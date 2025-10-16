import { type AppSettings, AppSettingsSchema } from '@/schemas/settings'
import { useSettingsStore } from '@/stores/settings'
import { loadJSON, saveJSON } from '@/utils/storage'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'

// Mock the storage utilities
vi.mock('@/utils/storage', () => ({
  loadJSON: vi.fn(),
  saveJSON: vi.fn(),
}))

// Mock the settings schema
vi.mock('@/schemas/settings', () => ({
  AppSettingsSchema: {
    safeParse: vi.fn(),
  },
}))

describe('stores/settings', () => {
  let store: ReturnType<typeof useSettingsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSettingsStore()
    vi.clearAllMocks()

    // Reset saveJSON mock to not throw by default
    vi.mocked(saveJSON).mockImplementation(() => {})
  })

  afterEach(() => {
    // Reset store state
    store.resetToDefaults()
  })

  describe('Initial State', () => {
    it('has correct default values', () => {
      expect(store.sidebarPosition).toBe('left')
      expect(store.theme).toBe('light')
    })
  })

  describe('setTheme', () => {
    it('sets theme to light', () => {
      store.setTheme('light')
      expect(store.theme).toBe('light')
    })

    it('sets theme to dark', () => {
      store.setTheme('dark')
      expect(store.theme).toBe('dark')
    })
  })

  describe('loadFromStorage', () => {
    it('loads valid settings from storage', () => {
      const mockSettings = {
        sidebarPosition: 'right' as const,
        theme: 'dark' as const,
      }

      vi.mocked(loadJSON).mockReturnValue(mockSettings)
      vi.mocked(AppSettingsSchema.safeParse).mockReturnValue({
        success: true,
        data: mockSettings,
      })

      const result = store.loadFromStorage()

      expect(result).toBe(true)
      expect(store.sidebarPosition).toBe('right')
      expect(store.theme).toBe('dark')
      expect(loadJSON).toHaveBeenCalledWith('app:settings')
    })

    it('returns false when no data in storage', () => {
      vi.mocked(loadJSON).mockReturnValue(null)

      const result = store.loadFromStorage()

      expect(result).toBe(false)
      expect(store.sidebarPosition).toBe('left') // Default value
      expect(store.theme).toBe('light') // Default value
    })

    it('returns false when data is invalid', () => {
      const invalidData = {
        sidebarPosition: 'invalid',
        theme: 'invalid',
      }

      vi.mocked(loadJSON).mockReturnValue(invalidData)
      const mockError = new Error('Invalid data')
      vi.mocked(AppSettingsSchema.safeParse).mockReturnValue({
        success: false,
        error: mockError as ZodError<AppSettings>,
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = store.loadFromStorage()

      expect(result).toBe(false)
      expect(store.sidebarPosition).toBe('left') // Default value
      expect(store.theme).toBe('light') // Default value
      expect(consoleSpy).toHaveBeenCalledWith('Invalid settings in storage, ignoring', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('handles partial valid data', () => {
      const partialData = {
        theme: 'dark',
        // sidebarPosition missing
      }

      vi.mocked(loadJSON).mockReturnValue(partialData)
      vi.mocked(AppSettingsSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          sidebarPosition: 'left', // Default value
          theme: 'dark',
        },
      })

      const result = store.loadFromStorage()

      expect(result).toBe(true)
      expect(store.sidebarPosition).toBe('left')
      expect(store.theme).toBe('dark')
    })

    it('handles storage errors gracefully', () => {
      vi.mocked(loadJSON).mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => store.loadFromStorage()).toThrow('Storage error')
    })
  })

  describe('persist', () => {
    it('saves current state to storage', () => {
      store.sidebarPosition = 'right'
      store.theme = 'dark'

      store.persist()

      expect(saveJSON).toHaveBeenCalledWith('app:settings', {
        sidebarPosition: 'right',
        theme: 'dark',
      })
    })

    it('saves default state', () => {
      store.persist()

      expect(saveJSON).toHaveBeenCalledWith('app:settings', {
        sidebarPosition: 'left',
        theme: 'light',
      })
    })

    it('handles save errors gracefully', () => {
      // Reset the mock to throw for this test only
      vi.mocked(saveJSON).mockImplementationOnce(() => {
        throw new Error('Save error')
      })

      // The store doesn't handle save errors, so it will throw
      expect(() => store.persist()).toThrow('Save error')
    })
  })

  describe('resetToDefaults', () => {
    it('resets to default values and persists', () => {
      // Reset saveJSON mock to not throw
      vi.mocked(saveJSON).mockImplementation(() => {})

      // Set non-default values
      store.sidebarPosition = 'right'
      store.theme = 'dark'

      store.resetToDefaults()

      expect(store.sidebarPosition).toBe('left')
      expect(store.theme).toBe('light')
      expect(saveJSON).toHaveBeenCalledWith('app:settings', {
        sidebarPosition: 'left',
        theme: 'light',
      })
    })

    it('works when already at default values', () => {
      // Reset saveJSON mock to not throw
      vi.mocked(saveJSON).mockImplementation(() => {})

      store.resetToDefaults()

      expect(store.sidebarPosition).toBe('left')
      expect(store.theme).toBe('light')
      expect(saveJSON).toHaveBeenCalled()
    })
  })

  describe('integration', () => {
    it('loads and saves settings correctly', () => {
      // Reset saveJSON mock to not throw
      vi.mocked(saveJSON).mockImplementation(() => {})

      const mockSettings = {
        sidebarPosition: 'right' as const,
        theme: 'dark' as const,
      }

      // Mock successful load
      vi.mocked(loadJSON).mockReturnValue(mockSettings)
      vi.mocked(AppSettingsSchema.safeParse).mockReturnValue({
        success: true,
        data: mockSettings,
      })

      // Load settings
      const loadResult = store.loadFromStorage()
      expect(loadResult).toBe(true)
      expect(store.sidebarPosition).toBe('right')
      expect(store.theme).toBe('dark')

      // Modify settings
      store.setTheme('dark')

      // Save settings
      store.persist()
      expect(saveJSON).toHaveBeenCalledWith('app:settings', {
        sidebarPosition: 'right',
        theme: 'dark',
      })
    })

    it('handles complete workflow', () => {
      // Reset saveJSON mock to not throw
      vi.mocked(saveJSON).mockImplementation(() => {})

      // Start with defaults
      expect(store.sidebarPosition).toBe('left')
      expect(store.theme).toBe('light')

      // Change theme
      store.setTheme('dark')
      expect(store.theme).toBe('dark')

      // Persist changes
      store.persist()
      expect(saveJSON).toHaveBeenCalledWith('app:settings', {
        sidebarPosition: 'left',
        theme: 'dark',
      })

      // Reset to defaults
      store.resetToDefaults()
      expect(store.sidebarPosition).toBe('left')
      expect(store.theme).toBe('light')
    })
  })

  describe('edge cases', () => {
    it('handles null values in storage', () => {
      vi.mocked(loadJSON).mockReturnValue(null)

      const result = store.loadFromStorage()
      expect(result).toBe(false)
    })

    it('handles undefined values in storage', () => {
      vi.mocked(loadJSON).mockReturnValue(undefined)

      const result = store.loadFromStorage()
      expect(result).toBe(false)
    })

    it('handles empty object in storage', () => {
      vi.mocked(loadJSON).mockReturnValue({})
      vi.mocked(AppSettingsSchema.safeParse).mockReturnValue({
        success: true,
        data: {
          sidebarPosition: 'left',
          theme: 'light',
        },
      })

      const result = store.loadFromStorage()
      expect(result).toBe(true)
    })

    it('handles malformed JSON in storage', () => {
      vi.mocked(loadJSON).mockImplementation(() => {
        throw new Error('Invalid JSON')
      })

      expect(() => store.loadFromStorage()).toThrow('Invalid JSON')
    })

    it('handles schema validation errors', () => {
      const invalidData = {
        sidebarPosition: 123, // Should be string
        theme: true, // Should be string
      }

      vi.mocked(loadJSON).mockReturnValue(invalidData)
      const mockError = new Error('Schema validation failed')
      vi.mocked(AppSettingsSchema.safeParse).mockReturnValue({
        success: false,
        error: mockError as ZodError<AppSettings>,
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = store.loadFromStorage()
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('type safety', () => {
    it('accepts valid theme values', () => {
      // Reset saveJSON mock to not throw
      vi.mocked(saveJSON).mockImplementation(() => {})

      const validThemes = ['light', 'dark'] as const

      validThemes.forEach(theme => {
        store.setTheme(theme)
        expect(store.theme).toBe(theme)
      })
    })

    it('accepts valid sidebar position values', () => {
      // Reset saveJSON mock to not throw
      vi.mocked(saveJSON).mockImplementation(() => {})

      const validPositions = ['left', 'right'] as const

      validPositions.forEach(position => {
        store.sidebarPosition = position
        expect(store.sidebarPosition).toBe(position)
      })
    })
  })
})
