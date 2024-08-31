export enum FocusTrapFeatures {
  /** No features enabled for the focus trap. */
  None = 0,

  /** Ensure that we move focus initially into the container. */
  InitialFocus = 1 << 0,

  /** Ensure that pressing `Tab` and `Shift+Tab` is trapped within the container. */
  TabLock = 1 << 1,

  /** Ensure that programmatically moving focus outside of the container is disallowed. */
  FocusLock = 1 << 2,

  /** Ensure that we restore the focus when unmounting the focus trap. */
  RestoreFocus = 1 << 3,

  /** Initial focus should look for the `data-autofocus` */
  AutoFocus = 1 << 4,
}
