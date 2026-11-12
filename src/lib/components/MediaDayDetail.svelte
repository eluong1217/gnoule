<script lang="ts">
	import MediaIcon from './MediaIcon.svelte';
	import { MEDIA_META, MEDIA_TYPES, cleanLink, formatDayHeading, type Day } from '$lib/media';

	let { day }: { day: Day | null } = $props();
</script>

<div class="detail">
	{#if day}
		<div class="detail-heading">ACTIVITY FOR {formatDayHeading(day.date)}</div>

		{#if day.entries.length}
			<div class="day-media">
				{#each MEDIA_TYPES as type (type)}
					{@const meta = MEDIA_META[type]}
					{#each day.entries.filter((e) => e.type === type) as entry, i (i)}
						<div class="media-item">
							{#if entry.posterUrl}
								<a
									class="media-thumb"
									href={cleanLink(entry.link)}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="{entry.title} on Letterboxd"
								>
									<img src={entry.posterUrl} alt="" />
									<span class="type-badge {meta.className}"><MediaIcon {type} size={13} /></span>
								</a>
							{:else}
								<div class="media-thumb placeholder" title={meta.label}>
									<MediaIcon {type} size={30} />
									<span class="type-badge {meta.className}"><MediaIcon {type} size={13} /></span>
								</div>
							{/if}
							<span class="media-title">{entry.title}</span>
						</div>
					{/each}
				{/each}
			</div>
		{:else}
			<p class="detail-empty">Nothing logged this day.</p>
		{/if}
	{:else}
		<p class="detail-empty">Click a square above to see what it was.</p>
	{/if}
</div>

<style>
	.detail {
		margin-top: 1.25rem;
		padding-top: 0.9rem;
		border-top: 1px solid var(--color-border);
	}

	.detail-heading {
		margin-bottom: 0.55rem;
		color: var(--color-text);
		font-size: 0.95rem;
		font-weight: 700;
	}

	.day-media {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.media-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		width: 138px;
	}

	.media-thumb {
		position: relative;
		display: block;
		width: 96px;
		height: 138px;
		border-radius: var(--radius-sm);
		overflow: visible;
		color: inherit;
		text-decoration: none;
	}

	.media-thumb img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}

	.media-thumb.placeholder {
		display: grid;
		place-items: center;
		background: color-mix(in srgb, var(--color-border) 70%, var(--color-surface));
		color: var(--color-text-muted);
	}

	.type-badge {
		position: absolute;
		bottom: -8px;
		right: -8px;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 2px solid var(--color-surface);
	}

	.type-badge.films {
		background: #5b96c4;
		color: #0d1f2c;
	}
	.type-badge.books {
		background: #5f9d74;
		color: #0c1b12;
	}
	.type-badge.games {
		background: #c48a4f;
		color: #241304;
	}

	.media-title {
		max-width: 100%;
		color: var(--color-text-muted);
		font-size: 0.72rem;
		line-height: 1.25;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.detail-empty {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.8rem;
	}

	@media (max-width: 700px) {
		.media-item {
			width: 104px;
		}
		.media-thumb {
			width: 72px;
			height: 104px;
		}
	}
</style>
