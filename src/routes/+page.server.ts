import type { PageServerLoad } from './$types';

type RawMovie = { title: string; date: string; url: string };

export const load: PageServerLoad = async ({ platform }) => {
	const raw = await platform?.env.MEDIA_KV.get('media:movies');
	const movies: RawMovie[] = raw ? JSON.parse(raw) : [];

	const entries = movies.map((m) => ({
		date: m.date,
		type: 'movie' as const,
		title: m.title,
		link: m.url
	}));

	return { movies: entries };
};