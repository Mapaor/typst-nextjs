'use client'

import { useEffect, useState, useRef } from 'react'
import { createHighlighter, type Highlighter } from 'shiki'

interface CodeEditorProps {
	filePath: string
	content: string
	onChange: (content: string) => void
}

export default function CodeEditor({ filePath, content, onChange }: CodeEditorProps) {
	const [highlightedCode, setHighlightedCode] = useState('')
	const [isInitializing, setIsInitializing] = useState(false)
	const highlighterRef = useRef<Highlighter | null>(null)
	
	// Detect file types
	const fileExtension = filePath.split('.').pop()?.toLowerCase() || ''
	const isTypFile = filePath.endsWith('.typ')
	const isMarkdownFile = ['md', 'mdx'].includes(fileExtension)
	const needsHighlighting = isTypFile || isMarkdownFile
	
	// Detect binary file types
	const isImageFile = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)
	const isFontFile = ['ttf', 'otf', 'woff', 'woff2'].includes(fileExtension)
	const isBinaryFile = isImageFile || isFontFile
	
	const getBinaryMessage = () => {
		if (isImageFile) return 'This is an image (binary data). Content too large to show here.'
		if (isFontFile) return 'This is a font file (binary data). Content too large to show here.'
		return ''
	}

	// Initialize highlighter once with all languages we'll ever need
	useEffect(() => {
		if (!highlighterRef.current) {
			setIsInitializing(true)
			const initHighlighter = async () => {
				try {
					// Load both Typst and Markdown - we'll always need them
					const { bundledLanguages } = await import('shiki')
					const response = await fetch('/textmate-sintax/typst.tmLanguage.json')
					const typstGrammar = await response.json()
					
					highlighterRef.current = await createHighlighter({
						langs: [
							{
								name: 'typst',
								scopeName: 'source.typst',
								...typstGrammar
							},
							bundledLanguages.markdown
						],
						themes: ['github-dark']
					})
					
					// Highlight initial content if needed
					if (content && needsHighlighting) {
						try {
							const lang = isTypFile ? 'typst' : 'markdown'
							const html = highlighterRef.current.codeToHtml(content, {
								lang,
								theme: 'github-dark',
							})
							const cleanedHtml = html.replace(/background-color:[^;"]*/g, '')
							setHighlightedCode(cleanedHtml)
						} catch (error) {
							console.error('Syntax highlighting error:', error)
						}
					}
				} catch (error) {
					console.error('Failed to initialize highlighter:', error)
				} finally {
					setIsInitializing(false)
				}
			}
			initHighlighter()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Highlight code immediately
	useEffect(() => {
		if (needsHighlighting && highlighterRef.current) {
			if (!content) {
				// Clear highlighting when content is empty
				setHighlightedCode('')
				return
			}
			
			try {
				const lang = isTypFile ? 'typst' : 'markdown'
				const html = highlighterRef.current.codeToHtml(content, {
					lang,
					theme: 'github-dark',
				})
				// Remove background color from generated HTML
				const cleanedHtml = html.replace(/background-color:[^;"]*/g, '')
				setHighlightedCode(cleanedHtml)
			} catch (error) {
				console.error('Syntax highlighting error:', error)
				setHighlightedCode('')
			}
		} else if (!needsHighlighting) {
			// Clear highlighting for non-highlighted files
			setHighlightedCode('')
		}
	}, [content, needsHighlighting, isTypFile, highlighterRef])

	return (
		<div className="flex flex-col h-full border-r border-gray-700">
			<div className="px-4 py-3 bg-gray-800 border-b border-gray-700 text-sm text-gray-400">
				{filePath}
			</div>
			
			<div className="flex-1 overflow-auto">
				{/* Loading indicator */}
				{needsHighlighting && isInitializing && (
					<div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm z-10">
						Initializing highlighter...
					</div>
				)}
				
				<div className="relative min-h-full">
					{/* Base layer - always present, defines layout */}
					<pre 
						className="m-0 p-0 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words"
						style={{ 
							tabSize: 4,
							lineHeight: '1.625',
							letterSpacing: '0',
							wordWrap: 'break-word',
							color: 'transparent',
							minHeight: '100%',
							paddingBottom: '100vh' // Ensures pre extends to fill viewport
						}}
						aria-hidden="true"
					>
						<code className="block p-4">
							{isBinaryFile ? (
								getBinaryMessage()
							) : needsHighlighting && highlightedCode ? (
								<span dangerouslySetInnerHTML={{ __html: highlightedCode }} />
							) : (
								content
							)}
						</code>
					</pre>
					
					{/* Textarea overlay - always positioned on top, fills entire container */}
					<textarea
						className="absolute inset-0 w-full p-4 m-0 font-mono text-sm resize-none focus:outline-none leading-relaxed whitespace-pre-wrap break-words border-0 cursor-text overflow-hidden box-border"
						style={{ 
							tabSize: 4,
							color: isBinaryFile ? '#fbbf24' : (needsHighlighting && highlightedCode && !isInitializing ? 'transparent' : 'white'),
							caretColor: isBinaryFile ? '#fbbf24' : 'white',
							background: 'transparent',
							lineHeight: '1.625',
							letterSpacing: '0',
							WebkitTextFillColor: isBinaryFile ? '#fbbf24' : (needsHighlighting && highlightedCode && !isInitializing ? 'transparent' : 'white'),
							wordWrap: 'break-word',
							minHeight: '100%',
							height: 'auto'
						}}
						value={isBinaryFile ? getBinaryMessage() : content}
						onChange={(e) => onChange(e.target.value)}
						placeholder="Type here..."
						spellCheck={false}
						readOnly={isBinaryFile}
					/>
				</div>
			</div>
		</div>
	)
}
