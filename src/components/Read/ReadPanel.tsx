import { supabase } from "@/lib/supabaseClient";
import { SectionEmptyHint } from "@/components/common/SectionEmptyHint";
import { ReadBookCard } from "./ReadBookCard";
import { AddToReadHistoryModal } from "./AddToReadHistoryModal";
import type { Tables } from "@/lib/database.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "@/lib/queryKeys";

type BookWithRating = Tables<"books"> & {
	avgRating: number | null;
};

async function fetchReadHistory() {
	const { data: booksData, error } = await supabase
		.from("books")
		.select("*")
		.eq("status", "read")
		.order("date_finished", { ascending: false });

	if (error) {
		console.error("Failed to fetch read books:", error);
		throw new Error("Failed to fetch read books. Try again.");
	}

	if (booksData.length === 0) return;

	const bookIds = booksData.map((b) => b.id);

	const { data: ratingsData } = await supabase
		.from("book_ratings")
		.select("book_id, rating")
		.in("book_id", bookIds);

	const avgMap = new Map<string, { sum: number; count: number }>();
	for (const row of ratingsData ?? []) {
		const prev = avgMap.get(row.book_id) ?? { sum: 0, count: 0 };
		avgMap.set(row.book_id, {
			sum: prev.sum + row.rating,
			count: prev.count + 1,
		});
	}

	const booksWithRatings: BookWithRating[] = booksData.map((book) => {
		const stats = avgMap.get(book.id);
		return {
			...book,
			avgRating: stats ? stats.sum / stats.count : null,
		};
	});

	return booksWithRatings;
}

export function ReadPanel() {
	const queryClient = useQueryClient();

	const {
		data: books = [],
		isPending,
		error,
	} = useQuery({
		queryKey: bookKeys.byStatus("read"),
		queryFn: fetchReadHistory,
	});

	if (error) {
		return (
			<p className="text-sm text-(--spooky-dust) text-center py-4">
				{error.message}
			</p>
		);
	}

	if (isPending) {
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
				<AddToReadHistoryModal
					onBookAdded={() =>
						queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("read") })
					}
				>
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
				<div className="grid grid-cols-2 md:grid-cols-3 gap-3 xl:grid-cols-4">
					{books.map((book) => (
						<ReadBookCard
							key={book.id}
							book={book}
							avgRating={book.avgRating}
						/>
					))}
				</div>
			)}
		</div>
	);
}
