import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BookDescription } from "@/components/common/BookDescription";
import { CoverPlaceholder } from "@/components/TBR/CoverPlaceholder";
import { BookCardSkeleton } from "@/components/common/BookCardSkeleton";
import { ActionButton } from "@/components/TBR/ActionButton";
import { MeetingDatePicker } from "@/components/common/MeetingDatePicker";
import { updateMeetingDate, cascadeOnDeckDates } from "@/services/bookActions";
import { parseDateString } from "@/lib/utils";
import type { Tables } from "@/lib/database.types";
import { getHighResCover } from "@/lib/utils";

interface CurrentlyReadingCardProps {
	userId: string | null;
	refreshKey?: number;
	onDateChange?: () => void;
}

type AppSettings = Pick<
	Tables<"app_settings">,
	"meeting_link" | "last_meeting_date"
>;

function addTwoWeeks(dateStr: string): Date {
	const d = parseDateString(dateStr);
	d.setDate(d.getDate() + 14);
	return d;
}

export function CurrentlyReadingCard({ userId, refreshKey, onDateChange }: CurrentlyReadingCardProps) {
	const [book, setBook] = useState<Tables<"books"> | null>(null);
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetch() {
			setIsLoading(true);
			setError(null);

			const [bookResult, settingsResult] = await Promise.all([
				supabase
					.from("books")
					.select("*")
					.eq("status", "currently_reading")
					.limit(1)
					.maybeSingle(),
				supabase
					.from("app_settings")
					.select("meeting_link, last_meeting_date")
					.limit(1)
					.maybeSingle(),
			]);

			if (bookResult.error || settingsResult.error) {
				setError("Couldn't load the current book. Please refresh.");
				setIsLoading(false);
				return;
			}

			setBook(bookResult.data);
			setSettings(settingsResult.data);
			setIsLoading(false);
		}

		fetch();
	}, [refreshKey]);

	async function handleDateChange(newDate: Date) {
		if (!book) return;
		const prevDate = book.next_meeting_date;
		const oldBase = book.next_meeting_date
			? parseDateString(book.next_meeting_date)
			: settings?.last_meeting_date
				? addTwoWeeks(settings.last_meeting_date)
				: null;
		setBook({ ...book, next_meeting_date: newDate.toISOString() });

		const [err1, err2] = await Promise.all([
			updateMeetingDate(book.id, newDate),
			oldBase ? cascadeOnDeckDates(oldBase, newDate) : Promise.resolve(null),
		]);

		if (err1 || err2) {
			setBook((prev) => prev ? { ...prev, next_meeting_date: prevDate } : prev);
		} else {
			onDateChange?.();
		}
	}

	if (isLoading) return <BookCardSkeleton tall />;

	if (error) {
		return <p className="text-sm text-(--spooky-dust)">{error}</p>;
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
			? addTwoWeeks(settings.last_meeting_date)
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
						onChange={userId ? handleDateChange : undefined}
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
