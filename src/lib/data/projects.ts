import type { ShowcaseItem } from '$lib/types';

export const projects: ShowcaseItem[] = [
	{
		id: 'project-1',
		title: 'Black Land Loss Visualization Tool',
		summary:
			'A website visualizing Black Land Loss data from the Agricultural Census (1910-2002) in the mid-Atlantic region.',
		tags: ['Python', 'React', 'Excel', 'JavaScript', 'Flask'],
		media: {
			type: 'video',
			src: '/videos/black-land-loss.mp4',
			alt: 'Demo of the Black Land Loss Visualization Tool'
		},
		description: `An interactive tool mapping the loss of Black-owned farmland across the American South from 1920–1997, built on USDA Census of Agriculture data and grounded in a Black land loss study published in AEA Papers and Proceedings, which put the compounded value of that lost land at roughly $326 billion.
			
			\u2022 Interactive cartogram grid with all 17 states color-coded live by land-loss severity, styled after EPI's Minimum Wage Tracker
			\u2022 Inflation-adjusted values for nominal and today's-dollar value-per-acre side by side, via real BLS CPI-U data
			\u2022 Originally built using Python, Flask, and React. Developed an API to do calculations for the website.
			\u2022 Revamped to use SvelteKit and TypeScript, data converted to JSON and calculated instantly.`,

		links: [
			{ type: 'demo', url: 'https://blacklandloss.gnoule.com/' },
			{ type: 'article', url: 'https://www.aeaweb.org/articles?id=10.1257/pandp.20221015' },
			{ type: 'github', url: 'https://github.com/yourname/your-repo' }
		]
	},
	{
		id: 'project-2',
		title: 'Pastry Predictions',
		summary: 'A short one-line summary of project two.',
		tags: ['React', 'TypeScript'],
		description: `As a Business Analyst at Paris Baguette, I supported daily bakery-cafe operations by tracking sales, labor, and inventory data to identify trends and inefficiencies across the store.

			I built simple reporting workflows to flag waste, forecast demand for high-turnover items, and support staffing decisions during peak hours, translating raw POS data into actionable recommendations for management.

			This role sharpened my ability to work with messy, real-world operational data and communicate findings to non-technical stakeholders — skills that carried directly into my later data science and research work.`,
		links: [{ type: 'github', url: 'https://github.com/yourusername/project-two' }]
	},
		{
		id: 'project-3',
		title: 'Monkey Mania II: Primate Party',
		summary: 'A revamped version of my high school AP Computer Science class project.',
		tags: ['TypeScript', 'Phaser', 'Node.js', 'WebSockets', 'Docker'],
		media: {
			type: 'video',
			src: '/videos/mm2-trailer.webm',
			alt: 'Trailer for Monkey Mania II: Primate Party'
		},
		description: 'Monkey Mania II: Primate Party is a real-time multiplayer party game that runs in the browser. The original Monkey Mania was a single-player fruit-catching game I wrote in Processing in 2018. This version includes new features, such as multiplayer, gameplay through browser, and three new minigames. I based the art style off of the PS2/Arcade era of gaming.',
		links: [
			{ type: 'demo', url: 'https://monkey-mania-ii.gnoule.com/' },
			{ type: 'github', url: 'https://github.com/eluong1217/Monkey-Mania' }
		]
	},
	{
		id: 'project-4',
		title: 'gnoule.com',
		summary: "This website and it's previous iteration!",
		tags: ['Svelte', 'React', 'Next.JS', 'TypeScript', 'CSS', 'Cloudflare Pages', 'Vercel'],
		description: `My personal portfolio website built from Svelte, javascript, and vanilla CSS, deployed on Cloudflare Pages. 
			
			My other works (Built in 2022, pre-AI) involve experience with React, Next.JS, Typescript, and deployment through Vercel.`,
		media: { type: 'image', src: '/images/project_portfolio.png', alt: 'Screenshot of gnoule.com' },
		links: [
			{ type: 'demo', url: 'https://portfolio.gnoule.com/' },
			{ type: 'github', url: 'https://github.com/eluong1217/portfolio-website' }
		]
	}
];
