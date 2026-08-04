import { supabase } from "@/lib/supabaseClient";
import { BookCardSkeleton } from "@/components/common/BookCardSkeleton";
import { UpNextCard } from "./UpNextCard";
import { updateMeetingDate } from "@/services/bookActions";
import { parseDateString, addDays, localISODate } from "@/lib/utils";
import type { Tables } from "@/lib/database.types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { bookKeys } from "@/lib/queryKeys";
import { useFetchCurrentlyReadingInfo } from "@/hooks/useFetchCurrentlyReadingInfo";

interface UpNextListProps {
	userId: string | null;
}

async function fetchUpNextBooks() {
	const deckResult = await supabase
		.from("books")
		.select("*")
		.eq("status", "on_deck")
		.order("next_meeting_date", { ascending: true, nullsFirst: false });

	if (deckResult.error) {
		throw new Error("Couldn't fetch up next list. Try again.");
	}

	return deckResult.data;
}

function computeCascadeUpdates(
	books: Tables<"books">[],
	index: number,
	newDate: Date,
): Array<{ id: string; date: Date }> {
	const updates: Array<{ id: string; date: Date }> = [];
	let current = newDate;
	for (let i = index; i < books.length; i++) {
		updates.push({ id: books[i].id, date: current });
		current = addDays(current, 14);
	}
	return updates;
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

export default function UpNextList({ userId }: UpNextListProps) {
	const queryClient = useQueryClient();
	// --- CURRENTLY READING DATA --- //
	const {
		data: currentlyReadingData,
		isPending: isPendingCurrentlyReading,
		error: currentlyReadingError,
	} = useFetchCurrentlyReadingInfo();

	// Use the currently reading book's meeting date as the cascade base.
	// Fall back to app_settings.last_meeting_date + 14 (approximates the upcoming
	// meeting for the currently reading book when it has no date stored yet).
	let currentlyReadingDate: Date | null = null;
	if (currentlyReadingData?.book?.next_meeting_date) {
		currentlyReadingDate = parseDateString(
			currentlyReadingData?.book?.next_meeting_date,
		);
	} else if (currentlyReadingData?.settings?.last_meeting_date) {
		currentlyReadingDate = addDays(
			parseDateString(currentlyReadingData?.settings?.last_meeting_date),
			14,
		);
	}

	// --- UP NEXT DATA --- //
	const {
		data: books = [],
		isPending: isPendingUpNext,
		error: upNextError,
	} = useQuery({
		queryKey: bookKeys.byStatus("on_deck"),
		queryFn: fetchUpNextBooks,
	});

	const dateMutation = useMutation({
		mutationFn: async ({
			index,
			newDate,
		}: {
			index: number;
			newDate: Date;
		}) => {
			const updates = computeCascadeUpdates(books, index, newDate);
			const results = await Promise.all(
				updates.map(({ id, date }) => updateMeetingDate(id, date)),
			);
			if (results.some(Boolean)) {
				throw new Error("Failed to save one or more dates. Please refresh.");
			}
		},
		onMutate: ({ index, newDate }: { index: number; newDate: Date }) => {
			const queryKey = bookKeys.byStatus("on_deck");
			const previous = queryClient.getQueryData<Tables<"books">[]>(queryKey);
			const updates = computeCascadeUpdates(books, index, newDate);

			queryClient.setQueryData<Tables<"books">[]>(queryKey, (old = []) =>
				old.map((book) => {
					const upd = updates.find((u) => u.id === book.id);
					return upd
						? { ...book, next_meeting_date: localISODate(upd.date) }
						: book;
				}),
			);

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					bookKeys.byStatus("on_deck"),
					context.previous,
				);
			}
		},
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function handleRemove(_bookId: string) {
		queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("tbr") });
		queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("on_deck") });
	}

	if (isPendingCurrentlyReading || isPendingUpNext) return <BookCardSkeleton />;

	if (currentlyReadingError)
		return (
			<p className="text-sm text-(--spooky-dust)">
				{currentlyReadingError.message}
			</p>
		);
	if (upNextError)
		return (
			<p className="text-sm text-(--spooky-dust)">{upNextError.message}</p>
		);

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
					onDateChange={(date) =>
						dateMutation.mutate({ index: i, newDate: date })
					}
					onRemove={handleRemove}
				/>
			))}
		</div>
	);
}
