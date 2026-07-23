const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export interface GoogleBookVolumeInfo {
	title: string;
	authors?: string[];
	description?: string;
	pageCount?: number;
	imageLinks?: {
		thumbnail?: string;
		smallThumbnail?: string;
	};
}

export interface GoogleBook {
	id: string;
	volumeInfo: GoogleBookVolumeInfo;
}

interface GoogleBooksApiResponse {
	items?: GoogleBook[];
	totalItems?: number;
	kind?: string;
}

const MAX_RETRIES = 2;
export const RETRYABLE_STATUSES = new Set([500, 502, 503, 504]);

function isRetryableStatus(status: number): boolean {
	return RETRYABLE_STATUSES.has(status);
}

function backoffMs(attempt: number): number {
	const base = 1000 * 2 ** attempt; // 1000, 2000, ...
	const jitter = base * 0.2 * (Math.random() * 2 - 1); // ±20%
	return base + jitter;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(resolve, ms);
		signal?.addEventListener(
			"abort",
			() => {
				clearTimeout(timeout);
				reject(new DOMException("Aborted", "AbortError"));
			},
			{ once: true },
		);
	});
}

export async function searchBooks(
	query: string,
	signal?: AbortSignal,
): Promise<GoogleBook[]> {
	const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=20`;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		let response: Response;
		try {
			response = await fetch(url, { signal });
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") throw err;
			if (attempt === MAX_RETRIES) throw err;
			await delay(backoffMs(attempt), signal);
			continue;
		}

		if (response.ok) {
			const result: GoogleBooksApiResponse = await response.json();
			return result.items ?? [];
		}

		if (!isRetryableStatus(response.status) || attempt === MAX_RETRIES) {
			throw new Error(`Response status: ${response.status}`);
		}

		await delay(backoffMs(attempt), signal);
	}

	throw new Error("Unreachable");
}
