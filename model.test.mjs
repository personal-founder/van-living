import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankDesign,validateDesign,upgradeDesign,derivedDimensions,doorLayout,windowLayout,dimensionText,dimensionSegments,selectDimensions,viewDirections} from './model.js';

test('blank shell has no furnishings and survives export/import',()=>{
  const design=blankDesign();assert.equal(design.items.length,0);assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(design))),design);
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
