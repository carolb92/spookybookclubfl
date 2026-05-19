import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type GoogleBook } from "@/services/searchBooks";
import { supabase } from "@/lib/supabaseClient";
import { CoverPlaceholder } from "./CoverPlaceholder";
import type { Tables } from "@/lib/database.types";

export function BookPreview({
	book,
	onBack,
	onBookAdded,
}: {
	book: GoogleBook;
	onBack: () => void;
	onBookAdded?: (book: Tables<"books">) => void;
}) {
	const [isAdding, setIsAdding] = useState(false);
	const [addError, setAddError] = useState<string | null>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const { title, authors, description, pageCount, imageLinks } =
		book.volumeInfo;
	const coverUrl = imageLinks?.thumbnail ?? imageLinks?.smallThumbnail;
	const authorLine = authors?.join(", ") ?? "Unknown author";

	const handleAdd = useCallback(async () => {
		setIsAdding(true);
		setAddError(null);
		try {
			const { data: inserted, error } = await supabase
				.from("books")
				.insert({
					title,
					author: authorLine,
					cover_url: coverUrl ?? null,
					description: description ?? null,
					page_count: pageCount ?? null,
					google_books_id: book.id,
					status: "tbr",
					date_added: new Date().toISOString(),
				})
				.select()
				.single();
			if (error) {
				if (error.code === "23505") {
					setAddError("This book is already in your TBR list.");
					return;
				}
				throw error;
			}
			onBookAdded?.(inserted);
			closeRef.current?.click();
		} catch {
			setAddError("Failed to add book. Please try again.");
		} finally {
			setIsAdding(false);
		}
	}, [
		title,
		authorLine,
		coverUrl,
		description,
		pageCount,
		book.id,
		onBookAdded,
	]);

	return (
		<div className="flex flex-col gap-5">
			<DialogClose ref={closeRef} className="hidden" />
			<button
				onClick={onBack}
				className={cn(
					"flex items-center gap-1.5 text-xs text-(--spooky-dust) hover:text-(--spooky-parchment)",
					"transition-colors duration-150 focus-visible:outline-none",
					"w-fit",
				)}
			>
				<svg
					viewBox="0 0 16 16"
					fill="none"
					className="size-3.5"
					aria-hidden="true"
				>
					<path
						d="M10 4L6 8l4 4"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				Back to results
			</button>

			<div className="relative flex justify-center">
				{coverUrl ? (
					<>
						<div
							className="absolute inset-x-0 top-2 bottom-0 mx-auto w-32 blur-2xl opacity-30 rounded-full"
							style={{
								backgroundImage: `url(${coverUrl})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
							aria-hidden="true"
						/>
						<img
							src={coverUrl}
							alt={`Cover of ${title}`}
							className="relative z-10 w-36 rounded-md shadow-2xl shadow-black/60 ring-1 ring-white/10"
						/>
					</>
				) : (
					<CoverPlaceholder className="w-36 h-52 rounded-md" />
				)}
			</div>

			<div className="flex flex-col gap-2 text-center">
				<h2 className="font-display text-lg font-bold leading-snug text-(--spooky-parchment) tracking-wide">
					{title}
				</h2>
				<p className="text-sm font-semibold text-(--spooky-dust)">
					{authorLine}
				</p>
				{pageCount && pageCount > 0 ? (
					<p className="text-xs text-(--spooky-dust)/60 tracking-widest uppercase">
						{pageCount} pages
					</p>
				) : (
					<p className="text-xs text-(--spooky-dust)/60 tracking-widest uppercase">
						No page count available
					</p>
				)}
			</div>

			{description && (
				<div
					className="overflow-y-auto max-h-32 leading-relaxed text-(--spooky-dust) border-t border-(--spooky-border) pt-3"
					style={{
						scrollbarWidth: "thin",
						scrollbarColor: "var(--spooky-border) transparent",
					}}
				>
					<p>{description.replace(/<[^>]*>/g, "")}</p>
				</div>
			)}

			{addError && (
				<p className="text-xs text-red-400/80 text-center">{addError}</p>
			)}

			<Button
				onClick={handleAdd}
				disabled={isAdding}
				className={cn(
					"w-full h-10 rounded-md font-semibold tracking-wide text-sm",
					"bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment)",
					"border border-(--spooky-crimson)/60 hover:border-(--spooky-crimson)",
					"transition-all duration-150 disabled:opacity-50",
				)}
			>
				{isAdding ? (
					<span className="flex items-center gap-2">
						<svg
							className="size-4 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="3"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						Adding…
					</span>
				) : (
					"Add to TBR"
				)}
			</Button>
		</div>
	);
}
