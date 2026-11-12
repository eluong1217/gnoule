<script lang="ts">
	import '@fontsource-variable/inter';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/snakebody2.png';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import { theme } from '$lib/stores/theme';
	import Navbar from '$lib/components/Navbar.svelte';
	import '$lib/styles/theme.css';
	import '$lib/styles/global.css';

	let { children } = $props();

	onMount(() => {
		theme.init();
	});
</script>

<svelte:head>
	<title>gnoule</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar />

<main>
	{@render children()}
</main>

<footer>
	<span>© {new Date().getFullYear()} Eric Luong</span>
	<span class="links">
		<SocialLinks size={18} />
	</span>
</footer>

<style>
	main,
	footer {
		max-width: var(--content-width);
		margin: 0 auto;
		padding: 0 1rem;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1.5rem;
		margin-top: 1rem;
		padding-block: 1.5rem 2.5rem;
		border-top: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.links {
		display: flex;
		gap: 1.25rem;
	}
</style>
