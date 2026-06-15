import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
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

export function localISODate(date: Date): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

export function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

export function getHighResCover(url: string): string {
	try {
		const u = new URL(url.replace(/^http:\/\//, "https://"));
		u.searchParams.delete("edge");
		if (!u.searchParams.has("w")) {
			u.searchParams.set("w", "400");
		}
		return u.toString();
	} catch {
		return url;
	}
}
