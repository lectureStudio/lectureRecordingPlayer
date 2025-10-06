import { defineStore } from 'pinia'

export const useMediaControlsStore = defineStore('mediaControls', {
  state: () => ({
    volume: 100 as number, // 0..100
    playbackSpeed: 1.0 as number,
    muted: false as boolean,
    prevVolume: 100 as number, // To restore volume when unmuting
    currentTime: 0 as number, // In seconds
    totalTime: 0 as number, // In seconds
    playbackState: 'paused' as 'paused' | 'playing' | 'ended' | 'error',
    seeking: false as boolean,
  }),
  getters: {
    /**
     * Returns the effective volume, considering mute state.
     * If muted, returns 0; otherwise returns the current volume.
     *
     * @param state - The store state object.
     *
     * @returns Effective volume as a number.
     */
    effectiveVolume(state): number {
      return state.muted ? 0 : state.volume
    },
  },
  actions: {
    /**
     * Sets the volume to the specified value, clamped between 0 and 100.
     * Automatically unmutes when volume is changed and updates prevVolume for non-zero values.
     *
     * @param value - The desired volume level (0-100).
     */
    setVolume(value: number) {
      const v = Math.max(0, Math.min(100, Math.round(value)))
      // Unmute when user changes volume
      this.muted = false
      if (v > 0) {
        this.prevVolume = v
      }
      this.volume = v
    },
    /**
     * Toggles the mute state of the media player.
     * When unmuting, restores the previous volume if available, otherwise uses the current volume or defaults to 50.
     * When muting, saves the current volume (if > 0) and sets the muted state to true.
     */
    toggleMute() {
      if (this.muted) {
        // Unmute: restore previous non-zero volume if available; fallback to 50
        this.volume = this.prevVolume > 0 ? this.prevVolume : this.volume > 0 ? this.volume : 50
        this.muted = false
      }
      else {
        // Mute: remember the current volume if > 0, then set to 0
        if (this.volume > 0) {
          this.prevVolume = this.volume
        }
        this.muted = true
      }
    },
    /**
     * Sets the playback speed to the specified value, clamped between 0.25x and 4x.
     *
     * @param value - The desired playback speed multiplier.
     */
    setPlaybackSpeed(value: number) {
      // allow common speeds roughly between 0.25x and 2x
      this.playbackSpeed = Math.max(0.25, Math.min(2, Number(value)))
    },
    /**
     * Sets the seeking state to true, indicating that a seek operation is in progress.
     * Called when a user begins dragging the playback position slider.
     */
    startSeeking() {
      this.seeking = true
    },
    /**
     * Sets the seeking state to false, indicating that a seek operation has completed.
     * Called when a user releases the playback position slider after seeking.
     */
    stopSeeking() {
      this.seeking = false
    },
  },
})
