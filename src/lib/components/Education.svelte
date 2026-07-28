<script lang="ts">
	import AccordionCard from './AccordionCard.svelte';

	type EducationEntry = {
		school: string;
		degree: string;
		dates: string;
		logo: string;
		bullets?: string[];
	};

	const entries: EducationEntry[] = [
        {
			school: 'University of Massachusetts Boston',
			degree: 'M.A. in Applied Economics',
			dates: '2026 — 2027',
			logo: '/logos/umb.png',
			bullets: [
				'Relevant coursework: Quantative Methods I and II, Machine Learning',
                'GPA: 4.0',
			]
		},
		{
			school: 'University of Massachusetts Boston',
			degree: 'B.A. in Computer Science and Economics',
			dates: '2020 — 2025',
			logo: '/logos/umb.png',
			bullets: [
				'Magna Cum Laude',
				'Teaching Assistant: Theory of Computation, Ethics in Computer Science',
				'Leonard J. Kirsch Award Recipient'   
			]
		}
		// add more entries here as needed
	];

	let openIndices = $state(new Set<number>());

	function toggle(index: number) {
		const next = new Set(openIndices);
		next.has(index) ? next.delete(index) : next.add(index);
		openIndices = next;
	}
</script>

<section class="education">
	<h2>Education</h2>
	<ul>
		{#each entries as entry, i}
			<AccordionCard
				logo={entry.logo}
				logoAlt="{entry.school} logo"
				heading={entry.degree}
				subheading=""
				tagline="@ {entry.school}"
				dates={entry.dates}
				bullets={entry.bullets}
				isOpen={openIndices.has(i)}
				onToggle={() => toggle(i)}
			/>
		{/each}
	</ul>
</section>

<style>
	.education {
		padding: 3rem 0;
	}

	h2 {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		color: var(--color-text);
	}

	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>