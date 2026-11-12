<script lang="ts">
	// ─────────────────────────────────────────────
	// Figure-8 (lemniscate) shape — fixed, never moves
	// ─────────────────────────────────────────────
	const A_X = 300;
	const A_Y = 225;
	const CENTER_X = 350;
	const CENTER_Y = 275;
	const RENDER_SCALE = 1.15;
	const SCALE_COUNT = 60;
	const CURVE_SAMPLES = 300;
	const SPEED = 0.01; // radians per frame
	const TAU = Math.PI * 2;

	function lemniscatePoint(t: number) {
		const denom = 1 + Math.sin(t) ** 2;
		return {
			x: CENTER_X + (A_X * Math.cos(t)) / denom,
			y: CENTER_Y + (A_Y * Math.sin(t) * Math.cos(t)) / denom
		};
	}

	/** Direction of travel along the curve at `t`, in degrees. */
	function tangentAngle(t: number) {
		const dt = 0.001;
		const p1 = lemniscatePoint(t - dt);
		const p2 = lemniscatePoint(t + dt);
		return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
	}

	function pointWithAngle(t: number) {
		return { ...lemniscatePoint(t), angle: tangentAngle(t) };
	}

	const bodyPath =
		Array.from({ length: CURVE_SAMPLES }, (_, i) => {
			const { x, y } = lemniscatePoint((i / CURVE_SAMPLES) * TAU);
			return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
		}).join(' ') + ' Z';

	// ─────────────────────────────────────────────
	// The head and the scale texture both travel along the curve at the same speed
	// ─────────────────────────────────────────────
	let phase = $state(0);

	const head = $derived(pointWithAngle(phase));

	// scale texture: small rotated ellipses spaced evenly along the curve
	const scales = $derived(
		Array.from({ length: SCALE_COUNT }, (_, i) => pointWithAngle((i / SCALE_COUNT) * TAU + phase))
	);

	$effect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let frameId = requestAnimationFrame(function loop() {
			phase = (phase + SPEED) % TAU;
			frameId = requestAnimationFrame(loop);
		});
		return () => cancelAnimationFrame(frameId);
	});
</script>

<svg viewBox="0 0 700 550" class="ouroboros" aria-hidden="true">
	<defs>
		<filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
			<feGaussianBlur stdDeviation="8" result="blur" />
			<feMerge>
				<feMergeNode in="blur" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>

	<g
		transform="translate({CENTER_X} {CENTER_Y}) scale({RENDER_SCALE}) translate({-CENTER_X} {-CENTER_Y})"
	>
		<path d={bodyPath} class="body" />

		{#each scales as scale, i (i)}
			<ellipse
				cx={scale.x}
				cy={scale.y}
				rx="9"
				ry="5"
				transform="rotate({scale.angle}, {scale.x}, {scale.y})"
				class="scale"
			/>
		{/each}

		<g transform="translate({head.x}, {head.y}) rotate({head.angle})" filter="url(#glow)">
			<image href="/images/snakehead.png" x="-20" y="-25" width="60" height="60" />
		</g>
	</g>
</svg>

<style>
	.ouroboros {
		width: 100%;
		max-width: 620px;
		height: auto;
		display: block;
		margin: 0 auto;
		overflow: visible;
	}

	.body {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 10;
		stroke-linecap: round;
	}

	.scale {
		fill: var(--color-bg);
		opacity: 0.25;
	}
</style>
