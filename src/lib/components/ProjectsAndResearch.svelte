<script lang="ts">
	import Projects from './Projects.svelte';
	import Research from './Research.svelte';

	let view = $state<'projects' | 'research'>('projects');
</script>

<section class="projects-research">
	<div class="toggle">
		<button class:active={view === 'projects'} onclick={() => (view = 'projects')}>
			Projects
		</button>
		<span class="divider">/</span>
		<button class:active={view === 'research'} onclick={() => (view = 'research')}>
			Research
		</button>
	</div>

	<div class="content">
		{#if view === 'projects'}
			<Projects />
		{:else}
			<Research />
		{/if}
	</div>
</section>

<style>
	.projects-research {
		padding: 3rem 0;
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.toggle {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.toggle button {
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		font-size: 1.75rem;
		font-weight: 600;
		color: var(--color-text);
		opacity: 0.4;
		transition: opacity 0.25s ease, text-shadow 0.25s ease;
	}

	.toggle button.active {
		opacity: 1;
		color: var(--color-text);
	}

	.toggle button:hover {
		opacity: 0.7;
	}

	.toggle button.active:hover {
		opacity: 1;
	}

	.divider {
		font-size: 1.5rem;
		opacity: 0.3;
		color: var(--color-text);
	}

	.content {
		width: 100%;
	}
</style>