<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/snakebody2.png';
	import { theme } from '$lib/stores/theme.js';
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

<style>
	main {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
	}
</style>