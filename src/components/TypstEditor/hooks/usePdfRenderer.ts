import { useState, useEffect, useRef } from 'react'
import { getPdfjs } from '@/lib/pdf/pdfjs'
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist'

interface UsePdfRendererProps {
	pdfUrl: string | null
	currentPage: number
	zoom: number
	isCollapsed: boolean
}

interface CanvasInfo {
	canvas: HTMLCanvasElement
	renderTask: RenderTask | null
}

export function usePdfRenderer({ pdfUrl, currentPage, zoom, isCollapsed }: UsePdfRendererProps) {
	const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
	const [totalPages, setTotalPages] = useState(1)
	const [isRendering, setIsRendering] = useState(false)
	const [containerWidth, setContainerWidth] = useState(0)
	const canvasRefs = useRef<Map<number, CanvasInfo>>(new Map())
	const containerRef = useRef<HTMLDivElement | null>(null)
	const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
	const resizeObserverRef = useRef<ResizeObserver | null>(null)
	const observerSetupRef = useRef(false)

	// Load PDF document when URL changes
	useEffect(() => {
		if (!pdfUrl) return

		let mounted = true

		const loadPdf = async () => {
			try {
				const pdfjs = await getPdfjs()
				const loadingTask = pdfjs.getDocument(pdfUrl)
				const pdf = await loadingTask.promise
				
				if (mounted) {
					setPdfDoc(pdf)
					setTotalPages(pdf.numPages)
				}
			} catch (error) {
				console.error('Failed to load PDF:', error)
			}
		}

		loadPdf()

		return () => {
			mounted = false
		}
	}, [pdfUrl])

	// Scroll to current page when it changes
	useEffect(() => {
		const pageElement = pageRefs.current.get(currentPage)
		if (pageElement) {
			pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}, [currentPage])

	// Render all pages when document, zoom, or container width changes
	useEffect(() => {
		if (!pdfDoc || !containerRef.current) return

		// Capture the current canvas refs for cleanup
		const canvasRefsSnapshot = canvasRefs.current

		// Set up ResizeObserver once when we know the container exists
		if (!observerSetupRef.current) {
			const parentElement = containerRef.current.parentElement
			if (parentElement) {
				setContainerWidth(parentElement.clientWidth)
				
				resizeObserverRef.current = new ResizeObserver((entries) => {
					for (const entry of entries) {
						const width = entry.contentRect.width
						setContainerWidth(width)
					}
				})
				
				resizeObserverRef.current.observe(parentElement)
				observerSetupRef.current = true
			}
		}

		let mounted = true

		const renderAllPages = async () => {
			// Cancel any ongoing render operations
			canvasRefs.current.forEach((canvasInfo) => {
				if (canvasInfo.renderTask) {
					try {
						canvasInfo.renderTask.cancel()
					} catch {
						// Ignore cancellation errors
					}
				}
			})

			setIsRendering(true)
			try {
				const container = containerRef.current
				if (!mounted || !container) return

				// Use the tracked container width, fallback to current width if not yet set
				const fullWidth = containerWidth || container.clientWidth
				// Account for padding (p-6 = 24px on each side = 48px total)
				const paddingTotal = 48
				const availableWidth = fullWidth - paddingTotal

				// Render each page
				for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
					const page = await pdfDoc.getPage(pageNum) as PDFPageProxy
					const canvasInfo = canvasRefs.current.get(pageNum)
					
					if (!mounted || !canvasInfo) continue

					const canvas = canvasInfo.canvas
					const context = canvas.getContext('2d', {
						alpha: false,
						desynchronized: true
					}) as CanvasRenderingContext2D | null
					if (!context) continue

					const viewport = page.getViewport({ scale: 1 })
					
					// Apply zoom scaling
					const scale = (zoom / 100) * (availableWidth / viewport.width)
					
					// Get device pixel ratio for high-DPI displays (retina, etc.)
					// Use a minimum of 2 for better quality even on standard displays
					const pixelRatio = Math.max(window.devicePixelRatio || 1, 4)
					
					// Render at higher resolution for crisp output
					const outputScale = scale * pixelRatio
					const scaledViewport = page.getViewport({ scale: outputScale })

					// Set canvas actual size (high resolution for crisp rendering)
					canvas.width = scaledViewport.width
					canvas.height = scaledViewport.height

					// Set canvas display size (CSS size)
					canvas.style.width = `${scaledViewport.width / pixelRatio}px`
					canvas.style.height = `${scaledViewport.height / pixelRatio}px`

					// Disable image smoothing for crisp text rendering
					context.imageSmoothingEnabled = false

					// Render PDF page
					const renderContext = {
						canvasContext: context,
						viewport: scaledViewport,
						canvas: canvas
					}

					const renderTask = page.render(renderContext)
					canvasInfo.renderTask = renderTask
					if (renderTask && renderTask.promise) {
						await renderTask.promise
					}
					canvasInfo.renderTask = null
				}
				
				if (mounted) {
					setIsRendering(false)
				}
			} catch (error: unknown) {
				const err = error as { name?: string }
				if (err?.name !== 'RenderingCancelledException') {
					console.error('Failed to render pages:', error)
				}
				if (mounted) {
					setIsRendering(false)
				}
			}
		}

		renderAllPages()

		return () => {
			mounted = false
			// Cancel render tasks on cleanup
			canvasRefsSnapshot.forEach((canvasInfo) => {
				if (canvasInfo.renderTask) {
					try {
						canvasInfo.renderTask.cancel()
					} catch {
						// Ignore cancellation errors
					}
				}
			})
		}
	}, [pdfDoc, zoom, containerWidth, isCollapsed])

	// Cleanup ResizeObserver on unmount
	useEffect(() => {
		return () => {
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect()
			}
		}
	}, [])

	return {
		totalPages,
		isRendering,
		canvasRefs,
		pageRefs,
		containerRef
	}
}
