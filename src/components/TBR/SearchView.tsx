import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type GoogleBook } from "@/services/searchBooks";
import { SearchResultItem } from "./SearchResultItem";
import { Spinner } from "@/components/ui/spinner";

interface SearchViewProps {
	query: string;
	results: GoogleBook[];
	hasSearched: boolean;
	isLoading: boolean;
	error: string | null;
	onQueryChange: (q: string) => void;
	onSelect: (book: GoogleBook) => void;
}

export function SearchView({
	query,
	results,
	hasSearched,
	isLoading,
	error,
	onQueryChange,
	onSelect,
}: SearchViewProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	return (
		<div className="flex flex-col gap-4 overflow-x-hidden">
			<div className="relative">
				<Input
					ref={inputRef}
					type="search"
					placeholder="Search by title, author, or ISBN…"
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					className={cn(
						"h-10 rounded-md border-(--spooky-border) bg-(--spooky-surface)",
						"text-(--spooky-parchment) placeholder:text-(--spooky-dust)/60",
						"focus-visible:border-(--spooky-crimson)/60 focus-visible:ring-(--spooky-crimson)/20",
					)}
				/>
				{isLoading && (
					<div
						className="absolute right-3 top-1/2 -translate-y-1/2"
						aria-label="Searching…"
					>
						<Spinner />
					</div>
				)}
			</div>

			{error && <p className="text-xs text-red-400/80 px-1">{error}</p>}

			<div
				className={cn(
					"overflow-y-auto overflow-x-hidden",
					results.length > 0 ? "max-h-85 -mx-1 px-1" : "max-h-0",
				)}
				style={{
					scrollbarWidth: "thin",
					scrollbarColor: "var(--spooky-border) transparent",
				}}
			>
				{results.length > 0 && (
					<ul className="flex flex-col gap-0.5 max-w-full">
						{results.map((book) => (
							<li key={book.id} className="min-w-0">
								<SearchResultItem book={book} onClick={() => onSelect(book)} />
							</li>
						))}
					</ul>
				)}
				{hasSearched && !isLoading && results.length === 0 && (
					<p className="py-8 text-center text-sm italic text-(--spooky-dust) opacity-60 font-display">
						No tomes found bearing that name.
					</p>
				)}
			</div>

			{!hasSearched && !query && (
				<p className="py-6 text-center text-xs text-(--spooky-dust)/50 tracking-wide">
					Begin typing to summon results.
				</p>
			)}
		</div>
	);
}
