import type { EducationEntry } from '$lib/types';

export const education: EducationEntry[] = [
	{
		school: 'University of Massachusetts Boston',
		degree: 'M.A. in Applied Economics',
		dates: '2026 — 2027',
		logo: '/logos/umb.png',
		bullets: ['Relevant coursework: Quantitative Methods I and II, Machine Learning', 'GPA: 4.0']
	},
	{
		school: 'University of Massachusetts Boston',
		degree: 'B.A. in Computer Science and Economics',
		dates: '2020 — 2025',
		logo: '/logos/umb.png',
		bullets: [
			'Magna Cum Laude',
			'Teaching Assistant: Theory of Computation, Ethics in Computer Science, First Year Seminar: Frame Theory',
			'Leonard J. Kirsch Award Recipient'
		]
	}
	// add more entries here as needed
];
