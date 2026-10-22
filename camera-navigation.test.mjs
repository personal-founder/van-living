import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from './three.module.js';
import {navigationCommand,wheelZoomFactor,panCamera,zoomCameraAtCrosshair,crosshairFocus,resizeCameraProjection,installCameraNavigation} from './camera-navigation.js';

const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const vectorNear=(actual,expected)=>actual.toArray().forEach((value,index)=>near(value,expected.toArray()[index]));
function cameraFor(mode='3d',direction=[0,0,1]) {
  const camera=mode==='3d'?new THREE.PerspectiveCamera(38,1.5,0.1,6000):new THREE.OrthographicCamera(-150,150,100,-100,0.1,6000);
  camera.position.set(...direction).multiplyScalar(300);
  if(Math.abs(direction[1])===1)camera.up.set(0,0,direction[1]>0?-1:1);
  camera.lookAt(0,0,0);camera.updateMatrixWorld();return camera;
}

test('arrows pan, shift accelerates and plain plus/minus zoom without consuming editing shortcuts',()=>{
  assert.deepEqual(navigationCommand({key:'ArrowRight'}),{pan:[30,0]});
  assert.deepEqual(navigationCommand({key:'ArrowUp',shiftKey:true}),{pan:[0,90]});
  assert.deepEqual(navigationCommand({key:'ArrowLeft'}),{pan:[-30,0]});
  assert.deepEqual(navigationCommand({key:'ArrowDown'}),{pan:[0,-30]});
  for(const key of ['+','=','Add'])assert.deepEqual(navigationCommand({key}),{zoom:0.8});
  for(const key of ['-','_','Subtract'])assert.deepEqual(navigationCommand({key}),{zoom:1.25});
  for(const modifier of ['ctrlKey','metaKey','altKey','isComposing','defaultPrevented'])assert.equal(navigationCommand({key:'ArrowLeft',[modifier]:true}),null);
  assert.equal(navigationCommand({key:'ArrowDown',target:{closest:()=>true}}),null);
  assert.equal(navigationCommand({key:'+',target:{isContentEditable:true}}),null);
  assert.equal(navigationCommand({key:'Tab'}),null);assert.equal(navigationCommand({key:' '}),null);
});

test('screen-relative panning works in both projections from every quick-view side',()=>{
  for(const mode of ['2d','3d'])for(const direction of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) {
    const camera=cameraFor(mode,direction);const target=new THREE.Vector3();
    const distance=camera.position.distanceTo(target);const forward=camera.getWorldDirection(new THREE.Vector3());
    const offset=panCamera(camera,target,30,20,600);
    vectorNear(target,offset);near(camera.position.distanceTo(target),distance);
    near(offset.dot(forward),0);
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0);
    const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
    assert.ok(offset.dot(right)>0&&offset.dot(up)>0);
    const projected=target.clone().project(camera);near(projected.x,0);near(projected.y,0);
    panCamera(camera,target,-30,-20,600);vectorNear(target,new THREE.Vector3());
  }
});

test('zoom anchors the picked center surface and cannot pass through it',()=>{
  for(const mode of ['2d','3d']) {
    const camera=cameraFor(mode);const target=new THREE.Vector3();const focus=new THREE.Vector3(0,0,75);
    const distance=camera.position.distanceTo(focus);const oldZoom=camera.zoom;
    assert.equal(zoomCameraAtCrosshair(camera,target,0.8,focus),true);
    vectorNear(target,focus);
    const projected=focus.clone().project(camera);near(projected.x,0);near(projected.y,0);
    if(mode==='3d')near(camera.position.distanceTo(focus),distance*0.8);else near(camera.zoom,oldZoom/0.8);
    zoomCameraAtCrosshair(camera,target,1.25,focus);
    if(mode==='3d')near(camera.position.distanceTo(focus),distance);else near(camera.zoom,oldZoom);
    for(let index=0;index<60;index++)zoomCameraAtCrosshair(camera,target,0.1,focus);
    assert.ok(camera.position.distanceTo(target)>=2-1e-8);assert.ok(camera.zoom<=100);
    for(let index=0;index<60;index++)zoomCameraAtCrosshair(camera,target,10,focus);
    assert.ok(camera.position.distanceTo(target)<=4800+1e-8);assert.ok(camera.zoom>=0.05);
    for(const factor of [NaN,Infinity,-1,0,1])assert.equal(zoomCameraAtCrosshair(camera,target,factor,focus),false);
  }
});

test('center-ray focusing skips beams, faded cutaway panels and hidden objects',()=>{
  const camera=cameraFor();const model=new THREE.Group();
  const addBox=(depth,opacity=1)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(20,20,10),new THREE.MeshBasicMaterial({opacity}));mesh.position.z=depth;model.add(mesh);return mesh;
  };
  addBox(200).userData.ignorePick=true;addBox(150,0.2);addBox(100).visible=false;
  const hidden=new THREE.Group();hidden.visible=false;hidden.add(addBox(125));model.add(hidden);
  addBox(0);
  vectorNear(crosshairFocus(camera,model,new THREE.Vector3(1,2,3)),new THREE.Vector3(0,0,5));
  vectorNear(crosshairFocus(camera,new THREE.Group(),new THREE.Vector3(1,2,3)),new THREE.Vector3(1,2,3));
  const distant=new THREE.Group();const farBox=new THREE.Mesh(new THREE.BoxGeometry(20,20,10),new THREE.MeshBasicMaterial());farBox.position.z=-7000;distant.add(farBox);
  vectorNear(crosshairFocus(camera,distant,new THREE.Vector3()),new THREE.Vector3());
});

test('wheel modes normalize consistently and extreme scroll events stay bounded',()=>{
  near(wheelZoomFactor(16),wheelZoomFactor(1,1));near(wheelZoomFactor(600),wheelZoomFactor(1,2,600));
  assert.ok(wheelZoomFactor(-100)<1&&wheelZoomFactor(100)>1);
  near(wheelZoomFactor(0),1);near(wheelZoomFactor(1e9),Math.exp(0.6));near(wheelZoomFactor(-1e9),Math.exp(-0.6));
});

test('sidebar and window resizing preserve camera position, target and zoom',()=>{
  const perspective=cameraFor();const orthographic=cameraFor('2d');
  perspective.zoom=1.7;orthographic.zoom=3.2;
  const perspectivePosition=perspective.position.clone();const orthoPosition=orthographic.position.clone();
  const target=new THREE.Vector3(5,6,7);panCamera(perspective,target,20,0,600);
  const pannedPosition=perspective.position.clone();const pannedTarget=target.clone();
  for(const width of [320,900,1230]) {
    resizeCameraProjection(perspective,orthographic,width,600);
    vectorNear(perspective.position,pannedPosition);vectorNear(orthographic.position,orthoPosition);vectorNear(target,pannedTarget);
    near(perspective.zoom,1.7);near(orthographic.zoom,3.2);near(perspective.aspect,width/600);
    near((orthographic.right-orthographic.left)/(orthographic.top-orthographic.bottom),width/600);
  }
  assert.notDeepEqual(perspective.position.toArray(),perspectivePosition.toArray());
});

test('navigation repaints repeated orthographic zooms even when OrbitControls reports no movement',()=>{
  const document=new EventTarget();const workspace=new EventTarget();const canvas=new EventTarget();
  Object.assign(canvas,{ownerDocument:document,clientHeight:600,setAttribute(){},focus(){}});
  const camera=cameraFor('2d');let paints=0;let navigations=0;
  const controls={target:new THREE.Vector3(),minDistance:0,maxDistance:Infinity,minZoom:0,maxZoom:Infinity,update:()=>false,dispatchEvent:()=>{paints++;}};
  const navigation=installCameraNavigation({workspace,canvas,getCamera:()=>camera,getModel:()=>new THREE.Group(),controls,onNavigate:()=>{navigations++;}});
  navigation.zoom(0.8);navigation.zoom(0.8);
  near(camera.zoom,1.5625);assert.equal(paints,2);assert.equal(navigations,2);
  const wheel=new Event('wheel',{cancelable:true});Object.assign(wheel,{deltaY:-100,deltaMode:0});workspace.dispatchEvent(wheel);
  assert.ok(camera.zoom>1.5625);assert.equal(wheel.defaultPrevented,true);assert.equal(paints,3);
  const keyboard=new Event('keydown',{cancelable:true});Object.assign(keyboard,{key:'ArrowRight'});document.dispatchEvent(keyboard);
  assert.ok(controls.target.x>0);assert.equal(keyboard.defaultPrevented,true);assert.equal(paints,4);
  controls.update=()=>{controls.dispatchEvent();return true;};navigation.zoom(1.25);assert.equal(paints,5);
  navigation.dispose();document.dispatchEvent(keyboard);assert.equal(paints,5);
});
