export function setPausedControls(
  paused: boolean,
  controls: Pick<HTMLButtonElement, 'disabled'>[],
) {
  for (const control of controls) control.disabled = paused;
}
