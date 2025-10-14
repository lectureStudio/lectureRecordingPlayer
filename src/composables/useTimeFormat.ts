/**
 * Composable that provides formatters to convert milliseconds to `h:mm` or `h:mm:ss` strings.
 * - Hours are omitted when 0, otherwise have no leading zero
 * - Minutes (and seconds) are always zero-padded to 2 digits
 * - Null/undefined/negative inputs are treated as 0 milliseconds
 */
export function useTimeFormat() {
  function getTimeComponents(milliseconds?: number | null) {
    const ms = typeof milliseconds === 'number' && isFinite(milliseconds) ? Math.max(0, Math.floor(milliseconds)) : 0
    const totalSeconds = Math.floor(ms / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const secs = totalSeconds % 60

    return { hours, minutes, seconds: secs }
  }

  function formatHMM(milliseconds?: number | null): string {
    const { hours, minutes } = getTimeComponents(milliseconds)

    if (hours === 0) {
      return `${minutes.toString().padStart(2, '0')}`
    }
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  function formatHHMMSS(milliseconds?: number | null): string {
    const { hours, minutes, seconds: secs } = getTimeComponents(milliseconds)

    if (hours === 0) {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return { formatHMM, formatHHMMSS }
}
