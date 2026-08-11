<script lang="ts">
	import { slide } from 'svelte/transition';

	type MediaType = 'movie' | 'book' | 'game';
	type Entry = { date: string; type: MediaType; title: string; posterUrl?: string; link?: string };
	type Day = { date: string; label: string; entries: Entry[] };

	let { entries = [] }: { entries: Entry[] } = $props();
	
	/*
	function slugify(title: string) {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	// Stand-in data — swap for the real fetch from media:movies / media:games / media:books
	// (Letterboxd RSS, Steam, Hardcover) once the cron worker + KV are wired up.
	// Letterboxd's RSS gives a poster image + film link per entry for free, so movies get both here.
	const entries: Entry[] = generateMockEntries();

	function generateMockEntries(): Entry[] {
		const titles: Record<MediaType, string[]> = {
			movie: ['Oldboy', 'Parasite', 'Whiplash', 'Her', 'The Fall', 'Perfect Days'],
			book: ['Piranesi', 'Klara and the Sun', 'The Fifth Season', 'Circe'],
			game: ['Hades', 'Outer Wilds', 'Disco Elysium', 'Celeste']
		};
		const out: Entry[] = [];
		const today = new Date();
		for (let i = 0; i < 365; i++) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			for (const type of ['movie', 'book', 'game'] as MediaType[]) {
				if (Math.random() < 0.12) {
					const pool = titles[type];
					const title = pool[Math.floor(Math.random() * pool.length)];
					const entry: Entry = { date: d.toISOString().slice(0, 10), type, title };
					if (type === 'movie') {
						entry.posterUrl = `https://picsum.photos/seed/${encodeURIComponent(title)}/80/120`;
						entry.link = `https://letterboxd.com/film/${slugify(title)}/`;
					}
					out.push(entry);
				}
			}
		}
		return out;
	}
	*/

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
		for (const e of entries) c[e.type]++;
		return c;
	});

	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	// 53 columns, Sunday-aligned, ending today — classic contribution-graph shape
	const weeks = $derived.by(() => {
		const end = new Date();
		end.setHours(0, 0, 0, 0);
		const start = new Date(end);
		start.setDate(start.getDate() - end.getDay() - 7 * 52);

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

	// month label per week column: show only where the month changes
	const monthLabels = $derived.by(() => {
		let last = -1;
		return weeks.map((week) => {
			const m = new Date(week[0].date).getMonth();
			if (m === last) return '';
			last = m;
			return MONTHS[m];
		});
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

	let expanded = $state(true);
	let selectedDate = $state<string | null>(null);

	const selected = $derived.by(() => weeks.flat().find((d) => d.date === selectedDate) ?? null);

	function selectDay(day: Day) {
		selectedDate = selectedDate === day.date ? null : day.date;
	}
</script>

<section class="media-activity">
	<div class="label">Fun Facts</div>
	<div class="card">
		<div class="header">
			<button class="expand-toggle" onclick={() => (expanded = !expanded)} aria-expanded={expanded}>
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
			</div>
		</div>

		{#if expanded}
			<div class="heatmap-wrap" transition:slide={{ duration: 300 }}>
				<div class="heatmap-scroll">
					<div class="heatmap">
						<div class="months">
							{#each monthLabels as label}
								<span class="month">{label}</span>
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
										>
											{#if selected?.date === day.date}
												<span>{String(new Date(`${day.date}T00:00:00`).getDate()).padStart(2, '0')}</span>
											{/if}
										</button>
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
									{@const entry = selected.entries.find((e) => e.type === type)}
									{#if entry}
										<div class="media-item">
											{#if entry.posterUrl}
												<a
													class="media-thumb"
													href={entry.link}
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
									{/if}
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
		overflow-x: auto;
		padding: 0.15rem 0 0.35rem;
		scrollbar-width: thin;
	}

	.heatmap {
		min-width: 890px;
	}

	.months {
		display: grid;
		grid-template-columns: repeat(53, 1fr);
		gap: 4px;
		margin-bottom: 0.3rem;
		padding: 0 1px;
	}

	.month {
		min-width: 12px;
		height: 0.85rem;
		color: var(--color-text);
		opacity: 0.55;
		font-size: 0.66rem;
		line-height: 1;
	}

	.grid {
		display: flex;
		gap: 4px;
	}

	.week {
		display: flex;
		flex: 1 0 12px;
		flex-direction: column;
		gap: 4px;
	}

	.cell {
		position: relative;
		display: grid;
		width: 12px;
		height: 12px;
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

	.cell > span {
		position: absolute;
		z-index: 2;
		color: var(--color-bg);
		font-size: 0.57rem;
		font-weight: 700;
		line-height: 1;
		pointer-events: none;
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
		width: 24px;
		height: 24px;
		margin: -6px;
		border: 2px solid var(--color-text);
		border-radius: 6px;
		background: var(--color-accent);
		box-shadow: 0 0 0 1px var(--color-bg);
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