import { type Project } from '@/lib/storage/ProjectStorage'
import { useProjectState } from './useProjectState'
import { useProjectFileOperations } from './useProjectFileOperations'

/**
 * Main hook for managing Typst projects
 * Coordinates project state and file operations
 */
export function useProjectManagement(onProjectChange?: (files: Record<string, string>, mainFile: string) => void) {
	// Project state management
	const {
		currentProject,
		activeFilePath,
		setActiveFilePath,
		loadProject,
		saveProject,
	} = useProjectState(onProjectChange)

	// File operations
	const fileOperations = useProjectFileOperations({
		currentProject,
		activeFilePath,
		setActiveFilePath,
		saveProject,
	})

	return {
		currentProject,
		activeFilePath,
		loadProject,
		...fileOperations,
	}
}
