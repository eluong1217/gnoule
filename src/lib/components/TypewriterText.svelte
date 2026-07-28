<script lang="ts">
	type Word = { text: string; direction: 'forward' | 'reverse' };

	type Props = {
		words: Word[];
		typingSpeed?: number;
		deletingSpeed?: number;
		pauseTime?: number;
	};

	let { words, typingSpeed = 120, deletingSpeed = 60, pauseTime = 1200 }: Props = $props();

	let displayText = $state('');
	let wordIndex = $state(0);
	let charIndex = $state(0);
	let isDeleting = $state(false);

	function getDisplayText(word: string, direction: string, count: number) {
		if (direction === 'forward') return word.slice(0, count);
		return word.slice(word.length - count);
	}

	$effect(() => {
		const current = words[wordIndex];
		const speed = isDeleting ? deletingSpeed : typingSpeed;
		let timeout: ReturnType<typeof setTimeout>;

		if (!isDeleting && charIndex === current.text.length) {
			timeout = setTimeout(() => (isDeleting = true), pauseTime);
		} else if (isDeleting && charIndex === 0) {
			timeout = setTimeout(() => {
				isDeleting = false;
				wordIndex = (wordIndex + 1) % words.length;
			}, 400);
		} else {
			timeout = setTimeout(() => {
				charIndex += isDeleting ? -1 : 1;
				displayText = getDisplayText(current.text, current.direction, charIndex);
			}, speed);
		}

		return () => clearTimeout(timeout);
	});
</script>

<span class="typewriter">{displayText}<span class="cursor">|</span></span>

<style>
	.typewriter {
		font-family: var(--font-body);
		white-space: nowrap;
	}

	.cursor {
		display: inline-block;
		animation: blink 1s step-end infinite;
		color: var(--color-accent);
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>