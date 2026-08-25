import type { PageServerLoad } from './$types';

type RawEntry = { title: string; date: string; url: string; posterUrl?: string };
type MediaType = 'movie' | 'book' | 'game';

function mapEntries(raw: RawEntry[], type: MediaType) {
	return raw.map((e) => ({
		date: e.date,
		type,
		title: e.title,
		link: e.url,
		posterUrl: e.posterUrl
	}));
}

export const load: PageServerLoad = async ({ platform }) => {
	const kv = platform?.env.MEDIA_KV;

	const [moviesRaw, gamesRaw, booksRaw] = await Promise.all([
		kv?.get('media:movies'),
		kv?.get('media:games'),
		kv?.get('media:books')
	]);

	const entries = [
		...mapEntries(moviesRaw ? JSON.parse(moviesRaw) : [], 'movie'),
		...mapEntries(gamesRaw ? JSON.parse(gamesRaw) : [], 'game'),
		...mapEntries(booksRaw ? JSON.parse(booksRaw) : [], 'book')
	];

	return { entries };
};