import { File, Folder, Check, X } from 'lucide-react'

interface CreateItemInputProps {
	type: 'file' | 'folder'
	value: string
	onChange: (value: string) => void
	onConfirm: () => void
	onCancel: () => void
	depth: number
}

export default function CreateItemInput({
	type,
	value,
	onChange,
	onConfirm,
	onCancel,
	depth,
}: CreateItemInputProps) {
	return (
		<div className="px-4 py-2 bg-gray-800" style={{ paddingLeft: `${depth * 12 + 16}px` }}>
			<div className="flex items-center gap-2">
				{type === 'folder' ? (
					<Folder className="w-4 h-4 text-blue-400 shrink-0" />
				) : (
					<File className="w-4 h-4 text-blue-400 shrink-0" />
				)}
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') onConfirm()
						if (e.key === 'Escape') onCancel()
					}}
					placeholder={type === 'folder' ? 'Folder name' : 'File name'}
					className="flex-1 px-2 py-1 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
					autoFocus
				/>
				<button
					onClick={onConfirm}
					className="p-1 hover:bg-gray-700 rounded"
					title="Create"
				>
					<Check className="w-3 h-3 text-green-400" />
				</button>
				<button
					onClick={onCancel}
					className="p-1 hover:bg-gray-700 rounded"
					title="Cancel"
				>
					<X className="w-3 h-3 text-red-400" />
				</button>
			</div>
		</div>
	)
}
