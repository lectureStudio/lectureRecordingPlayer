import { parsePx, sumParentsBoxModel } from '@/composables/dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock getComputedStyle
const mockGetComputedStyle = vi.fn()
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
  writable: true,
})

describe('composables/dom', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sumParentsBoxModel', () => {
    it('calculates box model dimensions for parent elements', () => {
      const mockElement = {
        parentElement: {
          parentElement: {
            parentElement: null,
          },
        },
      } as HTMLElement

      // Mock getComputedStyle to return specific values
      mockGetComputedStyle
        .mockReturnValueOnce({
          paddingLeft: '10px',
          paddingRight: '15px',
          borderLeftWidth: '2px',
          borderRightWidth: '3px',
          marginLeft: '5px',
          marginRight: '8px',
          paddingTop: '12px',
          paddingBottom: '18px',
          borderTopWidth: '1px',
          borderBottomWidth: '4px',
          marginTop: '6px',
          marginBottom: '9px',
        })
        .mockReturnValueOnce({
          paddingLeft: '20px',
          paddingRight: '25px',
          borderLeftWidth: '1px',
          borderRightWidth: '2px',
          marginLeft: '3px',
          marginRight: '7px',
          paddingTop: '14px',
          paddingBottom: '16px',
          borderTopWidth: '2px',
          borderBottomWidth: '3px',
          marginTop: '4px',
          marginBottom: '8px',
        })

      const result = sumParentsBoxModel(mockElement, 2)

      // First parent: 10+15+2+3+5+8 = 43 width, 12+18+1+4+6+9 = 50 height
      // Second parent: 20+25+1+2+3+7 = 58 width, 14+16+2+3+4+8 = 47 height
      // Total: 43+58 = 101 width, 50+47 = 97 height
      expect(result.totalWidth).toBe(101)
      expect(result.totalHeight).toBe(97)
    })

    it('handles missing parent elements gracefully', () => {
      const mockElement = {
        parentElement: null,
      } as HTMLElement

      const result = sumParentsBoxModel(mockElement, 3)

      expect(result.totalWidth).toBe(0)
      expect(result.totalHeight).toBe(0)
      expect(mockGetComputedStyle).not.toHaveBeenCalled()
    })

    it('stops at the specified parent count', () => {
      const mockElement = {
        parentElement: {
          parentElement: {
            parentElement: {
              parentElement: null,
            },
          },
        },
      } as HTMLElement

      mockGetComputedStyle.mockReturnValue({
        paddingLeft: '10px',
        paddingRight: '10px',
        borderLeftWidth: '0px',
        borderRightWidth: '0px',
        marginLeft: '0px',
        marginRight: '0px',
        paddingTop: '10px',
        paddingBottom: '10px',
        borderTopWidth: '0px',
        borderBottomWidth: '0px',
        marginTop: '0px',
        marginBottom: '0px',
      })

      sumParentsBoxModel(mockElement, 2)

      // Should only be called twice (for 2 parents)
      expect(mockGetComputedStyle).toHaveBeenCalledTimes(2)
    })

    it('uses default parent count of 3', () => {
      const mockElement = {
        parentElement: {
          parentElement: {
            parentElement: {
              parentElement: null,
            },
          },
        },
      } as HTMLElement

      mockGetComputedStyle.mockReturnValue({
        paddingLeft: '10px',
        paddingRight: '10px',
        borderLeftWidth: '0px',
        borderRightWidth: '0px',
        marginLeft: '0px',
        marginRight: '0px',
        paddingTop: '10px',
        paddingBottom: '10px',
        borderTopWidth: '0px',
        borderBottomWidth: '0px',
        marginTop: '0px',
        marginBottom: '0px',
      })

      sumParentsBoxModel(mockElement)

      // Should be called 3 times (default parent count)
      expect(mockGetComputedStyle).toHaveBeenCalledTimes(3)
    })

    it('handles invalid CSS values gracefully', () => {
      const mockElement = {
        parentElement: {
          parentElement: null,
        },
      } as HTMLElement

      mockGetComputedStyle.mockReturnValue({
        paddingLeft: 'invalid',
        paddingRight: 'NaN',
        borderLeftWidth: 'auto',
        borderRightWidth: 'inherit',
        marginLeft: '10px',
        marginRight: '20px',
        paddingTop: 'invalid',
        paddingBottom: 'NaN',
        borderTopWidth: 'auto',
        borderBottomWidth: 'inherit',
        marginTop: '5px',
        marginBottom: '15px',
      })

      const result = sumParentsBoxModel(mockElement, 1)

      // Invalid values become 0, valid values are counted: marginLeft(10) + marginRight(20) + marginTop(5) + marginBottom(15)
      expect(result.totalWidth).toBe(30) // 10 + 20
      expect(result.totalHeight).toBe(20) // 5 + 15
    })

    it('handles zero and negative values', () => {
      const mockElement = {
        parentElement: {
          parentElement: null,
        },
      } as HTMLElement

      mockGetComputedStyle.mockReturnValue({
        paddingLeft: '0px',
        paddingRight: '-5px',
        borderLeftWidth: '0',
        borderRightWidth: '10px',
        marginLeft: '0px',
        marginRight: '0',
        paddingTop: '0px',
        paddingBottom: '-10px',
        borderTopWidth: '0',
        borderBottomWidth: '15px',
        marginTop: '0px',
        marginBottom: '0',
      })

      const result = sumParentsBoxModel(mockElement, 1)

      // Zero and negative values become 0, positive values are counted: borderRightWidth(10) + borderBottomWidth(15)
      // Note: parseFloat('-5px') || 0 returns -5, not 0, so negative values are preserved
      expect(result.totalWidth).toBe(5) // -5 + 10 = 5
      expect(result.totalHeight).toBe(5) // -10 + 15 = 5
    })
  })

  describe('parsePx', () => {
    it('parses valid pixel values', () => {
      expect(parsePx('10px')).toBe(10)
      expect(parsePx('20.5px')).toBe(20.5)
      expect(parsePx('0px')).toBe(0)
      expect(parsePx('-5px')).toBe(-5)
    })

    it('parses numeric strings without px suffix', () => {
      expect(parsePx('10')).toBe(10)
      expect(parsePx('20.5')).toBe(20.5)
      expect(parsePx('0')).toBe(0)
      expect(parsePx('-5')).toBe(-5)
    })

    it('returns 0 for null, undefined, or empty string', () => {
      expect(parsePx(null)).toBe(0)
      expect(parsePx(undefined)).toBe(0)
      expect(parsePx('')).toBe(0)
    })

    it('returns 0 for invalid values', () => {
      expect(parsePx('invalid')).toBe(0)
      expect(parsePx('NaN')).toBe(0)
      expect(parsePx('Infinity')).toBe(0)
      expect(parsePx('auto')).toBe(0)
      expect(parsePx('inherit')).toBe(0)
    })

    it('handles edge cases', () => {
      expect(parsePx('0.0')).toBe(0)
      expect(parsePx('0.0001')).toBe(0.0001)
      expect(parsePx('999999')).toBe(999999)
      expect(parsePx('-999999')).toBe(-999999)
    })

    it('handles whitespace', () => {
      expect(parsePx(' 10px ')).toBe(10)
      expect(parsePx('\t20.5px\n')).toBe(20.5)
      expect(parsePx('   ')).toBe(0)
    })
  })
})
