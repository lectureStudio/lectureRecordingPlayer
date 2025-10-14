import { useMediaControlsStore } from '@/stores/mediaControls'
import { usePdfStore } from '@/stores/pdf'
import { useFullscreenControls } from './useFullscreenControls'
import { type KeyBinding, useKeyboard } from './useKeyboard'
import { usePlayerControls } from './usePlayerControls'

/**
 * Composable for handling application-wide keyboard shortcuts for video player controls.
 *
 * Provides keyboard shortcuts for:
 * - Play/Pause: Space or K
 * - Navigation: Left/Right arrows, Home/End
 * - Volume: Up/Down arrows, M for mute
 * - Fullscreen: F
 * - Playback speed: <, >, Shift+<, Shift+>, 0, =
 * - Help: ? to show keyboard shortcuts
 *
 * @note Shortcuts are automatically disabled when typing in input fields, textareas, or contentEditable elements.
 */
export function useKeyboardShortcuts(showShortcutsDialog?: () => void) {
  const mediaStore = useMediaControlsStore()
  const pdfStore = usePdfStore()
  const { toggleFullscreen } = useFullscreenControls()
  const { selectPrevPage, selectNextPage, selectPage } = usePlayerControls()

  // Define all keyboard shortcuts
  const shortcuts: KeyBinding[] = [
    // Play/Pause shortcuts
    {
      keys: [
        { key: ' ', repeat: false }, // Space bar
        { key: 'k', repeat: false }, // K key
      ],
      handler: () => {
        mediaStore.togglePlayPause()
      },
      description: 'Play/Pause video',
    },

    // Navigation shortcuts
    {
      keys: { key: 'ArrowLeft', repeat: false },
      handler: () => {
        selectPrevPage()
      },
      description: 'Previous page',
    },
    {
      keys: { key: 'ArrowRight', repeat: false },
      handler: () => {
        selectNextPage()
      },
      description: 'Next page',
    },
    {
      keys: { key: 'Home', repeat: false },
      handler: () => {
        selectPage(1)
      },
      description: 'Jump to first page',
    },
    {
      keys: { key: 'End', repeat: false },
      handler: () => {
        selectPage(pdfStore.pageCount)
      },
      description: 'Jump to last page',
    },

    // Volume shortcuts
    {
      keys: { key: 'ArrowUp', repeat: false },
      handler: () => {
        const newVolume = Math.min(100, mediaStore.volume + 5)
        mediaStore.setVolume(newVolume)
      },
      description: 'Volume up',
    },
    {
      keys: { key: 'ArrowDown', repeat: false },
      handler: () => {
        const newVolume = Math.max(0, mediaStore.volume - 5)
        mediaStore.setVolume(newVolume)
      },
      description: 'Volume down',
    },
    {
      keys: { key: 'm', repeat: false },
      handler: () => {
        mediaStore.toggleMute()
      },
      description: 'Mute/Unmute',
    },

    // Fullscreen shortcut
    {
      keys: { key: 'f', repeat: false },
      handler: () => {
        toggleFullscreen()
      },
      description: 'Toggle fullscreen',
    },

    // Playback speed shortcuts
    {
      keys: [
        { key: '>', repeat: false },
        { key: '>', shift: true, repeat: false }, // Shift + >
      ],
      handler: () => {
        const currentSpeed = mediaStore.playbackSpeed
        const speedIncrements = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        // Find the closest speed or the next higher one
        let nextIndex = speedIncrements.findIndex(speed => speed > currentSpeed)
        if (nextIndex === -1) {
          // If no higher speed found, stay at the highest
          nextIndex = speedIncrements.length - 1
        }
        mediaStore.setPlaybackSpeed(speedIncrements[nextIndex] ?? 1) // default to normal speed
      },
      description: 'Increase playback speed',
    },
    {
      keys: [
        { key: '<', repeat: false },
        { key: '<', shift: true, repeat: false }, // Shift + <
      ],
      handler: () => {
        const currentSpeed = mediaStore.playbackSpeed
        const speedIncrements = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        // Find the closest lower speed
        let prevIndex = -1
        for (let i = speedIncrements.length - 1; i >= 0; i--) {
          if (speedIncrements[i]! < currentSpeed) {
            prevIndex = i
            break
          }
        }
        if (prevIndex === -1) {
          // If no lower speed found, stay at the lowest
          prevIndex = 0
        }
        mediaStore.setPlaybackSpeed(speedIncrements[prevIndex] ?? 1) // default to normal speed
      },
      description: 'Decrease playback speed',
    },
    {
      keys: [
        { key: '0', repeat: false },
        { key: '=', repeat: false },
      ],
      handler: () => {
        mediaStore.setPlaybackSpeed(1.0)
      },
      description: 'Normal playback speed',
    },

    // Help shortcut
    ...(showShortcutsDialog
      ? [{
        keys: { key: '?', repeat: false },
        handler: () => {
          showShortcutsDialog()
        },
        description: 'Show keyboard shortcuts',
      }]
      : []),
  ]

  // Initialize keyboard shortcuts
  const { enabled } = useKeyboard(shortcuts, {
    ignoreEditable: true, // Don't trigger shortcuts when typing in input fields
  })

  return {
    enabled,
  }
}
