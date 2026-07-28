<script lang="ts">
	import { slide } from 'svelte/transition';

	type LinkType = 'demo' | 'github' | 'article';

	type MediaItem = {
		type: 'image' | 'video';
		src: string;
		alt?: string;
	};

	type LinkItem = {
		type: LinkType;
		url: string;
	};

	type Props = {
		title: string;
		summary: string;
		tags: string[];
		description?: string;
		media?: MediaItem;
		links?: LinkItem[];
		expanded?: boolean; // true once the card has taken its full-width shape
		revealed?: boolean; // true once the content should be visible
		onClick?: () => void;
	};

	let {
		title,
		summary,
		tags,
		description,
		media,
		links,
		expanded = false,
		revealed = false,
		onClick
	}: Props = $props();

	const linkLabels: Record<LinkType, string> = {
		demo: 'Try it out!',
		github: 'Source code',
		article: 'Read more!'
	};
</script>

<div class="card-content">
	<button class="header" onclick={onClick} aria-expanded={expanded}>
		<h3>{title}</h3>
		<p class="summary">{summary}</p>
		<div class="tags">
			{#each tags as tag}
				<span class="tag">{tag}</span>
			{/each}
		</div>
	</button>

	{#if revealed}
		<div class="expanded-content" transition:slide={{ duration: 300 }}>
			{#if media}
				<div class="media">
					{#if media.type === 'image'}
						<img src={media.src} alt={media.alt ?? title} />
					{:else}
						<video src={media.src} controls></video>
					{/if}
				</div>
			{/if}

			{#if description}
				<p class="description">{description}</p>
			{/if}

			{#if links?.length}
				<div class="links">
					{#each links as link}
						<a class="link-button" href={link.url} target="_blank" rel="noopener noreferrer">
							{linkLabels[link.type]}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.card-content {
	    display: flex;
	    flex-direction: column;
	    background: var(--color-surface, transparent);
	    border: 1px solid var(--color-border, currentColor);
	    border-radius: 8px;
	    overflow: hidden;
	    height: 100%;
	    transition: border-color 0.2s ease;
    }

    .card-content:hover {
	    border-color: var(--color-accent);
    }
    

	.header {
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: inherit;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	h3 {
		font-size: 1.05rem;
		color: var(--color-text);
	}

	.summary {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.25rem;
	}

	.tag {
		font-size: 0.75rem;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		background: var(--color-accent);
		color: var(--color-bg);
		opacity: 0.85;
	}

	.expanded-content {
		padding: 0 1.25rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.media img,
	.media video {
		width: 100%;
		border-radius: 6px;
		display: block;
	}

	.description {
		font-size: 0.9rem;
		opacity: 0.85;
		line-height: 1.5;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.link-button {
		font-size: 0.85rem;
		padding: 0.4rem 0.9rem;
		border: 1px solid var(--color-border, currentColor);
		border-radius: 6px;
		color: var(--color-text);
	}

	.link-button:hover {
		border-color: var(--color-accent);
	}
</style>