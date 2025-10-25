<script setup lang="ts">
import RangeSlider from '@/components/RangeSlider.vue'
import { useDropdownState } from '@/composables/useDropdownState'
import { useMediaControlsStore } from '@/stores/mediaControls'
import { computed } from 'vue'

const media = useMediaControlsStore()

// Dropdown state management
const { dropdownRef, handleDropdownToggle, exposedState } = useDropdownState()

// Expose dropdown state and functions to the parent
defineExpose({
  ...exposedState,
  toggleMute,
})

const volume = computed<number>({
  get: () => media.volume,
  set: (val: number) => media.setVolume(val),
})

const iconName = computed(() => {
  const v = Math.max(0, Math.min(100, media.effectiveVolume ?? 0))
  if (v === 0) {
    return 'speaker-mute' as const
  }
  if (v <= 25) {
    return 'speaker-low' as const
  }
  if (v <= 65) {
    return 'speaker-medium' as const
  }
  return 'speaker-high' as const
})

function toggleMute() {
  media.toggleMute()
}

function handleDropdownFocus() {
  handleDropdownToggle(true)
}

function handleDropdownBlur() {
  handleDropdownToggle(false)
}

function handleContentFocus() {
  handleDropdownToggle(true)
}

function handleContentBlur() {
  handleDropdownToggle(false)
}
</script>

<template>
  <div
    ref="dropdownRef"
    class="hidden md:inline-block dropdown dropdown-top dropdown-start"
  >
    <div
      tabindex="0"
      role="button"
      class="btn btn-ghost w-10 h-10 p-0"
      @focus="handleDropdownFocus"
      @blur="handleDropdownBlur"
    >
      <AppIcon :name="iconName" class="w-6" />
    </div>
    <div
      tabindex="0"
      class="dropdown-content bg-slate-50/30 dark:bg-slate-700/30 backdrop-blur-sm dark:backdrop-blur-lg rounded-box z-1 p-1 shadow-sm w-56"
      @focus="handleContentFocus"
      @blur="handleContentBlur"
      @mouseenter="handleContentFocus"
      @mouseleave="handleContentBlur"
    >
      <div
        class="px-1 py-2 flex items-center justify-center gap-3"
        @mouseenter="handleContentFocus"
      >
        <AppTooltip :content="media.muted ? 'Unmute' : 'Mute'">
          <button
            class="btn btn-ghost w-8 h-8 p-0"
            @click.stop="toggleMute"
          >
            <AppIcon :name="iconName" class="w-5 opacity-90" />
          </button>
        </AppTooltip>
        <RangeSlider
          :min="0"
          :max="100"
          v-model="volume"
          :show-tooltip-on-click="false"
        />
        <span class="text-xs tabular-nums w-7 text-right">{{
          Math.round(volume)
        }}</span>
      </div>
    </div>
  </div>
</template>
