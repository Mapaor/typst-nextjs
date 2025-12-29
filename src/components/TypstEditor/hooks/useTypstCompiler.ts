import { useState, useEffect, useRef } from 'react'
import { TypstCompilerService, type CompileStatus } from '@/lib/typst/TypstCompilerService'
import { debounce } from '@/lib/utils/helpers'

export function useTypstCompiler() {
	const [status, setStatus] = useState<CompileStatus>('idle')
	const [pdfUrl, setPdfUrl] = useState<string | null>(null)
	const [errorMsg, setErrorMsg] = useState<string | null>(null)
	const [hasCompiled, setHasCompiled] = useState(false)

	const compilerServiceRef = useRef<TypstCompilerService | null>(null)
	const debouncedCompileRef = useRef<((files: Record<string, string>, mainFile: string) => void) & { cancel: () => void } | null>(null)

	useEffect(() => {
		// Initialize compiler service
		const compilerService = new TypstCompilerService()
		compilerServiceRef.current = compilerService

		// Listen to compile events
		const unsubscribe = compilerService.addListener({
			onStatusChange: (newStatus) => {
				setStatus(newStatus)
			},
			onSuccess: (pdf, url) => {
				setPdfUrl(url)
				setErrorMsg(null)
				setHasCompiled(true)
			},
			onError: (error) => {
				setErrorMsg(error)
				setPdfUrl(null)
				setHasCompiled(true)
			},
		})

		// Create debounced compile function
		debouncedCompileRef.current = debounce((files: Record<string, string>, mainFile: string) => {
			if (compilerServiceRef.current) {
				void compilerServiceRef.current.compile(files, mainFile)
			}
		}, 1000)

		return () => {
			debouncedCompileRef.current?.cancel()
			unsubscribe()
			compilerService.dispose()
		}
	}, [])

	const compileNow = async (files: Record<string, string>, mainFile: string) => {
		if (compilerServiceRef.current) {
			await compilerServiceRef.current.compile(files, mainFile)
		}
	}

	const compileDebounced = (files: Record<string, string>, mainFile: string) => {
		if (debouncedCompileRef.current) {
			debouncedCompileRef.current(files, mainFile)
		}
	}

	return {
		status,
		pdfUrl,
		errorMsg,
		hasCompiled,
		compileNow,
		compileDebounced,
	}
}
