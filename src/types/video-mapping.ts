/**
 * Type definitions for video mapping functionality
 */

/**
 * Video mapping interface for production use.
 * Maps video file names to base64 encoded video data.
 */
export interface VideoMapping {
  [fileName: string]: string
}
