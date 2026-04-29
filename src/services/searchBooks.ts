const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export async function searchBooks(query: string) {
	const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${API_KEY}`;
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Response status: ${response.status}`);
		const result = await response.json();
		console.log(result);
		return result;
	} catch (error) {
		console.error(error.message);
	}
}
