import { useMediaControlsStore } from '@/stores/mediaControls'

/**
 * VideoRenderSurface manages video playback and synchronization with the media controls store.
 * It handles video loading, playback state, and time synchronization.
 */
class VideoRenderSurface {
  /** The HTML video element used for playback */
  private readonly video: HTMLVideoElement

  /** Current video file name */
  private currentFileName: string | null = null

  /** Start timestamp for video synchronization */
  private startTimestamp: number = 0

  /** Video offset in milliseconds */
  private videoOffset: number = 0

  /** Video length in milliseconds */
  private videoLength: number = 0

  /** Whether the video is currently playing */
  private isPlaying: boolean = false

  /** Media controls store for time synchronization */
  private mediaStore = useMediaControlsStore()

  /** Callback to notify when video should be hidden */
  private onVideoShouldHide?: () => void

  /** Callback to notify when video should be shown */
  private onVideoShouldShow?: () => void

  /** Whether the video is currently visible */
  private isVideoVisible: boolean = false

  /** Flag to prevent cyclic updates during seeking */
  private isSeeking: boolean = false

  /**
   * Creates a new video render surface associated with the given video element.
   *
   * @param video - The HTML video element to control.
   * @param onVideoShouldHide - Optional callback when video should be hidden
   * @param onVideoShouldShow - Optional callback when video should be shown
   */
  constructor(video: HTMLVideoElement, onVideoShouldHide?: () => void, onVideoShouldShow?: () => void) {
    this.video = video
    this.onVideoShouldHide = onVideoShouldHide
    this.onVideoShouldShow = onVideoShouldShow
    this.setupVideoEventListeners()
  }

  /**
   * Sets up event listeners for video synchronization and state management.
   */
  private setupVideoEventListeners(): void {
    // Disable audio tracks
    this.video.muted = true
    this.video.volume = 0

    // Sync video time with media store when seeking
    this.video.addEventListener('seeking', () => {
      this.syncVideoTimeToMediaStore()
    })

    // Update media store when video time changes
    this.video.addEventListener('timeupdate', () => {
      this.syncVideoTimeToMediaStore()
    })

    // Handle video end
    this.video.addEventListener('ended', () => {
      this.isPlaying = false
    })

    // Handle video errors
    this.video.addEventListener('error', (e) => {
      console.error('Video playback error:', e)
      this.isPlaying = false
    })

    // Handle video load
    this.video.addEventListener('loadedmetadata', () => {
      // Set initial time to video offset when metadata is loaded
      if (this.videoOffset > 0) {
        this.video.currentTime = this.videoOffset / 1000
      }
    })
  }

  /**
   * Loads and prepares a video for playback.
   *
   * @param fileName - The name of the video file (without path)
   * @param startTimestamp - When the video should start playing (in ms)
   * @param videoOffset - Offset within the video to start from (in ms)
   * @param videoLength - Length of the video segment to play (in ms)
   * @param contentWidth - Width of the video content
   * @param contentHeight - Height of the video content
   */
  loadVideo(
    fileName: string,
    startTimestamp: number,
    videoOffset: number,
    videoLength: number,
    contentWidth: number,
    contentHeight: number,
  ): void {
    // Only reload video if it's a different file or not already loaded
    const needsReload = this.currentFileName !== fileName || this.video.src === ''

    this.currentFileName = fileName
    this.startTimestamp = startTimestamp
    this.videoOffset = videoOffset
    this.videoLength = videoLength

    if (needsReload) {
      // Set video source only if needed
      this.video.src = `/${fileName}`

      // Update video dimensions and initial time
      this.video.style.width = `${contentWidth}px`
      this.video.style.height = `${contentHeight}px`
      this.video.currentTime = this.videoOffset / 1000 // Convert ms to seconds
    }
  }

  /**
   * Starts video playback if conditions are met.
   */
  play(): void {
    if (!this.currentFileName || this.isPlaying) {
      return
    }

    this.isPlaying = true
    this.video.play().catch((error) => {
      console.error('Failed to play video:', error)
      this.isPlaying = false
    })
  }

  /**
   * Pauses video playback.
   */
  pause(): void {
    if (!this.isPlaying) {
      return
    }

    this.isPlaying = false
    this.video.pause()
  }

  /**
   * Stops video playback and resets to beginning.
   */
  stop(): void {
    this.isPlaying = false
    this.video.pause()
    this.video.currentTime = this.videoOffset / 1000
  }

  /**
   * Seeks the video to a specific time based on the media store's current time.
   * During seeking operations: updates video time and visibility
   * During normal playback: only updates visibility (show/hide video)
   */
  seekToMediaTime(): void {
    if (!this.currentFileName) {
      return
    }

    const mediaTime = this.mediaStore.currentTime || 0
    const relativeTime = mediaTime - this.startTimestamp

    if (relativeTime >= 0 && relativeTime <= this.videoLength) {
      // We're in a video section - show the video if not already visible
      if (!this.isVideoVisible) {
        this.show()
        this.isVideoVisible = true
        if (this.onVideoShouldShow) {
          this.onVideoShouldShow()
        }
      }
      
      // Only update video time during seeking operations to prevent cyclic dependency
      if (this.mediaStore.seeking && !this.isSeeking) {
        this.isSeeking = true
        
        const videoTime = (this.videoOffset + relativeTime) / 1000 // Convert ms to seconds

        // Only update video time if it's significantly different to avoid unnecessary seeking
        const currentVideoTime = this.video.currentTime
        if (Math.abs(currentVideoTime - videoTime) > 0.1) { // 100ms threshold
          this.video.currentTime = videoTime
        }

        // Reset seeking flag after a short delay to allow video to update
        setTimeout(() => {
          this.isSeeking = false
        }, 50)
      }
    } else {
      // Current time is outside the video section, hide the video and show slides
      if (this.isVideoVisible) {
        this.hide()
        this.isVideoVisible = false
        this.pause() // Pause the video to prevent timeupdate events
        if (this.onVideoShouldHide) {
          this.onVideoShouldHide()
        }
      }
    }
  }

  /**
   * Updates video playback state based on media store playback state.
   */
  updatePlaybackState(): void {
    if (!this.currentFileName) {
      return
    }

    switch (this.mediaStore.playbackState) {
      case 'playing':
        if (!this.isPlaying) {
          this.play()
        }
        break
      case 'paused':
        if (this.isPlaying) {
          this.pause()
        }
        break
      case 'ended':
        this.stop()
        break
      case 'error':
        this.pause()
        break
    }
  }

  /**
   * Synchronizes the video's current time with the media store.
   * This should only be called during seeking operations to prevent cyclic dependency.
   */
  private syncVideoTimeToMediaStore(): void {
    if (!this.currentFileName || !this.isPlaying || this.isSeeking) {
      return
    }

    // Only sync video time if we're currently in a video section
    const mediaTime = this.mediaStore.currentTime || 0
    const relativeTime = mediaTime - this.startTimestamp
    
    if (relativeTime < 0 || relativeTime > this.videoLength) {
      // We're outside the video section, don't sync video time back to media store
      return
    }

    const videoTimeMs = this.video.currentTime * 1000 // Convert seconds to ms
    const videoRelativeTime = videoTimeMs - this.videoOffset
    const calculatedMediaTime = this.startTimestamp + videoRelativeTime

    // Only update media store time during seeking operations to prevent cyclic dependency
    // During normal playback, the media store should be the source of truth
    if (this.mediaStore.seeking && Math.abs(mediaTime - calculatedMediaTime) > 100) {
      this.mediaStore.currentTime = calculatedMediaTime
    }
  }

  /**
   * Shows the video element.
   */
  show(): void {
    this.video.style.display = 'block'
    this.isVideoVisible = true
  }

  /**
   * Hides the video element.
   */
  hide(): void {
    this.video.style.display = 'none'
    this.isVideoVisible = false
  }

  /**
   * Gets the video element.
   *
   * @returns The HTML video element.
   */
  getVideoElement(): HTMLVideoElement {
    return this.video
  }

  /**
   * Checks if a video is currently loaded.
   *
   * @returns True if a video is loaded, false otherwise.
   */
  hasVideo(): boolean {
    return this.currentFileName !== null
  }

  /**
   * Checks if the video is currently playing.
   *
   * @returns True if the video is playing, false otherwise.
   */
  isVideoPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Clears the current video and resets state.
   */
  clear(): void {
    this.currentFileName = null
    this.startTimestamp = 0
    this.videoOffset = 0
    this.videoLength = 0
    this.isPlaying = false
    this.isVideoVisible = false
    this.isSeeking = false
    this.video.src = ''
    this.video.currentTime = 0
    this.hide()
  }

  /**
   * Destroys the video surface and cleans up resources.
   */
  destroy(): void {
    this.clear()
    // Remove event listeners if needed
  }
}

export { VideoRenderSurface }
