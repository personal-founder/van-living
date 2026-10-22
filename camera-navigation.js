import * as THREE from './three.module.js';

const clamp=(value,minimum,maximum)=>Math.min(maximum,Math.max(minimum,value));

export function navigationCommand(event) {
  if(event.defaultPrevented||event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return null;
  const target=event.target;
  if(target?.isContentEditable||target?.closest?.('input,select,textarea,[contenteditable]:not([contenteditable="false"]),aside,article,details,[role="dialog"]'))return null;
  const step=event.shiftKey?90:30;
  const arrows={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,step],ArrowDown:[0,-step]};
  if(arrows[event.key])return {pan:arrows[event.key]};
  if(['+','=','Add'].includes(event.key))return {zoom:0.8};
  if(['-','_','Subtract'].includes(event.key))return {zoom:1.25};
  return null;
}

export function wheelZoomFactor(delta,deltaMode=0,height=600) {
  const pixels=delta*(deltaMode===1?16:deltaMode===2?height:1);
  return Math.exp(clamp(pixels*0.0015,-0.6,0.6));
}

export function panCamera(camera,target,horizontalPixels,verticalPixels,viewportHeight) {
  camera.updateMatrixWorld();
  const height=Math.max(1,viewportHeight);
  const span=camera.isOrthographicCamera?(camera.top-camera.bottom)/camera.zoom:2*camera.position.distanceTo(target)*Math.tan(THREE.MathUtils.degToRad(camera.getEffectiveFOV()/2));
  const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0);
  const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
  const offset=right.multiplyScalar(horizontalPixels*span/height).addScaledVector(up,verticalPixels*span/height);
  camera.position.add(offset);target.add(offset);camera.updateMatrixWorld();
  return offset;
}

export function zoomCameraAtCrosshair(camera,target,factor,focus=target,limits={}) {
  if(!Number.isFinite(factor)||factor<=0||factor===1)return false;
  camera.updateMatrixWorld();
  const forward=camera.getWorldDirection(new THREE.Vector3());
  const distance=Math.max(2,new THREE.Vector3().subVectors(focus,camera.position).dot(forward));
  const center=camera.position.clone().addScaledVector(forward,distance);
  if(camera.isOrthographicCamera) {
    const zoom=clamp(camera.zoom/factor,limits.minZoom??0.05,limits.maxZoom??100);
    if(zoom===camera.zoom)return false;
    camera.position.add(new THREE.Vector3().subVectors(center,target));
    target.copy(center);camera.zoom=zoom;camera.updateProjectionMatrix();
  } else {
    const nextDistance=clamp(distance*factor,limits.minDistance??2,limits.maxDistance??4800);
    camera.position.copy(center).addScaledVector(forward,-nextDistance);target.copy(center);
  }
  camera.lookAt(target);camera.updateMatrixWorld();
  return true;
}

export function crosshairFocus(camera,model,fallback) {
  camera.updateMatrixWorld();model.updateMatrixWorld(true);
  const raycaster=new THREE.Raycaster();raycaster.setFromCamera(new THREE.Vector2(0,0),camera);raycaster.near=camera.near;raycaster.far=camera.far;
  const hit=raycaster.intersectObject(model,true).find(intersection=>{
    const object=intersection.object;
    if(!object.isMesh||object.userData.ignorePick)return false;
    for(let parent=object;parent;parent=parent.parent)if(!parent.visible)return false;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    return materials.some(material=>material.visible&&material.opacity>=0.4);
  });
  return hit?hit.point.clone():fallback.clone();
}

export function resizeCameraProjection(perspective,orthographic,width,height) {
  const aspect=Math.max(1,width)/Math.max(1,height);
  perspective.aspect=aspect;perspective.updateProjectionMatrix();
  const halfHeight=(orthographic.top-orthographic.bottom)/2;
  const center=(orthographic.left+orthographic.right)/2;
  orthographic.left=center-halfHeight*aspect;orthographic.right=center+halfHeight*aspect;
  orthographic.updateProjectionMatrix();
}

export function installCameraNavigation({workspace,canvas,getCamera,getModel,controls,onNavigate}) {
  const document=canvas.ownerDocument;
  canvas.tabIndex=0;
  canvas.setAttribute('aria-describedby','camera-help');
  controls.screenSpacePanning=true;controls.zoomToCursor=false;
  const refresh=()=>{if(!controls.update())controls.dispatchEvent({type:'change'});onNavigate();};
  const zoom=factor=>{
    const camera=getCamera();const focus=crosshairFocus(camera,getModel(),controls.target);
    const limits={minDistance:Math.max(2,controls.minDistance),maxDistance:Math.min(4800,controls.maxDistance),minZoom:Math.max(0.05,controls.minZoom),maxZoom:Math.min(100,controls.maxZoom)};
    if(zoomCameraAtCrosshair(camera,controls.target,factor,focus,limits))refresh();
  };
  const keydown=event=>{
    const command=navigationCommand(event);if(!command)return;
    event.preventDefault();
    if(command.pan){panCamera(getCamera(),controls.target,...command.pan,canvas.clientHeight);refresh();}
    else zoom(command.zoom);
  };
  const wheel=event=>{
    if(event.target.closest?.('nav,article,details'))return;
    if(event.ctrlKey||event.metaKey){event.stopPropagation();return;}
    event.preventDefault();event.stopImmediatePropagation();
    zoom(wheelZoomFactor(event.deltaY,event.deltaMode,canvas.clientHeight));
  };
  document.addEventListener('keydown',keydown);
  workspace.addEventListener('wheel',wheel,{capture:true,passive:false});
  const focus=()=>canvas.focus({preventScroll:true});
  canvas.addEventListener('pointerdown',focus);
  return {zoom,dispose(){document.removeEventListener('keydown',keydown);workspace.removeEventListener('wheel',wheel,true);canvas.removeEventListener('pointerdown',focus);}};
}
