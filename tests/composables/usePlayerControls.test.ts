import { useFileActionPlayer } from '@/composables/useFileActionPlayer'
import { usePlayerControls } from '@/composables/usePlayerControls'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { usePdfStore } from '@/stores/pdf'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { watch } from 'vue'

// Mock the dependencies
vi.mock('@/composables/useFileActionPlayer', () => ({
  useFileActionPlayer: vi.fn(),
}))

vi.mock('@/stores/mediaControls', () => ({
  useMediaControlsStore: vi.fn(),
}))

vi.mock('@/stores/pdf', () => ({
  usePdfStore: vi.fn(),
}))

// Mock Vue watch
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    watch: vi.fn(),
  }
})

describe('composables/usePlayerControls', () => {
  let mockFileActionPlayer: {
    actionPlayer: {
      value: {
        selectPreviousPage: ReturnType<typeof vi.fn>
        selectNextPage: ReturnType<typeof vi.fn>
        seekByPage: ReturnType<typeof vi.fn>
      } | null
    }
  }
  let mockMediaStore: {
    currentTime: number
    playbackState: string
    seeking: boolean
  }
  let mockPdfStore: {
    currentPage: number
    totalPages: number
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Create mock action player
    mockFileActionPlayer = {
      actionPlayer: {
        value: {
          selectPreviousPage: vi.fn(),
          selectNextPage: vi.fn(),
          seekByPage: vi.fn(),
        },
      },
    }

    // Create mock media store
    mockMediaStore = {
      currentTime: 0,
      playbackState: 'paused',
      seeking: false,
    }

    // Create mock PDF store
    mockPdfStore = {
      currentPage: 1,
      totalPages: 10,
    }

    // Setup mocks
    vi.mocked(useFileActionPlayer).mockReturnValue(
      mockFileActionPlayer as unknown as ReturnType<typeof useFileActionPlayer>,
    )
    vi.mocked(useMediaControlsStore).mockReturnValue(
      mockMediaStore as unknown as ReturnType<typeof useMediaControlsStore>,
    )
    vi.mocked(usePdfStore).mockReturnValue(mockPdfStore as unknown as ReturnType<typeof usePdfStore>)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('selectPrevPage', () => {
    it('calls selectPreviousPage and updates media time', () => {
      const { selectPrevPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.selectPreviousPage.mockReturnValue(5000) // 5 seconds in ms

      selectPrevPage()

      expect(mockFileActionPlayer.actionPlayer.value!.selectPreviousPage).toHaveBeenCalled()
      expect(mockMediaStore.currentTime).toBe(5000) // 5000ms
    })

    it('does not update media time when selectPreviousPage returns -1', () => {
      const { selectPrevPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.selectPreviousPage.mockReturnValue(-1)
      const originalTime = mockMediaStore.currentTime

      selectPrevPage()

      expect(mockFileActionPlayer.actionPlayer.value!.selectPreviousPage).toHaveBeenCalled()
      expect(mockMediaStore.currentTime).toBe(originalTime)
    })

    it('handles case when action player is null', () => {
      const { selectPrevPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value = null
      const originalTime = mockMediaStore.currentTime

      selectPrevPage()

      expect(mockMediaStore.currentTime).toBe(originalTime)
    })

    it('handles case when action player is undefined', () => {
      const { selectPrevPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value = null
      const originalTime = mockMediaStore.currentTime

      selectPrevPage()

      expect(mockMediaStore.currentTime).toBe(originalTime)
    })
  })

  describe('selectNextPage', () => {
    it('calls selectNextPage and updates media time', () => {
      const { selectNextPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.selectNextPage.mockReturnValue(10000) // 10 seconds in ms

      selectNextPage()

      expect(mockFileActionPlayer.actionPlayer.value!.selectNextPage).toHaveBeenCalled()
      expect(mockMediaStore.currentTime).toBe(10000) // 10000ms
    })

    it('does not update media time when selectNextPage returns -1', () => {
      const { selectNextPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.selectNextPage.mockReturnValue(-1)
      const originalTime = mockMediaStore.currentTime

      selectNextPage()

      expect(mockFileActionPlayer.actionPlayer.value!.selectNextPage).toHaveBeenCalled()
      expect(mockMediaStore.currentTime).toBe(originalTime)
    })

    it('handles case when action player is null', () => {
      const { selectNextPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value = null
      const originalTime = mockMediaStore.currentTime

      selectNextPage()

      expect(mockMediaStore.currentTime).toBe(originalTime)
    })
  })

  describe('selectPage', () => {
    it('calls seekByPage with 0-based page number and updates media time', () => {
      const { selectPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(15000) // 15 seconds in ms

      selectPage(3) // 1-based page number

      expect(mockFileActionPlayer.actionPlayer.value!.seekByPage).toHaveBeenCalledWith(2) // 0-based
      expect(mockMediaStore.currentTime).toBe(15000) // 15000ms
    })

    it('does not update media time when seekByPage returns -1', () => {
      const { selectPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(-1)
      const originalTime = mockMediaStore.currentTime

      selectPage(2)

      expect(mockFileActionPlayer.actionPlayer.value!.seekByPage).toHaveBeenCalledWith(1) // 0-based
      expect(mockMediaStore.currentTime).toBe(originalTime)
    })

    it('handles case when action player is null', () => {
      const { selectPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value = null
      const originalTime = mockMediaStore.currentTime

      selectPage(1)

      expect(mockMediaStore.currentTime).toBe(originalTime)
    })

    it('converts page numbers correctly', () => {
      const { selectPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(0)

      // Test various page numbers
      selectPage(1)
      expect(mockFileActionPlayer.actionPlayer.value!.seekByPage).toHaveBeenCalledWith(0)

      selectPage(5)
      expect(mockFileActionPlayer.actionPlayer.value!.seekByPage).toHaveBeenCalledWith(4)

      selectPage(10)
      expect(mockFileActionPlayer.actionPlayer.value!.seekByPage).toHaveBeenCalledWith(9)
    })
  })

  describe('setupPdfPageSync', () => {
    it('sets up watcher for PDF page changes', () => {
      const { setupPdfPageSync } = usePlayerControls()

      setupPdfPageSync()

      expect(vi.mocked(watch)).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      )
    })

    it('watcher calls selectPage when PDF page changes', () => {
      const { setupPdfPageSync } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(20000) // 20 seconds in ms

      setupPdfPageSync()

      // Get the watcher callback
      const watchCallback = vi.mocked(watch).mock.calls[0]?.[1] as unknown as (
        newValue: number,
        oldValue: number,
        onCleanup: () => void,
      ) => void

      // Simulate page change
      watchCallback?.(3, 2, () => {})

      expect(mockFileActionPlayer.actionPlayer.value!.seekByPage).toHaveBeenCalledWith(2) // 0-based (3-1)
      expect(mockMediaStore.currentTime).toBe(20000) // 20000ms
    })

    it('watcher gets current page from PDF store', () => {
      const { setupPdfPageSync } = usePlayerControls()

      setupPdfPageSync()

      // Get the watcher source function
      const watchSource = vi.mocked(watch).mock.calls[0]?.[0] as unknown as () => number

      // Test that it returns the current page
      expect(typeof watchSource).toBe('function')
      expect(watchSource()).toBe(1) // mockPdfStore.currentPage
    })
  })

  describe('return values', () => {
    it('returns all expected functions', () => {
      const result = usePlayerControls()

      expect(result).toHaveProperty('selectPrevPage')
      expect(result).toHaveProperty('selectNextPage')
      expect(result).toHaveProperty('selectPage')
      expect(result).toHaveProperty('setupPdfPageSync')

      expect(typeof result.selectPrevPage).toBe('function')
      expect(typeof result.selectNextPage).toBe('function')
      expect(typeof result.selectPage).toBe('function')
      expect(typeof result.setupPdfPageSync).toBe('function')
    })
  })

  describe('edge cases', () => {
    it('handles zero time values', () => {
      const { selectPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(0)

      selectPage(1)

      expect(mockMediaStore.currentTime).toBe(0)
    })

    it('handles very large time values', () => {
      const { selectPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(3600000) // 1 hour in ms

      selectPage(1)

      expect(mockMediaStore.currentTime).toBe(3600000) // 1 hour in milliseconds
    })

    it('handles fractional time values', () => {
      const { selectPage } = usePlayerControls()

      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(1500) // 1.5 seconds in ms

      selectPage(1)

      expect(mockMediaStore.currentTime).toBe(1500) // 1.5 seconds in milliseconds
    })
  })

  describe('integration', () => {
    it('works with all functions together', () => {
      const { selectPrevPage, selectNextPage, selectPage, setupPdfPageSync } = usePlayerControls()

      // Setup mocks
      mockFileActionPlayer.actionPlayer.value!.selectPreviousPage.mockReturnValue(1000)
      mockFileActionPlayer.actionPlayer.value!.selectNextPage.mockReturnValue(2000)
      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(3000)

      // Test all functions
      selectPrevPage()
      expect(mockMediaStore.currentTime).toBe(1000) // 1 second in milliseconds

      selectNextPage()
      expect(mockMediaStore.currentTime).toBe(2000) // 2 seconds in milliseconds

      selectPage(5)
      expect(mockMediaStore.currentTime).toBe(3000) // 3 seconds in milliseconds

      setupPdfPageSync()
      expect(vi.mocked(watch)).toHaveBeenCalled()
    })
  })
})
