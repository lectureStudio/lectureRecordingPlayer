const ExecutableState = {
  Created: 'Created',
  Initializing: 'Initializing',
  Initialized: 'Initialized',
  Starting: 'Starting',
  Started: 'Started',
  Stopping: 'Stopping',
  Stopped: 'Stopped',
  Suspending: 'Suspending',
  Suspended: 'Suspended',
  Destroying: 'Destroying',
  Destroyed: 'Destroyed',
  Error: 'Error',
} as const

type ExecutableStateType = typeof ExecutableState[keyof typeof ExecutableState]

export { ExecutableState }
export type { ExecutableStateType }
