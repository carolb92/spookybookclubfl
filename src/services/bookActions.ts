import { supabase } from "@/lib/supabaseClient";
import { parseDateString } from "@/lib/utils";

export async function getCurrentlyReadingBook(): Promise<{
	data: { id: string; title: string } | null;
	error: string | null;
}> {
	const { data, error } = await supabase
		.from("books")
		.select("id, title")
		.eq("status", "currently_reading")
		.limit(1)
		.maybeSingle();

	if (error) return { data: null, error: "Something went wrong. Please try again." };
	return { data, error: null };
}

export async function markAsCurrentlyReading(bookId: string): Promise<string | null> {
	const { error } = await supabase
		.from("books")
		.update({ status: "currently_reading", date_started: new Date().toISOString() })
		.eq("id", bookId);

	return error ? "Failed to update. Please try again." : null;
}

export async function markAsRead(bookId: string): Promise<string | null> {
	const [{ data: book }, { error: updateError }] = await Promise.all([
		supabase
			.from("books")
			.select("next_meeting_date")
			.eq("id", bookId)
			.maybeSingle(),
		supabase
			.from("books")
			.update({ status: "read", date_finished: new Date().toISOString() })
			.eq("id", bookId),
	]);

	if (updateError) return "Failed to update. Please try again.";

	if (book?.next_meeting_date) {
		await supabase
			.from("app_settings")
			.update({ last_meeting_date: book.next_meeting_date })
			.not("last_meeting_date", "is", null);
	}

	return null;
}

export async function markAsOnDeck(bookId: string): Promise<string | null> {
	// Find the furthest-out meeting date from existing on_deck/currently_reading books
	// to compute this book's suggested meeting date (+14 days after that anchor)
	const { data: anchor } = await supabase
		.from("books")
		.select("next_meeting_date")
		.in("status", ["on_deck", "currently_reading"])
		.not("next_meeting_date", "is", null)
		.order("next_meeting_date", { ascending: false })
		.limit(1)
		.maybeSingle();

	let nextMeetingDate: string | null = null;

	if (anchor?.next_meeting_date) {
		const d = parseDateString(anchor.next_meeting_date);
		d.setDate(d.getDate() + 14);
		nextMeetingDate = d.toISOString();
	} else {
		// No anchor in queue — fall back to app_settings: currently_reading ≈ last_meeting+14,
		// so this book ≈ last_meeting+28
		const { data: settings } = await supabase
			.from("app_settings")
			.select("last_meeting_date")
			.limit(1)
			.maybeSingle();
		if (settings?.last_meeting_date) {
			const d = parseDateString(settings.last_meeting_date);
			d.setDate(d.getDate() + 28);
			nextMeetingDate = d.toISOString();
		}
	}

	const { error } = await supabase
		.from("books")
		.update({ status: "on_deck", next_meeting_date: nextMeetingDate })
		.eq("id", bookId);

	return error ? "Failed to update. Please try again." : null;
}

export async function updateMeetingDate(bookId: string, date: Date): Promise<string | null> {
	const { error } = await supabase
		.from("books")
		.update({ next_meeting_date: date.toISOString() })
		.eq("id", bookId);
	return error ? "Failed to update. Please try again." : null;
}

export async function markAsTBR(bookId: string): Promise<string | null> {
	const { error } = await supabase
		.from("books")
		.update({ status: "tbr", date_started: null, next_meeting_date: null })
		.eq("id", bookId);

	return error ? "Failed to update. Please try again." : null;
}

export async function deleteBook(bookId: string): Promise<string | null> {
	const { error } = await supabase.from("books").delete().eq("id", bookId);
	return error ? "Failed to delete. Please try again." : null;
}

export async function fetchExcitementWeights(bookIds: string[]): Promise<Map<string, number>> {
	const { data } = await supabase
		.from("excitement_votes")
		.select("book_id, rating")
		.in("book_id", bookIds);

	const map = new Map<string, number>();
	if (!data) return map;

	const totals = new Map<string, { sum: number; count: number }>();
	for (const row of data) {
		const entry = totals.get(row.book_id) ?? { sum: 0, count: 0 };
		entry.sum += row.rating;
		entry.count += 1;
		totals.set(row.book_id, entry);
	}
	for (const [bookId, { sum, count }] of totals) {
		map.set(bookId, Math.max(1, (sum / count) * Math.log(count + 1)));
	}
	return map;
}
