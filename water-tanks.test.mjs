import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankDesign, upgradeDesign, validateDesign} from './model.js';
import {tankProduct, waterTankLayout} from './water-tank-plan.js';

test('four real-size tanks stay indoors, ahead of wheels and behind the entry', () => {
  const d = blankDesign().dimensions;
  const layout = waterTankLayout(d);
  assert.equal(layout.tanks.length, 4);
  assert.equal(new Set(layout.tanks.map(t => t.id)).size, 4);
  assert.equal(layout.aisleWidth, 45.5);
  const entryEnd = d.bodyFront + 6 + d.entryWidth;
  for (const tank of layout.tanks) {
    assert.equal(tank.width, 22.25); assert.equal(tank.length, 38.25); assert.equal(tank.height, 14.25);
    assert.equal(tank.y - d.floorHeight, 1);
    assert.ok(tank.y + tank.height < d.floorHeight + d.interiorHeight);
    assert.ok(tank.tray.x >= -d.interiorWidth / 2);
    assert.ok(tank.tray.x + tank.tray.width <= d.interiorWidth / 2);
    assert.ok(tank.tray.z > entryEnd + 8);
    assert.ok(tank.tray.z + tank.tray.length < layout.rearAxle - d.tireDiameter / 2);
    assert.ok(tank.tray.x <= tank.x && tank.tray.x + tank.tray.width >= tank.x + tank.width);
    assert.ok(tank.tray.z <= tank.z && tank.tray.z + tank.tray.length >= tank.z + tank.length);
  }
  for (let i = 0; i < layout.tanks.length; i++) for (let j = i + 1; j < layout.tanks.length; j++) {
    const a = layout.tanks[i].tray, b = layout.tanks[j].tray;
    assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.z + a.length <= b.z || b.z + b.length <= a.z);
  }
});

test('paired tank water loads balance laterally and totals match the selected package', () => {
  const layout = waterTankLayout(blankDesign().dimensions);
  for (const pair of ['forward', 'rearward']) {
    const [a, b] = layout.tanks.filter(t => t.pair === pair);
    assert.equal(a.z, b.z);
    assert.equal((a.x + a.width / 2) + (b.x + b.width / 2), 0);
  }
  assert.equal(layout.gallons, 200); assert.equal(layout.waterWeight, 1668);
  assert.equal(layout.subtotal, 1029.16);
  assert.equal(tankProduct.price, 257.29);
  assert.equal(tankProduct.url, 'https://www.amazon.com/dp/B0GHSZCHY2');
  assert.equal(tankProduct.package, 'Tank & 12 Volt Pump · 50 Gallon');
});

test('tank plan follows axle and floor edits without resizing the purchased tanks', () => {
  const d = blankDesign().dimensions;
  const before = waterTankLayout(d);
  const after = waterTankLayout({...d, floorHeight: d.floorHeight + 2, wheelbase: d.wheelbase + 10});
  before.tanks.forEach((tank, i) => {
    assert.equal(after.tanks[i].z - tank.z, 10); assert.equal(after.tanks[i].y - tank.y, 2);
    assert.equal(after.tanks[i].width, tank.width); assert.equal(after.tanks[i].length, tank.length);
  });
});

test('impossible layouts fail explicitly instead of overlapping or shrinking tanks', () => {
  const d = blankDesign().dimensions;
  for (const edits of [{interiorWidth: 70}, {wheelbase: 190}, {interiorHeight: 15}, {floorHeight: NaN}])
    assert.throws(() => waterTankLayout({...d, ...edits}), /water tank|water tanks/i);
});

test('old shell exports gain tanks while existing light and visibility settings survive', () => {
  const old = blankDesign(); delete old.waterTanks;
  old.visible.roof = false; old.cutaway = true; old.lighting.beams = true;
  const migrated = validateDesign(upgradeDesign(old));
  assert.equal(migrated.waterTanks.visible, true);
  assert.equal(migrated.visible.roof, false); assert.equal(migrated.cutaway, true);
  assert.equal(migrated.lighting.beams, true);
  migrated.waterTanks.visible = false;
  assert.equal(validateDesign(upgradeDesign(JSON.parse(JSON.stringify(migrated)))).waterTanks.visible, false);
  migrated.waterTanks.visible = 'false';
  assert.throws(() => validateDesign(migrated), /tank visibility/);
});
