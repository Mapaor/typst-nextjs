import type { Project } from '@/lib/storage/ProjectStorage'

export interface FileNode {
	path: string
	isFolder: boolean
	children?: FileNode[]
}

export interface FileExplorerProps {
	project: Project
	activeFile: string
	onFileSelect: (path: string) => void
	onFileCreate: (path: string, initialContent?: string) => void
	onFolderCreate: (path: string) => void
	onFileDelete: (path: string) => void
	onFileRename: (oldPath: string, newPath: string) => void
	onFileMove: (oldPath: string, newPath: string) => void
	isCollapsed?: boolean
	onToggleCollapse?: () => void
}

export interface CreateItemState {
	type: 'file' | 'folder'
	parentPath: string
}
