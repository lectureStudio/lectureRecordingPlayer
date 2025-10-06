import { TypedEvent } from './event-listener'
import type { Disposable, Listener } from './event-listener'
import { ExecutableState } from './executable-state'
import type { ExecutableStateType } from './executable-state'

abstract class Executable {
  protected readonly stateEvent = new TypedEvent<ExecutableStateType>()

  protected _state: ExecutableStateType = ExecutableState.Created

  protected _prevState: ExecutableStateType = ExecutableState.Created

  abstract init(): void

  abstract start(): void

  abstract stop(): void

  abstract suspend(): void

  abstract destroy(): void

  get state(): ExecutableStateType {
    return this._state
  }

  get previousState(): ExecutableStateType {
    return this._prevState
  }

  initialized(): boolean {
    return this._state === ExecutableState.Initialized
  }

  created(): boolean {
    return this._state === ExecutableState.Created
  }

  started(): boolean {
    return this._state === ExecutableState.Started
  }

  stopped(): boolean {
    return this._state === ExecutableState.Stopped
  }

  suspended(): boolean {
    return this._state === ExecutableState.Suspended
  }

  destroyed(): boolean {
    return this._state === ExecutableState.Destroyed
  }

  error(): boolean {
    return this._state === ExecutableState.Error
  }

  addStateListener(listener: Listener<ExecutableStateType>): Disposable {
    return this.stateEvent.subscribe(listener)
  }

  removeStateListener(listener: Listener<ExecutableStateType>): void {
    this.stateEvent.unsubscribe(listener)
  }

  protected fireStateChanged(): void {
    this.stateEvent.publish(this._state)
  }

  protected setState(state: ExecutableStateType): void {
    // console.log(`Setting state for ${this.constructor.name} to ${state}`);

    if (!this.validateNextState(state)) {
      throw new Error(`Invalid state transition for ${this.constructor.name}: [${this.state}] -> [${state}].`)
    }

    this._prevState = this._state
    this._state = state

    this.fireStateChanged()
  }

  private validateNextState(nextState: ExecutableStateType): boolean {
    switch (this._state) {
      case ExecutableState.Created:
        return this.isAllowed(nextState, ExecutableState.Initializing, ExecutableState.Destroying)

      case ExecutableState.Initializing:
        return this.isAllowed(nextState, ExecutableState.Initialized, ExecutableState.Error)

      case ExecutableState.Initialized:
        return this.isAllowed(nextState, ExecutableState.Starting, ExecutableState.Destroying)

      case ExecutableState.Starting:
        return this.isAllowed(nextState, ExecutableState.Started, ExecutableState.Error)

      case ExecutableState.Started:
        return this.isAllowed(
          nextState,
          ExecutableState.Suspending,
          ExecutableState.Stopping,
          ExecutableState.Destroying,
          ExecutableState.Error,
        )

      case ExecutableState.Stopping:
        return this.isAllowed(nextState, ExecutableState.Stopped, ExecutableState.Error)

      case ExecutableState.Stopped:
        return this.isAllowed(nextState, ExecutableState.Starting, ExecutableState.Destroying)

      case ExecutableState.Suspending:
        return this.isAllowed(nextState, ExecutableState.Suspended, ExecutableState.Error)

      case ExecutableState.Suspended:
        return this.isAllowed(nextState, ExecutableState.Starting, ExecutableState.Stopping, ExecutableState.Destroying)

      case ExecutableState.Destroying:
        return this.isAllowed(nextState, ExecutableState.Destroyed, ExecutableState.Error)

      case ExecutableState.Destroyed:
        return this.isAllowed(nextState, ExecutableState.Initializing)

      case ExecutableState.Error:
        // Allow to recover from previous operation failure.
        return this.isAllowed(nextState, ExecutableState.Starting, ExecutableState.Stopping, ExecutableState.Destroying)

      default:
        return false
    }
  }

  private isAllowed(nextState: ExecutableStateType, ...allowedStates: ExecutableStateType[]): boolean {
    if (!allowedStates) {
      throw new Error('No allowed states provided.')
    }

    for (const allowedState of allowedStates) {
      if (nextState == allowedState) {
        return true
      }
    }

    return false
  }
}

export { Executable }
