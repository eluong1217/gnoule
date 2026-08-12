import type { PageServerLoad } from './$types';

type RawItem = { title: string; date: string; url: string; posterUrl?: string };

export const load: PageServerLoad = async ({ platform }) => {
	const [movieRaw, gameRaw] = await Promise.all([
		platform?.env.MEDIA_KV.get('media:movies'),
		platform?.env.MEDIA_KV.get('media:games')
	]);
	const movies: RawItem[] = movieRaw ? JSON.parse(movieRaw) : [];
	const games: RawItem[] = gameRaw ? JSON.parse(gameRaw) : [];

	const entries = [
		...movies.map((m) => ({ date: m.date, type: 'movie' as const, title: m.title, link: m.url, posterUrl: m.posterUrl })),
		...games.map((g) => ({ date: g.date, type: 'game' as const, title: g.title, link: g.url, posterUrl: g.posterUrl }))
	];

	return { entries };
};