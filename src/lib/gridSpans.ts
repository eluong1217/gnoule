/**
 * Layout maths for the expandable card grid.
 *
 * The grid is drawn on a finer "sub-column" track so that when one card expands to
 * full width, the cards left behind in a partial row can split that row evenly.
 */

export function columnsForWidth(width: number | undefined) {
	if (width === undefined) return 3;
	if (width <= 640) return 1;
	if (width <= 900) return 2;
	return 3;
}

export function subcolumnsFor(columns: number) {
	if (columns === 3) return 6;
	if (columns === 2) return 2;
	return 1;
}

/**
 * Span overrides (item index → sub-column span) so the grid never leaves a gap:
 * any row with fewer cards than columns splits the full width evenly.
 * `openIndex` is the expanded card (it takes a whole row by itself), or -1 for none.
 * Items not in the map keep the base span.
 */
export function computeSpans(count: number, openIndex: number, columns: number) {
	const spans = new Map<number, number>();
	const subcolumns = subcolumnsFor(columns);

	function assignRow(start: number, end: number) {
		const len = end - start;
		if (len === 0 || len === columns) return;
		for (let i = start; i < end; i++) spans.set(i, subcolumns / len);
	}

	// Cards sharing the open card's row, before it
	if (openIndex >= 0) assignRow(Math.floor(openIndex / columns) * columns, openIndex);

	// Everything after the open card (or everything, if none is open) flows into fresh rows
	for (let i = openIndex + 1; i < count; i += columns) {
		assignRow(i, Math.min(i + columns, count));
	}

	return spans;
}
