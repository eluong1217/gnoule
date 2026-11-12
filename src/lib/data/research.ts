import type { ShowcaseItem } from '$lib/types';

export const research: ShowcaseItem[] = [
	{
		id: 'research-1',
		title: 'Varieties of Capitalism and Household Debt',
		summary:
			'Research on the correlation between household debt, financialization and macroeconomics between Coordinated and Liberal Markets.',
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
		description: 'Full description of research project four goes here. Replace with real content.',
		links: [{ type: 'github', url: 'https://github.com/yourname/your-repo' }]
	},
	{
		id: 'research-4',
		title: 'Cryptocurrency ATM Legislation Report',
		summary: 'A short one-line summary of research project three.',
		tags: [],
		description: 'Full description of research project three goes here. Replace with real content.',
		links: [{ type: 'github', url: 'https://github.com/yourname/your-repo' }]
	}

	// add more research items here
];
