import { supabase } from "@/lib/supabaseClient";

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
	const { error } = await supabase
		.from("books")
		.update({ status: "read", date_finished: new Date().toISOString() })
		.eq("id", bookId);

	return error ? "Failed to update. Please try again." : null;
}

export async function markAsOnDeck(bookId: string): Promise<string | null> {
	const { error } = await supabase
		.from("books")
		.update({ status: "on_deck" })
		.eq("id", bookId);

	return error ? "Failed to update. Please try again." : null;
}

export async function deleteBook(bookId: string): Promise<string | null> {
	const { error } = await supabase.from("books").delete().eq("id", bookId);
	return error ? "Failed to delete. Please try again." : null;
}
