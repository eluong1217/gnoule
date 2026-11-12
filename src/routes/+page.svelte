<script lang="ts">
	import AccordionSection from '$lib/components/AccordionSection.svelte';
	import Bio from '$lib/components/Bio.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import MediaHeatmap from '$lib/components/MediaHeatmap.svelte';
	import ProjectsAndResearch from '$lib/components/ProjectsAndResearch.svelte';
	import { education } from '$lib/data/education';
	import { experience } from '$lib/data/experience';
	import type { AccordionItem } from '$lib/types';

	let { data } = $props();

	const educationItems: AccordionItem[] = education.map((e) => ({
		logo: e.logo,
		logoAlt: `${e.school} logo`,
		heading: e.degree,
		tagline: `@ ${e.school}`,
		dates: e.dates,
		bullets: e.bullets
	}));

	const experienceItems: AccordionItem[] = experience.map((e) => ({
		logo: e.logo,
		logoAlt: `${e.company} logo`,
		heading: e.title,
		company: e.company,
		location: e.location,
		dates: e.dates,
		bullets: e.bullets
	}));
</script>

<Hero />
<Bio />
<AccordionSection title="Education" items={educationItems} />
<AccordionSection title="Experience" items={experienceItems} />
<ProjectsAndResearch />
<MediaHeatmap entries={data.entries} />
