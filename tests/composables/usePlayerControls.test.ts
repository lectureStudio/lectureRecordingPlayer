import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerControls } from '@/composables/usePlayerControls'
import { useFileActionPlayer } from '@/composables/useFileActionPlayer'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { usePdfStore } from '@/stores/pdf'
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

  // Helper function to create mock action player
  const createMockActionPlayer = () => ({
    actionPlayer: {
      value: {
        selectPreviousPage: vi.fn(),
        selectNextPage: vi.fn(),
        seekByPage: vi.fn(),
      },
    },
  })

  // Helper function to test page navigation
  const testPageNavigation = (action: string, mockMethod: ReturnType<typeof vi.fn>, expectedTime: number) => {
    const composable = usePlayerControls()
    mockMethod.mockReturnValue(expectedTime)
    
    const originalTime = mockMediaStore.currentTime
    const actionFn = composable[action as keyof typeof composable] as () => void
    actionFn()
    
    expect(mockMethod).toHaveBeenCalled()
    if (expectedTime === -1) {
      expect(mockMediaStore.currentTime).toBe(originalTime)
    } else {
      expect(mockMediaStore.currentTime).toBe(expectedTime)
    }
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockFileActionPlayer = createMockActionPlayer()
    mockMediaStore = {
      currentTime: 0,
      playbackState: 'paused',
      seeking: false,
    }
    mockPdfStore = {
      currentPage: 1,
      totalPages: 10,
    }

    vi.mocked(useFileActionPlayer).mockReturnValue(mockFileActionPlayer as unknown as ReturnType<typeof useFileActionPlayer>)
    vi.mocked(useMediaControlsStore).mockReturnValue(mockMediaStore as unknown as ReturnType<typeof useMediaControlsStore>)
    vi.mocked(usePdfStore).mockReturnValue(mockPdfStore as unknown as ReturnType<typeof usePdfStore>)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('selectPrevPage', () => {
    it('calls selectPreviousPage and updates media time', () => {
      testPageNavigation('selectPrevPage', mockFileActionPlayer.actionPlayer.value!.selectPreviousPage, 5000)
    })

    it('does not update media time when selectPreviousPage returns -1', () => {
      testPageNavigation('selectPrevPage', mockFileActionPlayer.actionPlayer.value!.selectPreviousPage, -1)
    })

    it('handles case when action player is null', () => {
      const { selectPrevPage } = usePlayerControls()
      mockFileActionPlayer.actionPlayer.value = null
      const originalTime = mockMediaStore.currentTime

      selectPrevPage()
      expect(mockMediaStore.currentTime).toBe(originalTime)
    })
  })

  describe('selectNextPage', () => {
    it('calls selectNextPage and updates media time', () => {
      testPageNavigation('selectNextPage', mockFileActionPlayer.actionPlayer.value!.selectNextPage, 10000)
    })

    it('does not update media time when selectNextPage returns -1', () => {
      testPageNavigation('selectNextPage', mockFileActionPlayer.actionPlayer.value!.selectNextPage, -1)
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
      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(15000)

      selectPage(3) // 1-based page number

      expect(mockFileActionPlayer.actionPlayer.value!.seekByPage).toHaveBeenCalledWith(2) // 0-based
      expect(mockMediaStore.currentTime).toBe(15000)
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

      const testCases = [
        { input: 1, expected: 0 },
        { input: 5, expected: 4 },
        { input: 10, expected: 9 }
      ]

      testCases.forEach(({ input, expected }) => {
        selectPage(input)
        expect(mockFileActionPlayer.actionPlayer.value!.seekByPage).toHaveBeenCalledWith(expected)
      })
    })
  })

  describe('setupPdfPageSync', () => {
    it('sets up watcher for PDF page changes', () => {
      const { setupPdfPageSync } = usePlayerControls()

      setupPdfPageSync()

      expect(vi.mocked(watch)).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('watcher calls selectPage when PDF page changes', () => {
      const { setupPdfPageSync } = usePlayerControls()
      
      mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(20000) // 20 seconds in ms

      setupPdfPageSync()

      // Get the watcher callback
      const watchCallback = vi.mocked(watch).mock.calls[0]?.[1] as unknown as (newValue: number, oldValue: number, onCleanup: () => void) => void

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
    it('handles various time values', () => {
      const { selectPage } = usePlayerControls()
      
      const testCases = [0, 3600000, 1500]

      testCases.forEach((time) => {
        mockFileActionPlayer.actionPlayer.value!.seekByPage.mockReturnValue(time)
        selectPage(1)
        expect(mockMediaStore.currentTime).toBe(time)
      })
    })
  })
})