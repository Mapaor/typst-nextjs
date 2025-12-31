import { File, Star, Trash2, Edit2, Check, X } from 'lucide-react'

interface FileTreeItemProps {
	fileName: string
	depth: number
	isActive: boolean
	isMainFile: boolean
	isRenaming: boolean
	isDragging: boolean
	canDrag: boolean
	canRename: boolean
	canDelete: boolean
	renameValue: string
	onSelect: () => void
	onStartRename: () => void
	onRename: () => void
	onCancelRename: () => void
	onRenameChange: (value: string) => void
	onDelete: () => void
	onDragStart: (e: React.DragEvent) => void
	onDragEnd: () => void
}

export default function FileTreeItem({
	fileName,
	depth,
	isActive,
	isMainFile,
	isRenaming,
	isDragging,
	canDrag,
	canRename,
	canDelete,
	renameValue,
	onSelect,
	onStartRename,
	onRename,
	onCancelRename,
	onRenameChange,
	onDelete,
	onDragStart,
	onDragEnd,
}: FileTreeItemProps) {
	if (isRenaming) {
		return (
			<div className="px-4 py-2 bg-gray-800" style={{ paddingLeft: `${depth * 12 + 16}px` }}>
				<div className="flex items-center gap-2">
					<File className="w-4 h-4 text-blue-400 shrink-0" />
					<input
						type="text"
						value={renameValue}
						onChange={(e) => onRenameChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') onRename()
							if (e.key === 'Escape') onCancelRename()
						}}
						className="flex-1 px-2 py-1 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						autoFocus
					/>
					<button onClick={onRename} className="p-1 hover:bg-gray-700 rounded" title="Rename">
						<Check className="w-3 h-3 text-green-400" />
					</button>
					<button onClick={onCancelRename} className="p-1 hover:bg-gray-700 rounded" title="Cancel">
						<X className="w-3 h-3 text-red-400" />
					</button>
				</div>
			</div>
		)
	}

	return (
			<div
				draggable={canDrag}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				className={`
					group flex items-center justify-between px-4 py-2 cursor-pointer
					hover:bg-gray-700 transition-colors
					${isActive ? 'bg-gray-700 border-l-2 border-blue-500' : ''}
					${isDragging ? 'opacity-50' : ''}
				`}
				style={{ paddingLeft: `${depth * 12 + 16}px` }}
				onClick={onSelect}
			>
				<div className="flex items-center gap-2 flex-1 min-w-0">
					<File className="w-4 h-4 text-gray-400 shrink-0" />
					<span
						className={`
							text-sm truncate
							${isActive ? 'text-blue-300 font-medium' : 'text-gray-300'}
						`}
						title={fileName}
					>
						{fileName}
					</span>
					{isMainFile && (
						<Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
					)}
				</div>

				{/* Actions (visible on hover) */}
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					{canRename && (
						<button
							onClick={(e) => {
								e.stopPropagation()
								onStartRename()
							}}
							className="p-1 hover:bg-gray-600 rounded"
							title="Rename file"
						>
							<Edit2 className="w-3 h-3 text-gray-300" />
						</button>
					)}
					{canDelete && (
						<button
							onClick={(e) => {
								e.stopPropagation()
								onDelete()
							}}
							className="p-1 hover:bg-red-900/50 rounded"
							title="Delete file"
						>
							<Trash2 className="w-3 h-3 text-red-400" />
						</button>
					)}
				</div>
			</div>
	)
}
