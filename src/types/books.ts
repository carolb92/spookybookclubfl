import type { Tables } from "@/lib/database.types";

export type BookWithStats = Tables<"books"> & {
	avgExcitement: number | null;
	userVote: number | null;
};
