import fullscreenMaximize from '@fluentui/svg-icons/icons/arrow_maximize_top_left_bottom_right_24_regular.svg?raw'
import fullscreenMinimize from '@fluentui/svg-icons/icons/arrow_minimize_top_left_bottom_right_24_regular.svg?raw'
import playbackSpeed from '@fluentui/svg-icons/icons/arrow_rotate_clockwise_24_regular.svg?raw'
import searchNext from '@fluentui/svg-icons/icons/chevron_down_24_regular.svg?raw'
import searchPrev from '@fluentui/svg-icons/icons/chevron_up_24_regular.svg?raw'
import dismiss from '@fluentui/svg-icons/icons/dismiss_24_filled.svg?raw'
import keyboard from '@fluentui/svg-icons/icons/keyboard_24_regular.svg?raw'
import navigation from '@fluentui/svg-icons/icons/navigation_24_filled.svg?raw'
import next from '@fluentui/svg-icons/icons/next_24_regular.svg?raw'
import sidebarLeft from '@fluentui/svg-icons/icons/panel_left_24_regular.svg?raw'
import sidebarRight from '@fluentui/svg-icons/icons/panel_right_24_regular.svg?raw'
import pause from '@fluentui/svg-icons/icons/pause_24_regular.svg?raw'
import play from '@fluentui/svg-icons/icons/play_24_regular.svg?raw'
import previous from '@fluentui/svg-icons/icons/previous_24_regular.svg?raw'
import sidebarNone from '@fluentui/svg-icons/icons/rectangle_landscape_24_regular.svg?raw'
import search from '@fluentui/svg-icons/icons/search_24_filled.svg?raw'
import sidebarSettings from '@fluentui/svg-icons/icons/slide_settings_24_regular.svg?raw'
import speakerLow from '@fluentui/svg-icons/icons/speaker_0_24_regular.svg?raw'
import speakerMedium from '@fluentui/svg-icons/icons/speaker_1_24_regular.svg?raw'
import speakerHigh from '@fluentui/svg-icons/icons/speaker_2_24_regular.svg?raw'
import speakerMute from '@fluentui/svg-icons/icons/speaker_mute_24_regular.svg?raw'
import darkMode from '@fluentui/svg-icons/icons/weather_moon_24_regular.svg?raw'
import lightMode from '@fluentui/svg-icons/icons/weather_sunny_24_regular.svg?raw'

/**
 * Map of all Fluent UI icons used in the application.
 * Each icon is imported as raw SVG content and can be rendered via v-html.
 */
export const fluentIconMap = {
  'dark-mode': darkMode,
  'light-mode': lightMode,
  'dismiss': dismiss,
  'navigation': navigation,
  'next': next,
  'previous': previous,
  'pause': pause,
  'play': play,
  'fullscreen-maximize': fullscreenMaximize,
  'fullscreen-minimize': fullscreenMinimize,
  'playback-speed': playbackSpeed,
  'search': search,
  'search-prev': searchPrev,
  'search-next': searchNext,
  'sidebar-settings': sidebarSettings,
  'sidebar-left': sidebarLeft,
  'sidebar-right': sidebarRight,
  'sidebar-none': sidebarNone,
  'speaker-mute': speakerMute,
  'speaker-low': speakerLow,
  'speaker-medium': speakerMedium,
  'speaker-high': speakerHigh,
  'keyboard': keyboard,
}

/**
 * Type definition for valid Fluent icon names.
 * Ensures type safety when using icons in components.
 */
export type FluentIconName = keyof typeof fluentIconMap
