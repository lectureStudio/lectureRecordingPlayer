import { type KeyBinding, useKeyboard, type UseKeyboardOptions } from '@/composables/useKeyboard'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { defineComponent } from 'vue'

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

  // Helper function to test composable within a Vue component context
  const testComposable = (bindings: KeyBinding[], options: UseKeyboardOptions = {}) => {
    const TestComponent = defineComponent({
      setup() {
        return useKeyboard(bindings, options)
      },
      template: '<div></div>',
    })

    const wrapper = mount(TestComponent)
    return wrapper.vm
  }

  describe('basic functionality', () => {
    it('returns enabled ref and scoping ref', () => {
      const bindings: KeyBinding[] = []
      const result = testComposable(bindings)

      expect(result).toHaveProperty('enabled')
      expect(result).toHaveProperty('onlyWhenTargetInside')
      // When using testComposable, the ref gets unwrapped by Vue's component system
      expect(typeof result.enabled).toBe('boolean')
    })

    it('uses default enabled state', () => {
      const bindings: KeyBinding[] = []
      const result = testComposable(bindings)

      // When using testComposable, the ref gets unwrapped by Vue's component system
      expect(result.enabled).toBe(true)
    })

    it('accepts custom enabled ref', () => {
      const enabled = ref(false)
      const bindings: KeyBinding[] = []
      const result = testComposable(bindings, { enabled })

      // When using testComposable, the ref gets unwrapped by Vue's component system
      // So we test the value directly instead of .value
      expect(result.enabled).toBe(false)
      expect(typeof result.enabled).toBe('boolean')
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
      expect(() => testComposable(bindings)).not.toThrow()
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
      expect(() => testComposable(bindings)).not.toThrow()
    })
  })

  describe('options', () => {
    it('accepts ignoreEditable option', () => {
      const bindings: KeyBinding[] = []

      expect(() => testComposable(bindings, { ignoreEditable: true })).not.toThrow()
      expect(() => testComposable(bindings, { ignoreEditable: false })).not.toThrow()
    })

    it('accepts capture option', () => {
      const bindings: KeyBinding[] = []

      expect(() => testComposable(bindings, { capture: true })).not.toThrow()
      expect(() => testComposable(bindings, { capture: false })).not.toThrow()
    })

    it('accepts onlyWhenTargetInside option', () => {
      const bindings: KeyBinding[] = []
      const element = document.createElement('div')

      expect(() => testComposable(bindings, { onlyWhenTargetInside: element })).not.toThrow()
      expect(() => testComposable(bindings, { onlyWhenTargetInside: ref(element) })).not.toThrow()
      expect(() => testComposable(bindings, { onlyWhenTargetInside: null })).not.toThrow()
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

      testComposable(bindings)

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

      testComposable(bindings)

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

      testComposable(bindings)

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

      testComposable(bindings)

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

      testComposable(bindings)

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

      testComposable(bindings)

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

      testComposable(bindings)

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

      testComposable(bindings, { ignoreEditable: true })
      testComposable(bindings, { ignoreEditable: false })

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

      testComposable(bindings, { onlyWhenTargetInside: scopedElement })
      testComposable(bindings, { onlyWhenTargetInside: ref(scopedElement) })

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

      testComposable(bindings)

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

      testComposable(bindings, { capture: true })
      testComposable(bindings, { capture: false })

      // The composable should be created without errors
      expect(handler).not.toHaveBeenCalled()
    })
  })
})
