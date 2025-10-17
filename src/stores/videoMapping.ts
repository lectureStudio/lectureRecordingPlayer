import type { VideoMapping } from '@/types/video-mapping'
import { parseVideoMapping } from '@/utils/storage'
import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

/**
 * Store for managing video mapping data in production mode.
 * Maps video file names to base64 encoded video data.
 */
export const useVideoMappingStore = defineStore('videoMapping', () => {
  /** The parsed video mapping data */
  const videoMapping = ref<VideoMapping | null>(null)

  /**
   * Sets the video mapping from a JSON string.
   *
   * @param videoMappingJson - JSON string containing video mapping.
   */
  function setVideoMapping(videoMappingJson: string): void {
    videoMapping.value = parseVideoMapping(videoMappingJson)
  }

  /**
   * Gets the video mapping data.
   *
   * @returns The parsed video mapping or null if not available.
   */
  function getVideoMapping(): VideoMapping | null {
    return videoMapping.value
  }

  /**
   * Checks if video mapping is available.
   *
   * @returns True if video mapping is available, false otherwise.
   */
  function hasVideoMapping(): boolean {
    return videoMapping.value !== null
  }

  /**
   * Gets base64 data for a specific video file.
   *
   * @param fileName - The video file name.
   *
   * @returns Base64 data for the video or null if not found.
   */
  function getVideoData(fileName: string): string | null {
    return videoMapping.value?.[fileName] ?? null
  }

  /**
   * Clears the video mapping data.
   */
  function clearVideoMapping(): void {
    videoMapping.value = null
  }

  return {
    videoMapping: readonly(videoMapping),
    setVideoMapping,
    getVideoMapping,
    hasVideoMapping,
    getVideoData,
    clearVideoMapping,
  }
})
