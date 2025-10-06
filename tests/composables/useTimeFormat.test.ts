import { describe, it, expect } from 'vitest'
import { useTimeFormat } from '@/composables/useTimeFormat'

describe('composables/useTimeFormat', () => {
  const { formatHMM, formatHHMMSS } = useTimeFormat()

  it('formats 0 and falsy values as 0:00 and 0:00:00', () => {
    expect(formatHMM(undefined)).toBe('0:00')
    expect(formatHMM(null as any)).toBe('0:00')
    expect(formatHMM(-5 as any)).toBe('0:00')
    expect(formatHHMMSS(undefined)).toBe('0:00:00')
    expect(formatHHMMSS(null as any)).toBe('0:00:00')
    expect(formatHHMMSS(-10 as any)).toBe('0:00:00')
  })

  it('formats under an hour correctly', () => {
    expect(formatHMM(65)).toBe('0:01')
    expect(formatHHMMSS(65)).toBe('0:01:05')
    expect(formatHHMMSS(3599)).toBe('0:59:59')
  })

  it('formats one hour and above correctly', () => {
    expect(formatHMM(3600)).toBe('1:00')
    expect(formatHHMMSS(3600)).toBe('1:00:00')
    expect(formatHHMMSS(3661)).toBe('1:01:01')
    expect(formatHHMMSS(10 * 3600 + 2 * 60 + 3)).toBe('10:02:03')
  })

  it('floors and clamps non-integer and infinite values', () => {
    expect(formatHHMMSS(61.9)).toBe('0:01:01')
    expect(formatHHMMSS(Number.POSITIVE_INFINITY as any)).toBe('0:00:00')
    expect(formatHMM(Number.NaN as any)).toBe('0:00')
  })
})
