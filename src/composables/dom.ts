/**
 * Calculates the combined box model dimensions (padding, border, margin)
 * from a specified number of parent elements.
 *
 * @param {Element} el - The starting DOM element whose parents will be measured.
 * @param {number} [parentCount=3] - Number of parent levels to traverse and measure.
 *
 * @returns {{totalWidth: number, totalHeight: number}} An object containing the
 *   accumulated horizontal (totalWidth) and vertical (totalHeight) box model dimensions
 */
export function sumParentsBoxModel(
  el: Element,
  parentCount: number = 3,
): { totalWidth: number; totalHeight: number } {
  let totalWidth = 0
  let totalHeight = 0
  let cur: Element | null = el.parentElement

  for (let i = 0; i < parentCount && cur; i++) {
    const cs = getComputedStyle(cur)

    // width-wise: left+right (padding + border + margin)
    totalWidth += (parseFloat(cs.paddingLeft) || 0)
      + (parseFloat(cs.paddingRight) || 0)
      + (parseFloat(cs.borderLeftWidth) || 0)
      + (parseFloat(cs.borderRightWidth) || 0)
      + (parseFloat(cs.marginLeft) || 0)
      + (parseFloat(cs.marginRight) || 0)

    // height-wise: top+bottom (padding + border + margin)
    totalHeight += (parseFloat(cs.paddingTop) || 0)
      + (parseFloat(cs.paddingBottom) || 0)
      + (parseFloat(cs.borderTopWidth) || 0)
      + (parseFloat(cs.borderBottomWidth) || 0)
      + (parseFloat(cs.marginTop) || 0)
      + (parseFloat(cs.marginBottom) || 0)

    cur = cur.parentElement
  }

  return { totalWidth, totalHeight }
}

/**
 * Parses a CSS pixel value string into a number.
 *
 * @param {string | null | undefined} value - The CSS pixel value string to parse (e.g., "10px", "20").
 *
 * @returns {number} The parsed numeric value, or 0 if the input is invalid or missing.
 */
export function parsePx(value: string | null | undefined): number {
  if (!value) {
    return 0
  }
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}
