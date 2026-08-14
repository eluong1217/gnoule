<script lang="ts">
	import { slide } from 'svelte/transition';

	type MediaType = 'movie' | 'book' | 'game';
	type Entry = { date: string; type: MediaType; title: string; posterUrl?: string; link?: string };
	type Day = { date: string; label: string; entries: Entry[] };

	let { entries = [] }: { entries: Entry[] } = $props();

	const byDate = $derived.by(() => {
		const map = new Map<string, Entry[]>();
		for (const e of entries) {
			const arr = map.get(e.date);
			if (arr) arr.push(e);
			else map.set(e.date, [e]);
		}
		return map;
	});

	const counts = $derived.by(() => {
	const c = { movie: 0, book: 0, game: 0 };
	const seen = new Set<string>();
		for (const e of entries) {
			const key = `${e.type}:${e.title}`;
			if (seen.has(key)) continue;
			seen.add(key);
			c[e.type]++;
		}
		return c;
	});

	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const thisYear = new Date().getFullYear();

	// Years with at least one entry, plus the current year, newest first
	const availableYears = $derived.by(() => {
		const years = new Set<number>([thisYear]);
		for (const e of entries) years.add(new Date(`${e.date}T00:00:00`).getFullYear());
		return [...years].sort((a, b) => b - a);
	});

	let selectedYear = $state(thisYear);

	// Selected year: exactly Jan 1–Dec 31, no padding into adjacent years (first/last columns
	// may be partial weeks). Current year: rolling 365 days ending today (GitHub-style).
	const weeks = $derived.by(() => {
		let start: Date;
		let end: Date;

		if (selectedYear === thisYear) {
			end = new Date();
			end.setHours(0, 0, 0, 0);
			start = new Date(end);
			start.setDate(start.getDate() - 365);
		} else {
			start = new Date(selectedYear, 0, 1);
			end = new Date(selectedYear, 11, 31);
		}

		const out: Day[][] = [];
		let week: Day[] = [];
		const cursor = new Date(start);
		while (cursor <= end) {
			const iso = cursor.toISOString().slice(0, 10);
			week.push({ date: iso, label: cursor.toDateString(), entries: byDate.get(iso) ?? [] });
			if (cursor.getDay() === 6) {
				out.push(week);
				week = [];
			}
			cursor.setDate(cursor.getDate() + 1);
		}
		if (week.length) out.push(week);
		return out;
	});

	// { text, weekIndex } for each month that starts within a given week column — positioned, not one-per-column
	const monthLabels = $derived.by(() => {
		const labels: { text: string; weekIndex: number }[] = [];
		let last = -1;
		weeks.forEach((week, i) => {
			const m = new Date(`${week[0].date}T00:00:00`).getMonth();
			if (m === last) return;
			last = m;
			labels.push({ text: MONTHS[m], weekIndex: i });
		});
		return labels;
	});

	const typeIcon: Record<MediaType, string> = { movie: '▤', book: '▥', game: '⌁' };
	const typeGroupLabel: Record<MediaType, string> = { movie: 'Films', book: 'Books', game: 'Games' };
	const typeClass: Record<MediaType, string> = { movie: 'films', book: 'books', game: 'games' };
	const ALL_TYPES: MediaType[] = ['movie', 'book', 'game'];

	let activeTypes = $state<Set<MediaType>>(new Set(ALL_TYPES));

	function toggleType(type: MediaType) {
		const next = new Set(activeTypes);
		next.has(type) ? next.delete(type) : next.add(type);
		activeTypes = next;
	}

	function visibleEntries(day: Day) {
		return day.entries.filter((e) => activeTypes.has(e.type));
	}

	function level(day: Day) {
		const n = visibleEntries(day).length;
		return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : 3;
	}

	function tooltip(day: Day) {
		const visible = visibleEntries(day);
		if (!visible.length) return day.label;
		const list = visible.map((e) => `${e.type}: ${e.title}`).join(' · ');
		return `${day.label} — ${list}`;
	}

	let sectionEl: HTMLElement | undefined = $state();
	let expanded = $state(true);

	function toggleExpanded() {
		expanded = !expanded;
		if (expanded) {
			setTimeout(() => {
				sectionEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 300);
		}
	}

	let selectedDate = $state<string | null>(null);

	const selected = $derived.by(() => weeks.flat().find((d) => d.date === selectedDate) ?? null);

	function selectDay(day: Day) {
		selectedDate = selectedDate === day.date ? null : day.date;
	}

	function cleanLink(url?: string) {
		return url?.replace(/^(https:\/\/letterboxd\.com)\/[^/]+\/film\//, '$1/film/');
	}
</script>

<section class="media-activity" bind:this={sectionEl}>
	<div class="label">Fun Facts</div>
	<div class="card">
		<div class="header">
			<button class="expand-toggle" onclick={toggleExpanded} aria-expanded={expanded}>
				<p class="summary">
					I enjoy watching movies, reading books, and playing video games in my free time.
					Here is an updating log of everything I've watched, read, and played in the recent years.
				</p>
			</button>
			<div class="tags">
				{#each ALL_TYPES as type}
					<button
						type="button"
						class="tag {typeClass[type]}"
						class:active={activeTypes.has(type)}
						aria-pressed={activeTypes.has(type)}
						onclick={() => toggleType(type)}
					>
						<span class="icon">{typeIcon[type]}</span>{counts[type]}
						{typeGroupLabel[type].toUpperCase()}
					</button>
				{/each}

				<select class="year-select" bind:value={selectedYear} aria-label="Select year">
					{#each availableYears as year}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</div>
		</div>

		{#if expanded}
			<div class="heatmap-wrap" transition:slide={{ duration: 300 }}>
				<div class="heatmap-scroll">
					<div class="heatmap">
						<div class="months" style="--week-count: {weeks.length};">
							{#each monthLabels as label}
								<span class="month" style="--week-index: {label.weekIndex};">{label.text}</span>
							{/each}
						</div>
						<div class="grid">
							{#each weeks as week}
								<div class="week">
									{#each week as day}
										<button
											type="button"
											class="cell level-{level(day)}"
											class:selected={selected?.date === day.date}
											title={tooltip(day)}
											aria-label={tooltip(day)}
											aria-pressed={selected?.date === day.date}
											onclick={() => selectDay(day)}
										></button>
									{/each}
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div class="legend">
					<span>Less</span>
					<div class="cell level-0"></div>
					<div class="cell level-1"></div>
					<div class="cell level-2"></div>
					<div class="cell level-3"></div>
					<span>More</span>
				</div>

				<div class="detail">
					{#if selected}
						<div class="detail-heading">
							ACTIVITY FOR {selected.date.slice(8, 10)} {MONTHS[Number(selected.date.slice(5, 7)) - 1].toUpperCase()} {selected.date.slice(0, 4)}
						</div>

						{#if selected.entries.length}
							<div class="day-media">
								{#each ALL_TYPES as type}
									{#each selected.entries.filter((e) => e.type === type) as entry}
										<div class="media-item">
											{#if entry.posterUrl}
												<a
													class="media-thumb"
													href={cleanLink(entry.link)}
													target="_blank"
													rel="noopener noreferrer"
													aria-label="{entry.title} on Letterboxd"
												>
													<img src={entry.posterUrl} alt="" />
													<span class="type-badge {typeClass[type]}">{typeIcon[type]}</span>
												</a>
											{:else}
												<div class="media-thumb placeholder" title={typeGroupLabel[type]}>
													{typeIcon[type]}
													<span class="type-badge {typeClass[type]}">{typeIcon[type]}</span>
												</div>
											{/if}
											<span class="media-title">{entry.title}</span>
										</div>
									{/each}
								{/each}
							</div>
						{:else}
							<p class="detail-empty">Nothing logged this day.</p>
						{/if}
					{:else}
						<p class="detail-empty">Click a square above to see what it was.</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.media-activity {
		width: min(100%, 1050px);
		margin: 0 auto;
		padding: 1.2rem 1.5rem 2rem;
	}

	.label {
		margin: 0 0 0.35rem;
		padding-left: 0.05rem;
		color: var(--color-accent);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.card {
		background: linear-gradient(
			145deg,
			var(--color-surface),
			color-mix(in srgb, var(--color-surface) 85%, var(--color-bg))
		);
		border: 1px solid var(--color-border);
		border-radius: 7px;
		box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
		overflow: hidden;
		transition: border-color 0.2s ease;
	}

	.card:hover {
		border-color: var(--color-accent);
	}

	.header {
		padding: 1.5rem 1.65rem 0.75rem;
	}

	.expand-toggle {
		width: 100%;
		padding: 0;
		background: transparent;
		border: 0;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.summary {
		margin: 0;
		color: var(--color-text);
		opacity: 0.85;
		font-size: 0.92rem;
		line-height: 1.42;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
		margin-top: 0.8rem;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.32rem 0.7rem;
		border: 1px solid;
		border-radius: 999px;
		font: inherit;
		font-size: 0.73rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 1;
		cursor: pointer;
		opacity: 0.45;
		transition: opacity 0.15s ease;
	}

	.tag:hover {
		opacity: 0.75;
	}

	.tag.active {
		opacity: 1;
	}

	.tag.active:hover {
		opacity: 1;
	}

	.tag .icon {
		font-size: 0.9rem;
		line-height: 0;
	}

	.year-select {
		margin-left: auto;
		padding: 0.32rem 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
		font-size: 0.73rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.year-select:hover {
		border-color: var(--color-accent);
	}

	/* Category colors are fixed brand hues (not theme-driven) so films/books/games
	   stay visually distinct in both light and dark mode — same idea as GitHub's
	   language-color dots. Alpha blends against whatever surface sits behind them. */
	.films { color: #5b96c4; background: rgba(55, 103, 148, 0.16); border-color: rgba(84, 127, 165, 0.55); }
	.books { color: #5f9d74; background: rgba(56, 104, 69, 0.16); border-color: rgba(96, 139, 110, 0.55); }
	.games { color: #c48a4f; background: rgba(139, 82, 38, 0.18); border-color: rgba(163, 109, 60, 0.55); }

	.heatmap-wrap {
		padding: 0.45rem 1.65rem 1.35rem;
	}

	.heatmap-scroll {
		padding: 0.15rem 0 0.35rem;
	}

	.months {
		position: relative;
		height: 0.85rem;
		margin-bottom: 0.3rem;
	}

	.month {
		position: absolute;
		left: calc(var(--week-index) / var(--week-count) * 100%);
		color: var(--color-text);
		opacity: 0.55;
		font-size: 0.66rem;
		line-height: 1;
		white-space: nowrap;
	}

	.grid {
		display: flex;
		gap: clamp(2px, 0.4vw, 4px);
	}

	.week {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		gap: clamp(2px, 0.4vw, 4px);
	}

	.cell {
		position: relative;
		display: grid;
		width: 100%;
		aspect-ratio: 1 / 1;
		padding: 0;
		place-items: center;
		border: 0;
		border-radius: 3px;
		background: var(--color-border);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-text) 6%, transparent);
		cursor: pointer;
		transition: transform 0.12s ease, box-shadow 0.12s ease;
	}

	.cell:hover {
		transform: scale(1.2);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.cell.level-1 {
		background: color-mix(in srgb, var(--color-accent) 35%, var(--color-border));
	}

	.cell.level-2 {
		background: color-mix(in srgb, var(--color-accent) 65%, var(--color-border));
	}

	.cell.level-3 {
		background: var(--color-accent);
	}

	.cell.selected {
		box-shadow:
			0 0 0 2px var(--color-bg),
			0 0 0 4px var(--color-text);
		z-index: 3;
	}

	.legend {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.28rem;
		margin-top: 0.75rem;
		color: var(--color-text);
		opacity: 0.6;
		font-size: 0.7rem;
	}

	.legend .cell {
		width: 13px;
		height: 13px;
		cursor: default;
	}

	.detail {
		margin-top: 1.25rem;
		padding-top: 0.9rem;
		border-top: 1px solid var(--color-border);
	}

	.detail-heading {
		margin-bottom: 0.55rem;
		color: var(--color-text);
		opacity: 0.85;
		font-size: 0.95rem;
		font-weight: 700;
	}

	.day-media {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.media-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		width: 138px;
	}

	.media-thumb {
		position: relative;
		display: block;
		width: 96px;
		height: 138px;
		border-radius: 5px;
		overflow: visible;
		color: inherit;
		text-decoration: none;
	}

	.media-thumb img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 5px;
	}

	.media-thumb.placeholder {
		display: grid;
		place-items: center;
		background: color-mix(in srgb, var(--color-border) 70%, var(--color-surface));
		color: var(--color-text);
		opacity: 0.55;
		font-size: 1.8rem;
	}

	.type-badge {
		position: absolute;
		bottom: -8px;
		right: -8px;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid var(--color-surface);
		font-size: 0.85rem;
		line-height: 1;
	}

	.type-badge.films { background: #5b96c4; color: #0d1f2c; }
	.type-badge.books { background: #5f9d74; color: #0c1b12; }
	.type-badge.games { background: #c48a4f; color: #241304; }

	.media-title {
		max-width: 100%;
		color: var(--color-text);
		opacity: 0.75;
		font-size: 0.72rem;
		line-height: 1.25;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.detail-empty {
		margin: 0;
		color: var(--color-text);
		opacity: 0.55;
		font-size: 0.8rem;
	}

	@media (max-width: 700px) {
		.media-activity { padding-inline: 0.8rem; }
		.header, .heatmap-wrap { padding-inline: 1rem; }
	}
</style>