<script lang="ts">
	import { slide } from 'svelte/transition';

	type MediaType = 'movie' | 'book' | 'game';
	type Entry = { date: string; type: MediaType; title: string; posterUrl?: string; link?: string };
	type Day = { date: string; label: string; entries: Entry[] };

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

	function level(count: number) {
		return count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
	}

	function tooltip(day: Day) {
		if (!day.entries.length) return day.label;
		const list = day.entries.map((e) => `${e.type}: ${e.title}`).join(' · ');
		return `${day.label} — ${list}`;
	}

	const typeLabel: Record<MediaType, string> = { movie: 'Watched', book: 'Read', game: 'Played' };

	let expanded = $state(true);
	let selectedDate = $state('2025-12-08');

	const selected = $derived.by(() => {
		const day = weeks.flat().find((d) => d.date === selectedDate);
		if (!day) return null;
		if (day.date !== '2025-12-08' || day.entries.length) return day;

		return {
			...day,
			entries: [
				{ date: day.date, type: 'movie', title: 'Perfect Days', posterUrl: 'https://picsum.photos/seed/perfect-days/80/120' },
				{ date: day.date, type: 'movie', title: 'The Holdovers', posterUrl: 'https://picsum.photos/seed/the-holdovers/80/120' },
				{ date: day.date, type: 'book', title: 'Project Hail Mary', posterUrl: 'https://picsum.photos/seed/project-hail-mary/80/120' },
				{ date: day.date, type: 'book', title: 'Children', posterUrl: 'https://picsum.photos/seed/children/80/120' },
				{ date: day.date, type: 'game', title: 'Outer Wilds', posterUrl: 'https://picsum.photos/seed/outer-wilds/80/120' },
				{ date: day.date, type: 'game', title: 'Hades', posterUrl: 'https://picsum.photos/seed/hades/80/120' }
			]
		};
	});

	function selectDay(day: Day) {
		selectedDate = selectedDate === day.date ? '' : day.date;
	}
</script>

<section class="media-activity">
	 <div class="label">Fun Facts</div>
	<div class="card">
		<button class="header" onclick={() => (expanded = !expanded)} aria-expanded={expanded}>
			<p class="summary">
				I enjoy watching movies, reading books, and playing video games in my free time.
				Here is an updating log of everything I've watched, read, and played in the recent years.
			</p>
			<div class="tags">
				<span class="tag films"><span class="icon">▤</span>{counts.movie} FILMS</span>
				<span class="tag books"><span class="icon">▤</span>{counts.book} BOOKS</span>
				<span class="tag games"><span class="icon">⌁</span>{counts.game} GAMES</span>
			</div>
		</button>

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
											class="cell level-{level(day.entries.length)}"
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

						<div class="activity-grid">
							{#each (['movie', 'game', 'book'] as MediaType[]) as type}
								{@const media = selected.entries.filter((entry) => entry.type === type)}
								<div class="activity-column">
									<div class="media-items">
										{#each media.slice(0, 2) as entry}
											{#if entry.posterUrl}
												<a class="entry-link" href={entry.link} target="_blank" rel="noopener noreferrer">
													<img class="poster" src={entry.posterUrl} alt="" />
												</a>
											{:else}
												<div class="poster-placeholder">{type === 'book' ? '▤' : '⌁'}</div>
											{/if}
										{/each}
									</div>
									<div class="media-label">
										<span class="media-icon">{type === 'movie' ? '▤' : type === 'book' ? '▤' : '⌁'}</span>
										<strong>{type === 'movie' ? 'Films' : type === 'book' ? 'Books' : 'Games'}:</strong>
										<span>{media.map((entry) => entry.title).join(', ') || 'None'}</span>
									</div>
								</div>
							{/each}
						</div>
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
		color: #a8a9a6;
	}

	.label {
		margin: 0 0 0.35rem;
		padding-left: 0.05rem;
		color: #75aaa9;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.card {
		background: linear-gradient(145deg, rgba(19, 29, 30, .98), rgba(7, 12, 13, .98));
		border: 1px solid rgba(114, 144, 143, .28);
		border-radius: 7px;
		box-shadow: 0 14px 30px rgba(0, 0, 0, .28);
		overflow: hidden;
	}

	.header {
		width: 100%;
		padding: 1.5rem 1.65rem .75rem;
		background: transparent;
		border: 0;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.summary {
		margin: 0;
		max-width: 72ch;
		color: #a6a8a5;
		font-size: .92rem;
		line-height: 1.42;
	}

	.tags {
		display: flex;
		gap: .55rem;
		margin-top: .8rem;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: .4rem;
		padding: .32rem .7rem;
		border: 1px solid;
		border-radius: 999px;
		font-size: .73rem;
		font-weight: 700;
		letter-spacing: .04em;
		line-height: 1;
	}

	.tag .icon {
		font-size: .9rem;
		line-height: 0;
	}

	.films { color: #76a9d2; background: rgba(55, 103, 148, .3); border-color: #547fa5; }
	.books { color: #7db48d; background: rgba(56, 104, 69, .3); border-color: #608b6e; }
	.games { color: #d29b61; background: rgba(139, 82, 38, .32); border-color: #a36d3c; }

	.heatmap-wrap {
		padding: .45rem 1.65rem 1.35rem;
	}

	.heatmap-scroll {
		overflow-x: auto;
		padding: .15rem 0 .35rem;
		scrollbar-width: thin;
	}

	.heatmap {
		min-width: 890px;
	}

	.months {
		display: grid;
		grid-template-columns: repeat(53, 1fr);
		gap: 4px;
		margin-bottom: .3rem;
		padding: 0 1px;
	}

	.month {
		min-width: 12px;
		height: .85rem;
		color: #777c7a;
		font-size: .66rem;
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
		background: #252b2b;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .025);
		cursor: pointer;
		transition: transform .12s ease, box-shadow .12s ease;
	}

	.cell:hover {
		transform: scale(1.2);
		box-shadow: 0 0 0 1px rgba(174, 204, 201, .4);
	}

	.cell > span {
		position: absolute;
		z-index: 2;
		color: #dbe8e5;
		font-size: .57rem;
		font-weight: 700;
		line-height: 1;
		pointer-events: none;
	}

	.cell.level-1 { background: #435b5b; }
	.cell.level-2 { background: #638180; }
	.cell.level-3 { background: #89aaa6; }

	.cell.selected {
		width: 24px;
		height: 24px;
		margin: -6px;
		border: 2px solid #b7d5d0;
		border-radius: 6px;
		background: #739391;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, .35);
		z-index: 3;
	}

	.legend {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: .28rem;
		margin-top: .75rem;
		color: #777c7a;
		font-size: .7rem;
	}

	.legend .cell {
		width: 13px;
		height: 13px;
		cursor: default;
	}

	.detail {
		margin-top: 1.25rem;
		padding-top: .9rem;
		border-top: 1px solid rgba(120, 145, 144, .2);
	}

	.detail-heading {
		margin-bottom: .55rem;
		color: #b2b4b1;
		font-size: .95rem;
		font-weight: 700;
	}

	.activity-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		min-height: 92px;
	}

	.activity-column {
		min-width: 0;
	}

	.media-items {
		display: flex;
		align-items: flex-start;
		gap: .45rem;
		height: 62px;
	}

	.entry-link {
		display: block;
		width: 40px;
		color: inherit;
		text-decoration: none;
	}

	.poster,
	.poster-placeholder {
		display: block;
		width: 40px;
		height: 58px;
		object-fit: cover;
		border-radius: 3px;
		background: #28302f;
	}

	.poster-placeholder {
		display: grid;
		place-items: center;
		color: #85918f;
		font-size: 1.15rem;
	}

	.media-label {
		display: flex;
		align-items: baseline;
		gap: .35rem;
		margin-top: .25rem;
		color: #777d7b;
		font-size: .78rem;
		line-height: 1.35;
	}

	.media-label strong {
		color: #aeb1ae;
	}

	.media-icon {
		color: #969e9b;
		font-size: .95rem;
	}

	.detail-empty {
		margin: 0;
		color: #6f7573;
		font-size: .8rem;
	}

	@media (max-width: 700px) {
		.media-activity { padding-inline: .8rem; }
		.header, .heatmap-wrap { padding-inline: 1rem; }
		.activity-grid { gap: 1rem; }
	}
</style>
