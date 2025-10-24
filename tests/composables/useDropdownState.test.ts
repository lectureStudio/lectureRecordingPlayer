import { useDropdownState } from '@/composables/useDropdownState'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
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
    const { dropdownRef, handleDropdownToggle, exposedState } = useDropdownState()
    return {
      dropdownRef,
      handleDropdownToggle,
      ...exposedState,
    }
  },
}

// Type for the component instance properties
interface TestComponentInstance {
  dropdownRef: Ref<HTMLElement | undefined>
  handleDropdownToggle: (open: boolean) => void
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

  it('should provide dropdown ref for DOM element', () => {
    const vm = wrapper.vm as unknown as TestComponentInstance
    expect(vm.dropdownRef).toBeDefined()
    expect(vm.dropdownRef.value?.classList.contains('dropdown')).toBe(true)
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

    vm.handleDropdownToggle(false)
    expect(vm.isDropdownOpen.value).toBe(false)
  })
})
