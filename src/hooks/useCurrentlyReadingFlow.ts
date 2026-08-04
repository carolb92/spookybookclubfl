import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getCurrentlyReadingBook,
	markAsCurrentlyReading,
	markAsRead,
} from "@/services/bookActions";
import { bookKeys } from "@/lib/queryKeys";

export type CurrentlyReadingFlowState = "confirm" | "conflict" | null;

export interface CurrentlyReadingFlow {
	flowState: CurrentlyReadingFlowState;
	existingBook: { id: string; title: string } | null;
	isChecking: boolean;
	isSubmitting: boolean;
	error: string | null;
	initiate: () => Promise<void>;
	confirm: () => void;
	replace: () => void;
	close: () => void;
}

export function useCurrentlyReadingFlow(bookId: string): CurrentlyReadingFlow {
	const queryClient = useQueryClient();
	const [flowState, setFlowState] = useState<CurrentlyReadingFlowState>(null);
	const [existingBook, setExistingBook] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const [isChecking, setIsChecking] = useState(false);
	const [initiateError, setInitiateError] = useState<string | null>(null);

	function close() {
		setFlowState(null);
		setExistingBook(null);
		setInitiateError(null);
		confirmMutation.reset();
		replaceMutation.reset();
	}

	async function initiate() {
		setIsChecking(true);
		setInitiateError(null);
		const { data: existing, error } = await getCurrentlyReadingBook();
		setIsChecking(false);
		if (error) {
			setInitiateError(error);
			return;
		}
		setExistingBook(existing);
		setFlowState(existing ? "conflict" : "confirm");
	}

	const confirmMutation = useMutation({
		mutationFn: async () => {
			const err = await markAsCurrentlyReading(bookId);
			if (err) throw new Error(err);
		},
		onSuccess: () => {
			close();
			queryClient.invalidateQueries({ queryKey: bookKeys.all });
		},
	});

	const replaceMutation = useMutation({
		mutationFn: async () => {
			if (!existingBook) return;
			const [finishError, startError] = await Promise.all([
				markAsRead(existingBook.id),
				markAsCurrentlyReading(bookId),
			]);
			if (finishError || startError) {
				throw new Error("Failed to update. Please try again.");
			}
		},
		onSuccess: () => {
			close();
			queryClient.invalidateQueries({ queryKey: bookKeys.all });
		},
	});

	return {
		flowState,
		existingBook,
		isChecking,
		isSubmitting: confirmMutation.isPending || replaceMutation.isPending,
		error:
			initiateError ??
			confirmMutation.error?.message ??
			replaceMutation.error?.message ??
			null,
		initiate,
		confirm: () => confirmMutation.mutate(),
		replace: () => replaceMutation.mutate(),
		close,
	};
}
