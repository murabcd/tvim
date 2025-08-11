import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
	parseISO,
	format,
	isAfter,
	isToday,
	addDays,
	nextMonday,
	nextTuesday,
	nextWednesday,
	nextThursday,
	nextFriday,
	nextSaturday,
	nextSunday,
	startOfDay,
	isValid,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseDueDate(input: string): Date | null {
	const trimmed = input.trim().toLowerCase();

	// Handle relative dates
	if (trimmed === "today") {
		return startOfDay(new Date());
	}

	if (trimmed === "tomorrow") {
		return startOfDay(addDays(new Date(), 1));
	}

	if (trimmed === "next week") {
		return startOfDay(addDays(new Date(), 7));
	}

	// Handle day names
	const dayMap: Record<string, () => Date> = {
		monday: () => startOfDay(nextMonday(new Date())),
		tuesday: () => startOfDay(nextTuesday(new Date())),
		wednesday: () => startOfDay(nextWednesday(new Date())),
		thursday: () => startOfDay(nextThursday(new Date())),
		friday: () => startOfDay(nextFriday(new Date())),
		saturday: () => startOfDay(nextSaturday(new Date())),
		sunday: () => startOfDay(nextSunday(new Date())),
		mon: () => startOfDay(nextMonday(new Date())),
		tue: () => startOfDay(nextTuesday(new Date())),
		wed: () => startOfDay(nextWednesday(new Date())),
		thu: () => startOfDay(nextThursday(new Date())),
		fri: () => startOfDay(nextFriday(new Date())),
		sat: () => startOfDay(nextSaturday(new Date())),
		sun: () => startOfDay(nextSunday(new Date())),
	};

	if (dayMap[trimmed]) {
		return dayMap[trimmed]();
	}

	// Handle ISO date strings
	if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
		const date = parseISO(trimmed);
		return isValid(date) ? startOfDay(date) : null;
	}

	// Handle MM/DD/YYYY format
	if (trimmed.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
		const [month, day, year] = trimmed.split("/");
		const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		return isValid(date) ? startOfDay(date) : null;
	}

	// Handle DD/MM/YYYY format
	if (trimmed.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
		const [day, month, year] = trimmed.split("/");
		const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		return isValid(date) ? startOfDay(date) : null;
	}

	return null;
}

export function formatDueDate(date: Date): string {
	const now = new Date();
	const today = startOfDay(now);
	const tomorrow = startOfDay(addDays(now, 1));
	const dueDate = startOfDay(date);

	if (dueDate.getTime() === today.getTime()) {
		return "Today";
	} else if (dueDate.getTime() === tomorrow.getTime()) {
		return "Tomorrow";
	} else {
		return format(date, "MMM d");
	}
}

export function isOverdue(date: Date): boolean {
	return isAfter(startOfDay(new Date()), date);
}

export function isDueToday(date: Date): boolean {
	return isToday(date);
}

export function parseTags(tagsString?: string): string[] {
	if (!tagsString) return [];
	return tagsString
		.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);
}

export function formatTags(tags: string[]): string {
	return tags.join(", ");
}

export function extractTagsFromText(text: string): {
	text: string;
	tags: string[];
} {
	const tagRegex = /#(\w+)/g;
	const tags: string[] = [];
	const cleanText = text
		.replace(tagRegex, (_match, tag) => {
			tags.push(tag);
			return "";
		})
		.trim();

	return { text: cleanText, tags };
}

export function hasMatchingTags(
	todoTags: string[],
	filterTags: string[],
): boolean {
	if (filterTags.length === 0) return true;
	if (todoTags.length === 0) return false;

	return filterTags.some((filterTag) =>
		todoTags.some(
			(todoTag) => todoTag.toLowerCase() === filterTag.toLowerCase(),
		),
	);
}
