import { useTimeFormat } from '@/composables/useTimeFormat'
import { describe, expect, it } from 'vitest'

describe('useTimeFormat', () => {
  const { formatHMM, formatHHMMSS } = useTimeFormat()

  describe('formatHMM', () => {
    it('should format minutes only when hours is 0', () => {
      expect(formatHMM(0)).toBe('00')
      expect(formatHMM(30000)).toBe('00') // 30 seconds
      expect(formatHMM(59000)).toBe('00') // 59 seconds
      expect(formatHMM(60000)).toBe('01') // 1 minute
      expect(formatHMM(119000)).toBe('01') // 1 minute 59 seconds
    })

    it('should format hours and minutes when hours > 0', () => {
      expect(formatHMM(3600000)).toBe('1:00') // 1 hour
      expect(formatHMM(3660000)).toBe('1:01') // 1 hour 1 minute
      expect(formatHMM(7200000)).toBe('2:00') // 2 hours
      expect(formatHMM(7260000)).toBe('2:01') // 2 hours 1 minute
    })

    it('should handle edge cases', () => {
      expect(formatHMM(null)).toBe('00')
      expect(formatHMM(undefined)).toBe('00')
      expect(formatHMM(-1000)).toBe('00') // Negative time
      expect(formatHMM(Infinity)).toBe('00') // Infinite time
      expect(formatHMM(NaN)).toBe('00') // Not a number
    })

    it('should handle large values', () => {
      expect(formatHMM(86400000)).toBe('24:00') // 24 hours
      expect(formatHMM(90000000)).toBe('25:00') // 25 hours
    })

    it('should handle fractional milliseconds', () => {
      expect(formatHMM(59999.9)).toBe('00') // Just under 1 minute
      expect(formatHMM(60000.1)).toBe('01') // Just over 1 minute
    })
  })

  describe('formatHHMMSS', () => {
    it('should format minutes and seconds when hours is 0', () => {
      expect(formatHHMMSS(0)).toBe('0:00')
      expect(formatHHMMSS(30000)).toBe('0:30') // 30 seconds
      expect(formatHHMMSS(59000)).toBe('0:59') // 59 seconds
      expect(formatHHMMSS(60000)).toBe('1:00') // 1 minute
      expect(formatHHMMSS(90000)).toBe('1:30') // 1 minute 30 seconds
      expect(formatHHMMSS(119000)).toBe('1:59') // 1 minute 59 seconds
    })

    it('should format hours, minutes and seconds when hours > 0', () => {
      expect(formatHHMMSS(3600000)).toBe('1:00:00') // 1 hour
      expect(formatHHMMSS(3660000)).toBe('1:01:00') // 1 hour 1 minute
      expect(formatHHMMSS(3661000)).toBe('1:01:01') // 1 hour 1 minute 1 second
      expect(formatHHMMSS(7200000)).toBe('2:00:00') // 2 hours
      expect(formatHHMMSS(7261000)).toBe('2:01:01') // 2 hours 1 minute 1 second
    })

    it('should handle edge cases', () => {
      expect(formatHHMMSS(null)).toBe('0:00')
      expect(formatHHMMSS(undefined)).toBe('0:00')
      expect(formatHHMMSS(-1000)).toBe('0:00') // Negative time
      expect(formatHHMMSS(Infinity)).toBe('0:00') // Infinite time
      expect(formatHHMMSS(NaN)).toBe('0:00') // Not a number
    })

    it('should handle large values', () => {
      expect(formatHHMMSS(86400000)).toBe('24:00:00') // 24 hours
      expect(formatHHMMSS(90000000)).toBe('25:00:00') // 25 hours
    })

    it('should handle fractional milliseconds', () => {
      expect(formatHHMMSS(59999.9)).toBe('0:59') // Just under 1 minute
      expect(formatHHMMSS(60000.1)).toBe('1:00') // Just over 1 minute
      expect(formatHHMMSS(3599999.9)).toBe('59:59') // Just under 1 hour
      expect(formatHHMMSS(3600000.1)).toBe('1:00:00') // Just over 1 hour
    })

    it('should handle seconds correctly', () => {
      expect(formatHHMMSS(1000)).toBe('0:01') // 1 second
      expect(formatHHMMSS(10000)).toBe('0:10') // 10 seconds
      expect(formatHHMMSS(30000)).toBe('0:30') // 30 seconds
      expect(formatHHMMSS(59000)).toBe('0:59') // 59 seconds
    })
  })

  describe('consistency between formats', () => {
    it('should show same minutes for same time in both formats', () => {
      const time = 3661000 // 1 hour 1 minute 1 second
      const hmm = formatHMM(time)
      const hhmmss = formatHHMMSS(time)

      // Both should show 1:01 for the hour:minute part
      expect(hmm).toBe('1:01')
      expect(hhmmss).toBe('1:01:01')
    })

    it('should handle zero time consistently', () => {
      expect(formatHMM(0)).toBe('00')
      expect(formatHHMMSS(0)).toBe('0:00')
    })

    it('should handle null/undefined consistently', () => {
      expect(formatHMM(null)).toBe('00')
      expect(formatHHMMSS(null)).toBe('0:00')

      expect(formatHMM(undefined)).toBe('00')
      expect(formatHHMMSS(undefined)).toBe('0:00')
    })
  })

  describe('real-world scenarios', () => {
    it('should format typical video durations', () => {
      // 5 minutes 30 seconds
      expect(formatHMM(330000)).toBe('05')
      expect(formatHHMMSS(330000)).toBe('5:30')

      // 1 hour 23 minutes 45 seconds
      expect(formatHMM(5025000)).toBe('1:23')
      expect(formatHHMMSS(5025000)).toBe('1:23:45')

      // 2 hours 15 minutes 30 seconds
      expect(formatHMM(8130000)).toBe('2:15')
      expect(formatHHMMSS(8130000)).toBe('2:15:30')
    })

    it('should handle lecture durations', () => {
      // 45 minutes (typical lecture)
      expect(formatHMM(2700000)).toBe('45')
      expect(formatHHMMSS(2700000)).toBe('45:00')

      // 1 hour 30 minutes (longer lecture)
      expect(formatHMM(5400000)).toBe('1:30')
      expect(formatHHMMSS(5400000)).toBe('1:30:00')

      // 3 hours 15 minutes 20 seconds (very long lecture)
      expect(formatHMM(11720000)).toBe('3:15')
      expect(formatHHMMSS(11720000)).toBe('3:15:20')
    })
  })
})
