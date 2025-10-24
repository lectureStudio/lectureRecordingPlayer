import { computed, ref } from 'vue'

/**
 * Composable for managing dropdown state
 * Provides manual toggle functionality for DaisyUI dropdowns
 */
export function useDropdownState() {
  const isDropdownOpen = ref(false)
  const dropdownRef = ref<HTMLElement>()
  let closeTimeout: number | null = null

  const handleDropdownToggle = (open: boolean) => {
    if (open) {
      // Clear any pending close timeout when opening
      if (closeTimeout) {
        clearTimeout(closeTimeout)
        closeTimeout = null
      }
      isDropdownOpen.value = true
    }
    else {
      // Delay closing to allow for focus to move within the dropdown
      closeTimeout = window.setTimeout(() => {
        isDropdownOpen.value = false
        closeTimeout = null
      }, 200)
    }
  }

  const forceClose = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      closeTimeout = null
    }
    isDropdownOpen.value = false
  }

  // Expose dropdown state for parent components
  const exposedState = {
    isDropdownOpen: computed(() => isDropdownOpen.value),
  }

  return {
    isDropdownOpen,
    dropdownRef,
    handleDropdownToggle,
    forceClose,
    exposedState,
  }
}
