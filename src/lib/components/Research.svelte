<script lang="ts">
	import { flip } from 'svelte/animate';
	import ProjectCard from './ProjectCard.svelte';

	type ResearchItem = {
		id: string;
		title: string;
		summary: string;
		tags: string[];
		description?: string;
		media?: { type: 'image' | 'video'; src: string; alt?: string };
		links?: { type: 'demo' | 'github' | 'article'; url: string }[];
	};

	const research: ResearchItem[] = [
		{
			id: 'research-1',
			title: 'Varieties of Capitalism and Household Debt',
			summary: 'Research on the correlation between household debt, financialization and macroeconomics between Coordinated and Liberal Markets.',
			tags: [],
			description:
				'Constructed and analyzed panel data spanning 53 years, 21 OECD countries, and 100M+ households using Stata, Excel, and World Bank, OECD, BIS, and WID data to evaluate how capitalist systems influence consumer debt.',
			media: { type: 'image', src: '/images/research1.jpg', alt: 'Results chart' },
			links: [
				{ type: 'article', url: 'https://www.tandfonline.com/doi/abs/10.2753/PKE0160-3477350408' }
			]
		},
        {
            id: 'research-2',
            title: 'Employability between Network Connections and Social Capital',
            summary: 'A short one-line summary of research project four.',
            tags: [],
            description:
                'Full description of research project four goes here. Replace with real content.',
            links: [
                { type: 'github', url: 'https://github.com/yourname/your-repo' }
            ]
        },
        {
            id: 'research-4',
            title: 'Cryptocurrency ATM Legislation Report',
            summary: 'A short one-line summary of research project three.',
            tags: [],
            description:
                'Full description of research project three goes here. Replace with real content.',
            links: [
                { type: 'github', url: 'https://github.com/yourname/your-repo' }
            ]
        },


		// add more research items here
	];

	// ─────────────────────────────────────────────
	// Refs to each card's DOM element, keyed by research id
	// ─────────────────────────────────────────────
	let cardRefs = new Map<string, HTMLDivElement>();

	function registerCard(node: HTMLDivElement, id: string) {
		cardRefs.set(id, node);
		return {
			destroy() {
				cardRefs.delete(id);
			}
		};
	}

	function scrollToCard(id: string) {
		cardRefs.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	const FLIP_DURATION = 350;
	const CONTENT_DURATION = 300;

	let openId = $state<string | null>(null);
	let revealedId = $state<string | null>(null);

	function toggle(id: string) {
		if (openId === id) {
			revealedId = null;
			setTimeout(() => {
				openId = null;
			}, CONTENT_DURATION);
		} else if (openId === null) {
			openId = id;
			setTimeout(() => {
				scrollToCard(id);
				revealedId = id;
			}, FLIP_DURATION);
		} else {
			revealedId = null;
			setTimeout(() => {
				openId = id;
				setTimeout(() => {
					scrollToCard(id);
					revealedId = id;
				}, FLIP_DURATION);
			}, CONTENT_DURATION);
		}
	}

	function getColumnCount() {
		if (typeof window === 'undefined') return 3;
		if (window.innerWidth <= 640) return 1;
		if (window.innerWidth <= 900) return 2;
		return 3;
	}

	let columns = $state(3);

	$effect(() => {
		columns = getColumnCount();
		function handleResize() {
			columns = getColumnCount();
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function getSubcolumns(cols: number) {
		if (cols === 3) return 6;
		if (cols === 2) return 2;
		return 1;
	}

	const subcolumns = $derived(getSubcolumns(columns));
	const baseSpan = $derived(subcolumns / columns);

	const spanMap = $derived.by(() => {
		const map = new Map<number, number>();
		if (openId === null) return map;

		const openIndex = research.findIndex((r) => r.id === openId);
		if (openIndex === -1) return map;

		function assignRow(indices: number[]) {
			const len = indices.length;
			if (len === 0 || len === columns) return;
			const spanEach = subcolumns / len;
			indices.forEach((idx) => map.set(idx, spanEach));
		}

		const rowStart = Math.floor(openIndex / columns) * columns;
		const before: number[] = [];
		for (let i = rowStart; i < openIndex; i++) before.push(i);
		assignRow(before);

		for (let i = openIndex + 1; i < research.length; i += columns) {
			const chunk: number[] = [];
			for (let j = i; j < Math.min(i + columns, research.length); j++) chunk.push(j);
			assignRow(chunk);
		}

		return map;
	});
</script>

<div class="grid" style="grid-template-columns: repeat({subcolumns}, 1fr);">
	{#each research as item, i (item.id)}
		<div
			class="card"
			class:expanded={openId === item.id}
			style="grid-column: span {spanMap.get(i) ?? baseSpan};"
			animate:flip={{ duration: FLIP_DURATION }}
			use:registerCard={item.id}
		>
			<ProjectCard
				title={item.title}
				summary={item.summary}
				tags={item.tags}
				description={item.description}
				media={item.media}
				links={item.links}
				expanded={openId === item.id}
				revealed={revealedId === item.id}
				onClick={() => toggle(item.id)}
			/>
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		gap: 1.5rem;
		align-items: start;
	}

	.card.expanded {
		grid-column: 1 / -1 !important;
	}
</style>