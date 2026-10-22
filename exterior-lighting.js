import * as THREE from 'three';
import {lightProducts,lightLayout,lightEnabled,beamEndpoint,emitterPosition,radians} from './lighting-plan.js?v=9';

export function buildExteriorLighting(parent,design,selectedId,review) {
  const root=new THREE.Group();root.name='exterior-lighting';parent.add(root);
  if(!design.lighting.visible)return;
  const metal=new THREE.MeshStandardMaterial({color:'#3a4650',roughness:0.65});
  const hardware=(geometry,material,target,id)=>{
    const mesh=new THREE.Mesh(geometry,material);mesh.userData.lightId=id;target.add(mesh);return mesh;
  };
  const strut=(start,end,id)=>{
    const first=new THREE.Vector3(...start);const last=new THREE.Vector3(...end);const delta=last.clone().sub(first);
    const mesh=hardware(new THREE.CylinderGeometry(0.45,0.45,delta.length(),6),metal,root,id);
    mesh.position.copy(first.add(last).multiplyScalar(0.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  };
  for(const fixture of lightLayout(design.dimensions)) {
    const product=lightProducts[fixture.product];const [width,height,depth]=product.size;
    const selected=fixture.id===selectedId;
    const housing=new THREE.MeshStandardMaterial({color:selected?'#c88e29':'#202b33',roughness:0.68});
    const lens=new THREE.MeshStandardMaterial({color:design.lighting.beams&&lightEnabled(fixture,design.lighting)?'#fff0a3':'#c2d9e1',emissive:design.lighting.beams&&lightEnabled(fixture,design.lighting)?'#d4a945':'#000000',emissiveIntensity:0.8,roughness:0.25});
    const lamp=new THREE.Group();lamp.position.set(...fixture.position);root.add(lamp);lamp.lookAt(new THREE.Vector3(...fixture.position).add(new THREE.Vector3(...fixture.direction)));
    lamp.rotateZ(radians(fixture.roll));
    if(product.shape==='round') {
      const body=hardware(new THREE.CylinderGeometry(width/2,width/2,depth,20),housing,lamp,fixture.id);body.rotation.x=Math.PI/2;
      const face=hardware(new THREE.CircleGeometry(width*0.42,20),lens,lamp,fixture.id);face.position.z=depth/2+0.05;
    } else {
      const segments=product.shape==='curved'?11:1;
      for(let index=0;index<segments;index++) {
        const fraction=(index+0.5)/segments-0.5;
        const segment=new THREE.Group();segment.position.set(width*fraction,0,segments===1?0:-fraction*fraction*depth);segment.rotation.y=segments===1?0:fraction*0.55;lamp.add(segment);
        hardware(new THREE.BoxGeometry(width/segments+0.04,height,depth),housing,segment,fixture.id);
        const face=hardware(new THREE.BoxGeometry(width/segments*0.92,height*0.7,0.15),lens,segment,fixture.id);face.position.z=depth/2+0.05;
      }
    }
    for(const [index,anchor] of fixture.anchors.entries()) {
      const plate=hardware(new THREE.BoxGeometry(3,0.25,3),metal,root,fixture.id);plate.position.set(...anchor);
      if(fixture.surface==='side')plate.rotation.z=Math.PI/2;
      if(fixture.surface==='rear')plate.rotation.x=Math.PI/2;
      const pivots=(fixture.anchors.length===1?[0]:[-width*0.34,width*0.34]).map(offset=>new THREE.Vector3(offset,-height/2,-depth/2).applyQuaternion(lamp.quaternion).add(lamp.position));
      const anchorVector=new THREE.Vector3(...anchor);
      const pivot=pivots.sort((first,second)=>first.distanceToSquared(anchorVector)-second.distanceToSquared(anchorVector))[0];
      strut(anchor,pivot.toArray(),fixture.id);
      const bolt=hardware(new THREE.SphereGeometry(0.6,6,4),metal,root,fixture.id);bolt.position.copy(pivot);
    }
    if(design.lighting.beams&&lightEnabled(fixture,design.lighting)) for(const [profileIndex,profile] of product.profiles.entries()) {
      const origin=emitterPosition(fixture);
      const boundary=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([horizontal,vertical])=>beamEndpoint(fixture,profile,horizontal,vertical,design.lighting.rangeFeet*12,design.dimensions));
      const vertices=[];
      for(let index=0;index<4;index++) vertices.push(...origin,...boundary[index],...boundary[(index+1)%4]);
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
      const beam=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:profileIndex===0?'#f7e1a4':'#8cbfef',transparent:true,opacity:product.profiles.length===1?0.06:0.035,depthWrite:false,side:THREE.DoubleSide}));beam.userData.ignorePick=true;root.add(beam);
      const edges=[];for(const end of boundary)edges.push(...origin,...end);
      for(let index=0;index<4;index++)edges.push(...boundary[index],...boundary[(index+1)%4]);
      const edgeGeometry=new THREE.BufferGeometry();edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(edges,3));
      const outline=new THREE.LineSegments(edgeGeometry,new THREE.LineBasicMaterial({color:selected?'#bc7600':'#70959d',transparent:true,opacity:selected?0.6:0.2}));outline.userData.ignorePick=true;root.add(outline);
    }
  }
  if(design.lighting.coverage) {
    const positions=[];const colors=[];
    for(const sample of review.samples) {positions.push(sample.point[0],0.15,sample.point[2]);colors.push(...new THREE.Color(sample.hits.length?'#2a9c7d':'#cf6a35').toArray());}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    const points=new THREE.Points(geometry,new THREE.PointsMaterial({size:6,sizeAttenuation:false,vertexColors:true,depthWrite:false}));points.userData.ignorePick=true;root.add(points);
  }
}
