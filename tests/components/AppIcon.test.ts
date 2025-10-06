import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

describe('AppIcon', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const createWrapper = (props = {}) => {
    wrapper = mount(AppIcon, {
      props: {
        name: 'play',
        ...props,
      },
    })
    return wrapper
  }

  describe('Rendering', () => {
    it('renders with default props', () => {
      createWrapper()
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('renders with custom class', () => {
      createWrapper({ class: 'custom-class' })
      
      expect(wrapper.classes()).toContain('custom-class')
    })

    it('applies size classes correctly', () => {
      createWrapper({ class: 'w-6 h-6' })
      
      expect(wrapper.classes()).toContain('w-6')
      expect(wrapper.classes()).toContain('h-6')
    })
  })

  describe('Icon Names', () => {
    const iconNames = [
      'play',
      'pause',
      'previous',
      'next',
      'fullscreen-maximize',
      'fullscreen-minimize',
      'search',
    ]

    iconNames.forEach(iconName => {
      it(`renders ${iconName} icon`, () => {
        createWrapper({ name: iconName })
        
        expect(wrapper.exists()).toBe(true)
        // AppIcon renders a div with v-html, not an svg directly
        expect(wrapper.find('div').exists()).toBe(true)
      })
    })
  })

  describe('Accessibility', () => {
    it('renders icon content', () => {
      createWrapper()
      
      const div = wrapper.find('div')
      expect(div.exists()).toBe(true)
      expect(div.classes()).toContain('inline-flex')
    })

    it('handles missing icon gracefully', () => {
      createWrapper({ name: 'nonexistent-icon' })
      
      // Should not render anything when icon is not found
      expect(wrapper.find('div').exists()).toBe(false)
    })
  })

  describe('Props Validation', () => {
    it('requires name prop', () => {
      // @ts-expect-error - Testing missing required prop
      createWrapper({ name: undefined })
      
      // Component should still render but may show fallback
      expect(wrapper.exists()).toBe(true)
    })

    it('handles invalid icon names gracefully', () => {
      createWrapper({ name: 'invalid-icon' })
      
      // Should not crash
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Styling', () => {
    it('applies default styling', () => {
      createWrapper()
      
      const div = wrapper.find('div')
      expect(div.classes()).toContain('inline-flex')
      expect(div.classes()).toContain('items-center')
      expect(div.classes()).toContain('justify-center')
    })

    it('merges custom classes with default classes', () => {
      createWrapper({ class: 'text-blue-500' })
      
      expect(wrapper.classes()).toContain('inline-flex')
      expect(wrapper.classes()).toContain('text-blue-500')
    })

    it('handles multiple class names', () => {
      createWrapper({ class: 'w-8 h-8 text-red-500' })
      
      expect(wrapper.classes()).toContain('w-8')
      expect(wrapper.classes()).toContain('h-8')
      expect(wrapper.classes()).toContain('text-red-500')
    })
  })

  describe('Dynamic Updates', () => {
    it('updates when name prop changes', async () => {
      createWrapper({ name: 'play' })
      
      await wrapper.setProps({ name: 'pause' })
      await nextTick()
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('updates when class prop changes', async () => {
      createWrapper({ class: 'w-4 h-4' })
      
      await wrapper.setProps({ class: 'w-6 h-6' })
      await nextTick()
      
      expect(wrapper.classes()).toContain('w-6')
      expect(wrapper.classes()).toContain('h-6')
      expect(wrapper.classes()).not.toContain('w-4')
      expect(wrapper.classes()).not.toContain('h-4')
    })
  })

  describe('Event Handling', () => {
    it('forwards click events', async () => {
      createWrapper()
      
      await wrapper.trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('forwards other events', async () => {
      createWrapper()
      
      await wrapper.trigger('mouseenter')
      await wrapper.trigger('mouseleave')
      
      expect(wrapper.emitted('mouseenter')).toBeTruthy()
      expect(wrapper.emitted('mouseleave')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty name prop', () => {
      createWrapper({ name: '' })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('handles null name prop', () => {
      // @ts-expect-error - Testing null prop
      createWrapper({ name: null })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('handles undefined class prop', () => {
      createWrapper({ class: undefined })
      
      expect(wrapper.exists()).toBe(true)
    })
  })
})
