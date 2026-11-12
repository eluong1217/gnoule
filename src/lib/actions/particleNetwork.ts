import type { Action } from 'svelte/action';

const MOUSE_RADIUS = 140;
const LINK_DISTANCE = 110;
const PARTICLE_DENSITY = 9000; // px² of area per particle
const MAX_PARTICLES = 90;
const OFFSCREEN = -9999;

type Particle = { x: number; y: number; vx: number; vy: number };

/**
 * Draws an interactive particle network on a canvas, sized to and reacting to the mouse
 * over its parent element. Colours come from the --color-text / --color-accent theme vars.
 */
export const particleNetwork: Action<HTMLCanvasElement> = (canvas) => {
	const container = canvas.parentElement;
	const ctx = canvas.getContext('2d');
	if (!container || !ctx) return;

	return { destroy: start(canvas, container, ctx) };
};

/** Starts the simulation and returns a cleanup function. */
function start(canvas: HTMLCanvasElement, container: HTMLElement, ctx: CanvasRenderingContext2D) {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let particles: Particle[] = [];
	let width = 0;
	let height = 0;
	let mouseX = OFFSCREEN;
	let mouseY = OFFSCREEN;
	let frameId = 0;

	function getColors() {
		const styles = getComputedStyle(container);
		return {
			dot: styles.getPropertyValue('--color-text').trim() || '#000',
			line: styles.getPropertyValue('--color-accent').trim() || '#888'
		};
	}

	function resize() {
		const rect = container.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		width = rect.width;
		height = rect.height;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const count = Math.min(MAX_PARTICLES, Math.floor((width * height) / PARTICLE_DENSITY));
		particles = Array.from({ length: count }, () => ({
			x: Math.random() * width,
			y: Math.random() * height,
			vx: (Math.random() - 0.5) * 0.3,
			vy: (Math.random() - 0.5) * 0.3
		}));
	}

	function handleMouseMove(e: MouseEvent) {
		const rect = container.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}

	function handleMouseLeave() {
		mouseX = OFFSCREEN;
		mouseY = OFFSCREEN;
	}

	function drawLine(x1: number, y1: number, x2: number, y2: number, alpha: number) {
		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	function update() {
		for (const p of particles) {
			// Push away from the cursor
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

			// Wrap around the edges
			if (p.x < 0) p.x = width;
			if (p.x > width) p.x = 0;
			if (p.y < 0) p.y = height;
			if (p.y > height) p.y = 0;
		}
	}

	function draw() {
		const { dot, line } = getColors();
		ctx.clearRect(0, 0, width, height);
		ctx.strokeStyle = line;
		ctx.lineWidth = 1;

		for (let i = 0; i < particles.length; i++) {
			const a = particles[i];

			for (let j = i + 1; j < particles.length; j++) {
				const b = particles[j];
				const dist = Math.hypot(a.x - b.x, a.y - b.y);
				if (dist < LINK_DISTANCE) {
					drawLine(a.x, a.y, b.x, b.y, (1 - dist / LINK_DISTANCE) * 0.35);
				}
			}

			const distM = Math.hypot(a.x - mouseX, a.y - mouseY);
			if (distM < MOUSE_RADIUS) {
				drawLine(a.x, a.y, mouseX, mouseY, (1 - distM / MOUSE_RADIUS) * 0.6);
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

	function step() {
		update();
		draw();
	}

	function loop() {
		step();
		frameId = requestAnimationFrame(loop);
	}

	resize();
	window.addEventListener('resize', resize);
	container.addEventListener('mousemove', handleMouseMove);
	container.addEventListener('mouseleave', handleMouseLeave);

	if (prefersReducedMotion) step();
	else loop();

	return () => {
		cancelAnimationFrame(frameId);
		window.removeEventListener('resize', resize);
		container.removeEventListener('mousemove', handleMouseMove);
		container.removeEventListener('mouseleave', handleMouseLeave);
	};
}
