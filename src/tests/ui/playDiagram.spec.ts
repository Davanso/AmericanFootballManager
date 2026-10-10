import { expect, it } from 'vitest';
import { playDiagram } from '../../ui/playDiagram';
it('draws the RB handoff and running lane without displaying passing routes', () => {
  const diagram = playDiagram('run');
  expect(diagram).toContain('Corrida pelo meio');
  expect(diagram).toContain('Entrega ao RB');
  expect(diagram.match(/<polyline/g)).toHaveLength(1);
  expect(diagram).toContain('#b7ef8c');
  expect(diagram).toContain('>RB</text>');
});
