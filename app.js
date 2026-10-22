import * as THREE from 'three';
import {OrbitControls} from 'three/addons/OrbitControls.js';
import {blankDesign,validateDesign,derivedDimensions,fieldDefinitions,formatDimension,viewDirections} from './model.js';

const element=id=>document.getElementById(id);
const storageKey='van-living-empty-shell-v2';
let design=blankDesign();
let loadMessage='Blank shell ready · published dimensions + labeled estimates.';
try {
  localStorage.removeItem('van-living-design-v1');
  const saved=localStorage.getItem(storageKey);
  if(saved) {design=validateDesign(JSON.parse(saved));loadMessage='Saved empty shell restored.';}
} catch {loadMessage='Blank reference loaded · browser saving unavailable or saved file invalid.';}
const viewport=element('viewport');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#e6eae7');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
viewport.append(renderer.domElement);
renderer.domElement.setAttribute('aria-label','Empty shuttle body, cab and wheels');
scene.add(new THREE.HemisphereLight(0xffffff,0x677773,3));
const light=new THREE.DirectionalLight(0xffffff,2.2);
light.position.set(-250,450,-200);
scene.add(light);
const perspective=new THREE.PerspectiveCamera(38,1,0.1,6000);
const orthographic=new THREE.OrthographicCamera(-300,300,300,-300,0.1,6000);
let camera=perspective;
let mode='3d';
let view='overview';
let group=new THREE.Group();
scene.add(group);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=false;
controls.addEventListener('change',render);
const status=message=>{element('status').textContent=message;};
function render() {renderer.render(scene,camera);}
function paint(color,opacity=1) {return new THREE.MeshStandardMaterial({color,roughness:0.82,transparent:opacity<1,opacity,depthWrite:opacity===1,side:THREE.DoubleSide});}
function box(width,height,depth,x,y,z,color,opacity=1,outline=false) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),paint(color,opacity));
  mesh.position.set(x+width/2,y+height/2,z+depth/2);
  group.add(mesh);
  if(outline) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:0x7b908b,transparent:true,opacity:0.6})));
  return mesh;
}
function label(text,position,width=145) {
  const canvas=document.createElement('canvas');
  canvas.width=768;canvas.height=88;
  const context=canvas.getContext('2d');
  context.fillStyle='rgba(244,247,243,.94)';context.fillRect(0,0,canvas.width,canvas.height);
  context.fillStyle='#253d3b';context.font='600 44px system-ui';context.textAlign='center';context.textBaseline='middle';context.fillText(text,384,44,748);
  const texture=new THREE.CanvasTexture(canvas);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));
  sprite.position.set(...position);sprite.scale.set(width,width*88/768,1);sprite.renderOrder=10;group.add(sprite);
}
function dimension(start,end,text,position) {
  const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...start),new THREE.Vector3(...end)]);
  group.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x527a71,depthTest:false})));
  label(text,position);
}
function wheel(x,z,width,radius) {
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,width,20),paint('#273333'));
  tire.rotation.z=Math.PI/2;tire.position.set(x,radius,z);group.add(tire);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(radius*0.57,radius*0.57,width+0.4,16),paint('#9eaba7'));
  hub.rotation.z=Math.PI/2;hub.position.copy(tire.position);group.add(hub);
}
function cab(dimensions,derived,opacity) {
  const {cabWidth,cabFloor,cabHeight,bodyFront}=dimensions;
  const top=cabFloor+cabHeight;
  const profile=new THREE.Shape();
  profile.moveTo(derived.cabFront,cabFloor);profile.lineTo(bodyFront,cabFloor);profile.lineTo(bodyFront,top);profile.lineTo(derived.cabFront+18,top);profile.lineTo(derived.cabFront,cabFloor+40);profile.closePath();
  const geometry=new THREE.ExtrudeGeometry(profile,{depth:cabWidth,bevelEnabled:false});
  geometry.rotateY(-Math.PI/2);
  const enclosure=new THREE.Mesh(geometry,paint('#cbd5cf',opacity));
  enclosure.position.x=cabWidth/2;group.add(enclosure);
  box(70,36,derived.cabFront,-35,cabFloor-3,0,'#aebeb7',1,true);
  box(72,3,derived.cabFront,-36,cabFloor+33,0,'#d3dcd5');
  box(80,6,4,-40,21,0,'#536965');
  box(76,18,1,-38,44,-0.6,'#3c524e');
  box(11,8,1,-34,53,-1.2,'#f3efd9');box(11,8,1,23,53,-1.2,'#f3efd9');
  for(const side of [-1,1]) box(0.8,25,42,side*(cabWidth/2+0.3),cabFloor+42,derived.cabFront+21,'#658c98',0.5);
  const windshield=new THREE.Mesh(new THREE.PlaneGeometry(cabWidth-10,Math.hypot(18,cabHeight-40)),paint('#658c98',0.5));
  windshield.position.set(0,cabFloor+(40+cabHeight)/2,derived.cabFront+9-0.5);windshield.rotation.x=Math.atan2(18,cabHeight-40);group.add(windshield);
  box(cabWidth-4,2,dimensions.cabLength-4,-cabWidth/2+2,cabFloor,derived.cabFront+2,'#667a72');
  box(cabWidth-8,8,14,-cabWidth/2+4,cabFloor+24,derived.cabFront+8,'#4c635b');
  box(21,5,22,-32,cabFloor+17,bodyFront-32,'#4b615a');box(21,30,5,-32,cabFloor+20,bodyFront-12,'#4b615a');
  const steering=new THREE.Mesh(new THREE.TorusGeometry(7,0.8,6,20),paint('#30453f'));
  steering.position.set(-22,cabFloor+35,derived.cabFront+29);steering.rotation.x=-0.5;group.add(steering);
}
function rebuild() {
  group.traverse(object=>{object.geometry?.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.filter(Boolean).forEach(material=>{material.map?.dispose();material.dispose();});});
  scene.remove(group);group=new THREE.Group();scene.add(group);
  const dimensions=design.dimensions;
  const derived=derivedDimensions(dimensions);
  const {length,width,height,floorHeight,interiorHeight,bodyFront}=dimensions;
  const bodyLength=length-bodyFront;
  const half=width/2;
  const opacity=design.cutaway?0.13:1;
  if(design.visible.floor) box(width,2,bodyLength,-half,floorHeight-2,bodyFront,'#9caaa2',1,true);
  if(design.visible.roof) box(width,derived.roofThickness,bodyLength,-half,floorHeight+interiorHeight,bodyFront,'#c3cec8',opacity,true);
  for(const [side,key] of [[-1,'left'],[1,'right']]) {
    if(!design.visible[key]) continue;
    const wallX=side===-1?-half:half-derived.sideThickness;
    box(derived.sideThickness,interiorHeight,bodyLength,wallX,floorHeight,bodyFront,'#c7d1ca',opacity,true);
    const skirtX=side===-1?-half:half-1;
    const archStart=derived.rearAxle-dimensions.tireDiameter/2-2;
    const archEnd=derived.rearAxle+dimensions.tireDiameter/2+2;
    if(archStart>bodyFront) box(1,14,archStart-bodyFront,skirtX,floorHeight-16,bodyFront,'#aabbb1');
    if(archEnd<length) box(1,14,length-archEnd,skirtX,floorHeight-16,archEnd,'#aabbb1');
  }
  if(design.visible.front) {
    const opening=36;
    box((width-opening)/2,interiorHeight,2,-half,floorHeight,bodyFront,'#bac9c0',opacity,true);
    box((width-opening)/2,interiorHeight,2,opening/2,floorHeight,bodyFront,'#bac9c0',opacity,true);
    box(opening,interiorHeight-70,2,-opening/2,floorHeight+70,bodyFront,'#bac9c0',opacity,true);
  }
  if(design.visible.rear) box(width,interiorHeight,2,-half,floorHeight,length-2,'#c7d1ca',opacity,true);
  if(design.visible.cab) cab(dimensions,derived,design.cutaway?0.22:1);
  if(design.visible.wheels) for(const side of [-1,1]) {
    wheel(side*dimensions.frontTrack/2,dimensions.frontOverhang,12,dimensions.tireDiameter/2);
    wheel(side*(dimensions.rearTrack/2-5),derived.rearAxle,9,dimensions.tireDiameter/2);
    wheel(side*(dimensions.rearTrack/2+5),derived.rearAxle,9,dimensions.tireDiameter/2);
  }
  const grid=new THREE.GridHelper(600,50,0x9eaea5,0xcbd4cc);grid.position.set(0,-0.8,length/2);group.add(grid);
  if(design.visible.dimensions) {
    if(['overview','top','bottom','left','right'].includes(view)) dimension([-half-24,0,0],[-half-24,0,length],`OVERALL ${formatDimension(length)}`,[-half-36,10,length/2]);
    if(['overview','top','bottom','front','rear'].includes(view)) dimension([-half,0,length+25],[half,0,length+25],`BODY ${width} in`,[0,12,length+38]);
    if(['overview','front','rear','left','right'].includes(view)) dimension([half+25,0,length],[half+25,height,length],`HEIGHT ${height} in`,[half+40,height/2,length]);
    if(['overview','left','right','bottom'].includes(view)) dimension([half+20,dimensions.tireDiameter/2,dimensions.frontOverhang],[half+20,dimensions.tireDiameter/2,derived.rearAxle],`WHEELBASE ${dimensions.wheelbase} in`,[half+40,15,(dimensions.frontOverhang+derived.rearAxle)/2]);
    if(view==='top') label(`CLEAR ${dimensions.interiorWidth} × ${dimensions.interiorLength} in*`,[0,height+6,(bodyFront+length)/2],170);
    label('FRONT / HOOD',[0,10,-35],90);
  }
  render();
}
function frameCamera() {
  const dimensions=design.dimensions;
  const aspect=viewport.clientWidth/Math.max(1,viewport.clientHeight);
  renderer.setSize(viewport.clientWidth,viewport.clientHeight);
  perspective.aspect=aspect;perspective.updateProjectionMatrix();
  const target=new THREE.Vector3(0,dimensions.height/2,dimensions.length/2);
  let direction;
  if(view==='overview') direction=new THREE.Vector3(-1,0.65,-0.85).normalize();
  else direction=new THREE.Vector3(...viewDirections[view]);
  camera=mode==='3d'?perspective:orthographic;
  camera.up.set(0,1,0);
  if(['top','bottom'].includes(view)) camera.up.set(0,0,view==='top'?-1:1);
  const radius=Math.sqrt(dimensions.length**2+dimensions.width**2+dimensions.height**2)/2+42;
  const distance=radius/Math.sin(THREE.MathUtils.degToRad(38)/2)/Math.min(1,aspect);
  camera.position.copy(target).addScaledVector(direction,distance);
  const spanWidth=['front','rear'].includes(view)?dimensions.width+100:dimensions.length+110;
  const spanHeight=['top','bottom'].includes(view)?dimensions.length+110:dimensions.height+100;
  const horizontal=['top','bottom'].includes(view)?dimensions.width+120:spanWidth;
  const vertical=view==='overview'?dimensions.length+100:spanHeight;
  const halfHeight=Math.max(vertical/2,horizontal/(2*aspect));
  orthographic.left=-halfHeight*aspect;orthographic.right=halfHeight*aspect;orthographic.top=halfHeight;orthographic.bottom=-halfHeight;orthographic.updateProjectionMatrix();
  camera.zoom=1;camera.updateProjectionMatrix();
  controls.object=camera;controls.enableRotate=mode==='3d';controls.target.copy(target);controls.update();
  element('mode-2d').setAttribute('aria-pressed',String(mode==='2d'));element('mode-3d').setAttribute('aria-pressed',String(mode==='3d'));
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
  render();
}
function setView(nextView,nextMode=mode) {view=nextView;mode=nextMode;rebuild();frameCamera();status(`${view==='overview'?'Overview':view.toUpperCase()} · ${mode==='2d'?'orthographic 2D':'perspective 3D'} · amber fields are estimates.`);}
function save(message) {
  try {localStorage.setItem(storageKey,JSON.stringify(design));status(message);}
  catch {status(`${message} Export a backup; browser saving failed.`);}
}
function refresh() {
  const dimensions=design.dimensions;
  const rows=[['Exterior',`${dimensions.length/12}′ × ${dimensions.width}″ × ${dimensions.height}″`],['Interior width',formatDimension(dimensions.interiorWidth)],['Interior height',formatDimension(dimensions.interiorHeight)],['Clear length*',formatDimension(dimensions.interiorLength)],['Wheelbase',formatDimension(dimensions.wheelbase)],['Cab L × W × H*',`${dimensions.cabLength} × ${dimensions.cabWidth} × ${dimensions.cabHeight} in`]];
  const list=document.createElement('dl');
  rows.forEach(([name,value])=>{const term=document.createElement('dt');term.textContent=name;const detail=document.createElement('dd');detail.textContent=value;if(name.includes('*'))detail.className='estimate';list.append(term,detail);});
  element('summary').replaceChildren(list);
  const note=document.createElement('p');note.className='hint estimate';note.textContent='* Estimated, not manufacturer-verified. Cab height is enclosure height above its floor; passenger floor length excludes cab/hood.';element('summary').append(note);
  element('cutaway').checked=design.cutaway;
  element('layers').replaceChildren(...Object.entries(design.visible).map(([key,value])=>{
    const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.checked=value;
    input.addEventListener('change',()=>{design.visible[key]=input.checked;rebuild();save('Shell visibility saved.');});label.append(input,document.createTextNode(key[0].toUpperCase()+key.slice(1)));return label;
  }));
  element('dimension-fields').replaceChildren(...fieldDefinitions.map(([key,name,,confidence])=>{
    const label=document.createElement('label');label.append(document.createTextNode(name));const input=document.createElement('input');Object.assign(input,{type:'number',name:key,min:'0.01',max:'720',step:'0.01',required:true,value:dimensions[key]});
    const note=document.createElement('small');note.textContent=confidence;if(confidence.startsWith('Estimate'))label.className='estimate';label.append(input,note);return label;
  }));
  rebuild();frameCamera();
}
element('dimensions-form').addEventListener('submit',event=>{
  event.preventDefault();const candidate=structuredClone(design);
  fieldDefinitions.forEach(([key])=>{candidate.dimensions[key]=Number(event.target.elements.namedItem(key).value);});
  try {design=validateDesign(candidate);refresh();save('Vehicle dimensions saved. Estimated geometry remains provisional.');}catch(error){status(error.message);}
});
element('cutaway').addEventListener('change',event=>{design.cutaway=event.target.checked;rebuild();save('Cutaway setting saved.');});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view,button.dataset.view==='overview'?'3d':mode)));
element('mode-2d').addEventListener('click',()=>setView(view==='overview'?'top':view,'2d'));
element('mode-3d').addEventListener('click',()=>setView(view,'3d'));
element('fit').addEventListener('click',frameCamera);
function download(blob,name) {const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
element('export').addEventListener('click',()=>{download(new Blob([JSON.stringify(design,null,2)],{type:'application/json'}),'van-living-empty-shell.json');status('Empty shell exported.');});
element('image').addEventListener('click',()=>{render();renderer.domElement.toBlob(blob=>{if(blob)download(blob,'van-living-shell-view.png');});});
element('import').parentElement.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();element('import').click();}});
element('import').addEventListener('change',async event=>{
  try {const file=event.target.files[0];if(!file)return;if(file.size>100000)throw new Error('Shell file exceeds 100 KB.');design=validateDesign(JSON.parse(await file.text()));refresh();save('Imported empty shell. Previous shell replaced.');}
  catch(error){status(`Import failed: ${error.message}`);}finally{event.target.value='';}
});
element('reset').addEventListener('click',()=>{design=blankDesign();view='overview';mode='3d';refresh();save('Blank reference restored. No conversion components.');});
new ResizeObserver(frameCamera).observe(viewport);
refresh();status(loadMessage);
