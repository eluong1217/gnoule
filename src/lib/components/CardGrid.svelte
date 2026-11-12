<script lang="ts">
	import { tick } from 'svelte';
	import { columnsForWidth, computeSpans, subcolumnsFor } from '$lib/gridSpans';
	import type { ShowcaseItem } from '$lib/types';
	import ProjectCard from './ProjectCard.svelte';

	let { items }: { items: ShowcaseItem[] } = $props();

	let openId = $state<string | null>(null);

	const cardEls: Record<string, HTMLDivElement> = {};

	// ─────────────────────────────────────────────
	// Expand/collapse as one View Transition: the browser morphs every card from its old
	// position and size to its new one (see the ::view-transition rules in global.css).
	// Browsers without the API, and reduced-motion users, get an instant change.
	// ─────────────────────────────────────────────
	async function toggle(id: string) {
		const next = openId === id ? null : id;
		const apply = async () => {
			openId = next;
			await tick();
		};

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!document.startViewTransition || reducedMotion) {
			await apply();
		} else {
			// `finished` rejects if a newer click interrupts this transition; that's fine.
			await document.startViewTransition(apply).finished.catch(() => {});
		}

		if (next !== null && openId === next) {
			cardEls[next]?.scrollIntoView({
				behavior: reducedMotion ? 'auto' : 'smooth',
				block: 'nearest'
			});
		}
	}

	// ─────────────────────────────────────────────
	// Track current column count (set after mount so SSR and hydration agree)
	// ─────────────────────────────────────────────
	let columns = $state(columnsForWidth(undefined));

	$effect(() => {
		const update = () => (columns = columnsForWidth(window.innerWidth));
		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	});

	const subcolumns = $derived(subcolumnsFor(columns));
	const baseSpan = $derived(subcolumns / columns);
	const spans = $derived(
		computeSpans(
			items.length,
			items.findIndex((item) => item.id === openId),
			columns
		)
	);
</script>

<div class="grid" style="grid-template-columns: repeat({subcolumns}, 1fr);">
	{#each items as item, i (item.id)}
		<div
			class="card"
			class:expanded={openId === item.id}
			style="grid-column: span {spans.get(i) ?? baseSpan};"
			style:view-transition-name="card-{item.id}"
			bind:this={cardEls[item.id]}
		>
			<ProjectCard {item} expanded={openId === item.id} onClick={() => toggle(item.id)} />
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		gap: 1.5rem;
		align-items: stretch;
	}

	.card {
		view-transition-class: showcase-card;
		scroll-margin-block: 1rem;
	}

	.card.expanded {
		grid-column: 1 / -1 !important;
	}
</style>
