<script lang="ts">
	import { flip } from 'svelte/animate';
	import ProjectCard from './ProjectCard.svelte';

	type Project = {
		id: string;
		title: string;
		summary: string;
		tags: string[];
		description?: string;
		media?: { type: 'image' | 'video'; src: string; alt?: string };
		links?: { type: 'demo' | 'github' | 'article'; url: string }[];
	};

	const projects: Project[] = [
		{
			id: 'project-1',
			title: 'Black Land Loss Visualization Tool',
			summary: 'A website visualizing Black Land Loss data from the Agricultural Census (1910-2002) in the mid-Atlantic region.',
			tags: ['Python', 'React', 'Excel', 'JavaScript', 'Flask'],
            media: { type: 'video', src: 'https://placeholdervideo.dev/1920x1080', alt: 'Screenshot of the Black Land Loss Visualization Tool' },
			description: 'Full description of project one goes here. Replace with real content.',
            links: [{ type: 'demo', url: 'https://blacklandloss.gnoule.com/' }, { type: 'article', url: 'https://www.aeaweb.org/articles?id=10.1257/pandp.20221015' }, { type: 'github', url: 'https://github.com/yourname/your-repo' }]
		},
		{
			id: 'project-2',
			title: 'Bakery Production Forecaster',
			summary: 'A short one-line summary of project two.',
			tags: ['React', 'TypeScript'],
			description: 'Full description of project two goes here. Replace with real content.',
			links: [{ type: 'github', url: 'https://github.com/yourusername/project-two' }]
		},
		{
			id: 'project-3',
			title: 'Random Heatmap Generator',
			summary: 'A short one-line summary of project three.',
			tags: ['SvelteKit', 'PostgreSQL'],
			description: 'Full description of project three goes here. Replace with real content.',
			links: [{ type: 'github', url: 'https://github.com/yourusername/project-three' }]
		},
		{
			id: 'project-4',
			title: 'Monkey Mania II',
			summary: 'A short one-line summary of project four.',
			tags: ['Flask', 'Docker'],
			description: 'Full description of project four goes here. Replace with real content.',
			links: [{ type: 'github', url: 'https://github.com/yourusername/project-four' }]
		},
		{
			id: 'project-5',
			title: 'gnoule.com',
			summary: 'This website and it\'s previous iteration!',
			tags: ['Terraform', 'Serverless'],
			description: 'My personal portfolio website built from Svelte, javascript, and vanilla CSS, deployed on cloudflare pages. My other works involve experience with ReactJS, NodeJS, Typescript, and deployment through Vercel.',
            media: { type: 'image', src: '/images/project_portfolio.png', alt: 'Screenshot of gnoule.com' },
			links: [{ type: 'demo', url: 'https://gnoule.com/' }, { type: 'github', url: 'https://github.com/yourusername/gnoule' }]
		},
	];

	// ─────────────────────────────────────────────
	// Refs to each card's DOM element, keyed by project id
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
		const el = cardRefs.get(id);
		el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	// ─────────────────────────────────────────────
	// Two-stage expand/collapse timing
	// ─────────────────────────────────────────────
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

	// ─────────────────────────────────────────────
	// Track current column count to match CSS breakpoints
	// ─────────────────────────────────────────────
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

	// ─────────────────────────────────────────────
	// Sub-column grid so partial rows split evenly
	// ─────────────────────────────────────────────
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

		const openIndex = projects.findIndex((p) => p.id === openId);
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

		for (let i = openIndex + 1; i < projects.length; i += columns) {
			const chunk: number[] = [];
			for (let j = i; j < Math.min(i + columns, projects.length); j++) chunk.push(j);
			assignRow(chunk);
		}

		return map;
	});
</script>

<div class="grid" style="grid-template-columns: repeat({subcolumns}, 1fr);">
	{#each projects as project, i (project.id)}
		<div
			class="card"
			class:expanded={openId === project.id}
			style="grid-column: span {spanMap.get(i) ?? baseSpan};"
			animate:flip={{ duration: FLIP_DURATION }}
			use:registerCard={project.id}
		>
			<ProjectCard
				title={project.title}
				summary={project.summary}
				tags={project.tags}
				description={project.description}
				media={project.media}
				links={project.links}
				expanded={openId === project.id}
				revealed={revealedId === project.id}
				onClick={() => toggle(project.id)}
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