import type { Project } from '@/lib/storage/ProjectStorage'
import type { FileNode } from '../types'

export function buildFileTree(project: Project): FileNode[] {
	const root: FileNode[] = []
	const folderMap = new Map<string, FileNode>()

	// First pass: create all folders (use all files to detect folder structure)
	project.files.forEach(file => {
		const parts = file.path.split('/')
		let currentPath = ''
		
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i]
			const parentPath = currentPath
			currentPath = currentPath ? `${currentPath}/${part}` : part
			
			if (!folderMap.has(currentPath)) {
				const folderNode: FileNode = {
					path: currentPath,
					isFolder: true,
					children: []
				}
				folderMap.set(currentPath, folderNode)
				
				if (parentPath) {
					const parent = folderMap.get(parentPath)
					parent?.children?.push(folderNode)
				} else {
					root.push(folderNode)
				}
			}
		}
	})

	// Second pass: add files (filter out .gitkeep files from display)
	project.files.forEach(file => {
		// Skip .gitkeep files in the display
		if (file.path.endsWith('.gitkeep')) return
		
		const parts = file.path.split('/')
		const parentPath = parts.slice(0, -1).join('/')
		
		const fileNode: FileNode = {
			path: file.path,
			isFolder: false
		}
		
		if (parentPath) {
			const parent = folderMap.get(parentPath)
			parent?.children?.push(fileNode)
		} else {
			root.push(fileNode)
		}
	})

	return root
}
