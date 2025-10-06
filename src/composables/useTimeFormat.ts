/**
 * Composable that provides formatters to convert seconds to `h:mm` or `h:mm:ss` strings.
 * - Hours have no leading zero
 * - Minutes (and seconds) are always zero-padded to 2 digits
 * - Null/undefined/negative inputs are treated as 0 seconds
 */
export function useTimeFormat() {
  function getTimeComponents(seconds?: number | null) {
    const s = typeof seconds === 'number' && isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
    const totalMinutes = Math.floor(s / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const secs = s % 60

    return { hours, minutes, seconds: secs }
  }

  function formatHMM(seconds?: number | null): string {
    const { hours, minutes } = getTimeComponents(seconds)

    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  function formatHHMMSS(seconds?: number | null): string {
    const { hours, minutes, seconds: secs } = getTimeComponents(seconds)

    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return { formatHMM, formatHHMMSS }
}
