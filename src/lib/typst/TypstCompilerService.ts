import { TypstWorkerClient } from './typstClient'

export type CompileStatus = 'idle' | 'compiling' | 'done' | 'error'

export interface CompileResult {
	success: boolean
	pdf?: Uint8Array<ArrayBuffer>
	pdfUrl?: string
	error?: string
	status: CompileStatus
}

export interface CompileListener {
	onStatusChange?: (status: CompileStatus) => void
	onSuccess?: (pdf: Uint8Array<ArrayBuffer>, pdfUrl: string) => void
	onError?: (error: string) => void
}

export class TypstCompilerService {
	private client: TypstWorkerClient
	private compileSeq = 0
	private currentPdfUrl: string | null = null
	private listeners: CompileListener[] = []

	constructor() {
		this.client = new TypstWorkerClient()
	}

	/**
	 * Add a listener for compile events
	 */
	addListener(listener: CompileListener): () => void {
		this.listeners.push(listener)
		return () => {
			const index = this.listeners.indexOf(listener)
			if (index > -1) {
				this.listeners.splice(index, 1)
			}
		}
	}

	/**
	 * Compile Typst project to PDF
	 */
	async compile(files: Record<string, string>, mainFile: string): Promise<CompileResult> {
		const seq = ++this.compileSeq

		this.notifyStatusChange('compiling')

		try {
			// Separate text files from binary files (images and fonts)
			const textFiles: Record<string, string> = {}
			const images: Record<string, Uint8Array<ArrayBuffer>> = {}

			for (const [path, content] of Object.entries(files)) {
				// Check if this is a binary file (data URL for images or fonts)
				if (content.startsWith('data:')) {
					// Extract base64 data and convert to Uint8Array
					const base64Match = content.match(/^data:[^;]+;base64,(.+)$/)
					if (base64Match) {
						try {
							const base64Data = base64Match[1]
							const binaryString = atob(base64Data)
							const bytes = new Uint8Array(binaryString.length)
							for (let i = 0; i < binaryString.length; i++) {
								bytes[i] = binaryString.charCodeAt(i)
							}
							images[path] = bytes as Uint8Array<ArrayBuffer>
						} catch (error) {
							console.error(`Failed to decode binary file ${path}:`, error)
						}
					}
				} else {
					// Regular text file
					textFiles[path] = content
				}
			}

			const result = await this.client.compilePdf(textFiles, mainFile, images)

			// Check if this compile was superseded by a newer one
			if (seq !== this.compileSeq) {
				return {
					success: false,
					status: 'idle',
				}
			}

			// Revoke old PDF URL
			if (this.currentPdfUrl) {
				URL.revokeObjectURL(this.currentPdfUrl)
			}

			// Create new blob URL
			const blob = new Blob([result.pdf], { type: 'application/pdf' })
			const pdfUrl = URL.createObjectURL(blob)
			this.currentPdfUrl = pdfUrl

			this.notifySuccess(result.pdf, pdfUrl)
			this.notifyStatusChange('done')

			return {
				success: true,
				pdf: result.pdf,
				pdfUrl,
				status: 'done',
			}
		} catch (error) {
			// Check if this compile was superseded
			if (seq !== this.compileSeq) {
				return {
					success: false,
					status: 'idle',
				}
			}

			const errorMsg = error instanceof Error ? error.message : String(error)
			this.notifyError(errorMsg)
			this.notifyStatusChange('error')

			return {
				success: false,
				error: errorMsg,
				status: 'error',
			}
		}
	}

	/**
	 * Get the current PDF URL (if any)
	 */
	getCurrentPdfUrl(): string | null {
		return this.currentPdfUrl
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.client.dispose()
		if (this.currentPdfUrl) {
			URL.revokeObjectURL(this.currentPdfUrl)
			this.currentPdfUrl = null
		}
		this.listeners = []
	}

	private notifyStatusChange(status: CompileStatus): void {
		this.listeners.forEach((listener) => {
			listener.onStatusChange?.(status)
		})
	}

	private notifySuccess(pdf: Uint8Array<ArrayBuffer>, pdfUrl: string): void {
		this.listeners.forEach((listener) => {
			listener.onSuccess?.(pdf, pdfUrl)
		})
	}

	private notifyError(error: string): void {
		this.listeners.forEach((listener) => {
			listener.onError?.(error)
		})
	}
}
