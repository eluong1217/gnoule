<script lang="ts">
	import { projects } from '$lib/data/projects';
	import { research } from '$lib/data/research';
	import CardGrid from './CardGrid.svelte';

	let view = $state<'research' | 'projects'>('research');
</script>

<section class="projects-research">
	<div class="toggle">
		<button class:active={view === 'research'} onclick={() => (view = 'research')}>
			Research
		</button>
		<span class="divider">/</span>
		<button class:active={view === 'projects'} onclick={() => (view = 'projects')}>
			Projects
		</button>
	</div>

	<div class="content">
		{#if view === 'projects'}
			<CardGrid items={projects} />
		{:else}
			<CardGrid items={research} />
		{/if}
	</div>
</section>

<style>
	.projects-research {
		padding: 3rem 0;
	}

	.toggle {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.toggle button {
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-muted);
		transition: color 0.25s ease;
		padding: 0;
	}

	.toggle button.active {
		color: var(--color-text);
	}

	.toggle button:hover {
		color: var(--color-text);
	}

	.divider {
		font-size: 1.5rem;
		color: var(--color-border);
	}
</style>
