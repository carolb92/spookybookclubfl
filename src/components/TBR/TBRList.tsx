import { useEffect, useState } from "react";
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
import type { Tables } from "@/lib/database.types";

const PAGE_SIZE = 10;

type BookWithStats = Tables<"books"> & {
	avgExcitement: number | null;
	userVote: number | null;
};

interface TBRListProps {
	onEmpty: () => void;
	refetchKey: number;
}

export function TBRList({ onEmpty, refetchKey }: TBRListProps) {
	const { session } = useAuth();
	const [books, setBooks] = useState<BookWithStats[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	const userId = session?.user.id ?? null;

	useEffect(() => {
		async function fetchBooks() {
			setIsLoading(true);

			const { data: booksData, error } = await supabase
				.from("books")
				.select("*")
				.eq("status", "tbr");

			if (error) {
				console.error("Failed to fetch TBR books:", error);
				setIsLoading(false);
				return;
			}

			if (booksData.length === 0) {
				setBooks([]);
				setIsLoading(false);
				onEmpty();
				return;
			}

			const [avgResults, userVotesResult] = await Promise.all([
				Promise.all(
					booksData.map((b) =>
						supabase.rpc("get_average_excitement", { book_id: b.id }),
					),
				),
				userId
					? supabase
							.from("excitement_votes")
							.select("book_id, rating")
							.eq("user_id", userId)
					: Promise.resolve({
							data: [] as { book_id: string; rating: number }[],
						}),
			]);

			const userVoteMap = new Map(
				(userVotesResult.data ?? []).map((v) => [v.book_id, v.rating]),
			);

			const booksWithStats: BookWithStats[] = booksData.map((book, i) => ({
				...book,
				avgExcitement: avgResults[i].data ?? null,
				userVote: userVoteMap.get(book.id) ?? null,
			}));

			booksWithStats.sort((a, b) => {
				if (a.avgExcitement === null && b.avgExcitement === null) return 0;
				if (a.avgExcitement === null) return 1;
				if (b.avgExcitement === null) return -1;
				return b.avgExcitement - a.avgExcitement;
			});

			setBooks(booksWithStats);
			setIsLoading(false);
		}

		fetchBooks();
	}, [session, userId, onEmpty, refetchKey]);

	function handleVoteChange(
		bookId: string,
		newVote: number | null,
		newAvg: number | null,
	) {
		setBooks((prev) =>
			prev.map((b) =>
				b.id === bookId
					? { ...b, userVote: newVote, avgExcitement: newAvg }
					: b,
			),
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col w-full h-full justify-center items-center">
				<div
					// key={i}
					className="h-11 border-b border-(--spooky-border) animate-pulse text-9xl opacity-25"
					style={{
						background: "var(--spooky-skeleton)",
						// animationDelay: `${i * 80}ms`
					}}
				>
					👻
				</div>
			</div>
		);
	}

	if (books.length === 0) return null;

	const totalPages = Math.ceil(books.length / PAGE_SIZE);
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
						onVoteChange={handleVoteChange}
					/>
				))}
			</Accordion>

			{totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
										isActive={item === currentPage}
										onClick={() => setCurrentPage(item)}
									>
										{item}
									</PaginationLink>
								</PaginationItem>
							),
						)}

						<PaginationItem>
							<PaginationNext
								onClick={() =>
									setCurrentPage((p) => Math.min(totalPages, p + 1))
								}
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
