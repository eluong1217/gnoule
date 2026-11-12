import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function apply(theme: Theme) {
	document.documentElement.setAttribute('data-theme', theme);
}

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		// Mirrors the inline script in app.html, which sets data-theme before first paint.
		init: () => {
			if (typeof localStorage === 'undefined') return;
			const stored = localStorage.getItem('theme') as Theme | null;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const theme = stored || (prefersDark ? 'dark' : 'light');
			set(theme);
			apply(theme);
		},
		toggle: () => {
			update((current) => {
				const next = current === 'light' ? 'dark' : 'light';
				localStorage.setItem('theme', next);
				apply(next);
				return next;
			});
		}
	};
}

export const theme = createThemeStore();
