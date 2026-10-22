import {test} from 'node:test';
import assert from 'node:assert/strict';
import {exampleDesign, validateDesign, parsePoints} from './model.js';

test('example survives JSON export/import', () => {
  const design = exampleDesign();
  assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(design))), design);
});
test('rejects malformed or oversized imported designs', () => {
  for (const alter of [design => {design.shell.width = 0;}, design => {design.items[0].width = -1;}, design => {design.items[1].id = design.items[0].id;}, design => {design.items[3].points = [[0,0,0],[0,0,0]];}, design => {design.items[3].points = parsePoints('1,2,\n3,4,5');}, design => {design.items[0].color = 'red';}, design => {design.items = Array(301).fill(design.items[0]);}]) {
    const design = exampleDesign();
    alter(design);
    assert.throws(() => validateDesign(design));
  }
});
test('routes preserve coordinates and custom diameters', () => {
  const design = exampleDesign();
  design.items[3].points = parsePoints('1, 2, 3\n4, 5, 6\n4, 50, 6');
  design.items[3].diameter = 0.125;
  assert.deepEqual(validateDesign(design).items[3].points[2], [4,50,6]);
});
