<script lang="ts">
	import { particleNetwork } from '$lib/actions/particleNetwork';
	import Ouroboros from './Ouroboros.svelte';
</script>

<section class="hero">
	<canvas class="network" use:particleNetwork></canvas>
	<Ouroboros />
</section>

<style>
	.hero {
		position: relative;
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.network {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}
</style>
