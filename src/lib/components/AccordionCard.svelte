<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import type { AccordionItem } from '$lib/types';

	type Props = {
		item: AccordionItem;
		isOpen: boolean;
		onToggle: () => void;
	};

	let { item, isOpen, onToggle }: Props = $props();
</script>

<li>
	<button class="card-header" onclick={onToggle} aria-expanded={isOpen}>
		<img class="logo" src={item.logo} alt={item.logoAlt} />

		<div class="header-main">
			<h3>{item.heading}</h3>
			{#if item.subheading}
				<p class="subheading">{item.subheading}</p>
			{/if}
			{#if item.company && item.location}
				<p class="tagline">
					@ <strong>{item.company}</strong> — {item.location}
				</p>
			{:else}
				<p class="tagline">{item.tagline}</p>
			{/if}
		</div>

		<div class="header-meta">
			<span class="dates">{item.dates}</span>
			<span class="chevron" class:open={isOpen}><ChevronDown size={16} /></span>
		</div>
	</button>

	{#if isOpen && item.bullets?.length}
		<div class="card-body" transition:slide={{ duration: 250 }}>
			<ul class="bullets">
				{#each item.bullets as bullet, i (i)}
					<li>{bullet}</li>
				{/each}
			</ul>
		</div>
	{/if}
</li>

<style>
	li {
		list-style: none;
		border-bottom: 1px solid var(--color-border, currentColor);
		border-left: 3px solid transparent;
		transition: border-left-color 0.2s ease;
		padding-left: 0.75rem;
	}

	li:hover {
		border-left-color: var(--color-accent);
	}

	.card-header {
		width: 100%;
		background: none;
		border: none;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem 0;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: inherit;
	}

	.logo {
		width: 48px;
		height: 48px;
		object-fit: contain;
		flex-shrink: 0;
		border-radius: var(--radius-sm);
	}

	.header-main {
		flex: 1;
		min-width: 0;
	}

	.header-main h3 {
		font-size: 1.1rem;
		color: var(--color-text);
	}

	.subheading {
		font-size: 0.9rem;
		margin-top: 0.15rem;
		color: var(--color-text-muted);
	}

	.tagline {
		font-size: 0.95rem;
		margin-top: 0.25rem;
	}

	.header-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.dates {
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.chevron {
		display: inline-flex;
		transition: transform 0.2s ease;
		color: var(--color-text-muted);
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.card-body {
		padding-bottom: 1.25rem;
	}

	.bullets {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding-left: 1.25rem;
	}

	.bullets li {
		font-size: 0.9rem;
		list-style: disc;
		border: none;
		padding-left: 0;
	}

	/* Phones: move the dates under the title instead of squeezing it */
	@media (max-width: 640px) {
		.card-header {
			flex-wrap: wrap;
			row-gap: 0.35rem;
		}

		.header-meta {
			width: 100%;
			padding-left: calc(48px + 1rem);
			justify-content: space-between;
		}
	}
</style>
