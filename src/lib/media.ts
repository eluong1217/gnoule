export type MediaType = 'movie' | 'book' | 'game';

export type MediaEntry = {
	date: string; // YYYY-MM-DD
	type: MediaType;
	title: string;
	posterUrl?: string;
	link?: string;
};

export type Day = { date: string; label: string; entries: MediaEntry[] };

export const MEDIA_TYPES: MediaType[] = ['movie', 'book', 'game'];

export const MEDIA_META: Record<MediaType, { label: string; className: string }> = {
	movie: { label: 'Films', className: 'films' },
	book: { label: 'Books', className: 'books' },
	game: { label: 'Games', className: 'games' }
};

export const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

const localDate = (iso: string) => new Date(`${iso}T00:00:00`);

export function groupByDate(entries: MediaEntry[]) {
	const map = new Map<string, MediaEntry[]>();
	for (const e of entries) {
		const arr = map.get(e.date);
		if (arr) arr.push(e);
		else map.set(e.date, [e]);
	}
	return map;
}

/** Number of distinct titles per media type. */
export function countByType(entries: MediaEntry[]) {
	const counts: Record<MediaType, number> = { movie: 0, book: 0, game: 0 };
	const seen = new Set<string>();
	for (const e of entries) {
		const key = `${e.type}:${e.title}`;
		if (seen.has(key)) continue;
		seen.add(key);
		counts[e.type]++;
	}
	return counts;
}

/** Years with at least one entry, plus the current year, newest first. */
export function yearsWithEntries(entries: MediaEntry[], thisYear: number) {
	const years = new Set<number>([thisYear]);
	for (const e of entries) years.add(localDate(e.date).getFullYear());
	return [...years].sort((a, b) => b - a);
}

/**
 * Week columns (Sunday-first) for the heatmap.
 * Past year: exactly Jan 1–Dec 31, no padding into adjacent years (first/last columns
 * may be partial weeks). Current year: rolling 365 days ending today (GitHub-style).
 */
export function buildWeeks(year: number, thisYear: number, byDate: Map<string, MediaEntry[]>) {
	let start: Date;
	let end: Date;

	if (year === thisYear) {
		end = new Date();
		end.setHours(0, 0, 0, 0);
		start = new Date(end);
		start.setDate(start.getDate() - 365);
	} else {
		start = new Date(year, 0, 1);
		end = new Date(year, 11, 31);
	}

	const weeks: Day[][] = [];
	let week: Day[] = [];
	const cursor = new Date(start);
	while (cursor <= end) {
		const iso = cursor.toISOString().slice(0, 10);
		week.push({ date: iso, label: cursor.toDateString(), entries: byDate.get(iso) ?? [] });
		if (cursor.getDay() === 6) {
			weeks.push(week);
			week = [];
		}
		cursor.setDate(cursor.getDate() + 1);
	}
	if (week.length) weeks.push(week);
	return weeks;
}

/** One label per month, positioned at the first week column that starts in it. */
export function buildMonthLabels(weeks: Day[][]) {
	const labels: { text: string; weekIndex: number }[] = [];
	let last = -1;
	weeks.forEach((week, i) => {
		const m = localDate(week[0].date).getMonth();
		if (m === last) return;
		last = m;
		labels.push({ text: MONTHS[m], weekIndex: i });
	});
	return labels;
}

/** "07 MAR 2026" from "2026-03-07". */
export function formatDayHeading(iso: string) {
	const [year, month, day] = iso.split('-');
	return `${day} ${MONTHS[Number(month) - 1].toUpperCase()} ${year}`;
}

/** Letterboxd diary links are per-user; point at the film's public page instead. */
export function cleanLink(url?: string) {
	return url?.replace(/^(https:\/\/letterboxd\.com)\/[^/]+\/film\//, '$1/film/');
}
