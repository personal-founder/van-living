import {test} from 'node:test';
import assert from 'node:assert/strict';
import {structureLayout} from './shell-structure.js';
import {blankDesign,validateDesign,upgradeDesign,derivedDimensions,doorLayout,windowLayout,dimensionText,dimensionSegments,selectDimensions,viewDirections} from './model.js';

test('blank shell has no furnishings and survives export/import',()=>{
  const design=blankDesign();assert.equal(design.items.length,0);assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(design))),design);
});
test('steps close continuously from the published first tread to the published floor',()=>{
  const dimensions=blankDesign().dimensions;const structure=structureLayout(dimensions);
  assert.deepEqual(structure.steps,[15.5,25.25,35]);assert.equal(structure.wellDepth,29.25);
  for(const [index,level] of structure.steps.entries()) {
    const tread=structure.parts.find(part=>part.name===`tread-${index}`);
    const riser=structure.parts.find(part=>part.name===`riser-${index}`);
    assert.equal(tread.y+tread.height,level);assert.equal(tread.depth,35.75);
    assert.equal(riser.y,level);assert.equal(riser.y+riser.height,structure.steps[index+1]??44);
    assert.equal(riser.x,tread.x);
  }
  assert.equal(structure.parts.find(part=>part.name==='riser-2').height,9);
  assert.ok(structure.parts.some(part=>part.name==='stepwell-pan'));
  assert.equal(structure.parts.filter(part=>part.name==='stepwell-cheek').length,2);
});
test('structural closures fit the body and axles meet wheel center height',()=>{
  const dimensions=blankDesign().dimensions;const structure=structureLayout(dimensions);
  assert.equal(structure.wheelCenterHeight-dimensions.tireDiameter/2,0);
  assert.equal(structure.axles[1].z-structure.axles[0].z,291);
  assert.equal(structure.walkThroughTop,dimensions.cabFloor+dimensions.cabHeight-2);
  for(const part of structure.parts) {
    assert.ok(part.width>0&&part.height>0&&part.depth>0,part.name);
    assert.ok(part.y>=0&&part.y+part.height<=dimensions.height,part.name);
    assert.ok(part.x>=-dimensions.width/2&&part.x+part.width<=dimensions.width/2,part.name);
    assert.ok(part.z>=0&&part.z+part.depth<=dimensions.length,part.name);
  }
  assert.equal(structure.parts.find(part=>part.name==='front-bumper').y,dimensions.frontBumperBottom);
  assert.equal(structure.parts.find(part=>part.name==='rear-bumper').y,dimensions.rearBumperBottom);
  assert.equal(structure.parts.find(part=>part.name==='cab-transition-landing').y+structure.parts.find(part=>part.name==='cab-transition-landing').height,44);
});
test('ground labels distinguish published step heights from bumper estimates',()=>{
  const design=blankDesign();const segments=dimensionSegments(design);
  assert.equal(segments.find(segment=>segment.key==='first-step-ground').estimated,false);
  assert.equal(segments.find(segment=>segment.key==='front-bumper-ground').estimated,true);
  assert.equal(segments.find(segment=>segment.key==='step-rise-2').value,9);
  assert.equal(segments.find(segment=>segment.key==='step-rise-2').estimated,true);
  design.dimensions.firstStepHeight=16;
  assert.equal(dimensionSegments(design).find(segment=>segment.key==='first-step-ground').estimated,true);
});
test('invalid step and structural height combinations are rejected',()=>{
  for(const [key,value] of [['firstStepHeight',44],['stepWidth',40],['stepRise',1],['rearBumperBottom',40],['cabFloor',20]]) {
    const design=blankDesign();design.dimensions[key]=value;assert.throws(()=>validateDesign(design),key);
  }
  const old=blankDesign();delete old.visible.chassis;
  for(const key of ['firstStepHeight','stepRise','stepTread','stepWidth','frontBumperBottom','rearBumperBottom'])delete old.dimensions[key];
  assert.equal(validateDesign(upgradeDesign(old)).visible.chassis,true);
  old.dimensions.entrySill=20;old.dimensions.entryWidth=34;
  const migrated=validateDesign(upgradeDesign(old));assert.equal(migrated.dimensions.firstStepHeight,20);assert.equal(migrated.dimensions.stepWidth,33.75);
});
test('nominal passenger windows fit walls and do not intersect the bus entrance',()=>{
  const design=blankDesign();const windows=windowLayout(design.dimensions);const entry=doorLayout(design.dimensions).entry;
  assert.equal(windows.length,15);
  for(const window of windows) {
    assert.equal(window.width,36);assert.equal(window.height,36);
    assert.ok(window.sill+window.height<design.dimensions.floorHeight+design.dimensions.interiorHeight);
    if(window.side===1)assert.ok(window.start>entry.start+entry.width);
  }
  const labels=dimensionSegments(design);
  assert.equal(labels.find(segment=>segment.key==='passenger-window-width').estimated,false);
  assert.equal(labels.find(segment=>segment.key==='transition-glass-height').estimated,true);
  design.dimensions.windowWidth=35;
  assert.equal(dimensionSegments(design).find(segment=>segment.key==='passenger-window-width').estimated,true);
  design.dimensions.windowHeight=80;assert.throws(()=>validateDesign(design));
});
test('old exports gain windows while retaining door settings',()=>{
  const old=blankDesign();delete old.visible.windows;delete old.dimensionGroups.windows;
  for(const key of ['windowWidth','windowHeight','windowSill','windowGap'])delete old.dimensions[key];
  old.doors.open=true;
  const upgraded=validateDesign(upgradeDesign(old));assert.equal(upgraded.visible.windows,true);assert.equal(upgraded.dimensions.windowWidth,36);assert.equal(upgraded.doors.open,true);
});
test('published wheelbase and clear interior fit modeled vehicle',()=>{
  const dimensions=blankDesign().dimensions;const derived=derivedDimensions(dimensions);
  assert.equal(derived.rearAxle-dimensions.frontOverhang,291);assert.equal(derived.sideThickness,2);assert.equal(derived.roofThickness,7.25);assert.equal(derived.interiorStart,130);
});
test('rejects legacy furnished projects and impossible dimensions',()=>{
  assert.throws(()=>validateDesign({version:1,items:[{name:'Example bed'}]}));
  for(const change of [design=>design.items.push({name:'Bed'}),design=>{design.dimensions.interiorWidth=103;},design=>{design.dimensions.interiorHeight=100;},design=>{design.dimensions.wheelbase=500;},design=>{design.dimensions.cabLength=200;},design=>{design.dimensions.length=NaN;}]){const design=blankDesign();change(design);assert.throws(()=>validateDesign(design));}
});
test('six side directions are distinct orthogonal unit vectors',()=>{
  assert.equal(Object.keys(viewDirections).length,6);assert.equal(new Set(Object.values(viewDirections).map(direction=>direction.join(','))).size,6);
  Object.values(viewDirections).forEach(direction=>assert.equal(direction.reduce((sum,value)=>sum+value*value,0),1));
});
test('door layout separates standard entrance, driver access and optional rear opening',()=>{
  const design=blankDesign();const doors=doorLayout(design.dimensions);
  assert.equal(doors.entry.width,36);assert.equal(doors.entry.start,134);assert.equal(doors.driver.start,84);
  assert.equal(dimensionSegments(design).filter(segment=>segment.key==='Rear-width').length,2);
  design.doors.rear=false;
  assert.equal(dimensionSegments(design).filter(segment=>segment.key.startsWith('Rear-')).length,0);
  design.dimensions.rearDoorHeight=100;assert.throws(()=>validateDesign(design));
});
test('all exterior edges get arrows; simple mode retains one per measurement',()=>{
  const segments=dimensionSegments(blankDesign()).map(segment=>({...segment,screenLength:100}));
  const groups={exterior:true};const all=selectDimensions(segments,'all',groups);const simple=selectDimensions(segments,'simple',groups);
  assert.equal(all.length,12);assert.equal(simple.length,3);
  for(const key of ['outside-0','outside-1','outside-2'])assert.equal(all.filter(segment=>segment.key===key).length,4);
  assert.equal(selectDimensions(segments,'simple',{}).length,0);
  assert.equal(selectDimensions(segments.map(segment=>({...segment,screenLength:0})),'all',groups).length,0);
});
test('labels show feet/inches plus total inches; custom values lose published status',()=>{
  assert.equal(dimensionText(102,'Wide'),`8'6" Wide (102 in)`);
  assert.equal(dimensionText(103,'Wide'),`8'7" Wide (103 in)`);
  assert.match(dimensionText(79.75,'Interior high',true),/6'7.75" Interior high \(79.75 in\).*est/);
  const design=blankDesign();design.dimensions.width=104;
  assert.equal(dimensionSegments(design).find(segment=>segment.key==='outside-0').estimated,true);
});
test('previous empty-shell exports gain controls without losing edited dimensions',()=>{
  const original=blankDesign();delete original.doors;delete original.dimensionMode;delete original.dimensionGroups;delete original.visible.doors;
  for(const key of ['entryWidth','entryHeight','entrySill','driverDoorWidth','driverDoorHeight','rearDoorWidth','rearDoorHeight'])delete original.dimensions[key];
  original.dimensions.cabWidth=84;
  const migrated=validateDesign(upgradeDesign(JSON.parse(JSON.stringify(original))));
  assert.equal(migrated.dimensions.cabWidth,84);assert.equal(migrated.doors.rear,true);assert.equal(migrated.dimensionMode,'simple');assert.equal(migrated.items.length,0);
});
