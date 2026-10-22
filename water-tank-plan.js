// Exact selected Amazon variant, reviewed in the browser on this date.
// Dimensions describe the tank body; the included pump and fittings are separate.
export const tankProduct = Object.freeze({
  brand: 'classAcustoms', model: 'T5000-P', asin: 'B0GHSZCHY2',
  name: '50-gallon fresh water tank & 12-volt pump',
  url: 'https://www.amazon.com/dp/B0GHSZCHY2',
  installationUrl: 'https://www.classacustoms.com/Water-Tank-Helps_ep_41.html',
  reviewed: '2026-10-22', price: 257.29, currency: 'USD', gallons: 50,
  length: 38.25, width: 22.25, height: 14.25, tolerance: 0.25,
  material: 'White medium-density polyethylene',
  package: 'Tank & 12 Volt Pump · 50 Gallon',
});

export const defaultWaterTanks = () => ({visible: true});

export function waterTankLayout(d) {
  const required = ['interiorWidth', 'interiorHeight', 'floorHeight', 'bodyFront',
    'entryWidth', 'frontOverhang', 'wheelbase', 'tireDiameter', 'length'];
  if (required.some(key => !Number.isFinite(d?.[key]) || d[key] <= 0))
    throw new Error('Water tank layout requires positive finite vehicle dimensions.');
  const p = tankProduct;
  // One-inch perimeter allowance includes dimensional tolerance and bracing.
  // These clearances are design allowances, not manufacturer fitting locations.
  const trayWidth = p.width + 2;
  const trayLength = p.length + 2;
  const wallGap = 2;
  const trayHeight = 0.75;
  const padHeight = 0.25;
  const serviceGap = 8;
  const rearAxle = d.frontOverhang + d.wheelbase;
  const rearEnd = rearAxle - d.tireDiameter / 2 - 8;
  const frontStart = rearEnd - trayLength * 2 - serviceGap;
  const entryEnd = d.bodyFront + 6 + d.entryWidth;
  const aisleWidth = d.interiorWidth - 2 * (wallGap + trayWidth);
  if (aisleWidth < 30 || frontStart < Math.max(entryEnd + 8, d.frontOverhang + 8) ||
      rearEnd > d.length - 4 || trayHeight + padHeight + p.height + 2 > d.interiorHeight)
    throw new Error('Four fixed-size water tanks need more room: retain a 30-inch aisle, entry clearance and space ahead of the rear wheels.');
  const tanks = [];
  for (const [side, sign] of [['left', -1], ['right', 1]]) {
    const trayX = sign < 0 ? -d.interiorWidth / 2 + wallGap :
      d.interiorWidth / 2 - wallGap - trayWidth;
    for (const [index, pair] of ['forward', 'rearward'].entries()) {
      const trayZ = frontStart + index * (trayLength + serviceGap);
      tanks.push({id: `water-${side}-${pair}`, name: `${side === 'left' ? 'Driver' : 'Passenger'} side · ${pair} tank`,
        side, pair, x: trayX + 1, y: d.floorHeight + trayHeight + padHeight, z: trayZ + 1,
        width: p.width, height: p.height, length: p.length,
        tray: {x: trayX, y: d.floorHeight, z: trayZ, width: trayWidth,
          length: trayLength, height: trayHeight, padHeight}});
    }
  }
  return {tanks, aisleWidth, serviceGap, rearAxle,
    center: [0, d.floorHeight + 1 + p.height / 2, (frontStart + rearEnd) / 2],
    gallons: p.gallons * tanks.length,
    // Sum cents so the four-package subtotal is stable in both UI and documentation.
    subtotal: Math.round(p.price * 100) * tanks.length / 100,
    waterWeight: p.gallons * tanks.length * 8.34};
}
