import * as THREE from 'three';
import {tankProduct, waterTankLayout} from './water-tank-plan.js?v=7';

export function buildInteriorWaterTanks(parent, design, selectedId) {
  const root = new THREE.Group(); root.name = 'interior-water-tanks'; parent.add(root);
  if (!design.waterTanks.visible) return;
  for (const [index, tank] of waterTankLayout(design.dimensions).tanks.entries()) {
    const selected = tank.id === selectedId;
    const add = (width, height, length, x, y, z, color) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, length),
        new THREE.MeshStandardMaterial({color, roughness: 0.75}));
      mesh.position.set(x + width / 2, y + height / 2, z + length / 2);
      mesh.userData.tankId = tank.id; root.add(mesh); return mesh;
    };
    const t = tank.tray;
    add(t.width, t.height, t.length, t.x, t.y, t.z, '#a48359');
    add(tank.width, t.padHeight, tank.length, tank.x, t.y + t.height, tank.z, '#485c60');
    const body = add(tank.width, tank.height, tank.length, tank.x, tank.y, tank.z,
      selected ? '#f2d18f' : '#f4f5e9');
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry),
      new THREE.LineBasicMaterial({color: selected ? '#b77b22' : '#809fa1'}));
    body.add(outline);
    // Full base and braced sides, never a tank suspended from straps.
    // Mounting geometry is schematic and does not establish a floor load rating.
    for (const x of [t.x, t.x + t.width - 0.5])
      add(0.5, 10, t.length, x, t.y + t.height, t.z, '#a48359');
    for (const z of [t.z, t.z + t.length - 0.5])
      add(t.width, 10, 0.5, t.x, t.y + t.height, z, '#a48359');
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = selected ? '#704b17' : '#28545e'; context.fillRect(0, 0, 512, 256);
    context.textAlign = 'center'; context.fillStyle = '#ffffff';
    context.font = 'bold 64px system-ui'; context.fillText(`TANK ${index + 1}`, 256, 90);
    context.font = '52px system-ui'; context.fillText('50 US GAL', 256, 167);
    context.font = '28px system-ui'; context.fillText('classAcustoms · T5000-P', 256, 220);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(15, 7.5),
      new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide}));
    label.rotation.x = -Math.PI / 2;
    label.position.set(tank.x + tank.width / 2, tank.y + tank.height + 0.02, tank.z + tank.length / 2);
    label.userData.tankId = tank.id; root.add(label);
  }
}

export function updateWaterTankUI(design, selectedId) {
  const element = id => document.getElementById(id);
  const layout = waterTankLayout(design.dimensions);
  const p = tankProduct;
  element('show-water-tanks').checked = design.waterTanks.visible;
  element('water-tank-summary').textContent = `4 × 50 US gal = ${layout.gallons} US gal · $${layout.subtotal.toFixed(2)} for four tank-and-pump packages, before tax/shipping · ${layout.waterWeight.toLocaleString()} lb water only. Center aisle: ${layout.aisleWidth.toFixed(1)} in between support trays.`;
  const select = element('water-tank-select');
  if (select.options.length !== 5) {
    const prompt = document.createElement('option'); prompt.value = ''; prompt.textContent = 'Click a tank or select here';
    select.replaceChildren(prompt, ...layout.tanks.map((tank, index) => {
      const option = document.createElement('option'); option.value = tank.id;
      option.textContent = `Tank ${index + 1} · ${tank.name}`; return option;
    }));
  }
  select.value = selectedId ?? '';
  const tank = layout.tanks.find(candidate => candidate.id === selectedId);
  element('tank-inspector').hidden = !tank;
  if (!tank) return;
  element('tank-title').textContent = tank.name;
  const facts = document.createElement('dl');
  const rows = [['Brand / model', `${p.brand} · ${p.model}`],
    ['Storage', `${p.gallons} US gallons per tank · 200 US gallons total`],
    ['Price each', `$${p.price.toFixed(2)} USD · tank + 12V pump package`],
    ['Four packages', `$${layout.subtotal.toFixed(2)} before tax/shipping`],
    ['Price checked', `${p.reviewed} · Amazon snapshot; prices may change`],
    ['Body size', `${p.length} L × ${p.width} W × ${p.height} H in, in the modeled low orientation`],
    ['Tolerance', `±${p.tolerance} in per body dimension; excludes fittings/pump`],
    ['Location', `${tank.z.toFixed(2)}–${(tank.z + tank.length).toFixed(2)} in behind front bumper; tank bottom ${(tank.y - design.dimensions.floorHeight).toFixed(2)} in above interior floor`],
    ['Water weight', `${(p.gallons * 8.34).toFixed(0)} lb per full tank; tank/hardware extra`]];
  for (const [label, value] of rows) {
    const term = document.createElement('dt'); term.textContent = label;
    const detail = document.createElement('dd'); detail.textContent = value; facts.append(term, detail);
  }
  const links = [['Open selected Amazon product', p.url], ['Manufacturer installation guidance', p.installationUrl]].map(([label, url]) => {
    const anchor = document.createElement('a'); anchor.textContent = label; anchor.href = url;
    anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; return anchor;
  });
  const note = document.createElement('p'); note.className = 'estimate';
  note.textContent = 'Tank body dimensions and package price are from your selected listing. Supports and placement are schematic: floor reinforcement, anchoring and axle loads need vehicle-specific verification. No plumbing, fitting positions or pump installation is modeled. Tank must be vented; do not pressurize or load its top.';
  element('tank-details').replaceChildren(links[0], facts, links[1], note);
}
