<script lang="ts">
	import { BookOpen, Film, Gamepad2 } from 'lucide-svelte';
	import type { MediaType } from '$lib/media';

	let { type, size = 14 }: { type: MediaType; size?: number } = $props();

	const icons = { movie: Film, book: BookOpen, game: Gamepad2 };
	const Icon = $derived(icons[type]);
</script>

<Icon {size} aria-hidden="true" />
