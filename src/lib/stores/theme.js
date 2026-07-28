import { writable } from 'svelte/store';

function createThemeStore() {
	const { subscribe, set, update } = writable('light');

	return {
		subscribe,
		init: () => {
			if (typeof localStorage === 'undefined') return;
			const stored = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const theme = stored || (prefersDark ? 'dark' : 'light');
			set(theme);
			document.documentElement.setAttribute('data-theme', theme);
		},
		toggle: () => {
			update((current) => {
				const next = current === 'light' ? 'dark' : 'light';
				localStorage.setItem('theme', next);
				document.documentElement.setAttribute('data-theme', next);
				return next;
			});
		}
	};
}

export const theme = createThemeStore();