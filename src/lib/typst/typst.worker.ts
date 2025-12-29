/// <reference lib="webworker" />

import { createTypstCompiler, loadFonts, type TypstCompiler } from '@myriaddreamin/typst.ts';

// ============================================================================
// Type Definitions
// ============================================================================

type CompileRequest = {
	type: 'compile';
	id: string;
	mainTypst: string;
	images?: Record<string, Uint8Array<ArrayBuffer>>;
};

type CompileResponse =
	| {
			type: 'compile-result';
			id: string;
			ok: true;
			pdf: ArrayBuffer;
			diagnostics: string[];
	  }
	| {
			type: 'compile-result';
			id: string;
			ok: false;
			error: string;
			diagnostics: string[];
	  };

// ============================================================================
// Configuration
// ============================================================================

// const TYPST_VERSION = '0.7.0-rc2';
// CDN: https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@${TYPST_VERSION}/pkg/typst_ts_web_compiler_bg.wasm
const TYPST_WASM_URL = '/wasm/typst_ts_web_compiler_bg.wasm';

const CORE_FONTS: string[] = [
	// IBM Plex Sans (Modern UI)
	// CDN: https://cdn.jsdelivr.net/gh/typst/typst-dev-assets@v0.13.1/files/fonts/IBMPlexSans-Regular.ttf
	'/fonts/IBMPlexSans-Regular.ttf',
	// CDN: https://cdn.jsdelivr.net/gh/typst/typst-dev-assets@v0.13.1/files/fonts/IBMPlexSans-Bold.ttf
	'/fonts/IBMPlexSans-Bold.ttf',

	// Math fonts (Critical for mathematical formulas)
	// CDN: https://cdn.jsdelivr.net/gh/typst/typst-assets@v0.13.1/files/fonts/NewCMMath-Regular.otf
	'/fonts/NewCMMath-Regular.otf',
	// CDN: https://cdn.jsdelivr.net/gh/typst/typst-assets@v0.13.1/files/fonts/NewCMMath-Book.otf
	'/fonts/NewCMMath-Book.otf'
];

const EMOJI_FONTS: string[] = [
	// Emoji font (Noto Color Emoji) (~9MB)
	// CDN: https://fonts.gstatic.com/s/notocoloremoji/v37/Yq6P-KqIXTD0t4D9z1ESnKM3-HpFab4.ttf
	'/fonts/NotoColorEmoji.ttf'
];

// ============================================================================
// State Management
// ============================================================================

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

let compilerPromise: Promise<TypstCompiler> | null = null;
let compileQueue: Promise<void> = Promise.resolve();
let emojiLoaded = false;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Fetches the Typst WASM module from CDN
 */
async function fetchWasmModule(): Promise<ArrayBuffer> {
	const response = await fetch(TYPST_WASM_URL);
	return await response.arrayBuffer();
}

/**
 * Creates a compiler with specified fonts
 */
async function createCompilerWithFonts(fonts: string[]): Promise<TypstCompiler> {
	const compiler = createTypstCompiler();
	await compiler.init({
		getModule: fetchWasmModule,
		beforeBuild: [
			loadFonts(fonts, {
				assets: ['text']
			})
		]
	});
	return compiler;
}

/**
 * Detects if text requires emoji fonts
 */
function needsEmojiFont(text: string): boolean {
	return /[\uD800-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]/.test(text);
}

/**
 * Gets the current font set based on loaded fonts
 */
function getCurrentFonts(): string[] {
	return emojiLoaded ? [...CORE_FONTS, ...EMOJI_FONTS] : CORE_FONTS;
}

// ============================================================================
// Compiler Management
// ============================================================================

async function upgradeCompilerWithEmoji(): Promise<void> {
	if (emojiLoaded) return;

	emojiLoaded = true;
	console.log('Typst - Upgrading compiler with emoji fonts...');
	
	const newCompiler = await createCompilerWithFonts(getCurrentFonts());
	compilerPromise = Promise.resolve(newCompiler);
	
	console.log('Typst - Compiler upgraded successfully.');
}

function getCompiler(): Promise<TypstCompiler> {
	if (compilerPromise) return compilerPromise;

	compilerPromise = createCompilerWithFonts(CORE_FONTS);
	return compilerPromise;
}

// ============================================================================
// Compilation
// ============================================================================

async function compilePdf(
	mainTypst: string,
	images: Record<string, Uint8Array<ArrayBuffer>> = {}
): Promise<{ pdf: Uint8Array; diagnostics: string[] }> {
	// Check for emoji and upgrade compiler if needed
	if (needsEmojiFont(mainTypst)) {
		await upgradeCompilerWithEmoji();
	}

	const compiler = await getCompiler();
	compiler.addSource('/main.typ', mainTypst);

	for (const [path, data] of Object.entries(images)) {
		compiler.mapShadow('/' + path, data);
	}

	const result = await compiler.compile({
		mainFilePath: '/main.typ',
		format: 1,
		diagnostics: 'unix'
	});

	const diagnostics = (result.diagnostics ?? []).map(String);
	if (!result.result) {
		throw new Error(diagnostics.join('\n') || 'Typst 编译失败（无诊断信息）');
	}

	return { pdf: result.result, diagnostics };
}

// ============================================================================
// Message Handler
// ============================================================================

ctx.onmessage = (event: MessageEvent<CompileRequest>) => {
	const message = event.data;
	if (!message || message.type !== 'compile') return;

	compileQueue = compileQueue.then(async () => {
		try {
			const { pdf, diagnostics } = await compilePdf(message.mainTypst, message.images);
			const pdfCopy = new Uint8Array(pdf.length);
			pdfCopy.set(pdf);
			ctx.postMessage(
				{
					type: 'compile-result',
					id: message.id,
					ok: true,
					pdf: pdfCopy.buffer,
					diagnostics
				} satisfies CompileResponse,
				[pdfCopy.buffer]
			);
		} catch (error) {
			ctx.postMessage({
				type: 'compile-result',
				id: message.id,
				ok: false,
				error: error instanceof Error ? error.message : String(error),
				diagnostics: []
			} satisfies CompileResponse);
		}
	});
};
