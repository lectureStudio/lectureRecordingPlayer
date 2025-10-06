import type { ExecutableStateType } from '../utils/executable-state'
import { Property } from '../utils/property'

class PlaybackModel {
  private readonly _state = new Property<ExecutableStateType>()

  private readonly _selectedPageIndex = new Property<number>()

  private readonly _duration = new Property<number>()

  private readonly _time = new Property<number>()

  private readonly _volume = new Property<number>()

  private readonly _muted = new Property<boolean>()

  get selectedPageIndexProperty() {
    return this._selectedPageIndex
  }

  get selectedPageIndex(): number | undefined {
    return this._selectedPageIndex.value
  }

  set selectedPageIndex(index: number) {
    this._selectedPageIndex.value = index
  }

  get stateProperty() {
    return this._state
  }

  getState(): ExecutableStateType | undefined {
    return this._state.value
  }

  setState(state: ExecutableStateType): void {
    this._state.value = state
  }

  get durationProperty() {
    return this._duration
  }

  getDuration(): number | undefined {
    return this._duration.value
  }

  setDuration(duration: number): void {
    this._duration.value = duration
  }

  get timeProperty() {
    return this._time
  }

  getTime(): number | undefined {
    return this._time.value
  }

  setTime(time: number): void {
    this._time.value = time
  }

  get volumeProperty() {
    return this._volume
  }

  getVolume(): number | undefined {
    return this._volume.value
  }

  setVolume(volume: number): void {
    this._volume.value = volume
  }

  get mutedProperty() {
    return this._muted
  }

  getMuted(): boolean | undefined {
    return this._muted.value
  }

  setMuted(muted: boolean): void {
    this._muted.value = muted
  }
}

export { PlaybackModel }
