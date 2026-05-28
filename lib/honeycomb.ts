export interface HoneycombRowItem<T> {
  item: T;
  offset: boolean;
}

/**
 * Fit as many hex cells as possible into the available width while keeping
 * the mobile layout inside the page gutters.
 */
export function getHoneycombColumnCount(
  availableWidth: number,
  hexSize: number,
  gap = 4,
  minCols = 3,
  maxCols = 9,
): number {
  const safeWidth = Math.max(availableWidth, hexSize);
  const perCell = Math.max(hexSize + gap, 1);
  const fit = Math.floor((safeWidth + gap) / perCell);
  return Math.max(minCols, Math.min(maxCols, fit));
}

/**
 * Arranges items into rows for honeycomb layout.
 * Even rows have `cols` items, odd rows have `cols - 1` and are offset.
 */
export function buildHoneycombRows<T>(
  items: T[],
  cols: number,
): HoneycombRowItem<T>[][] {
  const rows: HoneycombRowItem<T>[][] = [];
  let i = 0;
  let isOffset = false;

  while (i < items.length) {
    const rowSize = isOffset ? cols - 1 : cols;
    const row = items.slice(i, i + rowSize).map((item) => ({
      item,
      offset: isOffset,
    }));
    rows.push(row);
    i += rowSize;
    isOffset = !isOffset;
  }

  return rows;
}
