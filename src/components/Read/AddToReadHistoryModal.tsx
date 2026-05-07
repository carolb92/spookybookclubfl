import { useState, useCallback, useEffect, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { searchBooks, type GoogleBook } from "@/services/searchBooks";
import { SearchView } from "@/components/TBR/SearchView";
import { supabase } from "@/lib/supabaseClient";

interface AddToReadHistoryModalProps {
	children: React.ReactNode;
	onBookAdded: () => void;
}

export function AddToReadHistoryModal({
	children,
	onBookAdded,
}: AddToReadHistoryModalProps) {
	const [selected, setSelected] = useState<GoogleBook | null>(null);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<GoogleBook[]>([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// form fields
	const [dateFinished, setDateFinished] = useState("");
	const [meetingDate, setMeetingDate] = useState("");
	const [meetingLink, setMeetingLink] = useState("");
	const [avgRating, setAvgRating] = useState("");

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const closeRef = useRef<HTMLButtonElement>(null);

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
				if (err instanceof Error && err.name === "AbortError") return;
				setSearchError("Search failed.");
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

	function reset() {
		setSelected(null);
		setQuery("");
		setResults([]);
		setHasSearched(false);
		setSearchError(null);
		setDateFinished("");
		setMeetingDate("");
		setMeetingLink("");
		setAvgRating("");
		setSaveError(null);
	}

	const handleSave = useCallback(async () => {
		if (!selected) return;
		setIsSaving(true);
		setSaveError(null);

		const { volumeInfo, id: googleBooksId } = selected;
		const title = volumeInfo.title;
		const author = volumeInfo.authors?.join(", ") ?? "Unknown author";
		const coverUrl =
			volumeInfo.imageLinks?.thumbnail ??
			volumeInfo.imageLinks?.smallThumbnail ??
			null;

		try {
			const parsedAvg = parseFloat(avgRating);
			const historicalAvg =
				avgRating !== "" &&
				!isNaN(parsedAvg) &&
				parsedAvg >= 1 &&
				parsedAvg <= 5
					? Math.round(parsedAvg * 100) / 100
					: null;

			const { error: insertError } = await supabase.from("books").insert({
				title,
				author,
				cover_url: coverUrl,
				description: volumeInfo.description ?? null,
				page_count: volumeInfo.pageCount ?? null,
				google_books_id: googleBooksId,
				status: "read",
				date_added: new Date().toISOString(),
				date_finished: dateFinished || null,
				next_meeting_date: meetingDate || null,
				meeting_link: meetingLink || null,
				historical_avg_rating: historicalAvg,
			});

			if (insertError) {
				setSaveError(insertError.message);
				return;
			}

			onBookAdded();
			closeRef.current?.click();
		} catch {
			setSaveError("Failed to save. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}, [
		selected,
		dateFinished,
		meetingDate,
		meetingLink,
		avgRating,
		onBookAdded,
	]);

	return (
		<div className="hidden">
			<Dialog
				onOpenChange={(open) => {
					if (!open) reset();
				}}
			>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className="sm:max-w-md bg-(--spooky-surface) border-(--spooky-border) text-(--spooky-parchment)">
					<DialogHeader>
						<DialogTitle>Add to Read History</DialogTitle>
					</DialogHeader>
					<DialogClose ref={closeRef} className="hidden" />

					{!selected ? (
						<SearchView
							query={query}
							results={results}
							hasSearched={hasSearched}
							isLoading={isLoading}
							error={searchError}
							onQueryChange={setQuery}
							onSelect={setSelected}
						/>
					) : (
						<div className="flex flex-col gap-3 text-sm">
							<button
								onClick={() => setSelected(null)}
								className="text-xs text-(--spooky-dust) hover:text-(--spooky-parchment) text-left w-fit"
							>
								← Back
							</button>

							<div className="font-semibold text-(--spooky-parchment)">
								{selected.volumeInfo.title}
								<span className="font-normal text-(--spooky-dust) ml-2 text-xs">
									{selected.volumeInfo.authors?.join(", ")}
								</span>
							</div>

							<label className="flex flex-col gap-1">
								<span className="text-xs text-(--spooky-dust)">
									Date finished
								</span>
								<input
									type="date"
									value={dateFinished}
									onChange={(e) => setDateFinished(e.target.value)}
									className="rounded border border-(--spooky-border) bg-(--spooky-surface) px-2 py-1.5 text-(--spooky-parchment) text-sm"
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-xs text-(--spooky-dust)">
									Meeting date
								</span>
								<input
									type="date"
									value={meetingDate}
									onChange={(e) => setMeetingDate(e.target.value)}
									className="rounded border border-(--spooky-border) bg-(--spooky-surface) px-2 py-1.5 text-(--spooky-parchment) text-sm"
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-xs text-(--spooky-dust)">
									Meeting link
								</span>
								<input
									type="url"
									value={meetingLink}
									onChange={(e) => setMeetingLink(e.target.value)}
									placeholder="https://..."
									className="rounded border border-(--spooky-border) bg-(--spooky-surface) px-2 py-1.5 text-(--spooky-parchment) text-sm placeholder:text-(--spooky-dust)/40"
								/>
							</label>

							<label className="flex flex-col gap-1">
								<span className="text-xs text-(--spooky-dust)">
									Coven avg rating (1–5, optional)
								</span>
								<input
									type="number"
									min={1}
									max={5}
									step={0.01}
									value={avgRating}
									onChange={(e) => setAvgRating(e.target.value)}
									placeholder="e.g. 3.75"
									className="rounded border border-(--spooky-border) bg-(--spooky-surface) px-2 py-1.5 text-(--spooky-parchment) text-sm placeholder:text-(--spooky-dust)/40 w-28"
								/>
							</label>

							{saveError && <p className="text-xs text-red-400">{saveError}</p>}

							<button
								onClick={handleSave}
								disabled={isSaving}
								className="mt-1 rounded bg-(--spooky-crimson) px-4 py-2 text-sm font-semibold text-(--spooky-parchment) disabled:opacity-50"
							>
								{isSaving ? "Saving…" : "Add to Read History"}
							</button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
