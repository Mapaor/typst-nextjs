'use client'

import { Loader2, XCircle } from 'lucide-react'
import type { CompileStatus } from '@/lib/typst/TypstCompilerService'

interface PdfPreviewProps {
	pdfUrl: string | null
	status: CompileStatus
	errorMsg: string | null
	hasCompiled: boolean
	fileCount: number
	charCount: number
}

export default function PdfPreview({ pdfUrl, status, errorMsg, hasCompiled, fileCount, charCount }: PdfPreviewProps) {
	return (
		<div className="h-full flex flex-col bg-gray-800">
			{pdfUrl ? (
				<iframe
					src={pdfUrl}
					title="PDF Preview"
					className="w-full h-full border-0"
				/>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center text-gray-400">
						{status === 'compiling' && (
							<p className="text-lg flex items-center justify-center gap-2">
								<Loader2 className="w-5 h-5 animate-spin" />
								{hasCompiled ? 'Compiling...' : 'Initializing compiler...'}
							</p>
						)}
						{status === 'error' && (
							<>
								<p className="text-lg text-red-500 flex items-center justify-center gap-2">
									<XCircle className="w-5 h-5" />
									Error
								</p>
								<pre className="mt-2 text-sm text-left max-w-2xl overflow-auto p-4 bg-gray-900 rounded">
									{errorMsg}
								</pre>
							</>
						)}
						{status === 'idle' && (
							<p className="text-lg">
								{hasCompiled 
									? 'Type to edit and compile' 
									: 'Click "Compile Now" or start typing to generate PDF'}
							</p>
						)}
						{status === 'done' && (
							<p className="text-lg text-gray-400">Compilation complete</p>
						)}
						<p className="mt-4 text-sm">
							{fileCount} file(s) • {charCount} chars
						</p>
					</div>
				</div>
			)}
		</div>
	)
}
