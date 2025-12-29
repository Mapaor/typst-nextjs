// ============================================================================
// Types
// ============================================================================

export interface ProjectFile {
	path: string // e.g., 'template.typ', 'document.typ'
	content: string
	lastModified: number
}

export interface Project {
	id: string
	name: string
	files: ProjectFile[]
	mainFile: string // which file to compile (e.g., 'document.typ')
	createdAt: number
	lastModified: number
}

// ============================================================================
// Storage Implementation
// ============================================================================

const STORAGE_KEY_PREFIX = 'typst-project-'
const PROJECTS_LIST_KEY = 'typst-projects-list'

export class ProjectStorage {
	/**
	 * Save a project to localStorage
	 */
	save(project: Project): void {
		if (typeof window === 'undefined') return
		
		const now = Date.now()
		
		// Set timestamps if not already set
		if (!project.createdAt) {
			project.createdAt = now
		}
		project.lastModified = now
		
		// Update file timestamps
		project.files.forEach(file => {
			if (!file.lastModified) {
				file.lastModified = now
			}
		})
		
		const key = STORAGE_KEY_PREFIX + project.id
		localStorage.setItem(key, JSON.stringify(project))

		// Update projects list
		const list = this.list()
		const existing = list.findIndex((p) => p.id === project.id)
		if (existing >= 0) {
			list[existing] = { id: project.id, name: project.name, lastModified: project.lastModified }
		} else {
			list.push({ id: project.id, name: project.name, lastModified: project.lastModified })
		}
		localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(list))
	}

	/**
	 * Load a project from localStorage
	 */
	load(id: string): Project | null {
		if (typeof window === 'undefined') return null
		
		const key = STORAGE_KEY_PREFIX + id
		const data = localStorage.getItem(key)
		if (!data) return null

		try {
			return JSON.parse(data) as Project
		} catch (error) {
			console.error('Failed to parse project:', error)
			return null
		}
	}

	/**
	 * List all projects (metadata only)
	 */
	list(): Array<{ id: string; name: string; lastModified: number }> {
		if (typeof window === 'undefined') return []
		
		const data = localStorage.getItem(PROJECTS_LIST_KEY)
		if (!data) return []

		try {
			return JSON.parse(data)
		} catch (error) {
			console.error('Failed to parse projects list:', error)
			return []
		}
	}

	/**
	 * Delete a project
	 */
	delete(id: string): void {
		if (typeof window === 'undefined') return
		
		const key = STORAGE_KEY_PREFIX + id
		localStorage.removeItem(key)

		// Update projects list
		const list = this.list().filter((p) => p.id !== id)
		localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(list))
	}

	/**
	 * Create a new empty project
	 */
	createNew(name: string): Project {
		const project: Project = {
			id: crypto.randomUUID(),
			name,
			files: [
				{
					path: 'main.typ',
					content: `= ${name}\n\nStart writing your document here.`,
					lastModified: Date.now(),
				},
			],
			mainFile: 'main.typ',
			createdAt: Date.now(),
			lastModified: Date.now(),
		}
		this.save(project)
		return project
	}

	/**
	 * Get storage size in bytes
	 */
	getStorageSize(): number {
		if (typeof window === 'undefined') return 0
		
		let total = 0
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i)
			if (key?.startsWith(STORAGE_KEY_PREFIX)) {
				total += (localStorage.getItem(key) || '').length
			}
		}
		return total
	}

	/**
	 * Check if storage is near limit (warning at 3MB)
	 */
	isStorageNearLimit(): boolean {
		return this.getStorageSize() > 3 * 1024 * 1024 // 3MB
	}
}

// Singleton instance
export const projectStorage = new ProjectStorage()
