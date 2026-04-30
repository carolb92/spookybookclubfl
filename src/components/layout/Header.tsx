import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";

interface HeaderProps {
	className?: string;
}

export function Header({ className }: HeaderProps) {
	const { session } = useAuth();
	return (
		<header
			className={cn("relative w-full px-6 py-5 md:px-10 md:py-6", className)}
		>
			{/* Top ruled line */}
			<div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-(--spooky-crimson)/40 to-transparent" />

			<div className="flex items-center justify-between">
				{/* Logo / Title */}
				<div className="flex flex-col gap-0.5">
					<h1 className="font-display text-2xl md:text-3xl tracking-wide text-(--spooky-parchment) leading-none">
						Spooky Book Club FL 👻
					</h1>
					<div className="h-px w-full bg-linear-to-r from-(--spooky-crimson)/60 to-transparent" />
				</div>

				<div className="flex items-center gap-2">
					{session?.user.email && (
						<span className="text-xs tracking-widest uppercase text-(--spooky-dust) opacity-60 sm:block">
							{session.user.email}
						</span>
					)}
				</div>
			</div>

			{/* Bottom ruled line */}
			<div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-(--spooky-border) to-transparent" />
		</header>
	);
}
