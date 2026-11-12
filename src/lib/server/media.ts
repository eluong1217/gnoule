import type { MediaEntry, MediaType } from '$lib/media';

/** The slice of Cloudflare's KVNamespace this module needs. */
type KVReader = { get(key: string): Promise<string | null> };

type RawEntry = { title: string; date: string; url: string; posterUrl?: string };

const KV_KEYS: Record<MediaType, string> = {
	movie: 'media:movies',
	game: 'media:games',
	book: 'media:books'
};

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
export function decodeEntities(value: string): string {
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

async function loadType(kv: KVReader | undefined, type: MediaType): Promise<MediaEntry[]> {
	const raw = await kv?.get(KV_KEYS[type]);
	const parsed: RawEntry[] = raw ? JSON.parse(raw) : [];
	return parsed.map((e) => ({
		date: e.date,
		type,
		title: decodeEntities(e.title ?? ''),
		link: e.url,
		posterUrl: e.posterUrl
	}));
}

export async function loadMediaEntries(kv: KVReader | undefined): Promise<MediaEntry[]> {
	const [movies, games, books] = await Promise.all([
		loadType(kv, 'movie'),
		loadType(kv, 'game'),
		loadType(kv, 'book')
	]);
	return [...movies, ...games, ...books];
}
