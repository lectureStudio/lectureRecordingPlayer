import NavigationBar from '@/components/NavigationBar.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('NavigationBar', () => {
  let wrapper: VueWrapper<InstanceType<typeof NavigationBar>>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const createWrapper = (props = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    })

    wrapper = mount(NavigationBar, {
      global: {
        plugins: [pinia],
        stubs: {
          AppIcon: true,
        },
      },
      props,
    })

    return wrapper
  }

  describe('Rendering', () => {
    it('renders the navigation bar with correct structure', () => {
      createWrapper()

      expect(wrapper.find('div').exists()).toBe(true)
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('displays the application title', () => {
      createWrapper()

      const title = wrapper.find('h1')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBeTruthy()
    })

    it('has proper structure', () => {
      createWrapper()

      const container = wrapper.find('div')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('px-4')
      expect(container.classes()).toContain('py-3')
    })
  })

  describe('Styling', () => {
    it('applies correct CSS classes', () => {
      createWrapper()

      const container = wrapper.find('div')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('px-4')
      expect(container.classes()).toContain('py-3')
    })
  })
})
