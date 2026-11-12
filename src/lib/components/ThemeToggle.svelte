<script lang="ts">
	import { theme } from '$lib/stores/theme';
</script>

<button
	class="switch"
	class:dark={$theme === 'dark'}
	onclick={theme.toggle}
	role="switch"
	aria-checked={$theme === 'dark'}
	aria-label="Toggle dark mode"
>
	<span class="track">
		<span class="thumb"></span>
	</span>
</button>

<style>
	.switch {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.track {
		display: block;
		width: 44px;
		height: 24px;
		border-radius: 999px;
		background: var(--color-border, currentColor);
		opacity: 0.5;
		position: relative;
		transition: background 0.2s ease;
	}

	.thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-bg);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: transform 0.2s ease;
	}

	.switch.dark .track {
		background: var(--color-accent);
		opacity: 1;
	}

	.switch.dark .thumb {
		transform: translateX(20px);
	}
</style>
