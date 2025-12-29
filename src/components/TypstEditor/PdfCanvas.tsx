import { Loader2 } from 'lucide-react'
import type { RefObject } from 'react'

interface PdfCanvasProps {
	canvasRef: RefObject<HTMLCanvasElement | null>
	containerRef: RefObject<HTMLDivElement | null>
	isRendering: boolean
}

export default function PdfCanvas({ canvasRef, containerRef, isRendering }: PdfCanvasProps) {
	return (
		<div className="preview-container relative flex-1 bg-gray-100">
			{isRendering && (
				<div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
					<Loader2 className="w-8 h-8 animate-spin text-gray-600" />
				</div>
			)}
			<div 
				ref={containerRef}
				className="pdfjs-container absolute inset-0 overflow-auto p-6"
			>
				<div className="pdfViewer">
					<div 
						className="page mx-auto my-2"
						style={{
							boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
						}}
					>
						<div className="canvasWrapper bg-white">
							<canvas
								ref={canvasRef}
								className="block"
								role="presentation"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
