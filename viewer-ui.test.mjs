import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readSidebarPreference,setSidebarCollapsed} from './viewer-ui.js';

test('sidebar preference defaults safely for missing, malformed and blocked storage',()=>{
  for(const value of [null,'bad','null','{}','{"sidebarCollapsed":"true"}'])assert.equal(readSidebarPreference({getItem:()=>value}),false);
  assert.equal(readSidebarPreference({getItem:()=>'{"sidebarCollapsed":true}'}),true);
  assert.equal(readSidebarPreference({getItem(){throw Error('blocked');}}),false);
  assert.equal(readSidebarPreference(null),false);
});

test('sidebar toggle preserves controls, exposes state and restores focus when hiding',()=>{
  const classes=new Map();const attributes=new Map();const saved=[];let focused=false;
  const sidebar={hidden:false,ownerDocument:{activeElement:{}},contains:()=>true};
  const toggle={setAttribute:(key,value)=>attributes.set(key,value),focus:()=>{focused=true;}};
  const elements={sidebar,toggle,main:{classList:{toggle:(key,value)=>classes.set(key,value)}},storage:{setItem:(key,value)=>saved.push(JSON.parse(value))}};
  setSidebarCollapsed(elements,true);
  assert.equal(sidebar.hidden,true);assert.equal(classes.get('sidebar-collapsed'),true);
  assert.equal(attributes.get('aria-expanded'),'false');assert.equal(toggle.textContent,'Show controls');assert.equal(focused,true);
  setSidebarCollapsed(elements,false);
  assert.equal(sidebar.hidden,false);assert.equal(attributes.get('aria-expanded'),'true');assert.equal(toggle.textContent,'Hide controls');
  assert.deepEqual(saved,[{sidebarCollapsed:true},{sidebarCollapsed:false}]);
  elements.storage={setItem(){throw Error('blocked');}};assert.doesNotThrow(()=>setSidebarCollapsed(elements,true));
});

test('all existing model controls stay in the page alongside new navigation controls',async()=>{
  const html=await readFile(new URL('./index.html',import.meta.url),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const id of ['toggle-sidebar','sidebar','crosshair','camera-help','zoom-in','zoom-out','fit','mode-2d','mode-3d','export','import','image','tank-controls','show-water-tanks','tank-view','water-tank-select','lighting-controls','show-lights','show-beams','show-coverage','beam-range','coverage-view','light-select','lighting-summary','lighting-notes','coverage-report','dimension-mode','dimension-groups','rear-door','doors-open','cutaway','layers','dimensions-form','dimension-fields','reset','light-inspector','tank-inspector'])assert.ok(ids.includes(id),id);
  for(const view of ['overview','top','bottom','front','rear','left','right','cab-left','cab-right'])assert.ok(html.includes(`data-view="${view}"`),view);
  assert.match(html,/aria-controls="sidebar" aria-expanded="true"/);
  assert.match(html,/id="crosshair" aria-hidden="true"/);
});
