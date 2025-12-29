import type { Project } from '@/lib/storage/ProjectStorage'

interface FileExplorerHeaderProps {
	project: Project
}

export default function FileExplorerHeader({ project }: FileExplorerHeaderProps) {
	const visibleFileCount = project.files.filter(f => !f.path.endsWith('.gitkeep')).length
	
	return (
		<div className="p-4 border-b border-gray-700">
			<h2 className="text-sm font-semibold text-gray-200">{project.name}</h2>
			<p className="text-xs text-gray-400 mt-1">{visibleFileCount} files</p>
		</div>
	)
}
