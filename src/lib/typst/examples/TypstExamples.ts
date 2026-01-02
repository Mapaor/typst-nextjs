export interface TypstExample {
	id: string
	name: string
	description: string
	filePath: string // Path to .typ file in public folder
	isMultiFile?: boolean
	additionalFiles?: Array<{ path: string; filePath: string }>
}

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const TYPST_EXAMPLES: TypstExample[] = [
	{
		id: 'hello',
		name: 'Hello World',
		description: 'A simple document with headings and text',
		filePath: `${publicBasePath}/typst-examples/hello-world/main.typ`
	},
	{
		id: 'math',
		name: 'Math Document',
		description: 'Mathematical formulas and equations',
		filePath: `${publicBasePath}/typst-examples/math-expressions/main.typ`
	},
	// {
	// 	id: 'report',
	// 	name: 'Academic Report',
	// 	description: 'A structured document with sections and formatting',
	// 	filePath: '/typst-examples/report/main.typ'
	// },
	{
		id: 'using-images',
		name: 'Using Images',
		description: 'Demonstrate how to use images in Typst documents',
		filePath: `${publicBasePath}/typst-examples/using-images/main.typ`,
		isMultiFile: true,
		additionalFiles: [
			{ path: 'cat-image.jpg', filePath: `${publicBasePath}/typst-examples/using-images/cat-image.jpg` },
			{ path: 'star-image.png', filePath: `${publicBasePath}/typst-examples/using-images/star-image.png` },
		]
	},
	{
		id: 'multi-file',
		name: 'Multi-File Document',
		description: 'Document with multiple files, imports, and includes',
		filePath: `${publicBasePath}/typst-examples/multi-file/main.typ`,
		isMultiFile: true,
		additionalFiles: [
			{ path: 'template.typ', filePath: `${publicBasePath}/typst-examples/multi-file/template.typ` },
			{ path: 'chapters/chapter-1.typ', filePath: `${publicBasePath}/typst-examples/multi-file/chapters/chapter-1.typ` },
			{ path: 'chapters/chapter-2.typ', filePath: `${publicBasePath}/typst-examples/multi-file/chapters/chapter-2.typ` },
		]
	},
	{
		id: 'mitex',
		name: 'Using a Package',
		description: 'Using Mitex package from the Typst Universe',
		filePath: `${publicBasePath}/typst-examples/mitex/main.typ`
	},
	{
		id: 'using-templates',
		name: 'Using a Template',
		description: 'Using Graceful-Genetics template (Oxford Physics) from the Typst Universe',
		filePath: `${publicBasePath}/typst-examples/using-templates/main.typ`
	},
	{
		id: 'local-template',
		name: 'Local Template',
		description: 'CV template with local modules and layouts',
		filePath: `${publicBasePath}/typst-examples/local-template/main.typ`,
		isMultiFile: true,
		additionalFiles: [
			{ path: 'cv.typ', filePath: `${publicBasePath}/typst-examples/local-template/cv.typ` },
			{ path: 'utils.typ', filePath: `${publicBasePath}/typst-examples/local-template/utils.typ` },
			{ path: 'example-cv.yml', filePath: `${publicBasePath}/typst-examples/local-template/example-cv.yml` },
			{ path: 'layouts/bullet-list.typ', filePath: `${publicBasePath}/typst-examples/local-template/layouts/bullet-list.typ` },
			{ path: 'layouts/header.typ', filePath: `${publicBasePath}/typst-examples/local-template/layouts/header.typ` },
			{ path: 'layouts/timeline.typ', filePath: `${publicBasePath}/typst-examples/local-template/layouts/timeline.typ` },
			{ path: 'layouts/prose.typ', filePath: `${publicBasePath}/typst-examples/local-template/layouts/prose.typ` },
			{ path: 'layouts/numbered-list.typ', filePath: `${publicBasePath}/typst-examples/local-template/layouts/numbered-list.typ` },
		]
	},
	{
		id: 'using-fonts',
		name: 'Using Fonts',
		description: 'Demonstrate how to use custom fonts in Typst documents',
		filePath: `${publicBasePath}/typst-examples/using-fonts/main.typ`,
		isMultiFile: true,
		additionalFiles: [
			{ path: 'RobotoRegular.ttf', filePath: `${publicBasePath}/typst-examples/using-fonts/RobotoRegular.ttf` },
			{ path: 'Andropabe.ttf', filePath: `${publicBasePath}/typst-examples/using-fonts/Andropabe.ttf` },
		]
	}
]

/**
 * Fetches a Typst example file from the public folder
 */
export async function fetchExample(filePath: string): Promise<string> {
	const response = await fetch(filePath)
	if (!response.ok) {
		throw new Error(`Failed to load example: ${response.statusText}`)
	}
	
	// Check if this is an image file
	const isImage = /\.(png|jpg|jpeg|svg)$/i.test(filePath)
	// Check if this is a font file
	const isFont = /\.(ttf|otf)$/i.test(filePath)
	
	if (isImage || isFont) {
		// For binary files (images and fonts), convert to base64 data URL
		const blob = await response.blob()
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result as string)
			reader.onerror = reject
			reader.readAsDataURL(blob)
		})
	}
	
	// For text files, return as text
	return await response.text()
}

export function getExampleById(id: string): TypstExample | undefined {
	return TYPST_EXAMPLES.find(example => example.id === id)
}

export function getExampleNames(): { id: string; name: string }[] {
	return TYPST_EXAMPLES.map(({ id, name }) => ({ id, name }))
}
