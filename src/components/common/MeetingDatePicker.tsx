import { useState } from "react";
import { CalendarIcon, PencilIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface MeetingDatePickerProps {
	date: Date | null;
	/** When provided, renders an edit button to open the date picker. */
	onChange?: (date: Date) => void;
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

// Overrides ShadCN's default light-mode tokens to match the spooky design system
const calendarTheme = {
	"--background": "#120f15",
	"--foreground": "#e4dce8",
	"--popover": "#120f15",
	"--popover-foreground": "#e4dce8",
	"--primary": "#7d3048",
	"--primary-foreground": "#e4dce8",
	"--muted": "rgba(220,210,230,0.06)",
	"--muted-foreground": "#9488a0",
	"--accent": "rgba(220,210,230,0.06)",
	"--accent-foreground": "#e4dce8",
	"--border": "rgba(220,210,230,0.08)",
	"--ring": "rgba(220,210,230,0.2)",
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
