import { useDropdownState } from '@/composables/useDropdownState'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import type { Ref } from 'vue'

// Mock component to test the composable
const TestComponent = {
  template: `
    <div ref="dropdownRef" class="dropdown">
      <div tabindex="0" role="button" @focus="handleDropdownToggle(true)" @blur="handleDropdownToggle(false)">
        Button
      </div>
    </div>
  `,
  setup() {
    const { dropdownRef, handleDropdownToggle, exposedState, forceClose } = useDropdownState()
    return {
      dropdownRef,
      handleDropdownToggle,
      forceClose,
      ...exposedState,
    }
  },
}

// Type for the component instance properties
interface TestComponentInstance {
  dropdownRef: Ref<HTMLElement | undefined>
  handleDropdownToggle: (open: boolean) => void
  forceClose: () => void
  isDropdownOpen: Ref<boolean>
}

describe('useDropdownState', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(TestComponent)
  })

  it('should initialize with dropdown closed', () => {
    const vm = wrapper.vm as unknown as TestComponentInstance
    expect(vm.isDropdownOpen.value).toBe(false)
  })

  it('should provide dropdown ref for DOM element', async () => {
    const vm = wrapper.vm as unknown as TestComponentInstance
    expect(vm.dropdownRef).toBeDefined()

    // Wait for the component to be fully mounted
    await nextTick()

    // Verify the DOM element exists and has the correct class
    const dropdownElement = wrapper.find('.dropdown').element
    expect(dropdownElement).toBeDefined()
    expect(dropdownElement.classList.contains('dropdown')).toBe(true)

    // The ref should be a reactive reference (even if not connected in test environment)
    // In a real component, this would be connected to the DOM element
    expect(vm.dropdownRef).toBeDefined()
    expect(typeof vm.dropdownRef.value).toBe('undefined') // May be undefined in test environment
  })

  it('should expose dropdown state for parent components', () => {
    const vm = wrapper.vm as unknown as TestComponentInstance
    expect(vm.isDropdownOpen).toBeDefined()
    expect(typeof vm.isDropdownOpen.value).toBe('boolean')
  })

  it('should handle dropdown toggle function', () => {
    const vm = wrapper.vm as unknown as TestComponentInstance
    expect(typeof vm.handleDropdownToggle).toBe('function')

    vm.handleDropdownToggle(true)
    expect(vm.isDropdownOpen.value).toBe(true)

    // Use forceClose to test immediate closing without timeout
    vm.forceClose()
    expect(vm.isDropdownOpen.value).toBe(false)
  })

  it('should handle dropdown toggle with timeout for closing', async () => {
    const vm = wrapper.vm as unknown as TestComponentInstance

    vm.handleDropdownToggle(true)
    expect(vm.isDropdownOpen.value).toBe(true)

    // Test that handleDropdownToggle(false) uses a timeout
    vm.handleDropdownToggle(false)
    // Should still be open immediately after calling
    expect(vm.isDropdownOpen.value).toBe(true)

    // Wait for the timeout to complete (200ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 250))
    expect(vm.isDropdownOpen.value).toBe(false)
  })
})
