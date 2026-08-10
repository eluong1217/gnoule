<script lang="ts">
	import { slide } from 'svelte/transition';

	type Props = {
	    logo: string;
	    logoAlt: string;
	    heading: string;
	    subheading?: string;
	    tagline?: string;
	    company?: string;
	    location?: string;
	    dates: string;
	    bullets?: string[];
	    isOpen: boolean;
	    onToggle: () => void;
    };

	let {
		logo,
		logoAlt,
		heading,
		subheading,
		tagline,
		company,
		location,
		dates,
		bullets,
		isOpen,
		onToggle
	}: Props = $props();
</script>

<li>
	<button class="card-header" onclick={onToggle} aria-expanded={isOpen}>
		<img class="logo" src={logo} alt={logoAlt} />

        <div class="header-main">
	        <h3>{heading}</h3>
	            {#if subheading}
		    <p class="subheading">{subheading}</p>
	            {/if}
	            {#if company && location}
		    <p class="tagline">
			    @ <strong>{company}</strong> — {location}
		    </p>
	            {:else}
		    <p class="tagline">{tagline}</p>
	            {/if}
        </div>

		<div class="header-meta">
			<span class="dates">{dates}</span>
			<span class="chevron" class:open={isOpen}>⌄</span>
		</div>
	</button>

	{#if isOpen && bullets?.length}
		<div class="card-body" transition:slide={{ duration: 250 }}>
			<ul class="bullets">
				{#each bullets as bullet}
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
		border-radius: 4px;
	}

	.header-main {
		flex: 1;
	}

	.header-main h3 {
		font-size: 1.1rem;
		color: var(--color-text);
	}

	.subheading {
		font-size: 0.9rem;
		opacity: 0.7;
		margin-top: 0.15rem;
	}

	.tagline {
		font-size: 0.95rem;
		opacity: 0.85;
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
		opacity: 0.7;
	}

	.chevron {
		display: inline-block;
		transition: transform 0.2s ease;
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
		border-bottom: none;
		font-size: 0.9rem;
		opacity: 0.8;
		list-style: disc;
	}
</style>