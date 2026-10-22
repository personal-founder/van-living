import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankDesign,validateDesign,derivedDimensions,viewDirections} from './model.js';

test('blank shell has no furnishings and survives export/import',()=>{
  const design=blankDesign();assert.equal(design.items.length,0);assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(design))),design);
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
