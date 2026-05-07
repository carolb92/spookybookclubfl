import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/useAuth";
import { SectionEmptyHint } from "@/components/common/SectionEmptyHint";
import { ReadBookCard } from "./ReadBookCard";
import { AddToReadHistoryModal } from "./AddToReadHistoryModal";
import type { Tables } from "@/lib/database.types";

type BookWithRating = Tables<"books"> & {
	avgRating: number | null;
	userRating: number | null;
};

export function ReadPanel() {
	const { session } = useAuth();
	const [books, setBooks] = useState<BookWithRating[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [refetchKey, setRefetchKey] = useState(0);

	const userId = session?.user.id ?? null;

	useEffect(() => {
		async function fetchBooks() {
			setIsLoading(true);
			setFetchError(null);

			const { data: booksData, error } = await supabase
				.from("books")
				.select("*")
				.eq("status", "read")
				.order("date_finished", { ascending: false });

			if (error) {
				console.error("Failed to fetch read books:", error);
				setFetchError("Couldn't load the read history. Please refresh.");
				setIsLoading(false);
				return;
			}

			if (booksData.length === 0) {
				setBooks([]);
				setIsLoading(false);
				return;
			}

			const bookIds = booksData.map((b) => b.id);

			const [allRatingsResult, userRatingsResult] = await Promise.all([
				supabase
					.from("book_ratings")
					.select("book_id, rating")
					.in("book_id", bookIds),
				userId
					? supabase
							.from("book_ratings")
							.select("book_id, rating")
							.eq("user_id", userId)
							.in("book_id", bookIds)
					: Promise.resolve({
							data: [] as { book_id: string; rating: number }[],
						}),
			]);

			const avgMap = new Map<string, { sum: number; count: number }>();
			for (const row of allRatingsResult.data ?? []) {
				const prev = avgMap.get(row.book_id) ?? { sum: 0, count: 0 };
				avgMap.set(row.book_id, { sum: prev.sum + row.rating, count: prev.count + 1 });
			}

			const userRatingMap = new Map(
				(userRatingsResult.data ?? []).map((v) => [v.book_id, v.rating]),
			);

			const booksWithRatings: BookWithRating[] = booksData.map((book) => {
				const stats = avgMap.get(book.id);
				return {
					...book,
					avgRating: stats ? stats.sum / stats.count : null,
					userRating: userRatingMap.get(book.id) ?? null,
				};
			});

			setBooks(booksWithRatings);
			setIsLoading(false);
		}

		fetchBooks();
	}, [userId, refetchKey]);

	function handleRatingChange(
		bookId: string,
		newRating: number | null,
		newAvg: number | null,
	) {
		setBooks((prev) =>
			prev.map((b) =>
				b.id === bookId
					? { ...b, userRating: newRating, avgRating: newAvg }
					: b,
			),
		);
	}

	if (fetchError) {
		return (
			<p className="text-sm text-(--spooky-dust) text-center py-4">
				{fetchError}
			</p>
		);
	}

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="relative rounded-sm border border-(--spooky-border) bg-(--spooky-card) overflow-hidden"
					>
						<div className="aspect-2/3 bg-(--spooky-skeleton) animate-pulse" />
						<div className="px-3 pt-2 pb-3 flex flex-col gap-2 items-center">
							<div className="h-2 w-20 rounded-sm bg-(--spooky-skeleton)" />
							<div className="h-2 w-16 rounded-sm bg-(--spooky-skeleton) opacity-60" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-end">
				<AddToReadHistoryModal onBookAdded={() => setRefetchKey((k) => k + 1)}>
					<button className="text-xs border border-(--spooky-border) rounded px-3 py-1.5 text-(--spooky-dust) hover:text-(--spooky-parchment) hover:border-(--spooky-crimson)/60 transition-colors">
						+ Add to read history
					</button>
				</AddToReadHistoryModal>
			</div>

			{books.length === 0 ? (
				<SectionEmptyHint>
					No books read yet — the coven is still warming up.
				</SectionEmptyHint>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
					{books.map((book) => (
						<ReadBookCard
							key={book.id}
							book={book}
							avgRating={book.avgRating}
							userRating={book.userRating}
							userId={userId}
							onRatingChange={handleRatingChange}
						/>
					))}
				</div>
			)}
		</div>
	);
}
