<script lang="ts">
	// ─────────────────────────────────────────────
	// Figure-8 (lemniscate) shape — fixed, never moves
	// ─────────────────────────────────────────────
	const aX = 300;
	const aY = 225;
	const centerX = 350;
	const centerY = 275;
	const scaleCount = 60;
    const renderScale = 1.15;

	function lemniscatePoint(t: number) {
		const denom = 1 + Math.sin(t) ** 2;
		const x = (aX * Math.cos(t)) / denom;
		const y = (aY * Math.sin(t) * Math.cos(t)) / denom;
		return { x: centerX + x, y: centerY + y };
	}

	function lemniscateTangentAngle(t: number) {
		const dt = 0.001;
		const p1 = lemniscatePoint(t - dt);
		const p2 = lemniscatePoint(t + dt);
		return Math.atan2(p2.y - p1.y, p2.x - p1.x);
	}

	const CURVE_SAMPLES = 300;
	const curvePoints = Array.from({ length: CURVE_SAMPLES }, (_, i) => {
		const t = (i / CURVE_SAMPLES) * Math.PI * 2;
		return lemniscatePoint(t);
	});

	const bodyPath =
		curvePoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';

	// scale texture: small rotated ellipses spaced evenly along the curve
	const scales = $derived.by(() => {
    return Array.from({ length: scaleCount }, (_, i) => {
            const t = (i / scaleCount) * Math.PI * 2 + scalePhase;
            const { x, y } = lemniscatePoint(t);
            const angle = (lemniscateTangentAngle(t) * 180) / Math.PI;
        return { x, y, angle };
        });
    });

	// ─────────────────────────────────────────────
	// Head position + orientation — animates continuously along the curve
	// ─────────────────────────────────────────────
	let headX = $state(curvePoints[0].x);
	let headY = $state(curvePoints[0].y);
	let headAngle = $state((lemniscateTangentAngle(0) * 180) / Math.PI);
    let scalePhase = $state(0);

	$effect(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;

		const SPEED = 0.01;
		let t = 0;
		let frameId: number;

		function loop() {
			t += SPEED;
			if (t > Math.PI * 2) t -= Math.PI * 2;
			const p = lemniscatePoint(t);
			headX = p.x;
			headY = p.y;
			headAngle = (lemniscateTangentAngle(t) * 180) / Math.PI;
			frameId = requestAnimationFrame(loop);
            scalePhase += 0.01;
		}

		frameId = requestAnimationFrame(loop);
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

    <g transform={`translate(350 275) scale(${renderScale}) translate(-350 -275)`}>
        <path d={bodyPath} class="body" />

        {#each scales as scale}
            <ellipse
                cx={scale.x}
                cy={scale.y}
                rx="9"
                ry="5"
                transform={`rotate(${scale.angle}, ${scale.x}, ${scale.y})`}
                class="scale"
            />
        {/each}

        <g transform={`translate(${headX}, ${headY}) rotate(${headAngle})`} filter="url(#glow)">
            <image
                href="/images/snakehead.png"
                x="-20"
                y="-25"
                width="60"
                height="60"
                class="head-image"
            />
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