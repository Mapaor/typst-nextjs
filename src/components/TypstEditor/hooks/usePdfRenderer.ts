import { useState, useEffect, useRef } from 'react'
import { getPdfjs } from '@/lib/pdf/pdfjs'
import type { PDFDocumentProxy } from 'pdfjs-dist'

interface UsePdfRendererProps {
	pdfUrl: string | null
	currentPage: number
	zoom: number
}

export function usePdfRenderer({ pdfUrl, currentPage, zoom }: UsePdfRendererProps) {
	const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
	const [totalPages, setTotalPages] = useState(1)
	const [isRendering, setIsRendering] = useState(false)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

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

	// Render current page when page number or zoom changes
	useEffect(() => {
		if (!pdfDoc || !canvasRef.current || !containerRef.current) return

		let mounted = true

		const renderPage = async () => {
			setIsRendering(true)
			try {
				const page = await pdfDoc.getPage(currentPage)
				const canvas = canvasRef.current
				const container = containerRef.current
				
				if (!mounted || !canvas || !container) return

				const context = canvas.getContext('2d')
				if (!context) return

				// Calculate scale to fit container width
				const containerWidth = container.clientWidth
				const viewport = page.getViewport({ scale: 1 })
				
				// Apply zoom scaling
				const scale = (zoom / 100) * (containerWidth / viewport.width)
				const scaledViewport = page.getViewport({ scale })

				// Set canvas dimensions
				canvas.width = scaledViewport.width
				canvas.height = scaledViewport.height

				// Render PDF page
				const renderContext = {
					canvasContext: context,
					viewport: scaledViewport,
					canvas: canvas
				}

				await page.render(renderContext).promise
				
				if (mounted) {
					setIsRendering(false)
				}
			} catch (error) {
				console.error('Failed to render page:', error)
				if (mounted) {
					setIsRendering(false)
				}
			}
		}

		renderPage()

		return () => {
			mounted = false
		}
	}, [pdfDoc, currentPage, zoom])

	return {
		totalPages,
		isRendering,
		canvasRef,
		containerRef
	}
}
