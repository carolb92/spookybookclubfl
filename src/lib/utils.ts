import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a date string from Supabase (any ISO format) into a local-noon Date.
 * Using local noon avoids the off-by-one-day display bug that occurs when UTC
 * midnight is interpreted in a negative-offset timezone, and sidesteps DST
 * edge cases that can affect local midnight.
 */
export function parseDateString(dateStr: string): Date {
	const [year, month, day] = dateStr.substring(0, 10).split("-").map(Number);
	return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function getHighResCover(url: string): string {
  return url
    .replace(/^http:\/\//, "https://")
    .replace(/zoom=\d+/, "zoom=0")
    .replace(/&edge=curl/, "");
}
