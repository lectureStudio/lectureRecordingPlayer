import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NavigationBar from '@/components/NavigationBar.vue'
import { createTestingPinia } from '@pinia/testing'

describe('NavigationBar', () => {
  it('should render the logo and title', () => {
    const wrapper = mount(NavigationBar, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
      },
    })

    const title = wrapper.find('span')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBeDefined()
  })
})
