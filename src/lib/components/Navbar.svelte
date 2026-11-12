<script lang="ts">
	import SocialLinks from './SocialLinks.svelte';
	import TypewriterText from './TypewriterText.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const words = [
		{ text: 'eluong', direction: 'forward' as const },
		{ text: 'gnoule', direction: 'reverse' as const }
	];
</script>

<nav class="navbar">
	<div class="logo">
		<TypewriterText {words} />
	</div>

	<div class="actions">
		<SocialLinks />

		<ThemeToggle />
	</div>
</nav>

<style>
	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		max-width: var(--content-width);
		margin: 0 auto;
	}

	.logo {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
</style>
