import { vi } from 'vitest';
export function mockCanvas() {
  const canvases: Array<{
    width: number;
    height: number;
    calls: Array<{ color: string; box: number[] }>;
  }> = [];
  vi.stubGlobal('document', {
    createElement: () => {
      const calls: Array<{ color: string; box: number[] }> = [];
      const ctx = {
        fillStyle: '',
        fillRect: (...box: number[]) => calls.push({ color: ctx.fillStyle, box }),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
      };
      const canvas = { width: 0, height: 0, calls, getContext: () => ctx };
      canvases.push(canvas);
      return canvas;
    },
  });
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
  return canvases;
}
