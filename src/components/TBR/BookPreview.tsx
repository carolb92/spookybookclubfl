import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { cn, sortTBR } from "@/lib/utils";
import { type GoogleBook } from "@/services/searchBooks";
import { supabase } from "@/lib/supabaseClient";
import { CoverPlaceholder } from "./CoverPlaceholder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/useAuth";
import { bookKeys } from "@/lib/queryKeys";
import type { BookWithStats } from "@/types/books";

export function BookPreview({
	book,
	onBack,
}: {
	book: GoogleBook;
	onBack: () => void;
}) {
	const closeRef = useRef<HTMLButtonElement>(null);
	const { session } = useAuth();
	const userId = session?.user.id ?? null;
	const queryClient = useQueryClient();
	const { title, authors, description, pageCount, imageLinks } =
		book.volumeInfo;
	const coverUrl = imageLinks?.thumbnail ?? imageLinks?.smallThumbnail;
	const authorLine = authors?.join(", ") ?? "Unknown author";

	const addBookMutation = useMutation({
		mutationFn: async () => {
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
					throw new Error("This book is already on the TBR list.");
				}
				throw new Error("Failed to add book. Try again.");
			}

			return inserted;
		},
		onSuccess: (inserted) => {
			queryClient.setQueryData<BookWithStats[]>(
				bookKeys.tbr(userId),
				(prev = []) => {
					if (prev.some((b) => b.id === inserted.id)) return prev;
					const withNew: BookWithStats[] = [
						...prev,
						{ ...inserted, avgExcitement: null, userVote: null },
					];
					withNew.sort(sortTBR);
					return withNew;
				},
			);
			closeRef.current?.click();
		},
	});

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

			{addBookMutation.error && (
				<p className="text-xs text-red-400/80 text-center">
					{addBookMutation.error.message}
				</p>
			)}

			<Button
				onClick={() => addBookMutation.mutate()}
				disabled={addBookMutation.isPending}
				className={cn(
					"w-full h-10 rounded-md font-semibold tracking-wide text-sm",
					"bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment)",
					"border border-(--spooky-crimson)/60 hover:border-(--spooky-crimson)",
					"transition-all duration-150 disabled:opacity-50",
				)}
			>
				{addBookMutation.isPending ? (
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
