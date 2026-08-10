<script lang="ts">
	// Edit this to update your bio
	const bioText =
        "Data Scientist based in Boston, MA. I research labor economics, financial insititutions, and behavioral economics. Passionate about data and machine learning in economics.";
	let sectionEl: HTMLElement | undefined = $state();
	let visible = $state(false);

	$effect(() => {
		if (!sectionEl) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.3 }
		);

		observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="bio" bind:this={sectionEl} class:visible>
	<span class="label">Eric Luong</span>
	<p>{bioText}</p>
	<div class="underline"></div>
</section>

<style>
	.bio {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1.5rem 3.5rem;
		text-align: center;
		position: relative;
		opacity: 0;
		transform: translateY(16px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.bio.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.label {
		display: inline-block;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-accent);
		margin-bottom: 0.75rem;
	}

	.quote-mark {
		font-size: 4rem;
		line-height: 1;
		color: var(--color-accent);
		opacity: 0.25;
		font-family: Georgia, serif;
		margin-bottom: -0.5rem;
	}

	.bio p {
		font-size: 1.2rem;
		line-height: 1.75;
		color: var(--color-text);
		opacity: 0.9;
	}

	.underline {
		width: 40px;
		height: 2px;
		background: var(--color-accent);
		margin: 1.5rem auto 0;
		opacity: 0.6;
	}
</style>