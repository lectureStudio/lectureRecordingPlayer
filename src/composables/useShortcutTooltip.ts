/**
 * Composable for easy integration of keyboard shortcuts in tooltips.
 */

import {
  formatShortcutForTooltip,
  getConditionalShortcutTooltip,
  getRichShortcutTooltip,
  getShortcutTooltip,
  lookupShortcut,
} from '@/utils/shortcutLookup'
import { computed, type ComputedRef } from 'vue'

/**
 * Options for the useShortcutTooltip composable.
 */
export interface UseShortcutTooltipOptions {
  /** Whether to show the keyboard shortcut in the tooltip */
  showShortcut?: boolean
  /** Fallback description if no shortcut is found */
  fallbackDescription?: string
  /** Conditional text to show instead of the default shortcut description */
  conditionalText?: string
  /** Whether to use rich HTML formatting with kbd elements */
  useRichFormat?: boolean
}

/**
 * Composable for generating tooltip content with keyboard shortcuts.
 *
 * @param action - The action description to look up shortcuts for.
 * @param options - Configuration options.
 *
 * @returns Object with tooltip content and shortcut information.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { tooltipContent, hasShortcut } = useShortcutTooltip('play')
 * // tooltipContent.value = "Play/Pause video (Space or K)"
 * // hasShortcut.value = true
 *
 * // With fallback
 * const { tooltipContent } = useShortcutTooltip('unknown action', {
 *   fallbackDescription: 'Do something'
 * })
 * // tooltipContent.value = "Do something"
 *
 * // Without shortcut display
 * const { tooltipContent } = useShortcutTooltip('play', {
 *   showShortcut: false
 * })
 * // tooltipContent.value = "Play/Pause video"
 * ```
 */
export function useShortcutTooltip(
  action: string,
  options: UseShortcutTooltipOptions = {},
): {
  /** The formatted tooltip content */
  tooltipContent: ComputedRef<string>
  /** Whether a shortcut was found for this action */
  hasShortcut: ComputedRef<boolean>
  /** The raw shortcut object if found */
  shortcut: ComputedRef<ReturnType<typeof lookupShortcut>>
  /** The formatted shortcut text */
  shortcutText: ComputedRef<string>
} {
  const {
    showShortcut = true,
    fallbackDescription,
    conditionalText,
    useRichFormat = true,
  } = options

  // Look up the shortcut
  const shortcut = computed(() => lookupShortcut(action))

  // Check if shortcut exists
  const hasShortcut = computed(() => shortcut.value !== undefined)

  // Generate shortcut text
  const shortcutText = computed(() => shortcut.value ? formatShortcutForTooltip(shortcut.value) : '')

  // Generate tooltip content
  const tooltipContent = computed(() => {
    if (!showShortcut || !shortcut.value) {
      return fallbackDescription || action
    }

    // Use conditional text if provided
    if (conditionalText) {
      return getConditionalShortcutTooltip(
        action,
        conditionalText,
        fallbackDescription,
        useRichFormat,
      )
    }

    // Use rich format if requested
    if (useRichFormat) {
      return getRichShortcutTooltip(action, fallbackDescription)
    }

    // Default format
    return getShortcutTooltip(action, fallbackDescription)
  })

  return {
    tooltipContent,
    hasShortcut,
    shortcut,
    shortcutText,
  }
}

/**
 * Predefined tooltip configurations for common media player actions.
 * These can be used directly in components without needing to specify action names.
 */
export const mediaPlayerTooltips = {
  play: () => useShortcutTooltip('play'),
  pause: () => useShortcutTooltip('pause'),
  playPause: () => useShortcutTooltip('play/pause'),
  previous: () => useShortcutTooltip('previous'),
  next: () => useShortcutTooltip('next'),
  firstPage: () => useShortcutTooltip('first page'),
  lastPage: () => useShortcutTooltip('last page'),
  volumeUp: () => useShortcutTooltip('volume up'),
  volumeDown: () => useShortcutTooltip('volume down'),
  mute: () => useShortcutTooltip('mute'),
  fullscreen: () => useShortcutTooltip('fullscreen'),
  speedUp: () => useShortcutTooltip('speed up'),
  speedDown: () => useShortcutTooltip('speed down'),
  normalSpeed: () => useShortcutTooltip('normal speed'),
  search: () => useShortcutTooltip('search'),
  help: () => useShortcutTooltip('help'),
}
