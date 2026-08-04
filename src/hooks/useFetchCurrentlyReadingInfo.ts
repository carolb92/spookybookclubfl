import { useQuery } from "@tanstack/react-query";
import { bookKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabaseClient";

async function fetchCurrentlyReadingInfo() {
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
		console.error(
			"Failed to fetch currently reading info: ",
			bookResult.error ?? settingsResult.error,
		);
		throw new Error(
			"Couldn't load currently reading info. Please refresh the page.",
		);
	}

	return { book: bookResult.data, settings: settingsResult.data };
}

export function useFetchCurrentlyReadingInfo() {
	return useQuery({
		queryKey: bookKeys.byStatus("currently_reading"),
		queryFn: fetchCurrentlyReadingInfo,
	});
}
