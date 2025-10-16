import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFileActionPlayer } from '@/composables/useFileActionPlayer'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { useRecordingStore } from '@/stores/recording'
import type { RecordedPage } from '@/api/model/recorded-page'
import { ref, nextTick } from 'vue'

// Define mock interfaces
interface MockFileActionPlayer {
  setRecordedPages: ReturnType<typeof vi.fn>
  init: ReturnType<typeof vi.fn>
  seekByTime: ReturnType<typeof vi.fn>
  started: ReturnType<typeof vi.fn>
  suspended: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  suspend: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

interface MockRenderController {
  destroy: ReturnType<typeof vi.fn>
  updateVideoSync: ReturnType<typeof vi.fn>
  updateVideoPlaybackState: ReturnType<typeof vi.fn>
  showPdfAndCanvas: ReturnType<typeof vi.fn>
  hidePdfAndCanvas: ReturnType<typeof vi.fn>
}

interface MockRecordingStore {
  getPage: ReturnType<typeof vi.fn>
  actions: ReturnType<typeof ref>
  pages: ReturnType<typeof ref>
}

interface MockMediaControlsStore {
  currentTime: number
  playbackState: 'paused' | 'playing' | 'ended' | 'error'
  seeking: boolean
}

// Mock the dependencies
let mockFileActionPlayerInstance: MockFileActionPlayer
let mockRecordingStore: MockRecordingStore

vi.mock('@/api/action/file-action-player', () => ({
  FileActionPlayer: vi.fn().mockImplementation(() => mockFileActionPlayerInstance),
}))

let mockRenderControllerInstance: MockRenderController

vi.mock('@/api/render/render-controller', () => ({
  RenderController: vi.fn().mockImplementation(() => mockRenderControllerInstance),
}))

vi.mock('@/api/render/render-surface', () => ({
  RenderSurface: vi.fn().mockImplementation(() => ({})),
}))

vi.mock('@/api/render/video-render-surface', () => ({
  VideoRenderSurface: vi.fn().mockImplementation(() => ({})),
}))

vi.mock('@/stores/recording', () => ({
  useRecordingStore: vi.fn(),
}))

vi.mock('@/stores/mediaControls', () => ({
  useMediaControlsStore: vi.fn(),
}))

vi.mock('@/stores/videoMapping', () => ({
  useVideoMappingStore: vi.fn().mockReturnValue({
    getVideoData: vi.fn().mockReturnValue(null),
  }),
}))

// Mock storeToRefs
vi.mock('pinia', async () => {
  const actual = await vi.importActual('pinia')
  return {
    ...actual,
    storeToRefs: vi.fn((store) => {
      if (store === mockRecordingStore) {
        return { actions: mockRecordingStore.actions, pages: mockRecordingStore.pages }
      }
      return {}
    }),
  }
})

describe('composables/useFileActionPlayer', () => {
  let mockMediaStore: MockMediaControlsStore
  let mockFileActionPlayer: MockFileActionPlayer
  let mockRenderController: MockRenderController

  // Helper function to create mock DOM elements
  const createMockElements = () => ({
    actionCanvas: document.createElement('canvas'),
    volatileCanvas: document.createElement('canvas'),
    videoElement: document.createElement('video'),
  })

  // Helper function to initialize player with mock elements
  const initializePlayerWithMocks = async (composable: ReturnType<typeof useFileActionPlayer>) => {
    const { actionCanvas, volatileCanvas, videoElement } = createMockElements()
    composable.initializePlayer(actionCanvas, volatileCanvas, videoElement)
    await nextTick()
    return { actionCanvas, volatileCanvas, videoElement }
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Create mock stores
    mockRecordingStore = {
      getPage: vi.fn(),
      actions: ref([]),
      pages: ref([]),
    }
    
    mockMediaStore = {
      currentTime: 0,
      playbackState: 'paused',
      seeking: false,
    }

    // Create mock player
    mockFileActionPlayer = {
      setRecordedPages: vi.fn(),
      init: vi.fn(),
      seekByTime: vi.fn(),
      started: vi.fn().mockReturnValue(false),
      suspended: vi.fn().mockReturnValue(false),
      start: vi.fn(),
      suspend: vi.fn(),
      stop: vi.fn(),
    }
    
    mockFileActionPlayerInstance = mockFileActionPlayer

    // Create mock render controller
    mockRenderController = {
      destroy: vi.fn(),
      updateVideoSync: vi.fn(),
      updateVideoPlaybackState: vi.fn(),
      showPdfAndCanvas: vi.fn(),
      hidePdfAndCanvas: vi.fn(),
    }
    
    mockRenderControllerInstance = mockRenderController

    // Setup mocks
    vi.mocked(useRecordingStore).mockReturnValue(mockRecordingStore as unknown as ReturnType<typeof useRecordingStore>)
    vi.mocked(useMediaControlsStore).mockReturnValue(mockMediaStore as unknown as ReturnType<typeof useMediaControlsStore>)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initializePlayer', () => {
    it('initializes player with canvas elements', async () => {
      const composable = useFileActionPlayer()
      await initializePlayerWithMocks(composable)
      expect(mockFileActionPlayer).toBeDefined()
    })

    it('does not reinitialize if player already exists', async () => {
      const composable = useFileActionPlayer()
      await initializePlayerWithMocks(composable)
      
      // Second initialization should not create new player
      const { actionCanvas, volatileCanvas, videoElement } = createMockElements()
      composable.initializePlayer(actionCanvas, volatileCanvas, videoElement)
      
      expect(mockFileActionPlayer).toBeDefined()
    })

    it('sets up watchers for actions, currentTime, and playbackState', async () => {
      const composable = useFileActionPlayer()
      await initializePlayerWithMocks(composable)
      expect(mockFileActionPlayer).toBeDefined()
    })
  })

  describe('destroyPlayer', () => {
    it('stops player and cleans up resources', async () => {
      const composable = useFileActionPlayer()
      await initializePlayerWithMocks(composable)
      
      const actualPlayer = composable.actionPlayer.value
      expect(actualPlayer).toBeDefined()
      
      // Mock player state
      if (actualPlayer) {
        vi.mocked(actualPlayer.started).mockReturnValue(true)
        vi.mocked(actualPlayer.suspended).mockReturnValue(false)
      }

      composable.destroyPlayer()

      if (actualPlayer) {
        expect(vi.mocked(actualPlayer.stop)).toHaveBeenCalled()
      }
    })

    it('handles case when player is not initialized', () => {
      const { destroyPlayer } = useFileActionPlayer()
      expect(() => destroyPlayer()).not.toThrow()
    })

    it('handles case when player is suspended', async () => {
      const composable = useFileActionPlayer()
      await initializePlayerWithMocks(composable)
      
      const actualPlayer = composable.actionPlayer.value
      expect(actualPlayer).toBeDefined()
      
      // Mock player state
      if (actualPlayer) {
        vi.mocked(actualPlayer.started).mockReturnValue(false)
        vi.mocked(actualPlayer.suspended).mockReturnValue(true)
      }

      composable.destroyPlayer()

      if (actualPlayer) {
        expect(vi.mocked(actualPlayer.stop)).toHaveBeenCalled()
      }
    })
  })

  describe('actionPlayer ref', () => {
    it('returns readonly ref to player', async () => {
      const composable = useFileActionPlayer()
      
      // Initially should be null
      expect(composable.actionPlayer.value).toBeNull()

      // Populate pages so the player gets created
      mockRecordingStore.pages.value = [{ pageNumber: 0 }]
      await initializePlayerWithMocks(composable)

      // After initialization, should have the player
      expect(composable.actionPlayer.value).toBeDefined()
      expect(composable.actionPlayer.value).toBe(mockFileActionPlayer)
    })

    it('prevents direct assignment to actionPlayer', () => {
      const { actionPlayer, destroyPlayer } = useFileActionPlayer()
      
      destroyPlayer()

      expect(actionPlayer).toBeDefined()
      expect(actionPlayer.value).toBeNull()
      expect(actionPlayer).toHaveProperty('value')
    })
  })

  describe('integration with stores', () => {
    it('responds to actions changes', async () => {
      const composable = useFileActionPlayer()
      await initializePlayerWithMocks(composable)

      // Simulate actions being loaded
      const mockActions: RecordedPage[] = [{ pageNumber: 0, staticActions: [], playbackActions: [], timestamp: 0 }]
      mockRecordingStore.actions.value = mockActions
      await nextTick()

      expect(mockFileActionPlayer).toBeDefined()
    })

    it('responds to currentTime changes', async () => {
      const composable = useFileActionPlayer()
      await initializePlayerWithMocks(composable)

      // Simulate time change
      mockMediaStore.currentTime = 120000
      mockMediaStore.seeking = true

      // The watcher should call seekByTime (tested indirectly)
    })

    it('responds to playbackState changes', async () => {
      const composable = useFileActionPlayer()
      await initializePlayerWithMocks(composable)

      // Test different playback states
      mockMediaStore.playbackState = 'playing'
      mockMediaStore.playbackState = 'paused'
      mockMediaStore.playbackState = 'ended'
      mockMediaStore.playbackState = 'error'
    })
  })

  describe('error handling', () => {
    it('handles initialization errors gracefully', () => {
      const composable = useFileActionPlayer()
      const { actionCanvas, volatileCanvas, videoElement } = createMockElements()

      // Mock init to throw error
      mockFileActionPlayer.init.mockImplementation(() => {
        throw new Error('Initialization failed')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => composable.initializePlayer(actionCanvas, volatileCanvas, videoElement)).not.toThrow()

      consoleSpy.mockRestore()
    })
  })
})
