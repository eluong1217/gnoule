<script lang="ts">
	import AccordionCard from './AccordionCard.svelte';

	type ExperienceEntry = {
		title: string;
		location: string;
		company: string;
		dates: string;
		logo: string;
		bullets?: string[];
	};

	const entries: ExperienceEntry[] = [
		{
			title: 'Associate Banker',
			location: 'Boston, MA',
			company: 'Bank of America',
			dates: 'Jan 2026 — Present',
			logo: '/logos/bank-of-america.png',
			bullets: [
				'Managed financial portfolios for 30+ clients weekly, identifying lending and investment opportunities that generated approximately $100K in balance growth through data-informed financial recommendations.',
				'Exceeded performance expectations by achieving +200% of management-defined sales and service goals through relationship management and personalized financial suggestions.',
				'Executed financial transactions over $1M while maintaining regulatory and operational compliance.'
			]
		},
        {   
            title: 'Research Analyst',
			location: 'Boston, MA',
            company: 'Jiang Networks Lab ',
			dates: 'Jun 2025 — Mar 2026',
			logo: '/logos/jianglabs.png',
			bullets: [
				'Analyzed 11+ years of LinkedIn network data using Python, pandas, NetworkX, etc. to model professional network structures and their relationship to labor market outcomes.',
                'Collaborated with a research team of 4 to clean, translate, and prepare 2TBs worth of data to support future computational social science research,',
                'Reduced the processing time of over 250K profiles worth of data by 60% through algorithm optimization.'     
			]
		},
        {
            title: 'Undergraduate Research Assistant',
			location: 'Boston, MA',
			company: 'Economics Department, University of Massachusetts Boston',
			dates: 'Sep 2024 — Sep 2025',
			logo: '/logos/umb.png',
			bullets: [
				'Built and deployed a website and API to visualize Black Land Loss data from the Agricultural Census, spanning 1910-2002, using Python, Flask, and React.',
				'Presented research findings to an audience of 200+ faculty and academic leaders, supporting advocacy efforts that contributed to preserving a $2M federally funded academic program.',
				'Constructed and analyzed panel data spanning 53 years, 21 OECD countries, and 100M+ households using Stata, Excel, and World Bank, OECD, BIS, and WID data to evaluate how capitalist systems influence consumer debt.'
			]
		},
        {   
            title: 'Research Analyst Intern',
			location: 'Boston, MA',
            company: 'Joint Commitee on Financial Services ',
			dates: 'Jan 2025 — May 2025',
			logo: '/logos/statehouse.png',
			bullets: [
				'Researched federal and state financial regulations, academic literature, and industry reports to evaluate proposed cryptocurrency ATM legislation (H.1247), supporting evidence-based policymaking on consumer fraud prevention and virtual currency regulation.',
				'Presented legislative research findings, supporting committee staff in evaluating regulatory approaches to emerging digital asset markets.'
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

<section class="experience">
	<h2>Experience</h2>
	<ul>
		{#each entries as entry, i}
			<AccordionCard
				logo={entry.logo}
				logoAlt="{entry.company} logo"
				heading={entry.title}
				company={entry.company}
				location={entry.location}
				dates={entry.dates}
				bullets={entry.bullets}
				isOpen={openIndices.has(i)}
				onToggle={() => toggle(i)}
            />
		{/each}
	</ul>
</section>

<style>
	.experience {
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