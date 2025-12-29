import { useState } from 'react'
import type { CreateItemState } from '../types'

export function useFileOperations(
	onFileCreate: (path: string) => void,
	onFolderCreate: (path: string) => void,
	onFileRename: (oldPath: string, newPath: string) => void,
	onExpandFolder: (path: string) => void
) {
	const [creatingItem, setCreatingItem] = useState<CreateItemState | null>(null)
	const [newItemName, setNewItemName] = useState('')
	const [renamingItem, setRenamingItem] = useState<string | null>(null)
	const [renameValue, setRenameValue] = useState('')
	const [selectedItem, setSelectedItem] = useState<{ path: string; isFolder: boolean } | null>(null)

	const handleCreateItem = () => {
		if (!newItemName.trim() || !creatingItem) return

		const fullPath = creatingItem.parentPath 
			? `${creatingItem.parentPath}/${newItemName.trim()}`
			: newItemName.trim()

		// Auto-expand parent folder
		if (creatingItem.parentPath) {
			onExpandFolder(creatingItem.parentPath)
		}

		if (creatingItem.type === 'file') {
			onFileCreate(fullPath)
		} else {
			onFolderCreate(fullPath)
		}

		setCreatingItem(null)
		setNewItemName('')
	}

	const handleCancelCreate = () => {
		setCreatingItem(null)
		setNewItemName('')
	}

	const handleStartRename = (path: string, isFolder: boolean) => {
		setRenamingItem(path)
		const name = isFolder ? path.split('/').pop() || path : path.split('/').pop() || path
		setRenameValue(name)
	}

	const handleRename = () => {
		if (!renameValue.trim() || !renamingItem) return

		const parts = renamingItem.split('/')
		const parentPath = parts.slice(0, -1).join('/')
		const newPath = parentPath ? `${parentPath}/${renameValue.trim()}` : renameValue.trim()

		if (newPath !== renamingItem) {
			onFileRename(renamingItem, newPath)
		}

		setRenamingItem(null)
		setRenameValue('')
	}

	const handleCancelRename = () => {
		setRenamingItem(null)
		setRenameValue('')
	}

	return {
		creatingItem,
		setCreatingItem,
		newItemName,
		setNewItemName,
		renamingItem,
		renameValue,
		setRenameValue,
		selectedItem,
		setSelectedItem,
		handleCreateItem,
		handleCancelCreate,
		handleStartRename,
		handleRename,
		handleCancelRename,
	}
}
