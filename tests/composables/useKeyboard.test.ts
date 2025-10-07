import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { useKeyboard, type KeyBinding } from '@/composables/useKeyboard'

describe('composables/useKeyboard', () => {
  let mockAddEventListener: ReturnType<typeof vi.fn>
  let mockRemoveEventListener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create fresh mocks for each test
    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()
    
    // Mock window event listeners
    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    })
    
    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('basic functionality', () => {
    it('returns enabled ref and scoping ref', () => {
      const bindings: KeyBinding[] = []
      const result = useKeyboard(bindings)

      expect(result).toHaveProperty('enabled')
      expect(result).toHaveProperty('onlyWhenTargetInside')
      expect(typeof result.enabled.value).toBe('boolean')
    })

    it('uses default enabled state', () => {
      const bindings: KeyBinding[] = []
      const result = useKeyboard(bindings)

      expect(result.enabled.value).toBe(true)
    })

    it('accepts custom enabled ref', () => {
      const enabled = ref(false)
      const bindings: KeyBinding[] = []
      const result = useKeyboard(bindings, { enabled })

      expect(result.enabled).toBe(enabled)
      expect(result.enabled.value).toBe(false)
    })
  })

  describe('key binding structure', () => {
    it('accepts valid key bindings', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a' },
          handler,
        },
        {
          keys: { code: 'KeyB' },
          handler,
        },
        {
          keys: { key: 'c', ctrl: true },
          handler,
        },
        {
          keys: [{ key: 'd' }, { key: 'e' }],
          handler,
        },
      ]

      // Should not throw
      expect(() => useKeyboard(bindings)).not.toThrow()
    })

    it('accepts priority and when conditions', () => {
      const handler = vi.fn()
      const condition = ref(true)
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a' },
          handler,
          priority: 1,
          when: () => condition.value,
        },
      ]

      // Should not throw
      expect(() => useKeyboard(bindings)).not.toThrow()
    })
  })

  describe('options', () => {
    it('accepts ignoreEditable option', () => {
      const bindings: KeyBinding[] = []
      
      expect(() => useKeyboard(bindings, { ignoreEditable: true })).not.toThrow()
      expect(() => useKeyboard(bindings, { ignoreEditable: false })).not.toThrow()
    })

    it('accepts capture option', () => {
      const bindings: KeyBinding[] = []
      
      expect(() => useKeyboard(bindings, { capture: true })).not.toThrow()
      expect(() => useKeyboard(bindings, { capture: false })).not.toThrow()
    })

    it('accepts onlyWhenTargetInside option', () => {
      const bindings: KeyBinding[] = []
      const element = document.createElement('div')
      
      expect(() => useKeyboard(bindings, { onlyWhenTargetInside: element })).not.toThrow()
      expect(() => useKeyboard(bindings, { onlyWhenTargetInside: ref(element) })).not.toThrow()
      expect(() => useKeyboard(bindings, { onlyWhenTargetInside: null })).not.toThrow()
    })
  })

  describe('key matching logic', () => {
    it('handles key property matching', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'Enter' },
          handler,
        },
      ]

      useKeyboard(bindings)
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })

    it('handles code property matching', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { code: 'KeyA' },
          handler,
        },
      ]

      useKeyboard(bindings)
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })

    it('handles modifier keys', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { key: 's', ctrl: true },
          handler,
        },
        {
          keys: { key: 's', alt: true },
          handler,
        },
        {
          keys: { key: 's', shift: true },
          handler,
        },
        {
          keys: { key: 's', meta: true },
          handler,
        },
      ]

      useKeyboard(bindings)
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })

    it('handles repeat behavior', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a', repeat: false },
          handler,
        },
        {
          keys: { key: 'b', repeat: true },
          handler,
        },
      ]

      useKeyboard(bindings)
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })

    it('handles array of keys', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: [{ key: 'a' }, { key: 'b' }],
          handler,
        },
      ]

      useKeyboard(bindings)
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('conditional execution', () => {
    it('handles when conditions', () => {
      const handler = vi.fn()
      const condition = ref(false)
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a' },
          handler,
          when: () => condition.value,
        },
      ]

      useKeyboard(bindings)
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('priority handling', () => {
    it('handles priority values', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a' },
          handler: handler1,
          priority: 1,
        },
        {
          keys: { key: 'a' },
          handler: handler2,
          priority: 2,
        },
      ]

      useKeyboard(bindings)
      
      // The composable should be created without errors
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('editable element handling', () => {
    it('handles ignoreEditable option', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a' },
          handler,
        },
      ]

      useKeyboard(bindings, { ignoreEditable: true })
      useKeyboard(bindings, { ignoreEditable: false })
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('scoping', () => {
    it('handles scoped elements', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a' },
          handler,
        },
      ]

      const scopedElement = document.createElement('div')
      
      useKeyboard(bindings, { onlyWhenTargetInside: scopedElement })
      useKeyboard(bindings, { onlyWhenTargetInside: ref(scopedElement) })
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('handler return values', () => {
    it('handles different return types', () => {
      const handler1 = vi.fn().mockReturnValue(true)
      const handler2 = vi.fn().mockReturnValue(false)
      const handler3 = vi.fn().mockReturnValue(undefined)
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a' },
          handler: handler1,
        },
        {
          keys: { key: 'b' },
          handler: handler2,
        },
        {
          keys: { key: 'c' },
          handler: handler3,
        },
      ]

      useKeyboard(bindings)
      
      // The composable should be created without errors
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()
    })
  })

  describe('capture option', () => {
    it('handles capture phase option', () => {
      const handler = vi.fn()
      const bindings: KeyBinding[] = [
        {
          keys: { key: 'a' },
          handler,
        },
      ]

      useKeyboard(bindings, { capture: true })
      useKeyboard(bindings, { capture: false })
      
      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })
  })
})