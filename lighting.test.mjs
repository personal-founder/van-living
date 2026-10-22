import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankDesign,upgradeDesign,validateDesign} from './model.js';
import {lightProducts,lightLayout,coverageReview,beamBasis,beamReaches,beamEndpoint,rayBoxDistance,defaultLighting,dotVector,barHousingBounds} from './lighting-plan.js';

test('document plan and requested additions map to 40 unique fixtures without wiring',()=>{
  const design=blankDesign();const fixtures=lightLayout(design.dimensions);
  assert.equal(fixtures.length,40);assert.equal(new Set(fixtures.map(fixture=>fixture.id)).size,40);
  assert.equal(fixtures.filter(fixture=>fixture.origin==='document').length,22);
  assert.equal(fixtures.filter(fixture=>fixture.origin==='addition').length,18);
  assert.deepEqual(Object.fromEntries(Object.keys(lightProducts).map(key=>[key,fixtures.filter(fixture=>fixture.product===key).length])),{curved:8,straight:5,pod:8,side:10,corner:5,down:4});
  assert.equal(coverageReview(design.dimensions,design.lighting).documentWatts,3172);
  assert.equal(coverageReview(design.dimensions,design.lighting).additionWatts,3670);
  assert.equal(coverageReview(design.dimensions,design.lighting).nominalWatts,6842);
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
      if(fixture.surface==='rear'){assert.equal(anchor[2],dimensions.length);assert.ok(Math.abs(anchor[0])>dimensions.rearDoorWidth/2+1.5||anchor[1]>dimensions.floorHeight+dimensions.rearDoorHeight+1.5||anchor[1]+1.5<dimensions.floorHeight);}
      if(fixture.surface==='front'){assert.equal(anchor[2],0);assert.equal(anchor[1],dimensions.frontBumperBottom+4);}
      if(fixture.surface==='bumper')assert.equal(anchor[1],dimensions.rearBumperBottom+8);
      if(fixture.surface==='front-bumper')assert.equal(anchor[1],dimensions.frontBumperBottom+8);
      if(fixture.surface==='cab-roof')assert.equal(anchor[1],dimensions.cabFloor+dimensions.cabHeight);
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
    const {right,up}=beamBasis(fixture.direction,fixture.roll);
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
  for(const fixture of lightLayout(dimensions).filter(candidate=>candidate.id.startsWith('roof-'))) {
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

test('third front bar is supported on the cab roof, separate from hood and body bars',()=>{
  const dimensions=blankDesign().dimensions;const fixtures=lightLayout(dimensions);
  const cab=fixtures.find(fixture=>fixture.id==='front-cab-middle');
  assert.equal(cab.position[1],dimensions.cabFloor+dimensions.cabHeight+4);
  const bounds=barHousingBounds(cab);
  assert.ok(bounds.minimum[1]>dimensions.cabFloor+dimensions.cabHeight);
  assert.ok(bounds.minimum[2]>dimensions.bodyFront-dimensions.cabLength+18);
  assert.ok(bounds.maximum[2]<dimensions.bodyFront);
  assert.ok(bounds.minimum[0]>-dimensions.cabWidth/2&&bounds.maximum[0]<dimensions.cabWidth/2);
  assert.ok(cab.position[1]>fixtures.find(fixture=>fixture.id==='front-hood').position[1]);
  assert.ok(cab.position[1]<fixtures.find(fixture=>fixture.id==='front-roof').position[1]);
});

test('upright rear bars have eight-inch housing-edge door clearance and clear pods',()=>{
  const dimensions=blankDesign().dimensions;const fixtures=lightLayout(dimensions);
  for(const side of ['left','right']) {
    const fixture=fixtures.find(candidate=>candidate.id===`rear-door-vertical-${side}`);
    const bounds=barHousingBounds(fixture);
    const edge=side==='left'?-bounds.maximum[0]:bounds.minimum[0];
    assert.ok(Math.abs(edge-dimensions.rearDoorWidth/2-8)<0.05);
    assert.equal(fixture.roll,90);
    assert.ok(bounds.maximum[1]-bounds.minimum[1]>23);
    assert.ok(bounds.maximum[0]-bounds.minimum[0]<3.1);
    assert.ok(bounds.minimum[1]>dimensions.floorHeight&&bounds.maximum[1]<dimensions.floorHeight+dimensions.rearDoorHeight);
    const pod=fixtures.find(candidate=>candidate.id===`rear-pod-${side}`);
    assert.ok(Math.abs(pod.position[0])-4.5>Math.max(Math.abs(bounds.minimum[0]),Math.abs(bounds.maximum[0])));
  }
});

test('additional lower side pairs have equal clear housing-to-housing and end gaps',()=>{
  const dimensions=blankDesign().dimensions;
  for(const side of ['left','right']) {
    const fixtures=lightLayout(dimensions).filter(fixture=>fixture.id.startsWith(`side-${side}-fill-`));
    assert.equal(fixtures.length,2);
    const bounds=fixtures.map(barHousingBounds);
    const gaps=[bounds[0].minimum[2]-dimensions.bodyFront,bounds[1].minimum[2]-bounds[0].maximum[2],dimensions.length-bounds[1].maximum[2]];
    for(const gap of gaps)assert.ok(Math.abs(gap-(dimensions.length-dimensions.bodyFront-2*lightProducts.side.size[0])/3)<0.05);
    for(const fixture of fixtures) {
      const bounds=barHousingBounds(fixture);
      assert.ok(bounds.minimum[1]>dimensions.tireDiameter+4);
      assert.ok(bounds.maximum[1]<dimensions.floorHeight+dimensions.windowSill);
      assert.ok(bounds.minimum[2]>dimensions.bodyFront+6+dimensions.entryWidth);
      assert.equal(fixture.pitch,30);
    }
  }
});

test('circular task lamps stay above fixed headers and bumper lamps fill front near-field',()=>{
  const dimensions=blankDesign().dimensions;const fixtures=lightLayout(dimensions);
  const side=fixtures.find(fixture=>fixture.id==='entry-round');
  assert.equal(side.position[2],dimensions.bodyFront+6+dimensions.entryWidth/2);
  assert.ok(side.position[1]-4.5>dimensions.entrySill+dimensions.entryHeight);
  const rear=fixtures.find(fixture=>fixture.id==='rear-door-round');
  assert.ok(rear.position[0]<0);assert.ok(rear.position[1]-4.5>dimensions.floorHeight+dimensions.rearDoorHeight);
  for(const sideName of ['left','right']) {
    const bumper=fixtures.find(fixture=>fixture.id===`front-bumper-${sideName}`);
    assert.equal(lightProducts[bumper.product].shape,'round');
    assert.ok(bumper.position[1]-4.5>=dimensions.frontBumperBottom+8);
    assert.ok(beamReaches(bumper,[bumper.position[0],0.1,-24],480,dimensions));
  }
  const entry=fixtures.find(fixture=>fixture.id==='entry-inner');
  assert.ok(entry.position[0]>dimensions.width/2);
  assert.equal(entry.roll,90);assert.equal(entry.surface,'side');
  assert.ok(barHousingBounds(entry).minimum[2]>dimensions.bodyFront+6+dimensions.entryWidth);
  assert.ok(barHousingBounds(entry).maximum[1]<dimensions.floorHeight+dimensions.windowSill);
  assert.equal(entry.pitch,10);
});

test('rolled beam axes agree with physical vertical bars and additions improve coverage',()=>{
  const dimensions=blankDesign().dimensions;const fixtures=lightLayout(dimensions);
  const vertical=fixtures.find(fixture=>fixture.id==='rear-door-vertical-left');
  const rolled=beamBasis(vertical.direction,vertical.roll);
  assert.ok(Math.abs(rolled.right[1])>0.9);assert.ok(Math.abs(rolled.up[0])>0.99);
  const baseline=defaultLighting();
  baseline.enabled=Object.fromEntries(fixtures.filter(fixture=>fixture.origin==='addition').map(fixture=>[fixture.id,false]));
  const before=coverageReview(dimensions,baseline);const after=coverageReview(dimensions,defaultLighting());
  for(const zone of ['Front','Rear','Left','Right']) {
    const hitCount=review=>review.samples.filter(sample=>sample.zone===zone&&sample.feet<=5&&sample.hits.length).length;
    assert.ok(hitCount(after)>hitCount(before),zone);
  }
  const saved=blankDesign();saved.lighting.enabled['rear-low']=false;saved.lighting.enabled['entry-inner']=false;
  const upgraded=validateDesign(upgradeDesign(JSON.parse(JSON.stringify(saved))));
  assert.equal(upgraded.lighting.enabled['rear-low'],false);assert.equal(upgraded.lighting.enabled['entry-inner'],false);
  assert.deepEqual(upgraded.waterTanks,saved.waterTanks);
});

test('all door-adjacent vertical bars have only a slight ten-degree downward aim',()=>{
  const dimensions=blankDesign().dimensions;
  const fixtures=lightLayout(dimensions).filter(fixture=>fixture.id==='entry-inner'||fixture.id.startsWith('rear-door-vertical-'));
  assert.equal(fixtures.length,3);
  for(const fixture of fixtures) {
    assert.equal(fixture.pitch,10);assert.equal(fixture.roll,90);
    assert.ok(fixture.direction[1]<0&&fixture.direction[1]>-0.18);
    assert.ok(Math.hypot(fixture.direction[0],fixture.direction[2])>0.98);
  }
});

test('six bottom bars stay clear of wheel arches, entry, ground and existing fixtures',()=>{
  for(const axleShift of [0,12]) {
    const dimensions={...blankDesign().dimensions,wheelbase:blankDesign().dimensions.wheelbase+axleShift};
    const fixtures=lightLayout(dimensions);const ground=fixtures.filter(fixture=>fixture.id.startsWith('ground-'));
    assert.equal(ground.length,6);
    const archStart=dimensions.frontOverhang+dimensions.wheelbase-dimensions.tireDiameter/2-2;
    const archEnd=dimensions.frontOverhang+dimensions.wheelbase+dimensions.tireDiameter/2+2;
    for(const side of ['left','right'])for(const end of ['front','rear']) {
      const fixture=ground.find(candidate=>candidate.id===`ground-${side}-${end}`);
      const bounds=barHousingBounds(fixture);
      assert.equal(fixture.product,'curved');assert.equal(fixture.position[1],dimensions.floorHeight-13);
      assert.ok(bounds.minimum[1]>dimensions.floorHeight-16&&bounds.maximum[1]<dimensions.floorHeight-2);
      assert.ok(bounds.minimum[2]>dimensions.bodyFront+6+dimensions.entryWidth);
      assert.ok(bounds.minimum[2]>archEnd+2||bounds.maximum[2]<archStart-2);
      assert.ok(bounds.maximum[2]<dimensions.length-2);
      assert.ok(side==='left'?bounds.maximum[0]<-dimensions.width/2:bounds.minimum[0]>dimensions.width/2);
      assert.equal(fixture.anchors.length,2);
    }
    const front=ground.find(fixture=>fixture.id==='ground-front');const rear=ground.find(fixture=>fixture.id==='ground-rear');
    assert.ok(barHousingBounds(front).minimum[1]>dimensions.frontBumperBottom);
    assert.ok(barHousingBounds(rear).minimum[1]>dimensions.rearBumperBottom);
    assert.ok(barHousingBounds(front).maximum[2]<0&&barHousingBounds(rear).minimum[2]>dimensions.length);
    const rearExisting=barHousingBounds(fixtures.find(fixture=>fixture.id==='rear-low'));
    assert.ok(barHousingBounds(rear).maximum[1]<rearExisting.minimum[1]);
    assert.ok(barHousingBounds(front).maximum[1]<dimensions.frontBumperBottom+8);
  }
});

test('bottom bars point outward and down, reach close ground and improve every near-field zone',()=>{
  const design=blankDesign();const dimensions=design.dimensions;const fixtures=lightLayout(dimensions);
  const ground=fixtures.filter(fixture=>fixture.id.startsWith('ground-'));
  for(const fixture of ground) {
    assert.equal(fixture.pitch,fixture.id==='ground-rear'?40:55);
    assert.ok(fixture.direction[1]<-0.6&&Math.hypot(fixture.direction[0],fixture.direction[2])>0.5);
    const point=fixture.id==='ground-front'?[0,0.1,-24]:fixture.id==='ground-rear'?[0,0.1,dimensions.length+24]:[Math.sign(fixture.position[0])*(dimensions.width/2+24),0.1,fixture.position[2]];
    assert.ok(beamReaches(fixture,point,480,dimensions),fixture.id);
  }
  const before=defaultLighting();before.enabled=Object.fromEntries(ground.map(fixture=>[fixture.id,false]));
  const previous=coverageReview(dimensions,before).rings.find(ring=>ring.feet===2);
  const after=coverageReview(dimensions,defaultLighting()).rings.find(ring=>ring.feet===2);
  for(const zone of ['Front','Rear','Left','Right'])assert.ok(after.zones[zone].covered>previous.zones[zone].covered,zone);
  assert.ok(Object.values(after.zones).some(zone=>zone.covered<zone.total));
});

test('previous light choices and tanks survive migration with new ground fixtures enabled',()=>{
  const old=blankDesign();old.lighting.enabled['rear-low']=false;old.lighting.enabled['entry-inner']=false;
  const upgraded=validateDesign(upgradeDesign(JSON.parse(JSON.stringify(old))));
  assert.deepEqual(upgraded.waterTanks,old.waterTanks);assert.deepEqual(upgraded.lighting.enabled,old.lighting.enabled);
  assert.equal(coverageReview(upgraded.dimensions,upgraded.lighting).fixtureCount,38);
  for(const fixture of lightLayout(upgraded.dimensions).filter(fixture=>fixture.id.startsWith('ground-')))upgraded.lighting.enabled[fixture.id]=false;
  assert.equal(coverageReview(upgraded.dimensions,upgraded.lighting).fixtureCount,32);
});

