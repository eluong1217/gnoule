<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { AccordionItem } from '$lib/types';
	import AccordionCard from './AccordionCard.svelte';

	let { title, items }: { title: string; items: AccordionItem[] } = $props();

	// Any number of rows can be open at once
	const openIndices = new SvelteSet<number>();

	function toggle(index: number) {
		if (!openIndices.delete(index)) openIndices.add(index);
	}
</script>

<section>
	<h2 class="section-title">{title}</h2>
	<ul>
		{#each items as item, i (i)}
			<AccordionCard {item} isOpen={openIndices.has(i)} onToggle={() => toggle(i)} />
		{/each}
	</ul>
</section>

<style>
	section {
		padding: 3rem 0;
	}

	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
