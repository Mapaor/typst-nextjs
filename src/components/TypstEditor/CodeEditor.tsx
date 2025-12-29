'use client'

interface CodeEditorProps {
	filePath: string
	content: string
	onChange: (content: string) => void
}

export default function CodeEditor({ filePath, content, onChange }: CodeEditorProps) {
	return (
		<div className="flex flex-col h-full border-r border-gray-700">
			<div className="px-4 py-3 bg-gray-800 border-b border-gray-700 text-sm text-gray-400">
				{filePath}
			</div>
			<textarea
				className="flex-1 bg-gray-900 text-white p-4 font-mono text-sm resize-none focus:outline-none"
				value={content}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Type Typst code here..."
			/>
		</div>
	)
}
