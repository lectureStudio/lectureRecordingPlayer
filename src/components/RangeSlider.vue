<template>
  <div class="flex relative">
    <input
      ref="slider"
      type="range"
      :min="props.min"
      :max="props.max"
      v-model="value"
      class="range-slider range range-xs range--fill w-full"
      aria-label="Range"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @touchend="onPointerUp"
      @blur="onPointerUp"
      @input="onUserInput"
    />
    <div
      class="tooltip tooltip-top tabular-nums absolute pointer-events-none select-none z-50"
      :class="{ 'tooltip-open': tooltipOpen }"
      :data-tip="formattedTip"
      :style="{ left: thumbLeft, transform: thumbTransform }"
      role="status"
      aria-live="polite"
    >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'

// Props: controls whether tooltip should be shown when the thumb is clicked/pressed
const props = withDefaults(
  defineProps<
    {
      showTooltipOnClick?: boolean
      modelValue?: number
      min?: number
      max?: number
      tooltipFormatter?: (value: number) => string
    }
  >(),
  {
    showTooltipOnClick: true,
    modelValue: 50,
    min: 0,
    max: 100,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (
    e: 'range-change',
    payload: { min: number; max: number; value: number },
  ): void
  (e: 'user-interaction', value: number): void
}>()

const value: Ref<number> = ref(props.modelValue)
const slider: Ref<HTMLInputElement | null> = ref(null)
const tooltipOpen = ref(false)

const percent = computed(() => {
  const min = props.min
  const max = props.max
  const span = Math.max(0, max - min)
  if (span === 0) {
    return 0
  }
  const clamped = Math.min(Math.max(value.value, min), max)
  return (clamped - min) / span
})

const thumbLeft = computed(() => {
  const pct = percent.value * 100
  const offset = (0.5 - percent.value) * (slider.value?.offsetHeight || 1)
  return `calc(${pct}% + ${offset}px)`
})
const thumbTransform = computed(() => `translateX(-${percent.value * 100}%)`)

const formattedTip = computed(() => {
  const v = value.value
  return props.tooltipFormatter ? props.tooltipFormatter(v) : String(v)
})

function setFillFromPercent(p: number) {
  if (!slider.value) {
    return
  }
  slider.value.style.setProperty('--range-fill', String(p))
}

function updateFill() {
  if (!slider.value) {
    return
  }

  const p = percent.value
  // The thumb width is assumed to be equal to the slider's client height with daisyui.
  const thumbSize = slider.value.offsetHeight
  const trackWidth = slider.value.offsetWidth

  if (trackWidth === 0) {
    // Avoid division by zero if the component is not rendered yet.
    setFillFromPercent(p)
    return
  }

  const thumbRatio = thumbSize / trackWidth
  // The fill of the track should extend to the center of the thumb.
  // The thumb's center position is approximately `p * (trackWidth - thumbWidth) + thumbWidth / 2`.
  // As a ratio of the total track width, this is:
  const fillRatio = p * (1 - thumbRatio) + thumbRatio / 2
  setFillFromPercent(fillRatio)
}

function onPointerDown() {
  if (props.showTooltipOnClick) {
    tooltipOpen.value = true
  }
}
function onPointerUp() {
  tooltipOpen.value = false
}

function onUserInput() {
  // Emit user-interaction event when the user is actively dragging the slider
  emit('user-interaction', value.value)
}

// Keep local value in sync with external modelValue
watch(
  () => props.modelValue,
  (v) => {
    if (v !== value.value) {
      value.value = v
    }
  },
)

// When value changes locally, update fill and propagate
watch(value, (v) => {
  updateFill()
  emit('update:modelValue', v)
  emit('range-change', { min: props.min, max: props.max, value: v })
})

onMounted(() => {
  nextTick(updateFill)
  emit('range-change', { min: props.min, max: props.max, value: value.value })
})
</script>

<style>
/* Opt-in thinner fill rendered on the track instead of the thumb shadow */
.range.range--fill::-webkit-slider-runnable-track {
  background:
    linear-gradient(to right, currentColor 0%, currentColor 100%) no-repeat,
    var(--range-bg);
  background-size:
    calc(var(--range-fill, 0) * 100%) 100%,
    auto;
  background-position:
    left center,
    left center;
}
/* Remove the full-height fill shadow when using the background-fill modifier */
.range.range--fill::-webkit-slider-thumb {
  box-shadow:
    0 -1px oklch(0% 0 0 / calc(var(--depth) * 0.1)) inset,
    0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset,
    0 1px color-mix(in oklab, currentColor calc(var(--depth) * 10%), #0000),
    0 0 0 2rem var(--range-thumb) inset;
}
/* Opt-in thinner fill on Firefox using range-progress */
.range.range--fill::-moz-range-track {
  background:
      linear-gradient(to right, currentColor 0%, currentColor 100%) no-repeat,
      var(--range-bg);
  background-size:
      calc(var(--range-fill, 0) * 100%) 100%,
      auto;
  background-position:
      left center,
      left center;
}
.range.range--fill::-moz-range-progress {
  /* Hide the default progress bar */
  background-color: transparent;
}
/* Remove the full-height fill shadow for Firefox when using background-fill */
.range.range--fill::-moz-range-thumb {
  box-shadow:
    0 -1px oklch(0% 0 0 / calc(var(--depth) * 0.1)) inset,
    0 8px 0 -4px oklch(100% 0 0 / calc(var(--depth) * 0.1)) inset,
    0 1px color-mix(in oklab, currentColor calc(var(--depth) * 10%), #0000),
    0 0 0 2rem var(--range-thumb) inset;
}
</style>
