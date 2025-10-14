/**
 * Keyboard shortcuts configuration for the application.
 */

export interface KeyboardShortcut {
  keys: string[]
  description: string
}

export interface ShortcutCategory {
  category: string
  items: KeyboardShortcut[]
}

/**
 * All available keyboard shortcuts organized by category.
 */
export const keyboardShortcuts: ShortcutCategory[] = [
  {
    category: 'Playback',
    items: [
      { keys: ['Space', 'K'], description: 'Play/Pause video' },
      { keys: ['F'], description: 'Toggle fullscreen' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['←'], description: 'Previous page' },
      { keys: ['→'], description: 'Next page' },
      { keys: ['Home'], description: 'Jump to first page' },
      { keys: ['End'], description: 'Jump to last page' },
    ],
  },
  {
    category: 'Volume',
    items: [
      { keys: ['↑'], description: 'Volume up' },
      { keys: ['↓'], description: 'Volume down' },
      { keys: ['M'], description: 'Mute/Unmute' },
    ],
  },
  {
    category: 'Playback Speed',
    items: [
      { keys: ['>', 'Shift + >'], description: 'Increase playback speed' },
      { keys: ['<', 'Shift + <'], description: 'Decrease playback speed' },
      { keys: ['0', '='], description: 'Normal playback speed' },
    ],
  },
  {
    category: 'Search',
    items: [
      { keys: ['Ctrl + K', '⌘ + K'], description: 'Focus search field' },
    ],
  },
  {
    category: 'Help',
    items: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
]

/**
 * Formats a key combination for display.
 */
export function formatKey(key: string): string {
  // Handle special keys
  const specialKeys: Record<string, string> = {
    ' ': 'Space',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'Shift + >': 'Shift + >',
    'Shift + <': 'Shift + <',
    'Ctrl + K': 'Ctrl + K',
    '⌘ + K': '⌘ + K',
  }

  return specialKeys[key] || key.toUpperCase()
}
