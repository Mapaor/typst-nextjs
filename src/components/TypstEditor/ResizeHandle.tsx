'use client'

interface ResizeHandleProps {
	isResizing: boolean
	onMouseDown: (e: React.MouseEvent) => void
	orientation?: 'vertical' | 'horizontal'
}

export default function ResizeHandle({ 
	isResizing, 
	onMouseDown,
	orientation = 'vertical'
}: ResizeHandleProps) {
	if (orientation === 'horizontal') {
		return (
			<div
				className={`h-1.5 cursor-row-resize transition-colors shrink-0 hover:bg-blue-400 ${
					isResizing ? 'bg-blue-500' : 'bg-gray-700'
				}`}
				onMouseDown={onMouseDown}
				style={{ userSelect: 'none' }}
			/>
		)
	}

	return (
		<div
			className={`w-1.5 cursor-col-resize transition-colors shrink-0 hover:bg-blue-400 group ${
				isResizing ? 'bg-blue-500' : 'bg-gray-700'
			}`}
			onMouseDown={onMouseDown}
			style={{ userSelect: 'none' }}
			title="Drag to resize"
		>
			{/* Visual indicator dots */}
			<div className="h-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-50 transition-opacity">
				<div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
				<div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
				<div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
			</div>
		</div>
	)
}
