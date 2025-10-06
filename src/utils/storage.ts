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
