type CompileRequest = {
	type: 'compile';
	id: string;
	files: Record<string, string>;
	mainFile: string;
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

type Pending = {
	resolve: (value: { pdf: Uint8Array<ArrayBuffer>; diagnostics: string[] }) => void;
	reject: (reason: unknown) => void;
};

export class TypstWorkerClient {
	#worker: Worker;
	#pending = new Map<string, Pending>();

	constructor() {
		this.#worker = new Worker(new URL('./typst.worker.ts', import.meta.url), { type: 'module' });
		this.#worker.addEventListener('message', (event: MessageEvent<CompileResponse>) => {
			const message = event.data;
			if (!message || message.type !== 'compile-result') return;

			const pending = this.#pending.get(message.id);
			if (!pending) return;
			this.#pending.delete(message.id);

			if (!message.ok) {
				pending.reject(new Error(message.error));
				return;
			}

			pending.resolve({ pdf: new Uint8Array(message.pdf), diagnostics: message.diagnostics });
		});
	}

	dispose(): void {
		this.#worker.terminate();
		for (const pending of this.#pending.values()) {
			pending.reject(new Error('Worker terminated'));
		}
		this.#pending.clear();
	}

	compilePdf(
		files: Record<string, string>,
		mainFile: string,
		images: Record<string, Uint8Array<ArrayBuffer>> = {}
	): Promise<{ pdf: Uint8Array<ArrayBuffer>; diagnostics: string[] }> {
		const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
		const request: CompileRequest = { type: 'compile', id, files, mainFile, images };

		return new Promise((resolve, reject) => {
			this.#pending.set(id, { resolve, reject });
			this.#worker.postMessage(request);
		});
	}
}
