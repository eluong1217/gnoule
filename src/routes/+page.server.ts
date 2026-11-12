import { loadMediaEntries } from '$lib/server/media';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	return { entries: await loadMediaEntries(platform?.env.MEDIA_KV) };
};
