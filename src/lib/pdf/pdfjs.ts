let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

export async function getPdfjs() {
	if (!pdfjsPromise) {
		pdfjsPromise = import('pdfjs-dist').then((mod) => {
			// Use CDN for PDF.js worker in Next.js
			mod.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${mod.version}/build/pdf.worker.min.mjs`;
			// PDF.js 的 viewer（`pdfjs-dist/web/pdf_viewer.mjs`）会从 `globalThis.pdfjsLib` 读取核心 API。
			(globalThis as unknown as { pdfjsLib?: typeof import('pdfjs-dist') }).pdfjsLib = mod;
			return mod;
		});
	}

	return pdfjsPromise;
}
