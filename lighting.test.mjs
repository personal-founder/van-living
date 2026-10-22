import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankDesign,upgradeDesign,validateDesign} from './model.js';
import {lightProducts,lightLayout,coverageReview,beamBasis,beamReaches,beamEndpoint,rayBoxDistance,defaultLighting,dotVector,barHousingBounds} from './lighting-plan.js';

test('document plan maps to 22 uniquely identified fixtures without switches or wiring',()=>{
  const design=blankDesign();const fixtures=lightLayout(design.dimensions);
  assert.equal(fixtures.length,22);assert.equal(new Set(fixtures.map(fixture=>fixture.id)).size,22);
  assert.deepEqual(Object.fromEntries(Object.keys(lightProducts).map(key=>[key,fixtures.filter(fixture=>fixture.product===key).length])),{curved:4,straight:2,pod:4,side:4,corner:4,down:4});
  assert.equal(coverageReview(design.dimensions,design.lighting).documentWatts,3172);
  assert.equal(design.items.length,0);
  for(const product of Object.values(lightProducts)){assert.ok(product.price>0);assert.match(product.url,/^https:\/\/www.amazon.com\/dp\//);assert.match(product.source,/^https:\/\//);}
});
test('mount anchors contact roof hood fixed rear body and bumper rather than door leaves',()=>{
  const dimensions=blankDesign().dimensions;
  for(const fixture of lightLayout(dimensions)) {
    assert.ok(fixture.anchors.length>0);assert.ok(Math.abs(Math.hypot(...fixture.direction)-1)<1e-10);
    for(const anchor of fixture.anchors) {
      if(fixture.surface==='roof')assert.equal(anchor[1],dimensions.height);
      if(fixture.surface==='hood')assert.equal(anchor[1],dimensions.cabFloor+36);
      if(fixture.surface==='side')assert.equal(Math.abs(anchor[0]),dimensions.width/2);
      if(fixture.surface==='rear'){assert.equal(anchor[2],dimensions.length);assert.ok(Math.abs(anchor[0])>dimensions.rearDoorWidth/2+4.5);}
      if(fixture.surface==='bumper')assert.equal(anchor[1],dimensions.rearBumperBottom+8);
    }
  }
  const fixtures=lightLayout(dimensions);
  assert.ok(fixtures.find(fixture=>fixture.id==='front-pod-left').direction[0]<0);
  assert.ok(fixtures.find(fixture=>fixture.id==='front-pod-right').direction[0]>0);
  assert.ok(fixtures.find(fixture=>fixture.id==='roof-left-rear').direction[2]>0);
  for(const side of ['left','right'])for(const end of ['front','rear']) {
    const fixture=fixtures.find(candidate=>candidate.id===`roof-${side}-${end}`);
    assert.equal(Math.abs(fixture.position[0]),dimensions.width/2-8);
    assert.equal(fixture.position[2],end==='front'?dimensions.bodyFront+8:dimensions.length-8);
    assert.ok(Math.abs(Math.abs(fixture.direction[0])-Math.abs(fixture.direction[2]))<1e-10);
  }
  assert.ok(fixtures.find(fixture=>fixture.id==='rear-low').position[1]+2<dimensions.floorHeight);
  dimensions.rearBumperBottom=32;
  assert.ok(lightLayout(dimensions).find(fixture=>fixture.id==='rear-low').position[1]+2<dimensions.floorHeight);
});
test('beam bases are orthonormal and ray blockers reject through-bus coverage',()=>{
  const dimensions=blankDesign().dimensions;const fixtures=lightLayout(dimensions);
  for(const fixture of fixtures) {
    const {right,up}=beamBasis(fixture.direction);
    assert.ok(Math.abs(dotVector(right,up))<1e-10);assert.ok(Math.abs(dotVector(right,fixture.direction))<1e-10);assert.ok(Math.abs(dotVector(up,fixture.direction))<1e-10);
  }
  const rear=fixtures.find(fixture=>fixture.id==='rear-low');
  assert.equal(beamReaches(rear,[0,0.1,dimensions.length+240],480,dimensions),true);
  assert.equal(beamReaches(rear,[0,0.1,dimensions.length-60],480,dimensions),false);
  assert.equal(beamReaches(rear,[0,0.1,dimensions.length+1000],480,dimensions),false);
  assert.equal(rayBoxDistance([0,0,0],[0,0,1],{minimum:[-1,-1,10],maximum:[1,1,20]}),10);
  assert.equal(rayBoxDistance([2,0,0],[0,0,1],{minimum:[-1,-1,10],maximum:[1,1,20]}),Infinity);
});
test('all diagonal upper corner housings stay inside the roof plan clearance',()=>{
  const dimensions=blankDesign().dimensions;
  for(const fixture of lightLayout(dimensions).filter(candidate=>candidate.product==='corner')) {
    const bounds=barHousingBounds(fixture);
    assert.ok(bounds.minimum[0]>-dimensions.width/2,fixture.id);assert.ok(bounds.maximum[0]<dimensions.width/2,fixture.id);
    assert.ok(bounds.minimum[2]>dimensions.bodyFront,fixture.id);assert.ok(bounds.maximum[2]<dimensions.length,fixture.id);
    assert.ok(bounds.minimum[1]>dimensions.height,fixture.id);
    for(const anchor of fixture.anchors)assert.ok(Math.abs(anchor[0])+1.5<dimensions.width/2&&anchor[2]-1.5>dimensions.bodyFront&&anchor[2]+1.5<dimensions.length,fixture.id);
  }
});
test('beam geometry ends at the ground or range and does not dip below ground',()=>{
  const dimensions=blankDesign().dimensions;
  for(const fixture of lightLayout(dimensions)) for(const profile of lightProducts[fixture.product].profiles) for(const horizontal of [-1,1]) for(const vertical of [-1,1]) {
    const end=beamEndpoint(fixture,profile,horizontal,vertical,480,dimensions);
    assert.ok(end.every(Number.isFinite));assert.ok(end[1]>=-1e-8);
  }
});
test('coverage uses all four zones, excludes clipped outer rings and reacts to disabled/hidden lights',()=>{
  const design=blankDesign();const review=coverageReview(design.dimensions,design.lighting);
  assert.deepEqual(review.rings.map(ring=>ring.feet),[2,5,10,20]);
  for(const ring of review.rings)assert.deepEqual(Object.keys(ring.zones),['Front','Rear','Left','Right']);
  assert.ok(review.samples.some(sample=>sample.hits.length));assert.ok(review.samples.some(sample=>!sample.hits.length));
  design.lighting.enabled=Object.fromEntries(lightLayout(design.dimensions).map(fixture=>[fixture.id,false]));
  assert.ok(coverageReview(design.dimensions,design.lighting).samples.every(sample=>sample.hits.length===0));
  design.lighting=defaultLighting();design.lighting.visible=false;
  assert.equal(coverageReview(design.dimensions,design.lighting).fixtureCount,0);
});
test('lighting settings migrate persist and reject invalid ranges and unknown fixtures',()=>{
  const old=blankDesign();delete old.lighting;
  const upgraded=validateDesign(upgradeDesign(old));assert.deepEqual(upgraded.lighting,defaultLighting());
  upgraded.lighting.enabled['rear-low']=false;upgraded.lighting.beams=true;
  assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(upgraded))).lighting,upgraded.lighting);
  for(const mutate of [design=>{design.lighting.rangeFeet=1000;},design=>{design.lighting.enabled.fake=true;},design=>{design.lighting.enabled=[];},design=>{design.lighting.beams='yes';}]) {const design=blankDesign();mutate(design);assert.throws(()=>validateDesign(design));}
});
test('linked product conflicts remain explicit rather than copied as verified watts',()=>{
  assert.match(lightProducts.pod.linkedWatts,/UNRESOLVED/);assert.match(lightProducts.side.linkedWatts,/297/);assert.match(lightProducts.corner.linkedWatts,/72/);
  assert.match(lightProducts.down.priceBasis,/four lights/);
});
