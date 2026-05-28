import { describe, expect, it } from "vitest";

import { buildHoneycombRows, getHoneycombColumnCount } from "./honeycomb";

describe("getHoneycombColumnCount", () => {
  it("uses 3 columns on narrow mobile widths", () => {
    expect(getHoneycombColumnCount(288, 80)).toBe(3);
    expect(getHoneycombColumnCount(328, 80)).toBe(3);
  });

  it("expands to 4 columns once the phone viewport can fit them", () => {
    expect(getHoneycombColumnCount(343, 80)).toBe(4);
  });

  it("caps the layout at 9 columns on wide screens", () => {
    expect(getHoneycombColumnCount(1152, 120)).toBe(9);
  });
});

describe("buildHoneycombRows", () => {
  it("alternates full and offset row sizes", () => {
    const rows = buildHoneycombRows([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);

    expect(rows.map((row) => row.length)).toEqual([4, 3, 3]);
    expect(rows[0]?.every((item) => item.offset === false)).toBe(true);
    expect(rows[1]?.every((item) => item.offset === true)).toBe(true);
    expect(rows[2]?.every((item) => item.offset === false)).toBe(true);
  });
});
