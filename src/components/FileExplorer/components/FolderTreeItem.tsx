import { Folder, ChevronRight, ChevronDown, Edit2, Trash2, Check, X } from 'lucide-react'
import type { FileNode } from '../types'

interface FolderTreeItemProps {
	node: FileNode
	depth: number
	isExpanded: boolean
	isRenaming: boolean
	isDropTarget: boolean
	isSelected: boolean
	renameValue: string
	onToggle: () => void
	onSelect: () => void
	onStartRename: () => void
	onRename: () => void
	onCancelRename: () => void
	onRenameChange: (value: string) => void
	onDelete: () => void
	onDragOver: (e: React.DragEvent) => void
	onDrop: (e: React.DragEvent) => void
	onExternalDrop?: (e: React.DragEvent, path: string) => void
	children?: React.ReactNode
}

export default function FolderTreeItem({
	node,
	depth,
	isExpanded,
	isRenaming,
	isDropTarget,
	isSelected,
	renameValue,
	onToggle,
	onSelect,
	onStartRename,
	onRename,
	onCancelRename,
	onRenameChange,
	onDelete,
	onDragOver,
	onDrop,
	onExternalDrop,
	children,
}: FolderTreeItemProps) {
	const folderName = node.path.split('/').pop() || node.path

	if (isRenaming) {
		return (
			<div>
				<div className="px-4 py-2 bg-gray-800" style={{ paddingLeft: `${depth * 12 + 16}px` }}>
					<div className="flex items-center gap-2">
						<Folder className="w-4 h-4 text-blue-400 shrink-0" />
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
				{children}
			</div>
		)
	}

	return (
		<div>
			<div
				className={`group flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-700 transition-colors ${
					isDropTarget ? 'bg-gray-700 border-l-2 border-blue-500' : ''
				} ${isSelected ? 'bg-gray-700' : ''}`}
				style={{ paddingLeft: `${depth * 12 + 16}px` }}
				onClick={() => {
					onToggle()
					onSelect()
				}}
				onDragOver={(e) => {
					if (e.dataTransfer.types.includes('Files')) {
						e.preventDefault()
						e.stopPropagation()
						e.dataTransfer.dropEffect = 'copy'
					} else {
						onDragOver(e)
					}
				}}
				onDrop={(e) => {
					if (e.dataTransfer.types.includes('Files') && onExternalDrop) {
						onExternalDrop(e, node.path)
					} else {
						onDrop(e)
					}
				}}
			>
				<div className="flex items-center gap-2 flex-1 min-w-0">
					{isExpanded ? (
						<ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
					) : (
						<ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
					)}
					<Folder className="w-4 h-4 text-gray-400 shrink-0" />
					<span className="text-sm text-gray-300 truncate" title={folderName}>{folderName}</span>
				</div>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={(e) => {
							e.stopPropagation()
							onStartRename()
						}}
						className="p-1 hover:bg-gray-600 rounded"
						title="Rename folder"
					>
						<Edit2 className="w-3 h-3 text-gray-300" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
						className="p-1 hover:bg-red-900/50 rounded"
						title="Delete folder"
					>
						<Trash2 className="w-3 h-3 text-red-400" />
					</button>
				</div>
			</div>
			{children}
		</div>
	)
}
