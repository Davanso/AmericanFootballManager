import { it, expect } from 'vitest';
import { setPausedControls } from '../../ui/pauseControls';
it('restores conversion, penalty and kicking actions after resuming', () => {
  const extraPoint = { disabled: false };
  const acceptPenalty = { disabled: false };
  const kick = { disabled: false };
  const actions = [extraPoint, acceptPenalty, kick];
  setPausedControls(true, actions);
  expect(actions.every((a) => a.disabled)).toBe(true);
  setPausedControls(false, actions);
  expect(actions.some((a) => a.disabled)).toBe(false);
});
