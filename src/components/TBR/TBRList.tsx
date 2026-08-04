import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/useAuth";
import { Accordion } from "@/components/ui/accordion";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { TBRBookItem } from "./TBRBookItem";
import { bookKeys } from "@/lib/queryKeys";
import { sortTBR } from "@/lib/utils";
import type { BookWithStats } from "@/types/books";

const PAGE_SIZE = 10;

interface TBRListProps {
	onEmptyChange: (isEmpty: boolean) => void;
}

async function fetchTBRBooks(userId: string | null): Promise<BookWithStats[]> {
	const { data: booksData, error } = await supabase
		.from("books")
		.select("*")
		.eq("status", "tbr");

	if (error) {
		console.error("Failed to fetch TBR books:", error);
		throw new Error("Couldn't load the TBR list. Please refresh.");
	}

	if (booksData.length === 0) return [];

	const bookIds = booksData.map((b) => b.id);

	const [avgResult, userVotesResult] = await Promise.all([
		supabase.rpc("get_average_excitement_batch", { book_ids: bookIds }),
		userId
			? supabase
					.from("excitement_votes")
					.select("book_id, rating")
					.eq("user_id", userId)
					.in("book_id", bookIds)
			: Promise.resolve({
					data: [] as { book_id: string; rating: number }[],
					error: null,
				}),
	]);

	if (avgResult.error || userVotesResult.error) {
		console.error(
			"Failed to fetch excitement data:",
			avgResult.error ?? userVotesResult.error,
		);
		throw new Error("Couldn't load the TBR list. Please refresh.");
	}

	const avgMap = new Map(
		(avgResult.data ?? []).map((r) => [r.book_id, r.avg_excitement]),
	);

	const userVoteMap = new Map(
		(userVotesResult.data ?? []).map((v) => [v.book_id, v.rating]),
	);

	const booksWithStats: BookWithStats[] = booksData.map((book) => ({
		...book,
		avgExcitement: avgMap.get(book.id) ?? null,
		userVote: userVoteMap.get(book.id) ?? null,
	}));

	booksWithStats.sort(sortTBR);
	return booksWithStats;
}

export function TBRList({ onEmptyChange }: TBRListProps) {
	const { session } = useAuth();
	const userId = session?.user.id ?? null;
	const queryClient = useQueryClient();
	const [rawCurrentPage, setRawCurrentPage] = useState(1);

	const queryKey = bookKeys.tbr(userId);

	const { data, isPending, error } = useQuery({
		queryKey,
		queryFn: () => fetchTBRBooks(userId),
	});

	const books = data ?? [];

	useEffect(() => {
		if (data) {
			onEmptyChange(data.length === 0);
		}
	}, [data, onEmptyChange]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function handleStatusChange(_bookId: string) {
		queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("tbr") });
		queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("on_deck") });
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function handleDelete(_bookId: string) {
		queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("tbr") });
	}

	if (error) {
		return (
			<p className="text-sm text-(--spooky-dust) text-center py-4">
				{error.message}
			</p>
		);
	}

	if (isPending) {
		return (
			<div className="flex flex-col w-full h-full justify-center items-center">
				<div
					className="h-11 border-b border-(--spooky-border) animate-pulse text-9xl opacity-25"
					style={{
						background: "var(--spooky-skeleton)",
					}}
				>
					😈
				</div>
			</div>
		);
	}

	if (books.length === 0) return null;

	const totalPages = Math.ceil(books.length / PAGE_SIZE);
	// Clamp for rendering instead of syncing via effect — if the list shrank
	// since the last render, this falls back to the new last page without an
	// extra render cycle or a stale `currentPage` for one frame.
	const currentPage = Math.min(rawCurrentPage, Math.max(1, totalPages));
	const pageBooks = books.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);

	return (
		<div className="flex flex-col gap-4">
			<Accordion type="single" collapsible>
				{pageBooks.map((book) => (
					<TBRBookItem
						key={book.id}
						book={book}
						avgExcitement={book.avgExcitement}
						userVote={book.userVote}
						userId={userId}
						onDelete={handleDelete}
						onStatusChange={handleStatusChange}
					/>
				))}
			</Accordion>

			{totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									setRawCurrentPage((p) => Math.max(1, p - 1));
								}}
								aria-disabled={currentPage === 1}
								className={
									currentPage === 1 ? "pointer-events-none opacity-40" : ""
								}
							/>
						</PaginationItem>

						{buildPageNumbers(currentPage, totalPages).map((item, i) =>
							item === "ellipsis" ? (
								<PaginationItem key={`ellipsis-${i}`}>
									<PaginationEllipsis />
								</PaginationItem>
							) : (
								<PaginationItem key={item}>
									<PaginationLink
										href="#"
										isActive={item === currentPage}
										onClick={(e) => {
											e.preventDefault();
											setRawCurrentPage(item);
										}}
									>
										{item}
									</PaginationLink>
								</PaginationItem>
							),
						)}

						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									setRawCurrentPage((p) => Math.min(totalPages, p + 1));
								}}
								aria-disabled={currentPage === totalPages}
								className={
									currentPage === totalPages
										? "pointer-events-none opacity-40"
										: ""
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}

function buildPageNumbers(
	current: number,
	total: number,
): (number | "ellipsis")[] {
	if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

	const pages: (number | "ellipsis")[] = [1];

	if (current > 3) pages.push("ellipsis");

	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);
	for (let i = start; i <= end; i++) pages.push(i);

	if (current < total - 2) pages.push("ellipsis");

	pages.push(total);
	return pages;
}
