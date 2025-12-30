import { type Project, type ProjectFile } from '@/lib/storage/ProjectStorage'

interface UseFileOperationsProps {
	currentProject: Project
	activeFilePath: string
	setActiveFilePath: (path: string) => void
	saveProject: (project: Project) => void
}

export function useProjectFileOperations({
	currentProject,
	activeFilePath,
	setActiveFilePath,
	saveProject,
}: UseFileOperationsProps) {
	
	const getActiveFile = (): ProjectFile | null => {
		return currentProject.files.find(f => f.path === activeFilePath) || null
	}

	const updateActiveFileContent = (content: string) => {
		const updatedFiles = currentProject.files.map(file =>
			file.path === activeFilePath
				? { ...file, content, lastModified: 0 }
				: file
		)

		const updatedProject = { ...currentProject, files: updatedFiles }
		saveProject(updatedProject)
	}

	const handleFileSelect = (path: string) => {
		setActiveFilePath(path)
	}

	const handleFileCreate = (path: string, initialContent?: string) => {
		if (currentProject.files.some(f => f.path === path)) {
			alert('A file with this name already exists!')
			return
		}

		const newFile: ProjectFile = {
			path,
			content: initialContent ?? `// ${path}\n\n`,
			lastModified: 0,
		}

		const updatedProject = {
			...currentProject,
			files: [...currentProject.files, newFile],
		}

		saveProject(updatedProject)
		setActiveFilePath(path)
	}

	const handleFolderCreate = (path: string) => {
		const placeholderPath = `${path}/.gitkeep`
		
		if (currentProject.files.some(f => f.path.startsWith(path + '/'))) {
			alert('A folder with this name already exists!')
			return
		}

		const newFile: ProjectFile = {
			path: placeholderPath,
			content: '// Placeholder file to maintain folder structure\n',
			lastModified: 0,
		}

		const updatedProject = {
			...currentProject,
			files: [...currentProject.files, newFile],
		}

		saveProject(updatedProject)
	}

	const handleFileRename = (oldPath: string, newPath: string) => {
		if (oldPath === newPath) return
		
		if (currentProject.files.some(f => f.path === newPath)) {
			alert('A file with this name already exists!')
			return
		}

		const isFolder = !oldPath.includes('.') || currentProject.files.some(f => f.path.startsWith(oldPath + '/'))

		if (isFolder) {
			const updatedFiles = currentProject.files.map(file => {
				if (file.path === oldPath || file.path.startsWith(oldPath + '/')) {
					const relativePath = file.path.substring(oldPath.length)
					return { ...file, path: newPath + relativePath }
				}
				return file
			})

			let updatedMainFile = currentProject.mainFile
			if (currentProject.mainFile === oldPath || currentProject.mainFile.startsWith(oldPath + '/')) {
				const relativePath = currentProject.mainFile.substring(oldPath.length)
				updatedMainFile = newPath + relativePath
			}

			const updatedProject = {
				...currentProject,
				files: updatedFiles,
				mainFile: updatedMainFile,
			}

			if (activeFilePath === oldPath || activeFilePath.startsWith(oldPath + '/')) {
				const relativePath = activeFilePath.substring(oldPath.length)
				setActiveFilePath(newPath + relativePath)
			}

			saveProject(updatedProject)
		} else {
			const updatedFiles = currentProject.files.map(file =>
				file.path === oldPath ? { ...file, path: newPath } : file
			)

			let updatedMainFile = currentProject.mainFile
			if (currentProject.mainFile === oldPath) {
				updatedMainFile = newPath
			}

			const updatedProject = {
				...currentProject,
				files: updatedFiles,
				mainFile: updatedMainFile,
			}

			if (activeFilePath === oldPath) {
				setActiveFilePath(newPath)
			}

			saveProject(updatedProject)
		}
	}

	const handleFileMove = (oldPath: string, newPath: string) => {
		if (oldPath === newPath) return
		
		if (currentProject.files.some(f => f.path === newPath)) {
			alert('A file with this name already exists at the destination!')
			return
		}

		const updatedFiles = currentProject.files.map(file =>
			file.path === oldPath ? { ...file, path: newPath } : file
		)

		let updatedMainFile = currentProject.mainFile
		if (currentProject.mainFile === oldPath) {
			updatedMainFile = newPath
		}

		const updatedProject = {
			...currentProject,
			files: updatedFiles,
			mainFile: updatedMainFile,
		}

		if (activeFilePath === oldPath) {
			setActiveFilePath(newPath)
		}

		saveProject(updatedProject)
	}

	const handleFileDelete = (path: string) => {
		const isFolder = !path.includes('.') && currentProject.files.some(f => f.path.startsWith(path + '/'))
		
		let updatedFiles: ProjectFile[]
		
		if (isFolder) {
			updatedFiles = currentProject.files.filter(f => !f.path.startsWith(path + '/'))
		} else {
			if (currentProject.files.length <= 1) {
				return
			}
			updatedFiles = currentProject.files.filter(f => f.path !== path)
		}

		if (updatedFiles.length === 0) {
			return
		}

		let updatedMainFile = currentProject.mainFile

		if (path === currentProject.mainFile || (isFolder && currentProject.mainFile.startsWith(path + '/'))) {
			updatedMainFile = updatedFiles[0].path
		}

		const updatedProject = {
			...currentProject,
			files: updatedFiles,
			mainFile: updatedMainFile,
		}

		if (path === activeFilePath || (isFolder && activeFilePath.startsWith(path + '/'))) {
			setActiveFilePath(updatedMainFile)
		}

		saveProject(updatedProject)
	}

	return {
		getActiveFile,
		updateActiveFileContent,
		handleFileSelect,
		handleFileCreate,
		handleFolderCreate,
		handleFileRename,
		handleFileMove,
		handleFileDelete,
	}
}
