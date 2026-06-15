import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BookCardSkeleton } from "@/components/common/BookCardSkeleton";
import { UpNextCard } from "./UpNextCard";
import { updateMeetingDate } from "@/services/bookActions";
import { parseDateString } from "@/lib/utils";
import type { Tables } from "@/lib/database.types";

interface UpNextListProps {
	userId: string | null;
	refreshKey?: number;
	onStatusChange?: () => void;
}

function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

function computeDisplayDates(
	books: Tables<"books">[],
	baseDate: Date | null,
): (Date | null)[] {
	const dates: (Date | null)[] = [];
	let prev = baseDate;
	for (const book of books) {
		const stored = book.next_meeting_date
			? parseDateString(book.next_meeting_date)
			: null;
		const derived = prev ? addDays(prev, 14) : null;
		const effective = stored ?? derived;
		dates.push(effective);
		prev = effective;
	}
	return dates;
}

export function UpNextList({ userId, refreshKey, onStatusChange }: UpNextListProps) {
	const [books, setBooks] = useState<Tables<"books">[]>([]);
	const [currentlyReadingDate, setCurrentlyReadingDate] = useState<Date | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetch() {
			setIsLoading(true);
			setError(null);

			const [deckResult, currentResult, settingsResult] = await Promise.all([
				supabase
					.from("books")
					.select("*")
					.eq("status", "on_deck")
					.order("next_meeting_date", { ascending: true, nullsFirst: false }),
				supabase
					.from("books")
					.select("next_meeting_date")
					.eq("status", "currently_reading")
					.limit(1)
					.maybeSingle(),
				supabase
					.from("app_settings")
					.select("last_meeting_date")
					.limit(1)
					.maybeSingle(),
			]);

			if (deckResult.error || currentResult.error) {
				setError("Couldn't load the up next list. Please refresh.");
				setIsLoading(false);
				return;
			}

			setBooks(deckResult.data ?? []);

			// Use the currently reading book's meeting date as the cascade base.
			// Fall back to app_settings.last_meeting_date + 14 (approximates the upcoming
			// meeting for the currently reading book when it has no date stored yet).
			let base: Date | null = null;
			if (currentResult.data?.next_meeting_date) {
				base = parseDateString(currentResult.data.next_meeting_date);
			} else if (settingsResult.data?.last_meeting_date) {
				base = addDays(
					parseDateString(settingsResult.data.last_meeting_date),
					14,
				);
			}
			setCurrentlyReadingDate(base);

			setIsLoading(false);
		}

		fetch();
	}, [refreshKey]);

	async function handleDateChange(index: number, newDate: Date) {
		// Cascade all books from `index` forward: index → newDate, index+1 → newDate+14, etc.
		const updates: Array<{ id: string; date: Date }> = [];
		let current = newDate;
		for (let i = index; i < books.length; i++) {
			updates.push({ id: books[i].id, date: current });
			current = addDays(current, 14);
		}

		// Optimistic update
		setBooks((prev) =>
			prev.map((book) => {
				const upd = updates.find((u) => u.id === book.id);
				return upd
					? { ...book, next_meeting_date: upd.date.toISOString() }
					: book;
			}),
		);

		const results = await Promise.all(
			updates.map(({ id, date }) => updateMeetingDate(id, date)),
		);
		if (results.some(Boolean)) {
			setError("Failed to save one or more dates. Please refresh.");
		}
	}

	function handleRemove(bookId: string) {
		setBooks((prev) => prev.filter((b) => b.id !== bookId));
	}

	function handleStatusChange(bookId: string) {
		setBooks((prev) => prev.filter((b) => b.id !== bookId));
		onStatusChange?.();
	}

	if (isLoading) return <BookCardSkeleton />;

	if (error) return <p className="text-sm text-(--spooky-dust)">{error}</p>;

	if (books.length === 0) {
		return (
			<p className="text-sm text-(--spooky-dust) italic">The queue is empty.</p>
		);
	}

	const displayDates = computeDisplayDates(books, currentlyReadingDate);

	return (
		<div className="flex flex-col gap-3">
			{books.map((book, i) => (
				<UpNextCard
					key={book.id}
					book={book}
					index={i}
					userId={userId}
					meetingDate={displayDates[i]}
					onDateChange={(date) => handleDateChange(i, date)}
					onRemove={handleRemove}
					onStatusChange={handleStatusChange}
				/>
			))}
		</div>
	);
}
