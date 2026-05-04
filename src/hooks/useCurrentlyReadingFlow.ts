import { useState } from "react";
import {
	getCurrentlyReadingBook,
	markAsCurrentlyReading,
	markAsRead,
} from "@/services/bookActions";

export type CurrentlyReadingFlowState = "confirm" | "conflict" | null;

export interface CurrentlyReadingFlow {
	flowState: CurrentlyReadingFlowState;
	existingBook: { id: string; title: string } | null;
	isChecking: boolean;
	isSubmitting: boolean;
	error: string | null;
	initiate: () => Promise<void>;
	confirm: () => Promise<void>;
	replace: () => Promise<void>;
	close: () => void;
}

export function useCurrentlyReadingFlow(
	bookId: string,
	onSuccess: () => void,
): CurrentlyReadingFlow {
	const [flowState, setFlowState] = useState<CurrentlyReadingFlowState>(null);
	const [existingBook, setExistingBook] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const [isChecking, setIsChecking] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function close() {
		setFlowState(null);
		setExistingBook(null);
		setError(null);
	}

	async function initiate() {
		setIsChecking(true);
		setError(null);
		const { data: existing, error } = await getCurrentlyReadingBook();
		setIsChecking(false);
		if (error) {
			setError(error);
			return;
		}
		setExistingBook(existing);
		setFlowState(existing ? "conflict" : "confirm");
	}

	async function confirm() {
		setIsSubmitting(true);
		setError(null);
		const err = await markAsCurrentlyReading(bookId);
		setIsSubmitting(false);
		if (err) {
			setError(err);
			return;
		}
		close();
		onSuccess();
	}

	async function replace() {
		if (!existingBook) return;
		setIsSubmitting(true);
		setError(null);
		const [finishError, startError] = await Promise.all([
			markAsRead(existingBook.id),
			markAsCurrentlyReading(bookId),
		]);
		setIsSubmitting(false);
		if (finishError || startError) {
			setError("Failed to update. Please try again.");
			return;
		}
		close();
		onSuccess();
	}

	return {
		flowState,
		existingBook,
		isChecking,
		isSubmitting,
		error,
		initiate,
		confirm,
		replace,
		close,
	};
}
