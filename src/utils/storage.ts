/**
 * Utility functions for storing and retrieving JSON data in localStorage
 */

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