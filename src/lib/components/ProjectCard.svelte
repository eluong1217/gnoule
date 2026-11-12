<script lang="ts">
	import type { ShowcaseItem, ShowcaseLinkType } from '$lib/types';

	type Props = {
		item: ShowcaseItem;
		expanded?: boolean;
		onClick?: () => void;
	};

	let { item, expanded = false, onClick }: Props = $props();

	const linkLabels: Record<ShowcaseLinkType, string> = {
		demo: 'Try it out!',
		github: 'Source code',
		article: 'Read more!'
	};
</script>

<div class="card-content">
	<button class="header" onclick={onClick} aria-expanded={expanded}>
		<h3>{item.title}</h3>
		<p class="summary">{item.summary}</p>
		{#if item.tags.length}
			<div class="tags">
				{#each item.tags as tag (tag)}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</button>

	{#if expanded}
		<div class="expanded-content">
			{#if item.media}
				<div class="media">
					{#if item.media.type === 'image'}
						<img src={item.media.src} alt={item.media.alt ?? item.title} />
					{:else}
						<video src={item.media.src} controls></video>
					{/if}
				</div>
			{/if}

			{#if item.description}
				<p class="description">{item.description}</p>
			{/if}

			{#if item.links?.length}
				<div class="links">
					{#each item.links as link, i (i)}
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
		border-radius: var(--radius-lg);
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
		color: var(--color-text-muted);
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
		background: color-mix(in srgb, var(--color-accent) 16%, transparent);
		color: var(--color-text);
		border: 1px solid color-mix(in srgb, var(--color-accent) 55%, transparent);
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
		border-radius: var(--radius-sm);
		display: block;
	}

	.description {
		font-size: 0.9rem;
		line-height: 1.5;
		white-space: pre-line;
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
		border-radius: var(--radius-sm);
		color: var(--color-text);
	}

	.link-button:hover {
		border-color: var(--color-accent);
	}

	/* Content rises in while the card itself morphs open (see CardGrid) */
	@media (prefers-reduced-motion: no-preference) {
		.expanded-content {
			animation: rise-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
		}
	}

	@keyframes rise-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}
</style>
