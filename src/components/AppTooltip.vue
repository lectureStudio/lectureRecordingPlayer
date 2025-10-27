<script setup lang="ts">
import {
  arrow,
  autoUpdate,
  flip,
  offset as offsetMiddleware,
  shift,
  useFloating,
} from '@floating-ui/vue'
import { computed, ref, watch } from 'vue'

interface Props {
  content: string
  richContent?: boolean
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  delay?: number
  disabled?: boolean
  hideOnClick?: boolean
  dropdownOpen?: boolean
  showArrow?: boolean
  offset?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'auto',
  delay: 0,
  disabled: false,
  hideOnClick: true,
  dropdownOpen: false,
  showArrow: true,
  offset: 8,
  richContent: false,
})

const reference = ref<HTMLElement>()
const floating = ref<HTMLElement>()
const arrowRef = ref<HTMLElement>()
const isOpen = ref(false)
let showTimeout: number | null = null

const { floatingStyles, middlewareData, placement } = useFloating(
  reference,
  floating,
  {
    placement: props.placement === 'auto' ? undefined : props.placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offsetMiddleware(props.offset),
      flip(),
      shift({ padding: 8 }),
      ...(props.showArrow ? [arrow({ element: arrowRef })] : []),
    ],
  },
)

const arrowStyles = computed(() => {
  const { x, y } = middlewareData.value.arrow || { x: 0, y: 0 }

  // Determine the static side based on actual computed placement
  const getStaticSide = (placement: string) => {
    if (placement.startsWith('top')) { return 'bottom' }
    if (placement.startsWith('bottom')) { return 'top' }
    if (placement.startsWith('left')) { return 'right' }
    if (placement.startsWith('right')) { return 'left' }
    return 'bottom'
  }

  const staticSide = getStaticSide(placement.value)

  return {
    position: 'absolute' as const,
    left: x != null ? `${x}px` : '',
    top: y != null ? `${y}px` : '',
    [staticSide]: '-4px',
  }
})

const showTooltip = () => {
  if (props.disabled || !props.content || props.dropdownOpen) { return }

  if (props.delay > 0) {
    showTimeout = window.setTimeout(() => {
      isOpen.value = true
    }, props.delay)
  }
  else {
    isOpen.value = true
  }
}

const hideTooltip = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }

  isOpen.value = false
}

const handleClick = (event: Event) => {
  // Prevent event propagation to avoid triggering parent tooltips
  event.stopPropagation()

  if (props.hideOnClick) {
    hideTooltip()
  }
}

// Clean up timeouts
const cleanup = () => {
  if (showTimeout) { clearTimeout(showTimeout) }
}

// Watch for disabled prop changes
watch(() => props.disabled, (disabled) => {
  if (disabled) {
    cleanup()
    isOpen.value = false
  }
})

// Watch for dropdown state changes
watch(() => props.dropdownOpen, (dropdownOpen) => {
  if (dropdownOpen) {
    cleanup()
    isOpen.value = false
  }
})

// Cleanup on unmounting
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<template>
  <div
    ref="reference"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
    @click="handleClick"
    class="inline"
  >
    <slot />

    <Teleport to="body">
      <Transition
        name="tooltip"
        @enter="(el: Element) => (el as HTMLElement).offsetHeight"
        @after-leave="() => {}"
      >
        <div
          v-if="isOpen && content"
          ref="floating"
          :style="floatingStyles"
          class="flex items-start content-start z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none"
          role="tooltip"
          data-theme="dark"
        >
          <div v-if="richContent" v-html="content" class="flex gap-2" />
          <span v-else>{{ content }}</span>
          <div
            v-if="showArrow"
            ref="arrowRef"
            :style="arrowStyles"
            class="absolute w-2 h-2 bg-gray-900 transform rotate-45"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Tooltip transition animations - using only opacity to avoid positioning conflicts */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease-in-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
}
</style>
