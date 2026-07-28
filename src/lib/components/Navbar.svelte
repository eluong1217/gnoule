<script lang="ts">
	import TypewriterText from './TypewriterText.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const words = [
		{ text: 'eluong', direction: 'forward' as const },
		{ text: 'gnoule', direction: 'reverse' as const }
	];

	// Update these with your real profile URLs
	const githubUrl = 'https://github.com/eluong1217';
	const linkedinUrl = 'https://linkedin.com/in/eluong1217';
</script>

<nav class="navbar">
	<div class="logo">
		<TypewriterText {words} />
	</div>

	<div class="actions">
		<a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
			<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
				<path
					d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.79 24 17.29 24 12c0-6.63-5.37-12-12-12Z"
				/>
			</svg>
		</a>

		<a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
			<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
				<path
					d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
				/>
			</svg>
		</a>

		<ThemeToggle />
	</div>
</nav>

<style>
	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-unit, 8px) calc(var(--spacing-unit, 8px) * 2);
		max-width: 1100px;
		margin: 0 auto;
	}

	.logo {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.actions a {
		color: var(--color-text);
		opacity: 0.75;
		transition: opacity 0.2s ease, color 0.2s ease;
		display: flex;
	}

	.actions a:hover {
		opacity: 1;
		color: var(--color-accent);
	}
</style>