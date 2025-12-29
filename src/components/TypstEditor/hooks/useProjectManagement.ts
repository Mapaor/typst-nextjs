import { useState, useEffect } from 'react'
import { projectStorage, type Project, type ProjectFile } from '@/lib/storage/ProjectStorage'

const TEMP_PROJECT: Project = {
	id: 'temp',
	name: 'My Document',
	files: [{ path: 'main.typ', content: '= My Document\n\nStart writing your document here.', lastModified: 0 }],
	mainFile: 'main.typ',
	createdAt: 0,
	lastModified: 0,
}

export function useProjectManagement(onProjectChange?: (files: Record<string, string>, mainFile: string) => void) {
	// Use lazy initialization with a function that returns TEMP_PROJECT
	// This ensures server and client render the same initial state
	const [currentProject, setCurrentProject] = useState<Project>(() => TEMP_PROJECT)
	const [activeFilePath, setActiveFilePath] = useState<string>(() => TEMP_PROJECT.mainFile)
	const [mounted, setMounted] = useState(false)

	// Load from storage after mount (client-side only)
	useEffect(() => {
		// Skip if already mounted (prevents double-loading)
		if (mounted) return
		
		setMounted(true)
		
		// Hydrate from localStorage
		const projects = projectStorage.list()
		if (projects.length > 0) {
			const mostRecent = projects.sort((a, b) => b.lastModified - a.lastModified)[0]
			const project = projectStorage.load(mostRecent.id)
			if (project) {
				setCurrentProject(project)
				setActiveFilePath(project.mainFile)
				return
			}
		}
		// Create new project if none exist
		const newProject = projectStorage.createNew('My Document')
		setCurrentProject(newProject)
		setActiveFilePath(newProject.mainFile)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Intentionally empty - we want this to run once on mount

	// Notify parent when project changes
	useEffect(() => {
		if (onProjectChange) {
			const filesMap = currentProject.files.reduce<Record<string, string>>((acc, file) => {
				acc[file.path] = file.content
				return acc
			}, {})
			onProjectChange(filesMap, currentProject.mainFile)
		}
	}, [currentProject, onProjectChange])

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
		setCurrentProject(updatedProject)
		projectStorage.save(updatedProject)
	}

	const loadProject = (project: Project) => {
		setCurrentProject(project)
		setActiveFilePath(project.mainFile)
		projectStorage.save(project)
	}

	const handleFileSelect = (path: string) => {
		setActiveFilePath(path)
	}

	const handleFileCreate = (path: string) => {
		if (currentProject.files.some(f => f.path === path)) {
			alert('A file with this name already exists!')
			return
		}

		const newFile: ProjectFile = {
			path,
			content: `// ${path}\n\n`,
			lastModified: 0,
		}

		const updatedProject = {
			...currentProject,
			files: [...currentProject.files, newFile],
		}

		setCurrentProject(updatedProject)
		setActiveFilePath(path)
		projectStorage.save(updatedProject)
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

		setCurrentProject(updatedProject)
		projectStorage.save(updatedProject)
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

			setCurrentProject(updatedProject)
			projectStorage.save(updatedProject)
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

			setCurrentProject(updatedProject)
			projectStorage.save(updatedProject)
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

		setCurrentProject(updatedProject)
		projectStorage.save(updatedProject)
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

		setCurrentProject(updatedProject)
		projectStorage.save(updatedProject)
	}

	return {
		currentProject,
		activeFilePath,
		getActiveFile,
		updateActiveFileContent,
		loadProject,
		handleFileSelect,
		handleFileCreate,
		handleFolderCreate,
		handleFileRename,
		handleFileMove,
		handleFileDelete,
	}
}
