/**
 * Utility functions for storing and retrieving JSON data in localStorage
 */

import type { Recording } from '@/api/model/recording'
import type { VideoMapping } from '@/types/video-mapping'
import type { TypedArray } from 'pdfjs-dist/types/src/display/api'

/**
 * Saves a value as JSON string in localStorage.
 *
 * @param {string} key - The key to store the value under.
 * @param {unknown} value - The value to stringify and save.
 */
export function saveJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * Loads and parses a JSON string from localStorage.
 *
 * @param {string} key - The key to retrieve the value from.
 *
 * @returns {unknown|null} Parsed JSON value or null if key doesn't exist.
 */
export function loadJSON(key: string): unknown | null {
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

/**
 * Fetches a resource from a base64 encoded data URL.
 *
 * @param {string} b64Data - The base64 encoded data.
 * @param {string} [mimeType='application/octet-stream'] - The MIME type of the data. Defaults to 'application/octet-stream'.
 *
 * @returns {Promise<Response>} A Promise that resolves to the Response to that request.
 */
export async function fetchBase64(b64Data: string, mimeType: string = 'application/octet-stream') {
  return fetch(`data:${mimeType};base64,${b64Data}`)
}

/**
 * Processes recording data from a response and updates the provided stores.
 *
 * @param {Response} response - The response containing the recording data.
 * @param {string} filename - The filename for the recording.
 * @param {Function} loadRecording - Function to load recording from file.
 * @param {Object} stores - Object containing the stores to update.
 * @param {Object} stores.mediaStore - Media controls store.
 * @param {Object} stores.recordingStore - Recording store.
 * @param {Object} stores.pdfStore - PDF store.
 *
 * @returns {Promise<void>} A Promise that resolves when the recording is processed.
 */
export async function processRecording(
  response: Response,
  filename: string,
  loadRecording: (file: File) => Promise<Recording>,
  stores: {
    mediaStore: { totalTime: number }
    recordingStore: { setRecording: (recording: Recording) => void }
    pdfStore: { load: (src: string | URL | TypedArray | ArrayBuffer) => void }
  },
): Promise<void> {
  if (!response.ok) {
    throw new Error(`Failed to fetch recording: ${response.status} ${response.statusText}`)
  }

  const blob = await response.blob()
  if (blob.size === 0) {
    throw new Error('Recording is empty')
  }

  const file = new File([blob], filename, {
    type: blob.type || 'application/octet-stream',
  })

  const recording = await loadRecording(file)

  if (!recording.document) {
    throw new Error('Recording does not contain a document')
  }

  stores.mediaStore.totalTime = recording.duration!
  stores.recordingStore.setRecording(recording)
  void stores.pdfStore.load(recording.document)
}

/**
 * Loads a recording with fallback logic - tries base64 first, then falls back to a file URL.
 *
 * @param {string} base64Recording - The base64 encoded recording data.
 * @param {string} fallbackUrl - The fallback URL to try if base64 fails.
 * @param {Function} loadRecording - Function to load recording from file.
 * @param {Object} stores - Object containing the stores to update.
 *
 * @returns {Promise<void>} A Promise that resolves when the recording is loaded.
 */
export async function loadRecordingWithFallback(
  base64Recording: string,
  fallbackUrl: string,
  loadRecording: (file: File) => Promise<Recording>,
  stores: {
    mediaStore: { totalTime: number }
    recordingStore: { setRecording: (recording: Recording) => void }
    pdfStore: { load: (src: string | URL | TypedArray | ArrayBuffer) => void }
  },
): Promise<void> {
  const processRecordingWrapper = (response: Response, filename: string) =>
    processRecording(response, filename, loadRecording, stores)

  try {
    // Try fetchBase64 first
    const base64Response = await fetchBase64(base64Recording)
    await processRecordingWrapper(base64Response, 'embedded.plr')
  }
  catch (base64Error) {
    console.warn(`Failed to load recording from base64, falling back to ${fallbackUrl}:`, base64Error)

    try {
      const fallbackResponse = await fetch(fallbackUrl)
      await processRecordingWrapper(fallbackResponse, 'dev.plr')
    }
    catch (fallbackError) {
      console.error(`Failed to load recording from both base64 and fallback:`, fallbackError)
      throw fallbackError
    }
  }
}

/**
 * Parses video mapping from JSON string.
 *
 * @param videoMappingJson - JSON string containing video mapping.
 *
 * @returns Parsed video mapping object or null if invalid.
 */
export function parseVideoMapping(videoMappingJson: string): VideoMapping | null {
  try {
    // Check if it's the placeholder (development mode)
    if (videoMappingJson.startsWith('#') || videoMappingJson === '') {
      return null
    }

    const parsed = JSON.parse(videoMappingJson)
    return parsed as VideoMapping
  }
  catch (error) {
    console.warn('Failed to parse video mapping:', error)
    return null
  }
}
