import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the dependencies
vi.mock('@/stores/mediaControls', () => ({
  useMediaControlsStore: vi.fn(() => ({
    togglePlayPause: vi.fn(),
    setTogglePlayPauseCallback: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    volume: 50,
    playbackSpeed: 1.0,
  })),
}))

vi.mock('@/stores/pdf', () => ({
  usePdfStore: vi.fn(() => ({
    pageCount: 10,
  })),
}))

vi.mock('@/composables/useFullscreenControls', () => ({
  useFullscreenControls: vi.fn(() => ({
    toggleFullscreen: vi.fn(),
  })),
}))

vi.mock('@/composables/usePlayerControls', () => ({
  usePlayerControls: vi.fn(() => ({
    selectPrevPage: vi.fn(),
    selectNextPage: vi.fn(),
    selectPage: vi.fn(),
  })),
}))

vi.mock('@/composables/useKeyboard', () => ({
  useKeyboard: vi.fn(() => ({
    enabled: { value: true },
  })),
}))

import { useFullscreenControls } from '@/composables/useFullscreenControls'
import { useKeyboard } from '@/composables/useKeyboard'
import { usePlayerControls } from '@/composables/usePlayerControls'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { usePdfStore } from '@/stores/pdf'

describe('useKeyboardShortcuts', () => {
  let mockMediaStore: ReturnType<typeof useMediaControlsStore>
  let mockPdfStore: ReturnType<typeof usePdfStore>
  let mockFullscreenControls: ReturnType<typeof useFullscreenControls>
  let mockPlayerControls: ReturnType<typeof usePlayerControls>

  beforeEach(() => {
    vi.clearAllMocks()

    mockMediaStore = {
      togglePlayPause: vi.fn(),
      setTogglePlayPauseCallback: vi.fn(),
      setVolume: vi.fn(),
      toggleMute: vi.fn(),
      setPlaybackSpeed: vi.fn(),
      volume: 50,
      playbackSpeed: 1.0,
    } as unknown as ReturnType<typeof useMediaControlsStore>

    mockPdfStore = {
      pageCount: 10,
    } as unknown as ReturnType<typeof usePdfStore>

    mockFullscreenControls = {
      toggleFullscreen: vi.fn(),
    } as unknown as ReturnType<typeof useFullscreenControls>

    mockPlayerControls = {
      selectPrevPage: vi.fn(),
      selectNextPage: vi.fn(),
      selectPage: vi.fn(),
    } as unknown as ReturnType<typeof usePlayerControls>

    vi.mocked(useMediaControlsStore).mockReturnValue(mockMediaStore)
    vi.mocked(usePdfStore).mockReturnValue(mockPdfStore)
    vi.mocked(useFullscreenControls).mockReturnValue(mockFullscreenControls)
    vi.mocked(usePlayerControls).mockReturnValue(mockPlayerControls)
  })

  describe('initialization', () => {
    it('should initialize keyboard shortcuts with default options', () => {
      useKeyboardShortcuts()

      expect(useKeyboard).toHaveBeenCalledWith(
        expect.any(Array),
        {
          ignoreEditable: true,
        },
      )
    })

    it('should return enabled state', () => {
      const { enabled } = useKeyboardShortcuts()

      expect(enabled).toBeDefined()
      expect(enabled.value).toBe(true)
    })
  })

  describe('play/pause shortcuts', () => {
    it('should register space key shortcut', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: Array<{ key: string; repeat: boolean }>
        handler: () => void
        description: string
      }>

      const spaceShortcut = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === ' '))

      expect(spaceShortcut).toBeDefined()
      expect(spaceShortcut?.description).toBe('Play/Pause video')
    })

    it('should register K key shortcut', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: Array<{ key: string; repeat: boolean }>
        handler: () => void
        description: string
      }>

      const kShortcut = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === 'k'))

      expect(kShortcut).toBeDefined()
      expect(kShortcut?.description).toBe('Play/Pause video')
    })

    it('should call togglePlayPause when space is pressed', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: Array<{ key: string; repeat: boolean }>
        handler: () => void
      }>

      const spaceShortcut = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === ' '))

      spaceShortcut?.handler()

      expect(mockMediaStore.togglePlayPause).toHaveBeenCalled()
    })
  })

  describe('navigation shortcuts', () => {
    it('should register arrow key shortcuts', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
        description: string
      }>

      const leftArrow = shortcuts.find(s => s.keys.key === 'ArrowLeft')
      const rightArrow = shortcuts.find(s => s.keys.key === 'ArrowRight')

      expect(leftArrow).toBeDefined()
      expect(leftArrow?.description).toBe('Previous page')
      expect(rightArrow).toBeDefined()
      expect(rightArrow?.description).toBe('Next page')
    })

    it('should register Home and End shortcuts', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
        description: string
      }>

      const homeShortcut = shortcuts.find(s => s.keys.key === 'Home')
      const endShortcut = shortcuts.find(s => s.keys.key === 'End')

      expect(homeShortcut).toBeDefined()
      expect(homeShortcut?.description).toBe('Jump to first page')
      expect(endShortcut).toBeDefined()
      expect(endShortcut?.description).toBe('Jump to last page')
    })

    it('should call navigation functions', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
      }>

      const leftArrow = shortcuts.find(s => s.keys.key === 'ArrowLeft')
      const rightArrow = shortcuts.find(s => s.keys.key === 'ArrowRight')
      const homeShortcut = shortcuts.find(s => s.keys.key === 'Home')
      const endShortcut = shortcuts.find(s => s.keys.key === 'End')

      leftArrow?.handler()
      expect(mockPlayerControls.selectPrevPage).toHaveBeenCalled()

      rightArrow?.handler()
      expect(mockPlayerControls.selectNextPage).toHaveBeenCalled()

      homeShortcut?.handler()
      expect(mockPlayerControls.selectPage).toHaveBeenCalledWith(1)

      endShortcut?.handler()
      expect(mockPlayerControls.selectPage).toHaveBeenCalledWith(10)
    })
  })

  describe('volume shortcuts', () => {
    it('should register volume control shortcuts', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
        description: string
      }>

      const upArrow = shortcuts.find(s => s.keys.key === 'ArrowUp')
      const downArrow = shortcuts.find(s => s.keys.key === 'ArrowDown')
      const mShortcut = shortcuts.find(s => s.keys.key === 'm')

      expect(upArrow).toBeDefined()
      expect(upArrow?.description).toBe('Volume up')
      expect(downArrow).toBeDefined()
      expect(downArrow?.description).toBe('Volume down')
      expect(mShortcut).toBeDefined()
      expect(mShortcut?.description).toBe('Mute/Unmute')
    })

    it('should increase volume with up arrow', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
      }>

      const upArrow = shortcuts.find(s => s.keys.key === 'ArrowUp')
      upArrow?.handler()

      expect(mockMediaStore.setVolume).toHaveBeenCalledWith(55) // 50 + 5
    })

    it('should decrease volume with down arrow', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
      }>

      const downArrow = shortcuts.find(s => s.keys.key === 'ArrowDown')
      downArrow?.handler()

      expect(mockMediaStore.setVolume).toHaveBeenCalledWith(45) // 50 - 5
    })

    it('should clamp volume to valid range', () => {
      mockMediaStore.volume = 98
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
      }>

      const upArrow = shortcuts.find(s => s.keys.key === 'ArrowUp')
      upArrow?.handler()

      expect(mockMediaStore.setVolume).toHaveBeenCalledWith(100) // Clamped to 100
    })

    it('should toggle mute with M key', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
      }>

      const mShortcut = shortcuts.find(s => s.keys.key === 'm')
      mShortcut?.handler()

      expect(mockMediaStore.toggleMute).toHaveBeenCalled()
    })
  })

  describe('fullscreen shortcut', () => {
    it('should register F key shortcut', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
        description: string
      }>

      const fShortcut = shortcuts.find(s => s.keys.key === 'f')

      expect(fShortcut).toBeDefined()
      expect(fShortcut?.description).toBe('Toggle fullscreen')
    })

    it('should call toggleFullscreen when F is pressed', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
      }>

      const fShortcut = shortcuts.find(s => s.keys.key === 'f')
      fShortcut?.handler()

      expect(mockFullscreenControls.toggleFullscreen).toHaveBeenCalled()
    })
  })

  describe('playback speed shortcuts', () => {
    it('should register speed control shortcuts', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: Array<{ key: string; shift?: boolean; repeat: boolean }> | { key: string; repeat: boolean }
        handler: () => void
        description: string
      }>

      const increaseSpeed = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === '>'))
      const decreaseSpeed = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === '<'))
      const normalSpeed = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === '0' || k.key === '='))

      expect(increaseSpeed).toBeDefined()
      expect(increaseSpeed?.description).toBe('Increase playback speed')
      expect(decreaseSpeed).toBeDefined()
      expect(decreaseSpeed?.description).toBe('Decrease playback speed')
      expect(normalSpeed).toBeDefined()
      expect(normalSpeed?.description).toBe('Normal playback speed')
    })

    it('should increase playback speed', () => {
      mockMediaStore.playbackSpeed = 1.0
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: Array<{ key: string; shift?: boolean; repeat: boolean }>
        handler: () => void
      }>

      const increaseSpeed = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === '>'))

      increaseSpeed?.handler()

      expect(mockMediaStore.setPlaybackSpeed).toHaveBeenCalledWith(1.25)
    })

    it('should decrease playback speed', () => {
      mockMediaStore.playbackSpeed = 1.0
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: Array<{ key: string; shift?: boolean; repeat: boolean }>
        handler: () => void
      }>

      const decreaseSpeed = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === '<'))

      decreaseSpeed?.handler()

      expect(mockMediaStore.setPlaybackSpeed).toHaveBeenCalledWith(0.75)
    })

    it('should set normal speed with 0 or =', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: Array<{ key: string; repeat: boolean }>
        handler: () => void
      }>

      const normalSpeed = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === '0' || k.key === '='))

      normalSpeed?.handler()

      expect(mockMediaStore.setPlaybackSpeed).toHaveBeenCalledWith(1.0)
    })

    it('should handle speed limits correctly', () => {
      mockMediaStore.playbackSpeed = 2.0
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: Array<{ key: string; shift?: boolean; repeat: boolean }>
        handler: () => void
      }>

      const increaseSpeed = shortcuts.find(s => Array.isArray(s.keys) && s.keys.some(k => k.key === '>'))

      increaseSpeed?.handler()

      expect(mockMediaStore.setPlaybackSpeed).toHaveBeenCalledWith(2.0) // Stay at max
    })
  })

  describe('help shortcut', () => {
    it('should register help shortcut when showShortcutsDialog is provided', () => {
      const showDialog = vi.fn()
      useKeyboardShortcuts(showDialog)

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
        description: string
      }>

      const helpShortcut = shortcuts.find(s => s.keys.key === '?')

      expect(helpShortcut).toBeDefined()
      expect(helpShortcut?.description).toBe('Show keyboard shortcuts')
    })

    it('should not register help shortcut when showShortcutsDialog is not provided', () => {
      useKeyboardShortcuts()

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
      }>

      const helpShortcut = shortcuts.find(s => s.keys.key === '?')

      expect(helpShortcut).toBeUndefined()
    })

    it('should call showShortcutsDialog when ? is pressed', () => {
      const showDialog = vi.fn()
      useKeyboardShortcuts(showDialog)

      const shortcuts = vi.mocked(useKeyboard).mock.calls[0]?.[0] as Array<{
        keys: { key: string; repeat: boolean }
        handler: () => void
      }>

      const helpShortcut = shortcuts.find(s => s.keys.key === '?')
      helpShortcut?.handler()

      expect(showDialog).toHaveBeenCalled()
    })
  })

  describe('keyboard configuration', () => {
    it('should configure keyboard to ignore editable elements', () => {
      useKeyboardShortcuts()

      const options = vi.mocked(useKeyboard).mock.calls[0]?.[1]

      expect(options).toEqual({
        ignoreEditable: true,
      })
    })
  })
})
