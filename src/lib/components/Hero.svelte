<script lang="ts">
	import Ouroboros from './Ouroboros.svelte';

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let sectionEl: HTMLElement | undefined = $state();

	// ─────────────────────────────────────────────
	// Particle network background
	// ─────────────────────────────────────────────
	$effect(() => {
		if (!canvasEl || !sectionEl) return;

		const canvas = canvasEl;
		const section = sectionEl;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		type Particle = { x: number; y: number; vx: number; vy: number };
		let particles: Particle[] = [];
		let width = 0;
		let height = 0;
		let dpr = window.devicePixelRatio || 1;

		let mouseX = -9999;
		let mouseY = -9999;
		const MOUSE_RADIUS = 140;
		const LINK_DISTANCE = 110;
		const PARTICLE_DENSITY = 9000;

		function getColors() {
			const styles = getComputedStyle(section);
			return {
				dot: styles.getPropertyValue('--color-text').trim() || '#000',
				line: styles.getPropertyValue('--color-accent').trim() || '#888'
			};
		}

		function resize() {
			const rect = section.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			dpr = window.devicePixelRatio || 1;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			const count = Math.min(90, Math.floor((width * height) / PARTICLE_DENSITY));
			particles = Array.from({ length: count }, () => ({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.3,
				vy: (Math.random() - 0.5) * 0.3
			}));
		}

		function handleMouseMove(e: MouseEvent) {
			const rect = section.getBoundingClientRect();
			mouseX = e.clientX - rect.left;
			mouseY = e.clientY - rect.top;
		}

		function handleMouseLeave() {
			mouseX = -9999;
			mouseY = -9999;
		}

		function step() {
			const { dot, line } = getColors();
			ctx.clearRect(0, 0, width, height);

			for (const p of particles) {
				const dx = p.x - mouseX;
				const dy = p.y - mouseY;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < MOUSE_RADIUS) {
					const force = (1 - dist / MOUSE_RADIUS) * 0.6;
					p.vx += (dx / dist) * force;
					p.vy += (dy / dist) * force;
				}

				p.x += p.vx;
				p.y += p.vy;
				p.vx *= 0.98;
				p.vy *= 0.98;

				if (p.x < 0) p.x = width;
				if (p.x > width) p.x = 0;
				if (p.y < 0) p.y = height;
				if (p.y > height) p.y = 0;
			}

			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const a = particles[i];
					const b = particles[j];
					const dx = a.x - b.x;
					const dy = a.y - b.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < LINK_DISTANCE) {
						ctx.strokeStyle = line;
						ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * 0.35;
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.stroke();
					}
				}

				const dxM = particles[i].x - mouseX;
				const dyM = particles[i].y - mouseY;
				const distM = Math.sqrt(dxM * dxM + dyM * dyM);
				if (distM < MOUSE_RADIUS) {
					ctx.strokeStyle = line;
					ctx.globalAlpha = (1 - distM / MOUSE_RADIUS) * 0.6;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(particles[i].x, particles[i].y);
					ctx.lineTo(mouseX, mouseY);
					ctx.stroke();
				}
			}

			ctx.globalAlpha = 0.7;
			ctx.fillStyle = dot;
			for (const p of particles) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.globalAlpha = 1;
		}

		let frameId: number;
		function loop() {
			step();
			frameId = requestAnimationFrame(loop);
		}

		resize();
		window.addEventListener('resize', resize);
		section.addEventListener('mousemove', handleMouseMove);
		section.addEventListener('mouseleave', handleMouseLeave);

		if (prefersReducedMotion) {
			step();
		} else {
			loop();
		}

		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener('resize', resize);
			section.removeEventListener('mousemove', handleMouseMove);
			section.removeEventListener('mouseleave', handleMouseLeave);
		};
	});
</script>

<section class="hero" bind:this={sectionEl}>
	<canvas bind:this={canvasEl} class="network"></canvas>
	<Ouroboros />
</section>

<style>
	.hero {
		position: relative;
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.network {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}
</style>