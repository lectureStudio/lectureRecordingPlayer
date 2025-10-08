<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import type { SidebarPosition } from '@schemas/settings'
import { computed } from 'vue'

const settings = useSettingsStore()
const position = computed<SidebarPosition>({
  get: () => settings.sidebarPosition ?? 'right',
  set: (val) => {
    settings.sidebarPosition = val
    settings.persist()
  },
})
</script>

<template>
  <div class="dropdown dropdown-top dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost m-1 w-10 h-10 p-0">
      <AppIcon name="sidebar-settings" class="w-6" />
    </div>
    <ul
      tabindex="0"
      class="dropdown-content menu bg-slate-300/30 dark:bg-slate-700/30 backdrop-blur-sm dark:backdrop-blur-lg rounded-box z-1 w-40 p-2 shadow-sm"
    >
      <li>
        <a
          :class="{ active: position === 'right' }"
          @click.prevent="position = 'right'"
        >
          <input
            type="radio"
            name="sidebarPosition"
            class="radio radio-xs"
            v-model="position"
            value="right"
          />
          Right
          <AppIcon name="sidebar-right" class="w-6" />
        </a>
      </li>
      <li>
        <a
          :class="{ active: position === 'left' }"
          @click.prevent="position = 'left'"
        >
          <input
            type="radio"
            name="sidebarPosition"
            class="radio radio-xs"
            v-model="position"
            value="left"
          />
          Left
          <AppIcon name="sidebar-left" class="w-6" />
        </a>
      </li>
      <li>
        <a
          :class="{ active: position === 'none' }"
          @click.prevent="position = 'none'"
        >
          <input
            type="radio"
            name="sidebarPosition"
            class="radio radio-xs"
            v-model="position"
            value="none"
          />
          None
          <AppIcon name="sidebar-none" class="w-6" />
        </a>
      </li>
    </ul>
  </div>
</template>
