import * as THREE from 'three';
import {OrbitControls} from 'three/addons/OrbitControls.js';
import {blankDesign,validateDesign,upgradeDesign,derivedDimensions,doorLayout,windowLayout,dimensionSegments,fieldDefinitions,formatDimension,viewDirections} from './model.js?v=5';
import {createDimensionOverlay} from './dimension-overlay.js?v=5';
import {structureLayout} from './shell-structure.js?v=5';

const element=id=>document.getElementById(id);
const storageKey='van-living-empty-shell-v2';
let design=blankDesign();
let loadMessage='Blank shell ready · published dimensions + labeled estimates.';
try {
  localStorage.removeItem('van-living-design-v1');
  const saved=localStorage.getItem(storageKey);
  if(saved) {design=validateDesign(upgradeDesign(JSON.parse(saved)));loadMessage='Saved shell restored · door options and dimension filters ready.';}
} catch {loadMessage='Blank reference loaded · browser saving unavailable or saved file invalid.';}
const viewport=element('viewport');
const dimensionOverlay=createDimensionOverlay(element('dimension-overlay'));
let annotations=[];
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
function render() {const grid=group.getObjectByName('ground-grid');if(grid)grid.visible=camera.position.y>=0;renderer.render(scene,camera);dimensionOverlay.draw(camera,annotations,design,viewport.clientWidth,viewport.clientHeight);}
function paint(color,opacity=1) {return new THREE.MeshStandardMaterial({color,roughness:0.82,transparent:opacity<1,opacity,depthWrite:opacity===1,side:THREE.DoubleSide});}
function box(width,height,depth,x,y,z,color,opacity=1,outline=false,parent=group) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),paint(color,opacity));
  mesh.position.set(x+width/2,y+height/2,z+depth/2);
  parent.add(mesh);
  if(outline) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:0x7b908b,transparent:true,opacity:0.6})));
  return mesh;
}
function wheel(x,z,width,radius) {
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,width,24),paint('#273333'));
  tire.rotation.z=Math.PI/2;tire.position.set(x,radius,z);group.add(tire);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(radius*0.57,radius*0.57,width+0.4,16),paint('#9eaba7'));
  hub.rotation.z=Math.PI/2;hub.position.copy(tire.position);group.add(hub);
}
function wheelArch(x,z,width,radius) {
  const shape=new THREE.Shape();
  shape.absarc(0,0,radius+4,0,Math.PI,false);
  shape.lineTo(-radius-2,0);shape.absarc(0,0,radius+2,Math.PI,0,true);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,curveSegments:16});geometry.rotateY(Math.PI/2);
  const fender=new THREE.Mesh(geometry,paint('#aabbb1'));fender.position.set(x,radius,z);group.add(fender);
}
function slopedCabTrim(dimensions,derived) {
  const lower=dimensions.cabFloor+40;
  const upper=dimensions.cabFloor+dimensions.cabHeight;
  for(const side of [-1,1]) {
    const outer=side*dimensions.cabWidth/2;
    const inner=side*(dimensions.cabWidth/2-5);
    const vertices=[outer,lower,derived.cabFront,inner,lower,derived.cabFront,inner,upper,derived.cabFront+18,outer,upper,derived.cabFront+18];
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();
    group.add(new THREE.Mesh(geometry,paint('#cbd5cf')));
  }
}
function sideFrame(x,sill,start,width,height,parent=group,slider=false) {
  box(1.8,2,width,-0.9+x,sill,start,'#273b39',1,false,parent);
  box(1.8,2,width,-0.9+x,sill+height-2,start,'#273b39',1,false,parent);
  for(const location of [start,start+width-2]) box(1.8,height,2,x-0.9,sill,location,'#273b39',1,false,parent);
  if(slider) box(2,1,width-4,x-1,sill+height*0.7,start+2,'#273b39',1,false,parent);
  if(design.visible.windows) box(0.5,height-4,width-4,x-0.25,sill+2,start+2,'#5c8b9c',0.32,false,parent);
}
function passengerSide(dimensions,side,opacity) {
  const entry=doorLayout(dimensions).entry;
  const half=dimensions.width/2;
  const wallX=side===-1?-half:half-derivedDimensions(dimensions).sideThickness;
  const thickness=derivedDimensions(dimensions).sideThickness;
  const base=dimensions.floorHeight;
  const top=base+dimensions.interiorHeight;
  const openings=windowLayout(dimensions).filter(window=>window.side===side);
  if(side===1) openings.push(entry);
  openings.sort((first,second)=>first.start-second.start);
  let position=dimensions.bodyFront;
  for(const opening of openings) {
    if(opening.start>position) box(thickness,dimensions.interiorHeight,opening.start-position,wallX,base,position,'#c7d1ca',opacity,true);
    if(opening.sill>base) box(thickness,opening.sill-base,opening.width,wallX,base,opening.start,'#c7d1ca',opacity,true);
    box(thickness,top-opening.sill-opening.height,opening.width,wallX,opening.sill+opening.height,opening.start,'#c7d1ca',opacity,true);
    if(opening!==entry) sideFrame(side*(half-thickness/2),opening.sill,opening.start,opening.width,opening.height,group,true);
    position=opening.start+opening.width;
  }
  if(position<dimensions.length) box(thickness,dimensions.interiorHeight,dimensions.length-position,wallX,base,position,'#c7d1ca',opacity,true);
}
function cab(dimensions,derived,opacity) {
  const {cabWidth,cabFloor,cabHeight,bodyFront}=dimensions;
  const top=cabFloor+cabHeight;
  const profile=new THREE.Shape();
  profile.moveTo(derived.cabFront,cabFloor);profile.lineTo(bodyFront,cabFloor);profile.lineTo(bodyFront,top);profile.lineTo(derived.cabFront+18,top);profile.lineTo(derived.cabFront,cabFloor+40);profile.closePath();
  const door=doorLayout(dimensions).driver;
  for(const side of [-1,1]) {
    const sideProfile=profile.clone();
    if(side===-1) {
      const opening=new THREE.Path();
      opening.moveTo(door.start,cabFloor);opening.lineTo(door.start,cabFloor+door.height);opening.lineTo(door.start+door.width,cabFloor+door.height);opening.lineTo(door.start+door.width,cabFloor);opening.closePath();sideProfile.holes.push(opening);
    } else {
      const opening=new THREE.Path();
      opening.moveTo(bodyFront-28,cabFloor+6);opening.lineTo(bodyFront-28,cabFloor+66);opening.lineTo(bodyFront-4,cabFloor+66);opening.lineTo(bodyFront-4,cabFloor+6);opening.closePath();sideProfile.holes.push(opening);
    }
    const geometry=new THREE.ShapeGeometry(sideProfile);geometry.rotateY(-Math.PI/2);
    const panel=new THREE.Mesh(geometry,paint('#cbd5cf',opacity));panel.position.x=side*cabWidth/2;group.add(panel);
  }
  box(cabWidth,2,dimensions.cabLength-18,-cabWidth/2,top-2,derived.cabFront+18,'#cbd5cf',opacity,true);
  box(cabWidth,40,2,-cabWidth/2,cabFloor,derived.cabFront,'#cbd5cf',opacity,true);
  box(70,36,derived.cabFront-2,-35,cabFloor-3,2,'#aebeb7',1,true);
  box(72,3,derived.cabFront-2,-36,cabFloor+33,2,'#d3dcd5');
  box(76,18,1,-38,44,0.2,'#3c524e');
  box(11,8,1,-34,53,0,'#f3efd9');box(11,8,1,23,53,0,'#f3efd9');
  sideFrame(cabWidth/2,cabFloor+6,bodyFront-28,24,60);
  if(design.visible.doors) {
    const hinge=new THREE.Group();hinge.position.set(-cabWidth/2-0.7,cabFloor,door.start);hinge.rotation.y=design.doors.open?-Math.PI*0.4:0;group.add(hinge);
    box(1.2,40,door.width,-0.6,0,0,'#afc3b5',1,true,hinge);
    box(1.2,door.height-64,door.width,-0.6,64,0,'#afc3b5',1,true,hinge);
    for(const start of [0,door.width-4]) box(1.2,24,4,-0.6,40,start,'#afc3b5',1,true,hinge);
    sideFrame(0,40,4,door.width-8,24,hinge);
    for(const location of [0,door.width-1]) box(1.4,door.height,1,-0.7,0,location,'#304b43',1,false,hinge);
    for(const level of [0,door.height-1]) box(1.4,1,door.width,-0.7,level,0,'#304b43',1,false,hinge);
    box(1.8,2,7,-1.5,30,door.width-10,'#304b43',1,false,hinge);
  }
  const windshield=new THREE.Mesh(new THREE.PlaneGeometry(cabWidth-10,Math.hypot(18,cabHeight-40)),paint('#658c98',0.32));
  windshield.position.set(0,cabFloor+(40+cabHeight)/2,derived.cabFront+9);windshield.rotation.x=Math.atan2(18,cabHeight-40);if(design.visible.windows)group.add(windshield);
  windshield.add(new THREE.LineSegments(new THREE.EdgesGeometry(windshield.geometry),new THREE.LineBasicMaterial({color:0x273b39})));
  slopedCabTrim(dimensions,derived);
  box(cabWidth,2,dimensions.cabLength,-cabWidth/2,cabFloor-2,derived.cabFront,'#667a72');
  box(cabWidth-8,8,14,-cabWidth/2+4,cabFloor+24,derived.cabFront+8,'#4c635b');
  box(21,5,22,-32,cabFloor+17,bodyFront-32,'#4b615a');box(21,30,5,-32,cabFloor+20,bodyFront-12,'#4b615a');
  const steering=new THREE.Mesh(new THREE.TorusGeometry(7,0.8,6,20),paint('#30453f'));
  steering.position.set(-22,cabFloor+35,derived.cabFront+29);steering.rotation.x=-0.5;group.add(steering);
}
function entryDoor(dimensions) {
  const door=doorLayout(dimensions).entry;
  const x=dimensions.width/2-1;
  if(design.visible.doors) for(const edge of [0,1]) {
    const leaf=new THREE.Group();leaf.position.set(x,door.sill,door.start+edge*door.width);leaf.rotation.y=design.doors.open?(edge?-1:1)*Math.PI*0.4:0;group.add(leaf);
    const start=edge?-door.width/2:0;
    sideFrame(0,0,start,door.width/2,door.height,leaf);
    box(2,2,door.width/2-4,-1,door.height*0.42,start+2,'#273b39',1,false,leaf);
  }
}
function rearPanel(dimensions,opacity) {
  const door=doorLayout(dimensions).rear;
  const width=design.doors.rear?door.width:48;
  const sill=design.doors.rear?door.sill:dimensions.floorHeight+dimensions.interiorHeight-38;
  const height=design.doors.rear?door.height:30;
  const half=dimensions.width/2;
  const base=dimensions.floorHeight;
  const roof=base+dimensions.interiorHeight;
  box(half-width/2,dimensions.interiorHeight,2,-half,base,dimensions.length-2,'#c7d1ca',opacity,true);
  box(half-width/2,dimensions.interiorHeight,2,width/2,base,dimensions.length-2,'#c7d1ca',opacity,true);
  if(sill>base)box(width,sill-base,2,-width/2,base,dimensions.length-2,'#c7d1ca',opacity,true);
  box(width,roof-sill-height,2,-width/2,sill+height,dimensions.length-2,'#c7d1ca',opacity,true);
  if(design.doors.rear&&design.visible.doors) {
    const hinge=new THREE.Group();hinge.position.set(width/2,sill,dimensions.length);hinge.rotation.y=design.doors.open?Math.PI/2:0;group.add(hinge);
    box(width,height-33,1.5,-width,0,-1.5,'#b5c6b0',1,true,hinge);
    box(width,7,1.5,-width,height-7,-1.5,'#b5c6b0',1,true,hinge);
    for(const location of [-width,-4]) box(4,26,1.5,location,height-33,-1.5,'#b5c6b0',1,true,hinge);
    if(design.visible.windows) box(width-8,26,0.5,-width+4,height-33,-1,'#80a8b1',0.32,true,hinge);
    box(8,2,2,-width+4,32,-0.6,'#a4513c',1,false,hinge);
  } else if(!design.doors.rear&&design.visible.windows) box(width,height,1,-width/2,sill,dimensions.length-1,'#80a8b1',0.32,true);
}
function rebuild() {
  group.traverse(object=>{object.geometry?.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.filter(Boolean).forEach(material=>{material.map?.dispose();material.dispose();});});
  scene.remove(group);group=new THREE.Group();scene.add(group);
  const dimensions=design.dimensions;
  const derived=derivedDimensions(dimensions);
  const structure=structureLayout(dimensions);
  const {length,width,height,floorHeight,interiorHeight,bodyFront}=dimensions;
  const bodyLength=length-bodyFront;
  const entry=doorLayout(dimensions).entry;
  const half=width/2;
  const opacity=design.cutaway?0.13:1;
  if(design.visible.floor) {
    const wellDepth=structure.wellDepth;
    box(width-wellDepth,2,bodyLength,-half,floorHeight-2,bodyFront,'#9caaa2',1,true);
    box(wellDepth,2,entry.start-bodyFront,half-wellDepth,floorHeight-2,bodyFront,'#9caaa2',1,true);
    box(wellDepth,2,length-entry.start-entry.width,half-wellDepth,floorHeight-2,entry.start+entry.width,'#9caaa2',1,true);
  }
  if(design.visible.roof) box(width,derived.roofThickness,bodyLength,-half,floorHeight+interiorHeight,bodyFront,'#c3cec8',opacity,true);
  for(const [side,key] of [[-1,'left'],[1,'right']]) {
    if(!design.visible[key]) continue;
    passengerSide(dimensions,side,opacity);
    const skirtX=side===-1?-half:half-1;
    const archStart=derived.rearAxle-dimensions.tireDiameter/2-2;
    const archEnd=derived.rearAxle+dimensions.tireDiameter/2+2;
    if(archStart>bodyFront) {
      if(side===-1)box(1,14,archStart-bodyFront,skirtX,floorHeight-16,bodyFront,'#aabbb1');
      else {
        box(1,14,entry.start-bodyFront,skirtX,floorHeight-16,bodyFront,'#aabbb1');
        box(1,14,archStart-entry.start-entry.width,skirtX,floorHeight-16,entry.start+entry.width,'#aabbb1');
      }
    }
    if(archEnd<length) box(1,14,length-archEnd,skirtX,floorHeight-16,archEnd,'#aabbb1');
  }
  if(design.visible.front) {
    const opening=36;
    const base=dimensions.cabFloor;
    const top=floorHeight+interiorHeight;
    box((width-opening)/2,top-base,2,-half,base,bodyFront,'#bac9c0',opacity,true);
    box((width-opening)/2,top-base,2,opening/2,base,bodyFront,'#bac9c0',opacity,true);
    box(opening,top-structure.walkThroughTop,2,-opening/2,structure.walkThroughTop,bodyFront,'#bac9c0',opacity,true);
  }
  for(const part of structure.parts) if(design.visible[part.layer]&&part.height>0) box(part.width,part.height,part.depth,part.x,part.y,part.z,part.color,design.cutaway&&part.layer==='front'?opacity:1,true);
  if(design.visible.rear) rearPanel(dimensions,opacity);
  if(design.visible.right) entryDoor(dimensions);
  if(design.visible.cab) cab(dimensions,derived,design.cutaway?0.22:1);
  if(design.visible.wheels) for(const side of [-1,1]) {
    wheel(side*dimensions.frontTrack/2,dimensions.frontOverhang,12,dimensions.tireDiameter/2);
    wheel(side*(dimensions.rearTrack/2-5),derived.rearAxle,9,dimensions.tireDiameter/2);
    wheel(side*(dimensions.rearTrack/2+5),derived.rearAxle,9,dimensions.tireDiameter/2);
  }
  if(design.visible.chassis) for(const axle of structure.axles) {
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(2,2,axle.width,12),paint('#35433e'));shaft.rotation.z=Math.PI/2;shaft.position.set(0,structure.wheelCenterHeight,axle.z);group.add(shaft);
  }
  for(const side of [-1,1]) {
    if(design.visible.cab) wheelArch(side===-1?-48:34,dimensions.frontOverhang,14,dimensions.tireDiameter/2);
    if(design.visible[side===-1?'left':'right']) wheelArch(side===-1?-half:half-1.5,derived.rearAxle,1.5,dimensions.tireDiameter/2);
  }
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),paint('#dbe2dc'));ground.material.side=THREE.FrontSide;ground.rotation.x=-Math.PI/2;ground.position.set(0,0,length/2);group.add(ground);
  const grid=new THREE.GridHelper(600,50,0x9eaea5,0xcbd4cc);grid.name='ground-grid';grid.position.set(0,0.02,length/2);group.add(grid);
  annotations=dimensionSegments(design);
  render();
}
function frameCamera() {
  const dimensions=design.dimensions;
  const aspect=viewport.clientWidth/Math.max(1,viewport.clientHeight);
  renderer.setSize(viewport.clientWidth,viewport.clientHeight);
  perspective.aspect=aspect;perspective.updateProjectionMatrix();
  const cabView=view.startsWith('cab-');
  const target=cabView?new THREE.Vector3(0,65,dimensions.bodyFront-20):new THREE.Vector3(0,dimensions.height/2,dimensions.length/2);
  let direction;
  if(view==='overview') direction=new THREE.Vector3(-1,0.65,-0.85).normalize();
  else direction=new THREE.Vector3(...viewDirections[cabView?view.slice(4):view]);
  camera=mode==='3d'?perspective:orthographic;
  camera.up.set(0,1,0);
  if(['top','bottom'].includes(view)) camera.up.set(0,0,view==='top'?-1:1);
  const radius=cabView?110:Math.sqrt(dimensions.length**2+dimensions.width**2+dimensions.height**2)/2+42;
  const distance=radius/Math.sin(THREE.MathUtils.degToRad(38)/2)/Math.min(1,aspect);
  camera.position.copy(target).addScaledVector(direction,distance);
  const spanWidth=['front','rear'].includes(view)?dimensions.width+100:dimensions.length+110;
  const spanHeight=['top','bottom'].includes(view)?dimensions.length+110:dimensions.height+100;
  const horizontal=['top','bottom'].includes(view)?dimensions.width+120:spanWidth;
  const vertical=view==='overview'?dimensions.length+100:spanHeight;
  const halfHeight=cabView?Math.max(90,120/aspect):Math.max(vertical/2,horizontal/(2*aspect));
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
  const rows=[['Exterior',`${dimensions.length/12}′ × ${dimensions.width}″ × ${dimensions.height}″`],['Interior width',formatDimension(dimensions.interiorWidth)],['Interior height',formatDimension(dimensions.interiorHeight)],['Floor above ground',formatDimension(dimensions.floorHeight)],['First step above ground',formatDimension(dimensions.firstStepHeight)],['Clear length*',formatDimension(dimensions.interiorLength)],['Wheelbase',formatDimension(dimensions.wheelbase)],['Cab L × W × H*',`${dimensions.cabLength} × ${dimensions.cabWidth} × ${dimensions.cabHeight} in`]];
  const list=document.createElement('dl');
  rows.forEach(([name,value])=>{const term=document.createElement('dt');term.textContent=name;const detail=document.createElement('dd');detail.textContent=value;if(name.includes('*'))detail.className='estimate';list.append(term,detail);});
  element('summary').replaceChildren(list);
  const note=document.createElement('p');note.className='hint estimate';note.textContent='* Estimated, not manufacturer-verified. Cab height is enclosure height above its floor; passenger floor length excludes cab/hood.';element('summary').append(note);
  element('cutaway').checked=design.cutaway;
  element('rear-door').checked=design.doors.rear;
  element('doors-open').checked=design.doors.open;
  element('dimension-mode').value=design.dimensionMode;
  element('dimension-groups').replaceChildren(...Object.entries(design.dimensionGroups).map(([key,value])=>{
    const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.checked=value;
    input.addEventListener('change',()=>{design.dimensionGroups[key]=input.checked;render();save('Dimension categories saved.');});label.append(input,document.createTextNode(key[0].toUpperCase()+key.slice(1)));return label;
  }));
  element('layers').replaceChildren(...Object.entries(design.visible).map(([key,value])=>{
    const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.checked=value;
    input.addEventListener('change',()=>{design.visible[key]=input.checked;rebuild();save('Shell visibility saved.');});label.append(input,document.createTextNode(key[0].toUpperCase()+key.slice(1)));return label;
  }));
  element('dimension-fields').replaceChildren(...fieldDefinitions.map(([key,name,,confidence])=>{
    const label=document.createElement('label');label.append(document.createTextNode(name));const input=document.createElement('input');Object.assign(input,{type:'number',name:key,min:'0.01',max:'720',step:'0.01',required:true,value:dimensions[key]});
    const note=document.createElement('small');const reference=fieldDefinitions.find(definition=>definition[0]===key)[2];note.textContent=confidence.startsWith('Published')&&dimensions[key]!==reference?`Custom / unverified; published reference: ${reference} in. ${confidence}`:confidence;if(confidence.startsWith('Estimate')||dimensions[key]!==reference)label.className='estimate';label.append(input,note);return label;
  }));
  rebuild();frameCamera();
}
element('dimensions-form').addEventListener('submit',event=>{
  event.preventDefault();const candidate=structuredClone(design);
  fieldDefinitions.forEach(([key])=>{candidate.dimensions[key]=Number(event.target.elements.namedItem(key).value);});
  try {design=validateDesign(candidate);refresh();save('Vehicle dimensions saved. Estimated geometry remains provisional.');}catch(error){status(error.message);}
});
element('cutaway').addEventListener('change',event=>{design.cutaway=event.target.checked;rebuild();save('Cutaway setting saved.');});
element('rear-door').addEventListener('change',event=>{design.doors.rear=event.target.checked;rebuild();save(design.doors.rear?'Optional rear emergency door shown; opening size is estimated.':'Standard rear egress window shown; no rear door selected.');});
element('doors-open').addEventListener('change',event=>{design.doors.open=event.target.checked;rebuild();save('Door position saved. Dimension arrows measure the closed openings.');});
element('dimension-mode').addEventListener('change',event=>{design.dimensionMode=event.target.value;render();save(`${design.dimensionMode==='all'?'All':'Simple'} Dimensions selected.`);});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view,button.dataset.view==='overview'?'3d':mode)));
element('mode-2d').addEventListener('click',()=>setView(view==='overview'?'top':view,'2d'));
element('mode-3d').addEventListener('click',()=>setView(view,'3d'));
element('fit').addEventListener('click',frameCamera);
function download(blob,name) {const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
element('export').addEventListener('click',()=>{download(new Blob([JSON.stringify(design,null,2)],{type:'application/json'}),'van-living-empty-shell.json');status('Empty shell exported.');});
element('image').addEventListener('click',()=>{
  render();
  const overlay=element('dimension-overlay').cloneNode(true);overlay.setAttribute('width',viewport.clientWidth);overlay.setAttribute('height',viewport.clientHeight);
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(overlay)],{type:'image/svg+xml;charset=utf-8'}));
  const annotationImage=new Image();
  annotationImage.onload=()=>{
    const canvas=document.createElement('canvas');canvas.width=renderer.domElement.width;canvas.height=renderer.domElement.height;
    const context=canvas.getContext('2d');context.drawImage(renderer.domElement,0,0);context.drawImage(annotationImage,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);
    canvas.toBlob(blob=>{if(blob){download(blob,'van-living-shell-view.png');status('View exported with arrowed dimension labels.');}});
  };
  annotationImage.onerror=()=>{URL.revokeObjectURL(url);status('Image export failed. Try again or save a browser screenshot.');};
  annotationImage.src=url;
});
element('import').parentElement.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();element('import').click();}});
element('import').addEventListener('change',async event=>{
  try {const file=event.target.files[0];if(!file)return;if(file.size>100000)throw new Error('Shell file exceeds 100 KB.');design=validateDesign(upgradeDesign(JSON.parse(await file.text())));refresh();save('Imported empty shell. Previous shell replaced.');}
  catch(error){status(`Import failed: ${error.message}`);}finally{event.target.value='';}
});
element('reset').addEventListener('click',()=>{design=blankDesign();view='overview';mode='3d';refresh();save('Blank reference restored. No conversion components.');});
new ResizeObserver(frameCamera).observe(viewport);
refresh();status(loadMessage);
