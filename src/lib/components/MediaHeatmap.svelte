<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		MEDIA_META,
		MEDIA_TYPES,
		buildMonthLabels,
		buildWeeks,
		countByType,
		groupByDate,
		yearsWithEntries,
		type Day,
		type MediaEntry,
		type MediaType
	} from '$lib/media';
	import MediaDayDetail from './MediaDayDetail.svelte';
	import MediaIcon from './MediaIcon.svelte';

	let { entries = [] }: { entries: MediaEntry[] } = $props();

	const thisYear = new Date().getFullYear();

	let selectedYear = $state(thisYear);
	let selectedDate = $state<string | null>(null);
	let expanded = $state(true);
	const activeTypes = new SvelteSet<MediaType>(MEDIA_TYPES);

	const byDate = $derived(groupByDate(entries));
	const counts = $derived(countByType(entries));
	const availableYears = $derived(yearsWithEntries(entries, thisYear));
	const weeks = $derived(buildWeeks(selectedYear, thisYear, byDate));
	const monthLabels = $derived(buildMonthLabels(weeks));
	const selected = $derived(weeks.flat().find((d) => d.date === selectedDate) ?? null);

	function toggleType(type: MediaType) {
		if (!activeTypes.delete(type)) activeTypes.add(type);
	}

	function visibleEntries(day: Day) {
		return day.entries.filter((e) => activeTypes.has(e.type));
	}

	function level(day: Day) {
		return Math.min(visibleEntries(day).length, 3);
	}

	function tooltip(day: Day) {
		const visible = visibleEntries(day);
		if (!visible.length) return day.label;
		const list = visible.map((e) => `${e.type}: ${e.title}`).join(' · ');
		return `${day.label} — ${list}`;
	}

	function selectDay(day: Day) {
		selectedDate = selectedDate === day.date ? null : day.date;
	}

	let sectionEl: HTMLElement | undefined = $state();

	// On narrow screens the grid overflows horizontally; start at the most recent week.
	let scrollEl: HTMLElement | undefined = $state();

	$effect(() => {
		void weeks; // re-run when the year changes
		if (!expanded) return;
		requestAnimationFrame(() => {
			if (scrollEl) scrollEl.scrollLeft = scrollEl.scrollWidth;
		});
	});

	function toggleExpanded() {
		expanded = !expanded;
		if (expanded) {
			setTimeout(() => {
				sectionEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 300);
		}
	}
</script>

<section class="media-activity" bind:this={sectionEl}>
	<h2 class="section-title">Fun Facts</h2>
	<div class="card">
		<div class="header">
			<button class="expand-toggle" onclick={toggleExpanded} aria-expanded={expanded}>
				<p class="summary">
					I enjoy watching movies, reading books, and playing video games in my free time. Here is
					an updating log of everything I've watched, read, and played in the recent years.
				</p>
				<span class="chevron" class:open={expanded}><ChevronDown size={18} /></span>
			</button>
			<div class="tags">
				{#each MEDIA_TYPES as type (type)}
					<button
						type="button"
						class="tag {MEDIA_META[type].className}"
						class:active={activeTypes.has(type)}
						aria-pressed={activeTypes.has(type)}
						onclick={() => toggleType(type)}
					>
						<MediaIcon {type} size={13} />{counts[type]}
						{MEDIA_META[type].label.toUpperCase()}
					</button>
				{/each}

				<select class="year-select" bind:value={selectedYear} aria-label="Select year">
					{#each availableYears as year (year)}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</div>
		</div>

		{#if expanded}
			<div class="heatmap-wrap" transition:slide={{ duration: 300 }}>
				<div class="heatmap-scroll" bind:this={scrollEl}>
					<div class="heatmap" style="--week-count: {weeks.length};">
						<div class="months">
							{#each monthLabels as label (label.weekIndex)}
								<span class="month" style="--week-index: {label.weekIndex};">{label.text}</span>
							{/each}
						</div>
						<div class="grid">
							{#each weeks as week (week[0].date)}
								<div class="week">
									{#each week as day (day.date)}
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

				<MediaDayDetail day={selected} />
			</div>
		{/if}
	</div>
</section>

<style>
	.media-activity {
		padding: 3rem 0;
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
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
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.summary {
		margin: 0;
		color: var(--color-text);
		font-size: 0.92rem;
		line-height: 1.42;
	}

	.chevron {
		display: inline-flex;
		flex-shrink: 0;
		margin-top: 0.15rem;
		color: var(--color-text-muted);
		transition: transform 0.2s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
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
	.films {
		color: #5b96c4;
		background: rgba(55, 103, 148, 0.16);
		border-color: rgba(84, 127, 165, 0.55);
	}
	.books {
		color: #5f9d74;
		background: rgba(56, 104, 69, 0.16);
		border-color: rgba(96, 139, 110, 0.55);
	}
	.games {
		color: #c48a4f;
		background: rgba(139, 82, 38, 0.18);
		border-color: rgba(163, 109, 60, 0.55);
	}

	.heatmap-wrap {
		padding: 0.45rem 1.65rem 1.35rem;
	}

	.heatmap-scroll {
		padding: 0.15rem 0 0.35rem;
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior-x: contain;
		scrollbar-width: thin;
	}

	/* Fluid on wide screens (fills the card), but never below --cell-min: past that the
	   grid keeps its natural width and .heatmap-scroll scrolls instead of shrinking cells. */
	.heatmap {
		--cell-min: 13px;
		--gap: clamp(2px, 0.4vw, 4px);
		width: 100%;
		min-width: calc(var(--week-count) * (var(--cell-min) + var(--gap)));
	}

	.months {
		position: relative;
		height: 0.85rem;
		margin-bottom: 0.3rem;
	}

	.month {
		position: absolute;
		left: calc(var(--week-index) / var(--week-count) * 100%);
		color: var(--color-text-muted);
		font-size: 0.66rem;
		line-height: 1;
		white-space: nowrap;
	}

	.grid {
		display: flex;
		gap: var(--gap);
	}

	.week {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		gap: var(--gap);
		min-width: var(--cell-min);
	}

	.cell {
		position: relative;
		display: grid;
		width: 100%;
		aspect-ratio: 1 / 1;
		padding: 0;
		place-items: center;
		border: 0;
		border-radius: var(--radius-sm);
		background: var(--color-border);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-text) 6%, transparent);
		cursor: pointer;
		transition:
			transform 0.12s ease,
			box-shadow 0.12s ease;
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
		color: var(--color-text-muted);
		font-size: 0.7rem;
	}

	.legend .cell {
		width: 13px;
		height: 13px;
		cursor: default;
	}

	/* Touch devices: no hover to reveal the tooltip, so make squares big enough to tap
	   reliably and drop the hover-scale (it sticks after a tap). */
	@media (hover: none) {
		.heatmap {
			--cell-min: 18px;
			--gap: 3px;
		}
		.cell:hover {
			transform: none;
			box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-text) 6%, transparent);
		}
		.cell:active {
			transform: scale(1.2);
		}
	}

	@media (max-width: 700px) {
		.header,
		.heatmap-wrap {
			padding-inline: 1rem;
		}
		.legend {
			justify-content: flex-start;
		}
	}
</style>
