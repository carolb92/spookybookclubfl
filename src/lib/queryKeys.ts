import type { Database } from "@/lib/database.types";

type BookStatus = Database["public"]["Enums"]["book_status_enum"];

export const bookKeys = {
	all: ["books"] as const,
	byStatus: (status: BookStatus) => [...bookKeys.all, status] as const,
	// TBR is the only status whose cached data includes per-user vote info,
	// so it's the only one keyed on userId.
	tbr: (userId: string | null) => [...bookKeys.byStatus("tbr"), userId] as const,
};
