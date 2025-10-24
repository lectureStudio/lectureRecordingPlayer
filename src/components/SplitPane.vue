<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

interface Props {
  /** Size of the first pane as a percentage (0-100) */
  firstPaneSize?: number
  /** Minimum size of the first pane as a percentage */
  firstPaneMinSize?: number
  /** Maximum size of the first pane as a percentage */
  firstPaneMaxSize?: number
  /** Size of the second pane as a percentage (0-100) */
  secondPaneSize?: number
  /** Minimum size of the second pane as a percentage */
  secondPaneMinSize?: number
  /** Maximum size of the second pane as a percentage */
  secondPaneMaxSize?: number
  /** Whether the splitter is vertical (default) or horizontal */
  vertical?: boolean
  /** Whether the panes can be resized */
  resizable?: boolean
  /** Size of the splitter handle in pixels */
  splitterSize?: number
  /** Order of panes: 'first-second' (default) or 'second-first' */
  order?: 'first-second' | 'second-first'
}

const props = withDefaults(defineProps<Props>(), {
  firstPaneSize: 50,
  firstPaneMinSize: 0,
  firstPaneMaxSize: 100,
  secondPaneSize: 50,
  secondPaneMinSize: 0,
  secondPaneMaxSize: 100,
  vertical: true,
  resizable: true,
  splitterSize: 8,
  order: 'first-second',
})

interface Emits {
  resize: [sizes: { first: number; second: number }]
}

const emit = defineEmits<Emits>()

const containerRef = ref<HTMLElement>()
const isDragging = ref(false)
const startPosition = ref(0)
const startFirstSize = ref(0)
const startSecondSize = ref(0)

// Computed sizes that respect min/max constraints
const firstSize = ref(props.firstPaneSize)
const secondSize = ref(props.secondPaneSize)

// Apply constraints and normalize sizes
const updateSizes = (newFirstSize: number, newSecondSize: number) => {
  // Apply constraints
  firstSize.value = Math.max(
    props.firstPaneMinSize,
    Math.min(props.firstPaneMaxSize, newFirstSize),
  )
  secondSize.value = Math.max(
    props.secondPaneMinSize,
    Math.min(props.secondPaneMaxSize, newSecondSize),
  )

  // Ensure they add up to 100%
  const total = firstSize.value + secondSize.value
  if (total !== 100) {
    const ratio = 100 / total
    firstSize.value = Math.round(firstSize.value * ratio * 100) / 100
    secondSize.value = Math.round(secondSize.value * ratio * 100) / 100
  }

  emit('resize', { first: firstSize.value, second: secondSize.value })
}

// Watch for prop changes
watch(() => [props.firstPaneSize, props.secondPaneSize], () => {
  updateSizes(props.firstPaneSize, props.secondPaneSize)
}, { immediate: true })

// Helper function to create pane styles
const createPaneStyle = (size: number, minSize: number, maxSize: number) => {
  const sizeWithSplitter = `calc(${size}% - ${props.splitterSize / 2}px)`
  const minWithSplitter = `calc(${minSize}% - ${props.splitterSize / 2}px)`
  const maxWithSplitter = `calc(${maxSize}% - ${props.splitterSize / 2}px)`

  return {
    width: props.vertical ? sizeWithSplitter : '100%',
    height: props.vertical ? '100%' : sizeWithSplitter,
    minWidth: props.vertical ? minWithSplitter : 'auto',
    maxWidth: props.vertical ? maxWithSplitter : 'auto',
    minHeight: props.vertical ? 'auto' : minWithSplitter,
    maxHeight: props.vertical ? 'auto' : maxWithSplitter,
  }
}

// Computed styles for panes
const firstPaneStyle = computed(() =>
  createPaneStyle(
    firstSize.value,
    props.firstPaneMinSize,
    props.firstPaneMaxSize,
  )
)

const secondPaneStyle = computed(() =>
  createPaneStyle(
    secondSize.value,
    props.secondPaneMinSize,
    props.secondPaneMaxSize,
  )
)

const splitterStyle = computed(() => ({
  width: props.vertical ? `${props.splitterSize}px` : '100%',
  height: props.vertical ? '100%' : `${props.splitterSize}px`,
  cursor: props.resizable
    ? (props.vertical ? 'col-resize' : 'row-resize')
    : 'default',
}))

// Computed order values for flex layout
const firstPaneOrder = computed(() => props.order === 'first-second' ? 1 : 3)
const secondPaneOrder = computed(() => props.order === 'first-second' ? 3 : 1)
const splitterOrder = computed(() => props.order === 'first-second' ? 2 : 2)

// Unified event handlers
const startDrag = (clientX: number, clientY: number) => {
  if (!props.resizable) { return }

  isDragging.value = true
  startPosition.value = props.vertical ? clientX : clientY
  startFirstSize.value = firstSize.value
  startSecondSize.value = secondSize.value

  document.body.style.cursor = props.vertical ? 'col-resize' : 'row-resize'
  document.body.style.userSelect = 'none'
}

const handleMove = (clientX: number, clientY: number) => {
  if (!isDragging.value || !containerRef.value) { return }

  const currentPosition = props.vertical ? clientX : clientY
  const delta = currentPosition - startPosition.value

  const containerRect = containerRef.value.getBoundingClientRect()
  const containerSize = props.vertical
    ? containerRect.width
    : containerRect.height

  const deltaPercent = (delta / containerSize) * 100

  // When order is 'second-first', the visual order is reversed, so we need to invert the delta
  const adjustedDelta = props.order === 'second-first'
    ? -deltaPercent
    : deltaPercent

  const newFirstSize = startFirstSize.value + adjustedDelta
  const newSecondSize = startSecondSize.value - adjustedDelta

  updateSizes(newFirstSize, newSecondSize)
}

const endDrag = () => {
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Mouse event handlers
const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  startDrag(e.clientX, e.clientY)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  handleMove(e.clientX, e.clientY)
}

const handleMouseUp = () => {
  endDrag()
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// Touch event handlers
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  if (!touch) { return }

  startDrag(touch.clientX, touch.clientY)
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  if (!touch) { return }

  handleMove(touch.clientX, touch.clientY)
}

const handleTouchEnd = () => {
  endDrag()
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})

// Expose methods for external control
defineExpose({
  setFirstPaneSize: (size: number) => updateSizes(size, 100 - size),
  setSecondPaneSize: (size: number) => updateSizes(100 - size, size),
  getSizes: () => ({ first: firstSize.value, second: secondSize.value }),
  getSplitterSize: () => props.splitterSize,
})
</script>

<template>
  <div
    ref="containerRef"
    class="split-pane-container"
    :class="{
      'split-pane-vertical': vertical,
      'split-pane-horizontal': !vertical,
      'split-pane-dragging': isDragging,
    }"
  >
    <div
      ref="firstPaneRef"
      class="split-pane-pane split-pane-first"
      :style="{ ...firstPaneStyle, order: firstPaneOrder }"
    >
      <slot name="first"></slot>
    </div>

    <div
      v-if="resizable"
      ref="splitterRef"
      class="split-pane-splitter"
      :style="{ ...splitterStyle, order: splitterOrder }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
    >
      <div class="split-pane-splitter-handle"></div>
    </div>

    <div
      ref="secondPaneRef"
      class="split-pane-pane split-pane-second"
      :style="{ ...secondPaneStyle, order: secondPaneOrder }"
    >
      <slot name="second"></slot>
    </div>
  </div>
</template>

<style scoped>
.split-pane-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.split-pane-vertical {
  flex-direction: row;
}

.split-pane-horizontal {
  flex-direction: column;
}

.split-pane-pane {
  overflow: hidden;
  position: relative;
}

.split-pane-first {
  flex-shrink: 0;
}

.split-pane-second {
  flex-shrink: 0;
}

.split-pane-splitter {
  flex-shrink: 0;
  position: relative;
  background-color: transparent;
  transition: background-color 0.2s ease;
}

.split-pane-splitter:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.split-pane-splitter-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #e5e7eb;
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

.split-pane-vertical .split-pane-splitter-handle {
  width: 2px;
  height: 20px;
}

.split-pane-horizontal .split-pane-splitter-handle {
  width: 20px;
  height: 2px;
}

.split-pane-splitter:hover .split-pane-splitter-handle {
  background-color: #3b82f6;
}

.split-pane-dragging .split-pane-splitter {
  background-color: rgba(59, 130, 246, 0.2);
}

.split-pane-dragging .split-pane-splitter-handle {
  background-color: #3b82f6;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .split-pane-splitter-handle {
    background-color: #4b5563;
  }
  
  .split-pane-splitter:hover .split-pane-splitter-handle {
    background-color: #60a5fa;
  }
  
  .split-pane-dragging .split-pane-splitter {
    background-color: rgba(96, 165, 250, 0.2);
  }
  
  .split-pane-dragging .split-pane-splitter-handle {
    background-color: #60a5fa;
  }
}
</style>
