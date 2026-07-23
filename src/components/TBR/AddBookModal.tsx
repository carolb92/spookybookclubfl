import { useState, useCallback, useEffect, useRef } from "react";
import type { Tables } from "@/lib/database.types";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { searchBooks, type GoogleBook } from "@/services/searchBooks";
import { SearchView } from "./SearchView";
import { BookPreview } from "./BookPreview";
import { RETRYABLE_STATUSES } from "../../services/searchBooks";

type ModalView = "search" | "preview";

export function AddBookModal({
	children,
	onBookAdded,
}: {
	children: React.ReactNode;
	onBookAdded?: (book: Tables<"books">) => void;
}) {
	const [view, setView] = useState<ModalView>("search");
	const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);

	const [query, setQuery] = useState("");
	const [results, setResults] = useState<GoogleBook[]>([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		if (!query.trim()) {
			setResults([]);
			setHasSearched(false);
			setSearchError(null);
			return;
		}

		const controller = new AbortController();

		debounceRef.current = setTimeout(async () => {
			setIsLoading(true);
			setSearchError(null);
			try {
				const books = await searchBooks(query.trim(), controller.signal);
				setResults(books);
				setHasSearched(true);
			} catch (err) {
				if (!(err instanceof Error)) {
					setSearchError("Something went wrong. Try again.");
					setResults([]);
					return;
				}
				if (err.name === "AbortError") return;
				if (RETRYABLE_STATUSES.has(Number(err.message.split(":")[1]))) {
					setSearchError(
						"The fuck ass Google Books API server tanked this search. Try again in a bit.",
					);
				} else {
					setSearchError("Something went wrong. Try again.");
				}
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 400);

		return () => {
			controller.abort();
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query]);

	const handleSelect = useCallback((book: GoogleBook) => {
		setSelectedBook(book);
		setView("preview");
	}, []);

	const handleBack = () => setView("search");

	const handleOpenChange = useCallback((open: boolean) => {
		if (!open) {
			setView("search");
			setSelectedBook(null);
			setQuery("");
			setResults([]);
			setHasSearched(false);
			setSearchError(null);
			if (debounceRef.current) clearTimeout(debounceRef.current);
		}
	}, []);

	return (
		<Dialog onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className={cn(
					"max-w-full border-(--spooky-border) bg-(--spooky-surface)",
					"text-(--spooky-parchment) shadow-2xl shadow-black/70",
					"sm:max-w-md",
				)}
				showCloseButton
			>
				<DialogHeader>
					<DialogTitle className="font-display text-base tracking-wide text-(--spooky-parchment)">
						{view === "search" ? "Add a book to the TBR List" : "Preview"}
					</DialogTitle>
					<div className="h-px bg-linear-to-r from-(--spooky-crimson)/40 to-transparent" />
				</DialogHeader>

				<div
					className="min-w-0 overflow-hidden"
					style={{ animation: "fadeUp 0.2s ease-out both" }}
				>
					{view === "search" && (
						<SearchView
							query={query}
							results={results}
							hasSearched={hasSearched}
							isLoading={isLoading}
							error={searchError}
							onQueryChange={setQuery}
							onSelect={handleSelect}
						/>
					)}
					{view === "preview" && selectedBook && (
						<BookPreview
							book={selectedBook}
							onBack={handleBack}
							onBookAdded={onBookAdded}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
