import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateInviteCode, sendMagicLink } from "@/services/auth";

type View = "form" | "success";

type AuthModalProps = {
	action?: string;
	children: React.ReactNode;
};

export function AuthModal({ children, action = "continue" }: AuthModalProps) {
	const [view, setView] = useState<View>("form");
	const [inviteCode, setInviteCode] = useState("");
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const valid = await validateInviteCode(inviteCode.trim());
			if (!valid) {
				setError("🙅🏽‍♀️ That invite code isn't valid. 🙅🏽‍♀️");
				return;
			}
			await sendMagicLink(email.trim());
			setView("success");
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setView("form");
			setInviteCode("");
			setEmail("");
			setError(null);
		}
	};

	return (
		<Dialog onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className={cn(
					"max-w-full border-(--spooky-border) bg-(--spooky-surface)",
					"text-(--spooky-parchment) shadow-2xl shadow-black/70",
					"sm:max-w-md",
				)}
				showCloseButton
			>
				{view === "form" && (
					<DialogHeader>
						<DialogTitle className="font-display text-base tracking-wide text-(--spooky-parchment)">
							{`Enter the invite code to ${action}`}
						</DialogTitle>
						<div className="h-px bg-linear-to-r from-(--spooky-crimson)/40 to-transparent" />
					</DialogHeader>
				)}

				{view === "form" ? (
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
						style={{ animation: "fadeUp 0.2s ease-out both" }}
					>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="invite-code"
								className="text-xs text-(--spooky-parchment)/70"
							>
								Invite code
							</label>
							<Input
								id="invite-code"
								value={inviteCode}
								onChange={(e) => setInviteCode(e.target.value)}
								placeholder="Enter your invite code"
								required
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="email"
								className="text-xs text-(--spooky-parchment)/70"
							>
								Email
							</label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								required
							/>
						</div>
						{error && (
							<p className="text-(--spooky-crimson) font-display font-semibold text-lg text-center">
								{error}
							</p>
						)}
						<Button
							type="submit"
							disabled={isLoading}
							className={cn(
								"h-8 rounded-md text-xs font-semibold tracking-wide",
								"bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment)",
								"border border-(--spooky-crimson)/60 hover:border-(--spooky-crimson)",
								"transition-all duration-150",
							)}
						>
							{isLoading ? "Checking..." : "Continue"}
						</Button>
					</form>
				) : (
					<div
						className="flex flex-col gap-2 py-1"
						style={{ animation: "fadeUp 0.2s ease-out both" }}
					>
						<p className="text-sm text-(--spooky-parchment)/80">
							Nailed it. Check your email for a magic link to sign in. 🤙🏽
						</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
