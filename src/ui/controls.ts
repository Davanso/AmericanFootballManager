import type { Input } from '../simulation/update';
import { PASS_TARGETS } from '../data/passTargets';
export function createControls(
  onSnap: () => void,
  onPass: (index: number) => void,
  onSwitch: () => void = () => {},
) {
  const keys = new Set<string>();
  function keydown(event: KeyboardEvent) {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest('input, textarea, select')) return;
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key))
      event.preventDefault();
    keys.add(key);
    if (event.repeat) return;
    if (key === ' ') onSnap();
    if (key === 'e') onSwitch();
    const target = PASS_TARGETS.findIndex((receiver) => receiver.key === key);
    if (target >= 0) onPass(target);
  }
  function keyup(event: KeyboardEvent) {
    keys.delete(event.key.toLowerCase());
  }
  function clear() {
    keys.clear();
  }
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  window.addEventListener('blur', clear);
  return {
    read(): Input {
      return {
        x:
          Number(keys.has('d') || keys.has('arrowright')) -
          Number(keys.has('a') || keys.has('arrowleft')),
        z:
          Number(keys.has('s') || keys.has('arrowdown')) -
          Number(keys.has('w') || keys.has('arrowup')),
      };
    },
    dispose() {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', clear);
    },
  };
}
