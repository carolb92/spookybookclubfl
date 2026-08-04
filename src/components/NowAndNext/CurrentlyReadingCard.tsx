import { BookDescription } from "@/components/common/BookDescription";
import { CoverPlaceholder } from "@/components/TBR/CoverPlaceholder";
import { BookCardSkeleton } from "@/components/common/BookCardSkeleton";
import { ActionButton } from "@/components/TBR/ActionButton";
import { MeetingDatePicker } from "@/components/common/MeetingDatePicker";
import { updateMeetingDate, cascadeOnDeckDates } from "@/services/bookActions";
import { parseDateString, addDays, localISODate } from "@/lib/utils";
import { getHighResCover } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "@/lib/queryKeys";
import { useFetchCurrentlyReadingInfo } from "@/hooks/useFetchCurrentlyReadingInfo";

interface CurrentlyReadingCardProps {
	userId: string | null;
}

export default function CurrentlyReadingCard({
	userId,
}: CurrentlyReadingCardProps) {
	const { data, isPending, error } = useFetchCurrentlyReadingInfo();
	const book = data?.book;
	const settings = data?.settings;
	const queryKey = bookKeys.byStatus("currently_reading");
	const queryClient = useQueryClient();

	const dateMutation = useMutation({
		mutationFn: async (newDate: Date) => {
			if (!book) return;
			const oldBase = book.next_meeting_date
				? parseDateString(book.next_meeting_date)
				: settings?.last_meeting_date
					? addDays(parseDateString(settings.last_meeting_date), 14)
					: null;

			const [err1, err2] = await Promise.all([
				updateMeetingDate(book.id, newDate),
				cascadeOnDeckDates(oldBase, newDate),
			]);
			if (err1 || err2)
				throw new Error("Couldn't update the meeting date. Try again.");
		},
		onMutate: (newDate: Date) => {
			const previous = queryClient.getQueryData(queryKey);
			queryClient.setQueryData(queryKey, (old: typeof data) =>
				old?.book
					? {
							...old,
							book: { ...old.book, next_meeting_date: localISODate(newDate) },
						}
					: old,
			);
			return { previous };
		},
		onError: (_err, _newDate, context) => {
			if (context?.previous)
				queryClient.setQueryData(queryKey, context.previous);
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("on_deck") }),
	});

	if (isPending) return <BookCardSkeleton tall />;

	if (error) {
		return <p className="text-sm text-(--spooky-dust)">{error.message}</p>;
	}

	if (!book) {
		return (
			<p className="text-sm text-(--spooky-dust) italic">
				Nothing in the cauldron yet.
			</p>
		);
	}

	const meetingDate: Date | null = book.next_meeting_date
		? parseDateString(book.next_meeting_date)
		: settings?.last_meeting_date
			? addDays(parseDateString(settings.last_meeting_date), 14)
			: null;

	return (
		<div className="flex flex-col lg:flex-row lg:gap-8">
			{/* Cover */}
			<div className="flex justify-center lg:justify-start lg:w-1/3 lg:shrink-0">
				{book.cover_url ? (
					<img
						src={getHighResCover(book.cover_url)}
						alt={book.title}
						className="w-4/5 max-w-70 rounded lg:w-full lg:max-w-none"
						style={{ boxShadow: "0 8px 32px -8px var(--spooky-crimson)" }}
					/>
				) : (
					<CoverPlaceholder className="w-4/5 max-w-70 aspect-2/3 rounded lg:w-full lg:max-w-none" />
				)}
			</div>

			{/* Metadata */}
			<div className="flex flex-col gap-4 mt-5 lg:mt-0 lg:flex-1">
				<div>
					<h2 className="font-display font-semibold text-xl leading-snug text-(--spooky-parchment)">
						{book.title}
					</h2>
					<p className="text-sm text-(--spooky-dust) mt-0.5">{book.author}</p>
				</div>

				{book.description && (
					<BookDescription
						description={book.description}
						pageCount={book.page_count}
					/>
				)}

				{/* Next Yap Session */}
				<div className="flex flex-col gap-1.5 pt-4 mt-6 lg:mt-4 max-sm:items-center">
					{/* //TODO: linear gradient bottom border under yap session? */}
					<h3 className="font-section text-xl font-semibold tracking-widest uppercase text-(--spooky-crimson) max-sm:text-center">
						Yap Session
					</h3>
					<MeetingDatePicker
						date={meetingDate}
						onChange={
							userId ? (newDate) => dateMutation.mutate(newDate) : undefined
						}
					/>
					{userId && settings?.meeting_link && (
						<div>
							<ActionButton asChild className="mt-1">
								<a
									href={settings.meeting_link}
									target="_blank"
									rel="noopener noreferrer"
								>
									Join the meeting →
								</a>
							</ActionButton>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
