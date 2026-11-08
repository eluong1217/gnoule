import type { PageServerLoad } from './$types';

type RawEntry = { title: string; date: string; url: string; posterUrl?: string };
type MediaType = 'movie' | 'book' | 'game';

const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	rsquo: '’',
	lsquo: '‘',
	rdquo: '”',
	ldquo: '“',
	mdash: '—',
	ndash: '–',
	hellip: '…'
};

// Some upstream sources hand back HTML-escaped titles ("What&#039;s Your Number?").
// Svelte renders titles as text, so entities would show up literally — decode them here.
// Runs repeatedly to undo double-escaping (&amp;#039; → &#039; → ').
function decodeEntities(value: string): string {
	let out = value;
	for (let i = 0; i < 3; i++) {
		const next = out.replace(/&(#\d+|#[xX][\da-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
			if (code[0] === '#') {
				const point =
					code[1] === 'x' || code[1] === 'X'
						? parseInt(code.slice(2), 16)
						: parseInt(code.slice(1), 10);
				return Number.isFinite(point) && point > 0 && point <= 0x10ffff
					? String.fromCodePoint(point)
					: match;
			}
			return NAMED_ENTITIES[code.toLowerCase()] ?? match;
		});
		if (next === out) break;
		out = next;
	}
	return out;
}

function mapEntries(raw: RawEntry[], type: MediaType) {
	return raw.map((e) => ({
		date: e.date,
		type,
		title: decodeEntities(e.title ?? ''),
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