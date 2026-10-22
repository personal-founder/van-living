import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { exampleDesign, validateDesign, layerNames, routeKinds, boxKeys, parsePoints } from './model.js';

const element = id => document.getElementById(id);
const storageKey = 'van-living-design-v1';
let design = exampleDesign();
let startupMessage = 'Example design loaded. Enter your actual measurements.';
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) { design = validateDesign(JSON.parse(saved)); startupMessage = 'Restored your saved browser design.'; }
} catch { startupMessage = 'Saved design unavailable. Example loaded; export to keep a backup.'; }
let selectedId = design.items[0]?.id;
let view = 'perspective';
const viewport = element('viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#dce2df');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
viewport.append(renderer.domElement);
renderer.domElement.setAttribute('aria-label', 'Rotatable 3D van layout');
scene.add(new THREE.HemisphereLight(0xffffff, 0x71827c, 2.6));
const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(100, 200, 100);
scene.add(sunlight);
const perspective = new THREE.PerspectiveCamera(42, 1, 0.1, 5000);
const orthographic = new THREE.OrthographicCamera(-200, 200, 200, -200, 0.1, 5000);
let camera = perspective;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.addEventListener('change', render);
let geometryGroup = new THREE.Group();
scene.add(geometryGroup);
const selection = element('selection');
const itemForm = element('item-form');
const status = message => { element('status').textContent = message; };
function render() { renderer.render(scene, camera); }
function resize() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  renderer.setSize(width, height);
  perspective.aspect = width / height;
  perspective.updateProjectionMatrix();
  const span = Math.max(design.shell.length, design.shell.width, design.shell.height) * 0.7;
  const aspect = width / height;
  orthographic.left = -span * Math.max(1, aspect);
  orthographic.right = span * Math.max(1, aspect);
  orthographic.top = span * Math.max(1, 1 / aspect);
  orthographic.bottom = -span * Math.max(1, 1 / aspect);
  orthographic.updateProjectionMatrix();
  render();
}
function setView(nextView) {
  view = nextView;
  camera = view === 'perspective' ? perspective : orthographic;
  controls.object = camera;
  controls.enableRotate = view === 'perspective';
  const {width, height, length} = design.shell;
  const center = new THREE.Vector3(width / 2, height / 2, length / 2);
  const distance = Math.max(width, height, length) * 2.1;
  camera.up.set(0, 1, 0);
  const offsets = {perspective:[1, 0.75, 1], top:[0, 1, 0], side:[1, 0, 0], rear:[0, 0, -1]};
  if (view === 'top') camera.up.set(0, 0, 1);
  camera.position.copy(center).add(new THREE.Vector3(...offsets[view]).multiplyScalar(distance));
  camera.zoom = 1;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  resize();
}
function material(color) { return new THREE.MeshStandardMaterial({color, roughness:0.85}); }
function addBox(width, height, depth, x, y, z, color, id) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color));
  mesh.position.set(x + width / 2, y + height / 2, z + depth / 2);
  mesh.userData.itemId = id;
  geometryGroup.add(mesh);
  if (id && id === selectedId) {
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({color:0x372304}));
    mesh.add(outline);
  }
}
function rebuild() {
  geometryGroup.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
  scene.remove(geometryGroup);
  geometryGroup = new THREE.Group();
  scene.add(geometryGroup);
  const {width, height, length} = design.shell;
  if (design.visible.floor) addBox(width, 1, length, 0, -1, 0, '#aeb9ad');
  let offset = 0;
  for (const [key, color] of [['lining','#ddcaaa'],['insulation','#e8bd71'],['skin','#7c9297']]) {
    const thickness = design.walls[key];
    if (design.visible[key]) {
      addBox(thickness, height, length, -offset - thickness, 0, 0, color);
      addBox(thickness, height, length, width + offset, 0, 0, color);
    }
    offset += thickness;
  }
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, length)), new THREE.LineBasicMaterial({color:0x728780}));
  edges.position.set(width / 2, height / 2, length / 2);
  geometryGroup.add(edges);
  const grid = new THREE.GridHelper(Math.ceil(Math.max(length, width) / 12) * 12, Math.ceil(Math.max(length, width) / 12), 0x81918b, 0xb2bdb6);
  grid.position.set(width / 2, -1.1, length / 2);
  geometryGroup.add(grid);
  for (const item of design.items) {
    if (!design.visible[item.kind]) continue;
    if (!routeKinds.includes(item.kind)) {
      addBox(item.width, item.height, item.depth, item.x, item.y, item.z, item.color, item.id);
    } else {
      for (let index = 1; index < item.points.length; index++) {
        const start = new THREE.Vector3(...item.points[index - 1]);
        const end = new THREE.Vector3(...item.points[index]);
        const direction = end.clone().sub(start);
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(item.diameter / 2, item.diameter / 2, direction.length(), 8), material(item.color));
        mesh.position.copy(start).add(end).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        mesh.userData.itemId = item.id;
        geometryGroup.add(mesh);
      }
    }
  }
  render();
}
function save(message) {
  let result = message;
  try { localStorage.setItem(storageKey, JSON.stringify(design)); }
  catch { result += ' Browser save failed; export a backup.'; }
  status(result);
}
function updateEditor() {
  const item = design.items.find(candidate => candidate.id === selectedId);
  selection.replaceChildren(...design.items.map(candidate => new Option(candidate.name, candidate.id)));
  selection.value = item?.id ?? '';
  itemForm.hidden = !item;
  if (!item) return;
  itemForm.elements.name.value = item.name;
  itemForm.elements.color.value = item.color;
  const isRoute = routeKinds.includes(item.kind);
  element('route-fields').hidden = !isRoute;
  element('box-fields').hidden = isRoute;
  if (isRoute) {
    itemForm.elements.points.value = item.points.map(point => point.join(', ')).join('\n');
    itemForm.elements.diameter.value = item.diameter;
  } else boxKeys.forEach(key => { itemForm.elements[key].value = item[key]; });
}
function refresh() {
  for (const key of ['length','width','height']) element('shell-form').elements.namedItem(key).value = design.shell[key];
  for (const key of ['skin','insulation','lining']) element('wall-form').elements[key].value = design.walls[key];
  element('layers').replaceChildren(...Object.entries(layerNames).map(([key, name]) => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = design.visible[key];
    checkbox.addEventListener('change', () => { design.visible[key] = checkbox.checked; rebuild(); save('Layer visibility saved.'); });
    label.append(checkbox, document.createTextNode(name));
    return label;
  }));
  updateEditor();
  rebuild();
}
for (const key of boxKeys) {
  const label = document.createElement('label');
  label.textContent = key.toUpperCase();
  const input = document.createElement('input');
  Object.assign(input, {type:'number', name:key, min:['x','y','z'].includes(key) ? '-600' : '0.125', max:'600', step:'0.125'});
  label.append(input);
  element('box-fields').append(label);
}
for (const [formId, section] of [['shell-form','shell'],['wall-form','walls']]) {
  element(formId).addEventListener('submit', event => {
    event.preventDefault();
    const candidate = structuredClone(design);
    Object.keys(candidate[section]).forEach(key => { candidate[section][key] = Number(event.target.elements.namedItem(key).value); });
    try { design = validateDesign(candidate); refresh(); setView(view); save('Dimensions saved. Existing components retain their positions.'); }
    catch (error) { status(error.message); }
  });
}
itemForm.addEventListener('submit', event => {
  event.preventDefault();
  const candidate = structuredClone(design);
  const item = candidate.items.find(candidateItem => candidateItem.id === selectedId);
  item.name = itemForm.elements.name.value.trim();
  item.color = itemForm.elements.color.value;
  if (routeKinds.includes(item.kind)) {
    item.diameter = Number(itemForm.elements.diameter.value);
    item.points = parsePoints(itemForm.elements.points.value);
  } else boxKeys.forEach(key => { item[key] = Number(itemForm.elements[key].value); });
  try { design = validateDesign(candidate); refresh(); save('Component saved.'); }
  catch (error) { status(error.message); }
});
selection.addEventListener('change', () => { selectedId = selection.value; updateEditor(); rebuild(); });
element('add').addEventListener('click', () => {
  if (design.items.length >= 300) { status('Limit: 300 components.'); return; }
  const kind = element('new-kind').value;
  const item = {id:crypto.randomUUID(), kind, name:`New ${layerNames[kind]}`, color:{water:'#338cce',electric:'#d99530',air:'#84978f'}[kind] ?? '#b89972'};
  Object.assign(item, routeKinds.includes(kind) ? {diameter:kind === 'air' ? 4 : 1, points:[[12,12,12],[12,12,60]]} : {x:30,y:0,z:100,width:24,height:36,depth:kind === 'furniture' ? 24 : 1.5});
  design.items.push(item);
  design.visible[kind] = true;
  selectedId = item.id;
  refresh();
  save('Component added. Edit dimensions and position below.');
});
element('delete').addEventListener('click', () => {
  if (!confirm('Delete this component?')) return;
  design.items = design.items.filter(item => item.id !== selectedId);
  selectedId = design.items[0]?.id;
  refresh();
  save('Component deleted.');
});
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
element('export').addEventListener('click', () => { download(new Blob([JSON.stringify(design, null, 2)], {type:'application/json'}), 'van-living-design.json'); status('Design exported. Share this JSON with Codex for changes.'); });
element('image').addEventListener('click', () => { render(); renderer.domElement.toBlob(blob => { if (blob) download(blob, 'van-living-view.png'); }); });
element('import').addEventListener('change', async event => {
  const file = event.target.files[0];
  try {
    if (!file) return;
    if (file.size > 2000000) throw new Error('Design file must be smaller than 2 MB.');
    const candidate = validateDesign(JSON.parse(await file.text()));
    if (!confirm('Replace your current design with this file? Export first if you need a backup.')) return;
    design = candidate;
    selectedId = design.items[0]?.id;
    refresh();
    setView('perspective');
    save('Imported design saved in this browser.');
  } catch (error) { status(`Import failed: ${error.message}`); }
  finally { event.target.value = ''; }
});
element('reset').addEventListener('click', () => {
  if (!confirm('Replace this design with the example? Export first to keep your work.')) return;
  design = exampleDesign();
  selectedId = design.items[0]?.id;
  refresh();
  setView('perspective');
  save('Example restored.');
});
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
element('fit').addEventListener('click', () => setView(view));
const raycaster = new THREE.Raycaster();
let pointerStart;
renderer.domElement.addEventListener('pointerdown', event => { pointerStart = [event.clientX, event.clientY]; });
renderer.domElement.addEventListener('pointerup', event => {
  if (!pointerStart || Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 5) return;
  const bounds = renderer.domElement.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), camera);
  const hit = raycaster.intersectObjects(geometryGroup.children).find(result => result.object.userData.itemId);
  if (hit) { selectedId = hit.object.userData.itemId; updateEditor(); rebuild(); }
});
new ResizeObserver(resize).observe(viewport);
refresh();
setView('perspective');
status(startupMessage);
