/**
 * Utility functions for looking up keyboard shortcuts for the tooltip display.
 */

import { type KeyboardShortcut, keyboardShortcuts } from './keyboardShortcuts'

/**
 * Maps action descriptions to their corresponding keyboard shortcuts.
 * This allows components to look up shortcuts by the action they perform.
 */
const actionToShortcutMap = new Map<string, KeyboardShortcut>()

// Build the mapping from the static keyboard shortcuts configuration
keyboardShortcuts.forEach(category => {
  category.items.forEach(shortcut => {
    actionToShortcutMap.set(shortcut.description.toLowerCase(), shortcut)
  })
})

/**
 * Additional mappings for common UI actions that might have different descriptions
 * in the UI vs. the shortcuts' configuration.
 */
const uiActionMappings: Record<string, string> = {
  'play': 'Play/Pause',
  'pause': 'Play/Pause',
  'play/pause': 'Play/Pause',
  'previous': 'Previous page',
  'next': 'Next page',
  'first page': 'Jump to first page',
  'last page': 'Jump to last page',
  'volume up': 'Volume up',
  'volume down': 'Volume down',
  'mute': 'Mute/Unmute',
  'unmute': 'Mute/Unmute',
  'fullscreen': 'Toggle fullscreen',
  'speed up': 'Increase playback speed',
  'speed down': 'Decrease playback speed',
  'normal speed': 'Normal playback speed',
  'search': 'Focus search field',
  'help': 'Show keyboard shortcuts',
  'shortcuts': 'Show keyboard shortcuts',
}

/**
 * Looks up a keyboard shortcut by action description.
 *
 * @param action - The action description (case-insensitive).
 *
 * @returns The keyboard shortcut if found, undefined otherwise.
 *
 * @example
 * ```typescript
 * const shortcut = lookupShortcut('play')
 * // Returns: { keys: ['Space', 'K'], description: 'Play/Pause video' }
 *
 * const shortcut2 = lookupShortcut('volume up')
 * // Returns: { keys: ['↑'], description: 'Volume up' }
 * ```
 */
export function lookupShortcut(action: string): KeyboardShortcut | undefined {
  const normalizedAction = action.toLowerCase().trim()

  // First, try direct lookup
  const shortcut = actionToShortcutMap.get(normalizedAction)
  if (shortcut) {
    return shortcut
  }

  // Try UI action mappings
  const mappedAction = uiActionMappings[normalizedAction]
  if (mappedAction) {
    return actionToShortcutMap.get(mappedAction.toLowerCase())
  }

  return undefined
}

/**
 * Formats a keyboard shortcut for display in tooltips.
 *
 * @param shortcut - The keyboard shortcut to format.
 *
 * @returns Formatted string for display.
 *
 * @example
 * ```typescript
 * const shortcut = lookupShortcut('play')
 * const formatted = formatShortcutForTooltip(shortcut)
 * // Returns: "Space or K"
 * ```
 */
export function formatShortcutForTooltip(shortcut: KeyboardShortcut): string {
  if (!shortcut) { return '' }

  return shortcut.keys.join(' or ')
}

/**
 * Escapes HTML characters to prevent XSS attacks.
 *
 * @param text - The text to escape.
 *
 * @returns HTML-safe string.
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Formats a keyboard shortcut with HTML kbd elements for rich display.
 *
 * @param shortcut - The keyboard shortcut to format.
 *
 * @returns Formatted HTML string with kbd elements (safe HTML with dark mode styling).
 *
 * @example
 * ```typescript
 * const shortcut = lookupShortcut('play')
 * const formatted = formatShortcutWithKbd(shortcut)
 * // Returns: '<kbd class="kbd kbd-xs dark">Space</kbd> or <kbd class="kbd kbd-xs dark">K</kbd>'
 * ```
 */
export function formatShortcutWithKbd(shortcut: KeyboardShortcut): string {
  if (!shortcut) { return '' }

  return shortcut.keys
    .map(key => {
      if (key.includes(' + ')) {
        // Handle compound keys like "Ctrl + K"
        return key.split(' + ')
          .map(part => `<kbd class="kbd kbd-sm border-b">${escapeHtml(part.trim())}</kbd>`)
          .join(' + ')
      }
      return `<kbd class="kbd kbd-sm border-b">${escapeHtml(key)}</kbd>`
    })
    .join(' or ')
}

/**
 * Gets a tooltip content string that includes both the action description and keyboard shortcut.
 *
 * @param action - The action description.
 * @param fallbackDescription - Optional fallback description if no shortcut is found.
 *
 * @returns Formatted tooltip content.
 *
 * @example
 * ```typescript
 * const tooltip = getShortcutTooltip('play', 'Play video')
 * // Returns: "Play/Pause video (Space or K)"
 *
 * const tooltip2 = getShortcutTooltip('unknown action', 'Do something')
 * // Returns: "Do something"
 * ```
 */
export function getShortcutTooltip(action: string, fallbackDescription?: string): string {
  const shortcut = lookupShortcut(action)

  if (!shortcut) {
    return fallbackDescription || action
  }

  const shortcutText = formatShortcutForTooltip(shortcut)
  return `${shortcut.description} ${shortcutText}`
}

/**
 * Gets a rich tooltip content with HTML kbd elements for keyboard shortcuts.
 *
 * @param action - The action description.
 * @param fallbackDescription - Optional fallback description if no shortcut is found.
 *
 * @returns Formatted HTML tooltip content.
 *
 * @example
 * ```typescript
 * const tooltip = getRichShortcutTooltip('play', 'Play video')
 * // Returns: "Play/Pause video (<kbd>Space</kbd> or <kbd>K</kbd>)"
 * ```
 */
export function getRichShortcutTooltip(action: string, fallbackDescription?: string): string {
  const shortcut = lookupShortcut(action)

  if (!shortcut) {
    return fallbackDescription || action
  }

  const shortcutHtml = formatShortcutWithKbd(shortcut)
  return `${shortcut.description} ${shortcutHtml}`
}

/**
 * Gets a conditional tooltip content that shows different text based on state.
 *
 * @param action - The action description.
 * @param content - The text to show based on current state.
 * @param fallbackDescription - Optional fallback description if no shortcut is found.
 * @param useRichFormat - Whether to use HTML kbd elements.
 *
 * @returns Formatted tooltip content.
 *
 * @example
 * ```typescript
 * const tooltip = getConditionalShortcutTooltip('play', 'Pause', 'Pause video')
 * // Returns: "Pause (Space or K)" - shows "Pause" instead of "Play/Pause video"
 * ```
 */
export function getConditionalShortcutTooltip(
  action: string,
  content: string,
  fallbackDescription?: string,
  useRichFormat = false,
): string {
  const shortcut = lookupShortcut(action)

  if (!shortcut) {
    return fallbackDescription || content
  }

  const shortcutText = useRichFormat
    ? formatShortcutWithKbd(shortcut)
    : formatShortcutForTooltip(shortcut)

  return `${content} ${shortcutText}`
}
