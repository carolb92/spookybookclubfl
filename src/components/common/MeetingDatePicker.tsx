import { useState } from "react";
import { CalendarIcon, PencilIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils";

interface MeetingDatePickerProps {
	date: Date | null;
	/** When provided, renders an edit button to open the date picker. */
	onChange?: (date: Date) => void;
}

// Overrides ShadCN's default light-mode tokens to match the spooky design system
const calendarTheme = {
	"--background": "var(--spooky-bg)",
	"--foreground": "var(--spooky-parchment)",
	"--popover": "var(--spooky-bg)",
	"--popover-foreground": "var(--spooky-parchment)",
	"--primary": "var(--spooky-crimson)",
	"--primary-foreground": "var(--spooky-parchment)",
	"--muted": "var(--spooky-surface)",
	"--muted-foreground": "var(--spooky-dust)",
	"--accent": "var(--spooky-surface)",
	"--accent-foreground": "var(--spooky-parchment)",
	"--border": "var(--spooky-border)",
	"--ring": "var(--spooky-border)",
} as React.CSSProperties;

export function MeetingDatePicker({ date, onChange }: MeetingDatePickerProps) {
	const [open, setOpen] = useState(false);

	function handleSelect(day: Date | undefined) {
		if (!day || !onChange) return;
		setOpen(false);
		onChange(day);
	}

	return (
		<div className="flex items-center gap-1.5">
			<CalendarIcon className="size-3 text-(--spooky-crimson) shrink-0" />
			<span className="text-(--spooky-dust)">
				{date ? formatDate(date) : "Date TBD"}
			</span>
			{onChange && (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<button
							aria-label="Edit meeting date"
							className="flex items-center text-(--spooky-dust) hover:text-(--spooky-parchment) transition-colors cursor-pointer"
						>
							<PencilIcon className="size-3" />
						</button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto p-0 border-(--spooky-border)"
						align="start"
						style={calendarTheme}
					>
						<Calendar
							mode="single"
							selected={date ?? undefined}
							defaultMonth={date ?? undefined}
							onSelect={handleSelect}
						/>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
