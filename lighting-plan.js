export const lightingReviewDate='2026-10-22';
const nilight='https://www.nilight.com/products/';
export const lightProducts={
  curved:{brand:'Nilight',name:'52-inch curved slim spot/flood bar',price:179.99,priceBasis:'Document quote per bar',currentPrice:179.99,watts:210,linkedWatts:'210 W advertised per bar',size:[52,2.5,3],shape:'curved',lumens:'21,000 raw / 13,401 effective, manufacturer claims',temperature:'5700 K',url:'https://www.amazon.com/dp/B0CZDQSBFB',source:nilight+'52-210w-21000lm-slim-anti-glare-drl-spot-flood-curved-led-light-bar',beam:'Published 10° spot + 90° flood horizontally; vertical spread not published',profiles:[{horizontal:10,vertical:10},{horizontal:90,vertical:30}],notes:'Nominal 52-inch length; housing height/depth and bend are schematic. Quoted 346 m at 1 lux is not used as a simulated illuminance guarantee.'},
  straight:{brand:'Nilight',name:'50.5-inch straight slim spot/flood bar',price:189.99,priceBasis:'Document quote per bar',currentPrice:170.99,watts:210,linkedWatts:'210 W advertised per bar',size:[50.5,2.5,3],shape:'bar',lumens:'21,260 raw, manufacturer claim; document: 21,200 / 16,900 effective',temperature:'5700 K in document',url:'https://www.amazon.com/dp/B0BKJZ39K7',source:nilight+'50inch-210w-21260lm-slim-anti-glare-drl-spot-flood-led-light-bar-14awg-dt-wire',beam:'Published 10° spot + 90° flood horizontally; vertical spread assumed',profiles:[{horizontal:10,vertical:10},{horizontal:90,vertical:30}],notes:'Nominal 50.5-inch length. Housing height/depth are schematic. Current manufacturer price is a dated snapshot, not a checkout guarantee.'},
  pod:{brand:'Nilight',name:'Round hood/rear pod · variant unresolved',price:182.99,priceBasis:'Document quote for L/R group; pack basis unconfirmed',currentPrice:null,watts:80,linkedWatts:'UNRESOLVED: document 80 W; linked 9-inch title 120 W; listing table also conflicts',size:[9,8,4],shape:'round',lumens:'Document 7,000; listing conflicts prevent verified output',temperature:'6000 K in linked listing; unconfirmed variant',url:'https://www.amazon.com/dp/B0BR96JWGW',source:'https://www.amazon.com/dp/B0BR96JWGW?th=1&psc=1',beam:'Spot/flood approximation only; assumed 10° spot + 60° flood horizontally',profiles:[{horizontal:10,vertical:10},{horizontal:60,vertical:30}],notes:'Uses a schematic 9-inch housing from the linked title, NOT a verified 80 W product match. No side-shooter angle is inferred from another product. Confirm variant before purchase or fabrication.'},
  side:{brand:'Nilight',name:'26-inch triple-row spot/flood bar',price:59.99,priceBasis:'Document quote per bar',currentPrice:59.99,watts:300,linkedWatts:'297 W advertised; document rounds to 300 W',size:[26,3,3],shape:'bar',lumens:'29,700 advertised',temperature:'6500 K advertised',url:'https://www.amazon.com/dp/B07232Z7WC',source:nilight+'26inch-297w-29700lm-triple-row-spot-flood-led-light-bar',beam:'Spot/flood type published; assumed 20° spot + 90° flood, vertical spread assumed',profiles:[{horizontal:20,vertical:10},{horizontal:90,vertical:30}],notes:'ASIN resolves to model 18005C-A, not the 15-inch wording in the old URL. Manufacturer lists a 26 × 3 × 3-inch envelope; confirm bracket drawing.'},
  corner:{brand:'Nilight',name:'13.5-inch curved corner bar',price:42.99,priceBasis:'Document quote; quantity/pack basis unconfirmed',currentPrice:null,watts:80,linkedWatts:'72 W advertised by linked listing; document says 80 W',size:[13.5,3,3],shape:'curved',lumens:'Not verified for selected variant',temperature:'6000 K in document',url:'https://www.amazon.com/dp/B0CLS2SZ8G',source:'https://www.amazon.com/dp/B0CLS2SZ8G?th=1&psc=1',beam:'Spot/flood type published; assumed 20° spot + 60° flood, vertical spread assumed',profiles:[{horizontal:20,vertical:10},{horizontal:60,vertical:30}],notes:'13.5-inch nominal length. Height, depth and bend are schematic. Product identity/power conflict remains visible, not silently corrected.'},
  down:{brand:'Nilight',name:'4-inch 18 W flood pod',price:42.99,priceBasis:'Document quote for four lights, not $42.99 each',currentPrice:null,watts:18,linkedWatts:'18 W advertised per pod',size:[4,3,3],shape:'bar',lumens:'1,260 advertised; document rounds to 1,200',temperature:'6000–6500 K advertised',url:'https://www.amazon.com/dp/B01KRV3PNA',source:nilight+'4inch-18w-1260lm-double-row-flood-led-pods-4pcs-16awg-wire-3pin-switch',beam:'Flood type published; 60° horizontal / 60° vertical assumed, not a measured beam',profiles:[{horizontal:60,vertical:60}],notes:'4-inch nominal size; height/depth schematic. Manufacturer comparison page includes a different harness bundle, so no current price is substituted.'}
};
export const defaultLighting=()=>({visible:true,beams:false,coverage:false,rangeFeet:40,enabled:{}});
export const radians=degrees=>degrees*Math.PI/180;
export const addVector=(first,second)=>first.map((value,index)=>value+second[index]);
export const scaleVector=(vector,scale)=>vector.map(value=>value*scale);
export const dotVector=(first,second)=>first.reduce((sum,value,index)=>sum+value*second[index],0);
export const normalizeVector=vector=>scaleVector(vector,1/Math.hypot(...vector));
export function beamBasis(direction,roll=0) {
  const right=normalizeVector([direction[2],0,-direction[0]]);
  const up=[direction[1]*right[2],direction[2]*right[0]-direction[0]*right[2],-direction[1]*right[0]];
  const angle=radians(roll);
  return {right:addVector(scaleVector(right,Math.cos(angle)),scaleVector(up,Math.sin(angle))),up:addVector(scaleVector(up,Math.cos(angle)),scaleVector(right,-Math.sin(angle)))};
}
export function lightLayout(dimensions) {
  const fixtures=[];
  const half=dimensions.width/2;
  const roof=dimensions.height;
  const front=dimensions.bodyFront;
  const rear=dimensions.length;
  const add=(id,name,product,position,yaw,pitch,surface,anchors,note='',roll=0,origin='document')=>{
    const direction=[Math.sin(radians(yaw))*Math.cos(radians(pitch)),-Math.sin(radians(pitch)),Math.cos(radians(yaw))*Math.cos(radians(pitch))];
    fixtures.push({id,name,product,position,direction,yaw,pitch,roll,surface,anchors,note,origin});
  };
  add('front-roof','Front roof · curved bar','curved',[0,roof+4,front+5],180,8,'roof',[[-20,roof,front+5],[20,roof,front+5]],'Above the fixed body front cap; 8° down. Hood/cab may shadow the near ground.');
  add('front-hood','Front hood · center bar','straight',[0,dimensions.cabFloor+39,12],180,0,'hood',[[-18,dimensions.cabFloor+36,12],[18,dimensions.cabFloor+36,12]],'Centered forward, with separate rear/outboard hood pods. Hood tilt and service clearance require a real vehicle check.');
  add('rear-roof','Rear roof · curved bar','curved',[0,roof+4,rear-5],0,8,'roof',[[-20,roof,rear-5],[20,roof,rear-5]],'Rearward; center bar above the door, not on its moving leaf.');
  add('rear-low','Rear lower · fixed bumper-mounted bar','straight',[0,Math.min(dimensions.rearBumperBottom+14,dimensions.floorHeight-4),rear+5],0,3,'bumper',[[-18,dimensions.rearBumperBottom+8,rear-3],[18,dimensions.rearBumperBottom+8,rear-3]],'Interprets the rear “hood mount” as a fixed bumper carrier, below the emergency-door sill. No rear hood exists.');
  const cabRoof=dimensions.cabFloor+dimensions.cabHeight;
  const cabRoofZ=front-dimensions.cabLength+30;
  add('front-cab-middle','Front cab roof · third middle bar','straight',[0,cabRoof+4,cabRoofZ],180,10,'cab-roof',[[-18,cabRoof,cabRoofZ],[18,cabRoof,cabRoofZ]],'Added by request: third forward center bar, on the lower cab roof between the hood bar and the higher passenger-body bar. Structural backing and windshield/service clearance require actual measurements.',0,'addition');
  const entryStart=front+6;
  const entryMiddle=entryStart+dimensions.entryWidth/2;
  const entryTop=dimensions.entrySill+dimensions.entryHeight;
  const entryJambZ=entryStart+dimensions.entryWidth+4;
  const entryJambY=dimensions.entrySill+dimensions.entryHeight/2;
  add('entry-inner','Side entry · exterior rear-jamb vertical bar','corner',[half+5,entryJambY,entryJambZ],90,45,'side',[[half,entryJambY-4,entryJambZ],[half,entryJambY+4,entryJambZ]],'User clarified: OUTSIDE beside the side door, not inside the entryway. Upright 13.5-inch bar on the fixed rear jamb, four-inch center setback behind the opening; about 2.5-inch housing-edge clearance. Faces outward and 45° down for the doorway ground area, clear of both moving leaves and below the passenger windows. Confirm actual jamb backing and open-door/grab-rail clearance.',90,'addition');
  add('entry-round','Side entry · centered circular header light','pod',[half+5,entryTop+7.5,entryMiddle],90,25,'side',[[half,entryTop+7.5,entryMiddle]],'Centered above the fixed side-door header, facing outward and 25° down. Reuses the document’s unresolved round-pod product/envelope, not a newly verified compact task lamp.',0,'addition');
  add('rear-door-round','Rear door · latch-side circular header light','pod',[-dimensions.rearDoorWidth/4,dimensions.floorHeight+dimensions.rearDoorHeight+7,rear+5],0,25,'rear',[[-dimensions.rearDoorWidth/4,dimensions.floorHeight+dimensions.rearDoorHeight+7,rear]],'Above the fixed rear-door header, offset toward the left/latch side opposite the modeled right-hand hinges; 25° down. If no rear door is selected, it remains a rear task light above the egress-window area.',0,'addition');
  for(const side of [-1,1]) {
    const sideName=side<0?'Left':'Right';
    const key=side<0?'left':'right';
    add(`front-pod-${key}`,`${sideName} front hood pod`,'pod',[side*29,dimensions.cabFloor+42,34],180-side*20,3,'hood',[[side*29,dimensions.cabFloor+36,34]],'20° outward; back and outboard of the central bar.');
    add(`rear-pod-${key}`,`${sideName} rear mid-height pod`,'pod',[side*(half-6),dimensions.floorHeight+dimensions.rearDoorHeight/2,rear+4],side*20,8,'rear',[[side*(half-6),dimensions.floorHeight+dimensions.rearDoorHeight/2,rear]],'Center six inches inboard of side edge, at door mid-height on FIXED rear panel, outside the door sweep.');
    const rearVerticalX=side*(dimensions.rearDoorWidth/2+8+lightProducts.side.size[1]/2);
    const rearVerticalY=dimensions.floorHeight+dimensions.rearDoorHeight/2;
    add(`rear-door-vertical-${key}`,`${sideName} rear door · vertical bar`,'side',[rearVerticalX,rearVerticalY,rear+5],0,25,'rear',[[rearVerticalX,rearVerticalY-9,rear],[rearVerticalX,rearVerticalY+9,rear]],'26-inch bar rolled 90° upright on the fixed rear panel. Approximately 8 inches from the door edge to the nearest housing edge, not to the center. Door leaf, hinges and existing outboard pods remain clear in the schematic; 25° down.',90,'addition');
    add(`front-bumper-${key}`,`${sideName} front bumper · circular near-field light`,'pod',[side*24,dimensions.frontBumperBottom+13,-3],180-side*12,45,'front-bumper',[[side*24,dimensions.frontBumperBottom+8,2.5]],'Bumper-top supported circular pod, 12° outward and 45° down to fill the near-ground hood shadow. Does not replace road headlights. Reuses the unresolved round-pod variant; brackets and bumper load capacity require verification.',0,'addition');
    const sideYaw=side*90;
    for(const [end,position] of [['front',front+25],['rear',rear-25]]) add(`side-${key}-${end}`,`${sideName} side · ${end} bar`,'side',[side*(half+4),roof-4,position],sideYaw,12,'side',[[side*half,roof-4,position-9],[side*half,roof-4,position+9]],'26-inch bar starts 12 inches from the fixed passenger-body end, above the entry/window tops; 12° down.');
    const middle=(front+rear)/2;
    add(`side-${key}-middle`,`${sideName} side · center curved bar`,'curved',[side*(half+4),roof-4,middle],sideYaw,6,'side',[[side*half,roof-4,middle-20],[side*half,roof-4,middle+20]],'Centered along the fixed passenger body, above windows; 6° down.');
    for(const fraction of [1/3,2/3]) {
      const position=front+(rear-front)*fraction;
      const height=dimensions.floorHeight+11;
      add(`side-${key}-fill-${fraction<0.5?'front':'rear'}`,`${sideName} side · ${fraction<0.5?'forward':'rearward'} lower fill bar`,'side',[side*(half+4),height,position],sideYaw,30,'side',[[side*half,height,position-9],[side*half,height,position+9]],'Added pair at one-third and two-thirds of the fixed passenger-body length: equal center-to-center and center-to-end spacing. Below windows and above the wheel envelope, 30° outward/down. This improves ground coverage but does not guarantee the strip immediately against the wall.',0,'addition');
    }
    for(const [end,position,endYaw] of [['front',front,180],['rear',rear,0]]) {
      const cornerX=side*(half-8);
      const diagonalYaw=endYaw+(end==='front'?-side*45:side*45);
      const cornerZ=end==='front'?front+8:rear-8;
      const anchorZ=end==='front'?front+8:rear-8;
      add(`roof-${key}-${end}`,`${sideName} ${end} roof corner bar`,'corner',[cornerX,roof+4,cornerZ],diagonalYaw,5,'roof',[[side*(half-5),roof,anchorZ],[side*(half-11),roof,anchorZ]],'Latest user instruction: 45° diagonally outward, center inset 8 inches from BOTH roof edges so the complete 13.5-inch housing ends remain inside the roof outline. Four-inch vertical center stand-off clears the roof; inboard anchors and brackets remain within the plan-view envelope. Housing/fastener clearance remains schematic.');
      const downPosition=end==='front'?front+4:rear-4;
      add(`down-${key}-${end}`,`${sideName} ${end} corner downlight`,'down',[side*(half+3),roof-6,downPosition],diagonalYaw,45,'side',[[side*half,roof-6,downPosition]],'Six inches below roof, aimed diagonally out/endward and 45° down; fixed body mount, not glass or door.');
    }
  }
  return fixtures;
}
export function lightEnabled(fixture,settings) {return settings.visible&&settings.enabled[fixture.id]!==false;}
export function bodyOccluders(dimensions) {
  return [
    {minimum:[-dimensions.width/2,dimensions.floorHeight,dimensions.bodyFront],maximum:[dimensions.width/2,dimensions.height,dimensions.length]},
    {minimum:[-dimensions.cabWidth/2,dimensions.cabFloor,dimensions.bodyFront-dimensions.cabLength],maximum:[dimensions.cabWidth/2,dimensions.cabFloor+dimensions.cabHeight,dimensions.bodyFront]},
    {minimum:[-36,dimensions.cabFloor-3,2],maximum:[36,dimensions.cabFloor+36,dimensions.bodyFront-dimensions.cabLength]}
  ];
}
export function rayBoxDistance(origin,direction,bounds) {
  let near=0;let far=Infinity;
  for(const axis of [0,1,2]) {
    if(Math.abs(direction[axis])<1e-9) {if(origin[axis]<bounds.minimum[axis]||origin[axis]>bounds.maximum[axis])return Infinity;continue;}
    const intersections=[(bounds.minimum[axis]-origin[axis])/direction[axis],(bounds.maximum[axis]-origin[axis])/direction[axis]].sort((first,second)=>first-second);
    near=Math.max(near,intersections[0]);far=Math.min(far,intersections[1]);if(near>far)return Infinity;
  }
  return far<0?Infinity:near;
}
export function beamEndpoint(fixture,profile,horizontalSign,verticalSign,range,dimensions) {
  const {right,up}=beamBasis(fixture.direction,fixture.roll);
  const direction=normalizeVector(addVector(fixture.direction,addVector(scaleVector(right,horizontalSign*Math.tan(radians(profile.horizontal/2))),scaleVector(up,verticalSign*Math.tan(radians(profile.vertical/2))))));
  const origin=emitterPosition(fixture);
  const groundDistance=direction[1]<0?-origin[1]/direction[1]:Infinity;
  const obstruction=Math.min(...bodyOccluders(dimensions).map(bounds=>rayBoxDistance(origin,direction,bounds)));
  return addVector(origin,scaleVector(direction,Math.max(0,Math.min(range,groundDistance,obstruction))));
}
export function emitterPosition(fixture) {return addVector(fixture.position,scaleVector(fixture.direction,lightProducts[fixture.product].size[2]/2+0.15));}
export function barHousingBounds(fixture) {
  const product=lightProducts[fixture.product];const [width,height,depth]=product.size;
  const {right,up}=beamBasis(fixture.direction,fixture.roll);const points=[];
  const segments=product.shape==='curved'?11:1;
  for(let index=0;index<segments;index++) {
    const fraction=(index+0.5)/segments-0.5;const yaw=segments===1?0:fraction*0.55;
    for(const horizontal of [-1,1])for(const vertical of [-1,1])for(const forward of [-1,1]) {
      const localX=horizontal*(width/segments/2+0.02);
      const localZ=forward*(depth/2+0.15);
      const rotatedX=localX*Math.cos(yaw)+localZ*Math.sin(yaw)+width*fraction;
      const rotatedZ=-localX*Math.sin(yaw)+localZ*Math.cos(yaw)-(segments===1?0:fraction*fraction*depth);
      points.push(addVector(fixture.position,addVector(scaleVector(right,rotatedX),addVector(scaleVector(up,vertical*height/2),scaleVector(fixture.direction,rotatedZ)))));
    }
  }
  return {minimum:[0,1,2].map(axis=>Math.min(...points.map(point=>point[axis]))),maximum:[0,1,2].map(axis=>Math.max(...points.map(point=>point[axis])))};
}
export function beamReaches(fixture,point,range,dimensions) {
  const origin=emitterPosition(fixture);
  const delta=point.map((value,index)=>value-origin[index]);const distance=Math.hypot(...delta);
  if(distance>range||distance<0.01)return false;
  const along=dotVector(delta,fixture.direction);if(along<=0)return false;
  const {right,up}=beamBasis(fixture.direction,fixture.roll);
  const horizontal=Math.abs(Math.atan2(dotVector(delta,right),along));
  const vertical=Math.abs(Math.atan2(dotVector(delta,up),along));
  if(!lightProducts[fixture.product].profiles.some(profile=>horizontal<=radians(profile.horizontal/2)&&vertical<=radians(profile.vertical/2)))return false;
  const direction=scaleVector(delta,1/distance);
  return !bodyOccluders(dimensions).some(bounds=>rayBoxDistance(origin,direction,bounds)<distance-0.1);
}
export function coverageReview(dimensions,settings) {
  const fixtures=lightLayout(dimensions).filter(fixture=>lightEnabled(fixture,settings));
  const range=settings.rangeFeet*12;
  const samples=[];const rings=[];
  for(const feet of [2,5,10,20,40].filter(value=>value<settings.rangeFeet)) {
    const distance=feet*12;const half=dimensions.width/2;
    const points=[];
    for(let position=-half-distance;position<=half+distance;position+=24) {
      points.push({zone:'Front',point:[position,0.1,-distance]},{zone:'Rear',point:[position,0.1,dimensions.length+distance]});
    }
    for(let position=-distance+24;position<dimensions.length+distance;position+=24) points.push({zone:'Left',point:[-half-distance,0.1,position]},{zone:'Right',point:[half+distance,0.1,position]});
    const zones={};
    for(const sample of points) {
      const hits=fixtures.filter(fixture=>beamReaches(fixture,sample.point,range,dimensions)).map(fixture=>fixture.id);
      const result={...sample,feet,hits};samples.push(result);
      zones[sample.zone]??={covered:0,total:0};zones[sample.zone].total++;if(hits.length)zones[sample.zone].covered++;
    }
    rings.push({feet,zones});
  }
  const allFixtures=lightLayout(dimensions);
  const nominalWatts=list=>list.reduce((sum,fixture)=>sum+lightProducts[fixture.product].watts,0);
  return {samples,rings,fixtureCount:fixtures.length,documentWatts:nominalWatts(allFixtures.filter(fixture=>fixture.origin==='document')),additionWatts:nominalWatts(allFixtures.filter(fixture=>fixture.origin==='addition')),nominalWatts:nominalWatts(allFixtures)};
}
