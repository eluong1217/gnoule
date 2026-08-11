<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Bio from '$lib/components/Bio.svelte';
	import Education from '$lib/components/Education.svelte';
	import Experience from '$lib/components/Experience.svelte';
	import ProjectsAndResearch from '$lib/components/ProjectsAndResearch.svelte';
	import MediaHeatmap from '$lib/components/MediaHeatmap.svelte';
	let { data } = $props();
</script>

<Hero />
<Bio />
<Education />
<Experience />
<ProjectsAndResearch />
<MediaHeatmap entries={data.movies} />