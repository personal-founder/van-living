import {defaultLighting,lightLayout} from './lighting-plan.js?v=8';
import {defaultWaterTanks,waterTankLayout} from './water-tank-plan.js?v=7';
export const brochure = 'https://forestriverbus.com/brochures/Starcraft-Allstar-XL-Freightliner-Brochure.pdf';
export const viewDirections = {front:[0,0,-1],rear:[0,0,1],left:[-1,0,0],right:[1,0,0],top:[0,1,0],bottom:[0,-1,0]};
export const fieldDefinitions = [
  ['length','Overall length',480,'Published'],['width','Body width',102,'Published; excludes mirrors'],['height','Overall height',131,'Published'],
  ['interiorWidth','Interior width',98,'Published'],['interiorHeight','Interior height',79.75,'Published'],['floorHeight','Ground to interior floor',44,'Published'],['wheelbase','Wheelbase',291,'Published for brochure configuration'],
  ['bodyFront','Nose to passenger body',128,'Estimate'],['interiorLength','Passenger clear length',348,'Estimate'],['cabLength','Cab enclosure length',72,'Estimate; excludes hood'],['cabWidth','Cab enclosure width',86,'Estimate'],['cabHeight','Cab enclosure height',74,'Estimate'],['cabFloor','Ground to cab floor',34,'Estimate'],
  ['frontOverhang','Nose to front axle',46,'Estimate'],['tireDiameter','Tire outside diameter',39,'Estimate'],['frontTrack','Front tire center spacing',80,'Estimate'],['rearTrack','Rear dual-pair center spacing',80,'Estimate'],
  ['entryWidth','Entry door nominal width',36,'Published nominal; clear passage is 31 in with one rail or 30 in with two'],['entryHeight','Entry door height',96,'Estimate'],['entrySill','Entry door sill above ground',15.5,'Estimate; first-step reference is 15.5 in'],
  ['driverDoorWidth','Driver door length along cab',38,'Estimate'],['driverDoorHeight','Driver door height',70,'Estimate'],['rearDoorWidth','Optional rear door width',32,'Estimate'],['rearDoorHeight','Optional rear door height',72,'Estimate'],
  ['windowWidth','Passenger window nominal width',36,'Published nominal; not a cutout or glass order size'],['windowHeight','Passenger window nominal height',36,'Published nominal; not a cutout or glass order size'],['windowSill','Passenger window bottom above floor',38,'Estimate'],['windowGap','Passenger window spacing',4,'Estimate'],
  ['firstStepHeight','Ground to first step surface',15.5,'Published'],['stepRise','Intermediate step rise',9.75,'Published; final rise closes to the floor height'],['stepTread','Step tread depth',9.75,'Published'],['stepWidth','Step tread width',35.75,'Published'],['frontBumperBottom','Ground to front bumper bottom',21,'Estimate'],['rearBumperBottom','Ground to rear bumper bottom',24,'Estimate']
];
export function blankDesign() {
  return {version:2,vehicle:'Starcraft Allstar XL Freightliner · 40 ft / wide body target',dimensions:Object.fromEntries(fieldDefinitions.map(([key,,value])=>[key,value])),visible:{roof:true,left:true,right:true,front:true,rear:true,floor:true,cab:true,wheels:true,chassis:true,dimensions:true,doors:true,windows:true},cutaway:false,items:[],doors:{rear:true,open:false},lighting:defaultLighting(),waterTanks:defaultWaterTanks(),dimensionMode:'simple',dimensionGroups:{exterior:true,interior:true,cab:false,doors:true,chassis:false,windows:false}};
}
export function upgradeDesign(design) {
  if(!design||design.version!==2) return design;
  const defaults=blankDesign();
  const dimensions={...defaults.dimensions,...design.dimensions};
  if(design.dimensions?.firstStepHeight===undefined) dimensions.firstStepHeight=Math.max(defaults.dimensions.firstStepHeight,dimensions.entrySill);
  if(design.dimensions?.stepWidth===undefined) dimensions.stepWidth=Math.min(defaults.dimensions.stepWidth,dimensions.entryWidth-0.25);
  return {...design,dimensions,visible:{...defaults.visible,...design.visible},doors:{...defaults.doors,...design.doors},lighting:{...defaults.lighting,...design.lighting},waterTanks:{...defaults.waterTanks,...design.waterTanks},dimensionMode:design.dimensionMode??defaults.dimensionMode,dimensionGroups:{...defaults.dimensionGroups,...design.dimensionGroups}};
}
export function doorLayout(dimensions) {
  return {entry:{start:dimensions.bodyFront+6,width:dimensions.entryWidth,height:dimensions.entryHeight,sill:dimensions.entrySill},driver:{start:dimensions.bodyFront-dimensions.driverDoorWidth-6,width:dimensions.driverDoorWidth,height:dimensions.driverDoorHeight,sill:dimensions.cabFloor},rear:{width:dimensions.rearDoorWidth,height:dimensions.rearDoorHeight,sill:dimensions.floorHeight}};
}
export function windowLayout(dimensions) {
  const windows=[];
  const entry=doorLayout(dimensions).entry;
  for(const side of [-1,1]) {
    const start=side===-1?dimensions.bodyFront+8:entry.start+entry.width+8;
    for(let position=start;position+dimensions.windowWidth<=dimensions.length-8;position+=dimensions.windowWidth+dimensions.windowGap) windows.push({side,start:position,width:dimensions.windowWidth,height:dimensions.windowHeight,sill:dimensions.floorHeight+dimensions.windowSill});
  }
  return windows;
}
export function derivedDimensions(dimensions) {
  return {sideThickness:(dimensions.width-dimensions.interiorWidth)/2,roofThickness:dimensions.height-dimensions.floorHeight-dimensions.interiorHeight,rearAxle:dimensions.frontOverhang+dimensions.wheelbase,rearOverhang:dimensions.length-dimensions.frontOverhang-dimensions.wheelbase,cabFront:dimensions.bodyFront-dimensions.cabLength,interiorStart:dimensions.length-2-dimensions.interiorLength};
}
export function validateDesign(design) {
  if (!design || design.version!==2 || !design.dimensions || !design.visible || !Array.isArray(design.items) || design.items.length || typeof design.cutaway!=='boolean') throw new Error('Use a version 2 empty vehicle-shell file. Legacy furnished designs are not loaded.');
  for (const [key,label] of fieldDefinitions) {
    const value=design.dimensions[key];
    if (!Number.isFinite(value)||value<=0||value>720) throw new Error(`${label} must be greater than 0 and no more than 720 inches.`);
  }
  const dimensions=design.dimensions;
  const derived=derivedDimensions(dimensions);
  const doors=doorLayout(dimensions);
  const stepCount=Math.ceil((dimensions.floorHeight-dimensions.firstStepHeight)/dimensions.stepRise);
  if(dimensions.firstStepHeight<=1.2||dimensions.firstStepHeight<dimensions.entrySill||dimensions.firstStepHeight>=dimensions.floorHeight||stepCount<1||stepCount>8||stepCount*dimensions.stepTread>=dimensions.width/2-4||dimensions.stepWidth>=dimensions.entryWidth||dimensions.stepWidth<=4||dimensions.frontBumperBottom+8>=dimensions.cabFloor+33||dimensions.rearBumperBottom+8>=dimensions.floorHeight||dimensions.cabFloor<=dimensions.floorHeight-20||dimensions.cabFloor>=dimensions.floorHeight||dimensions.cabWidth>=dimensions.width||Math.min(dimensions.cabFloor-10,dimensions.floorHeight-12)<=dimensions.tireDiameter/2+2) throw new Error('Steps, bumper heights, cab floor and axle supports must fit beneath the vehicle floors.');
  if(dimensions.windowSill+dimensions.windowHeight>=dimensions.interiorHeight||dimensions.windowWidth>dimensions.length-dimensions.bodyFront-16) throw new Error('Passenger windows must fit below the ceiling and within the body.');
  if(dimensions.driverDoorWidth<=8||dimensions.driverDoorHeight<=64||dimensions.cabHeight<=66||dimensions.entryWidth<=8||dimensions.rearDoorWidth<=8||dimensions.rearDoorHeight<=33||windowLayout(dimensions).length>40) throw new Error('Glazing must fit its door and roof; passenger window count must not exceed 40.');
  if(doors.entry.start+doors.entry.width>=derived.rearAxle-dimensions.tireDiameter/2-2||doors.entry.sill>=dimensions.floorHeight||doors.entry.sill+doors.entry.height>=dimensions.floorHeight+dimensions.interiorHeight||doors.driver.start<=derived.cabFront+18||doors.driver.height>=dimensions.cabHeight||doors.rear.width>=dimensions.interiorWidth||doors.rear.height>=dimensions.interiorHeight) throw new Error('Door openings must fit their body/cab panels and clear the rear wheel arch.');
  if(Math.abs(dimensions.interiorLength-(dimensions.length-dimensions.bodyFront-4))>0.01) throw new Error('Passenger clear length must equal overall length minus nose-to-body distance minus the two 2-inch end panels.');
  if (dimensions.interiorWidth>=dimensions.width||derived.roofThickness<=0||derived.rearOverhang<=dimensions.tireDiameter/2||dimensions.frontOverhang<=dimensions.tireDiameter/2||derived.cabFront<=0||dimensions.cabFloor+dimensions.cabHeight>dimensions.height||derived.interiorStart<dimensions.bodyFront||dimensions.frontTrack+12>dimensions.width||dimensions.rearTrack+20>dimensions.width||dimensions.tireDiameter>=dimensions.floorHeight*2) throw new Error('Dimensions conflict: check body clearances, cab, wheels, and axle locations.');
  for (const key of Object.keys(blankDesign().visible)) if(typeof design.visible[key]!=='boolean') throw new Error(`Missing visibility setting: ${key}`);
  if(!design.doors||typeof design.doors.rear!=='boolean'||typeof design.doors.open!=='boolean') throw new Error('Invalid door configuration.');
  if(!['simple','all'].includes(design.dimensionMode)) throw new Error('Choose Simple Dimensions or All Dimensions.');
  for(const key of Object.keys(blankDesign().dimensionGroups)) if(typeof design.dimensionGroups?.[key]!=='boolean') throw new Error(`Missing dimension category: ${key}`);
  const lighting=design.lighting;
  if(!lighting||['visible','beams','coverage'].some(key=>typeof lighting[key]!=='boolean')||![20,40,80].includes(lighting.rangeFeet)||!lighting.enabled||typeof lighting.enabled!=='object'||Array.isArray(lighting.enabled)) throw new Error('Invalid exterior lighting controls.');
  const fixtureIds=new Set(lightLayout(dimensions).map(fixture=>fixture.id));
  if(Object.entries(lighting.enabled).some(([key,value])=>!fixtureIds.has(key)||typeof value!=='boolean')) throw new Error('Invalid individual light setting.');
  if(!design.waterTanks||typeof design.waterTanks.visible!=='boolean') throw new Error('Invalid interior water tank visibility setting.');
  waterTankLayout(dimensions);
  return design;
}
export function dimensionText(inches,title,estimated=false) {
  const feet=Math.floor(inches/12);
  return `${feet}'${Number((inches-feet*12).toFixed(2))}" ${title} (${Number(inches.toFixed(2))} in)${estimated?' · est.':''}`;
}
export function selectDimensions(candidates,mode,groups) {
  const available=candidates.filter(candidate=>groups[candidate.category]&&candidate.screenLength>=24);
  if(mode==='all') return available;
  const unique=new Map();
  for(const candidate of available) if(!unique.has(candidate.key)||candidate.screenLength>unique.get(candidate.key).screenLength) unique.set(candidate.key,candidate);
  return [...unique.values()];
}
export function dimensionSegments(design) {
  const dimensions=design.dimensions;
  const derived=derivedDimensions(dimensions);
  const doors=doorLayout(dimensions);
  const segments=[];
  const verified=key=>{const reference=fieldDefinitions.find(definition=>definition[0]===key);return reference?.[3].startsWith('Published')&&dimensions[key]===reference[2];};
  const add=(key,category,start,end,value,title,estimated=false)=>segments.push({id:`${key}-${segments.length}`,key,category,start,end,value,title,estimated});
  const volume=(key,category,minimum,maximum,titles,estimates)=>{
    for(const axis of [0,1,2]) {
      const others=[0,1,2].filter(value=>value!==axis);
      for(const first of [0,1]) for(const second of [0,1]) {
        const start=[...minimum];const end=[...minimum];
        start[others[0]]=end[others[0]]=first?maximum[others[0]]:minimum[others[0]];
        start[others[1]]=end[others[1]]=second?maximum[others[1]]:minimum[others[1]];
        end[axis]=maximum[axis];
        add(`${key}-${axis}`,category,start,end,maximum[axis]-minimum[axis],titles[axis],estimates[axis]);
      }
    }
  };
  volume('outside','exterior',[-dimensions.width/2,0,0],[dimensions.width/2,dimensions.height,dimensions.length],['Wide','High','Long'],['width','height','length'].map(key=>!verified(key)));
  volume('inside','interior',[-dimensions.interiorWidth/2,dimensions.floorHeight,derived.interiorStart],[dimensions.interiorWidth/2,dimensions.floorHeight+dimensions.interiorHeight,dimensions.length-2],['Interior wide','Interior high','Interior long'],[!verified('interiorWidth'),!verified('interiorHeight'),true]);
  volume('cab','cab',[-dimensions.cabWidth/2,dimensions.cabFloor,derived.cabFront],[dimensions.cabWidth/2,dimensions.cabFloor+dimensions.cabHeight,dimensions.bodyFront],['Cab wide','Cab high','Cab long'],[true,true,true]);
  for(const side of [-1,1]) {
    const axleX=side*(dimensions.width/2+8);
    add('wheelbase','chassis',[axleX,dimensions.tireDiameter/2,dimensions.frontOverhang],[axleX,dimensions.tireDiameter/2,derived.rearAxle],dimensions.wheelbase,'Wheelbase',!verified('wheelbase'));
    add('front-overhang','chassis',[axleX,0,0],[axleX,0,dimensions.frontOverhang],dimensions.frontOverhang,'Front overhang',true);
    add('rear-overhang','chassis',[axleX,0,derived.rearAxle],[axleX,0,dimensions.length],derived.rearOverhang,'Rear overhang',true);
    add('floor','chassis',[side*dimensions.width/2,0,dimensions.bodyFront],[side*dimensions.width/2,dimensions.floorHeight,dimensions.bodyFront],dimensions.floorHeight,'Floor above ground',!verified('floorHeight'));
    add('tire','chassis',[side*dimensions.frontTrack/2,0,dimensions.frontOverhang],[side*dimensions.frontTrack/2,dimensions.tireDiameter,dimensions.frontOverhang],dimensions.tireDiameter,'Tire diameter',true);
    add('body-front','chassis',[axleX,0,0],[axleX,0,dimensions.bodyFront],dimensions.bodyFront,'Nose to body',true);
    for(const location of [derived.cabFront,dimensions.bodyFront]) add('cab-floor','chassis',[side*dimensions.cabWidth/2,0,location],[side*dimensions.cabWidth/2,dimensions.cabFloor,location],dimensions.cabFloor,'Cab floor above ground',true);
    add('front-bumper-ground','chassis',[side*40,0,0],[side*40,dimensions.frontBumperBottom,0],dimensions.frontBumperBottom,'Front bumper bottom',true);
    add('rear-bumper-ground','chassis',[side*dimensions.width/2,0,dimensions.length],[side*dimensions.width/2,dimensions.rearBumperBottom,dimensions.length],dimensions.rearBumperBottom,'Rear bumper bottom',true);
  }
  add('first-step-ground','chassis',[dimensions.width/2,0,doors.entry.start],[dimensions.width/2,dimensions.firstStepHeight,doors.entry.start],dimensions.firstStepHeight,'First step surface',!verified('firstStepHeight'));
  for(let index=0,level=dimensions.firstStepHeight;level<dimensions.floorHeight;index++,level=dimensions.firstStepHeight+index*dimensions.stepRise) {
    const next=Math.min(level+dimensions.stepRise,dimensions.floorHeight);
    const x=dimensions.width/2-(index+1)*dimensions.stepTread;
    add(`step-rise-${index}`,'chassis',[x,level,doors.entry.start],[x,next,doors.entry.start],next-level,index===Math.ceil((dimensions.floorHeight-dimensions.firstStepHeight)/dimensions.stepRise)-1?'Final rise to floor':'Intermediate step rise',next===dimensions.floorHeight||!verified('stepRise'));
  }
  add('front-track','chassis',[-dimensions.frontTrack/2,dimensions.tireDiameter/2,dimensions.frontOverhang],[dimensions.frontTrack/2,dimensions.tireDiameter/2,dimensions.frontOverhang],dimensions.frontTrack,'Front tire centers',true);
  add('rear-track','chassis',[-dimensions.rearTrack/2,dimensions.tireDiameter/2,derived.rearAxle],[dimensions.rearTrack/2,dimensions.tireDiameter/2,derived.rearAxle],dimensions.rearTrack,'Rear dual-pair centers',true);
  for(const location of [doors.entry.start,doors.entry.start+doors.entry.width]) add('entry-sill','doors',[dimensions.width/2,0,location],[dimensions.width/2,doors.entry.sill,location],doors.entry.sill,'Entry sill above ground',true);
  for(const [name,door,x] of [['Entry',doors.entry,dimensions.width/2],['Driver',doors.driver,-dimensions.cabWidth/2]]) {
    for(const level of [door.sill,door.sill+door.height]) add(`${name}-width`,'doors',[x,level,door.start],[x,level,door.start+door.width],door.width,`${name} ${name==='Entry'?'nominal ':''}wide`,name!=='Entry'||!verified('entryWidth'));
    for(const location of [door.start,door.start+door.width]) add(`${name}-height`,'doors',[x,door.sill,location],[x,door.sill+door.height,location],door.height,`${name} high`,true);
  }
  if(design.doors.rear) {
    const door=doors.rear;
    for(const level of [door.sill,door.sill+door.height]) add('Rear-width','doors',[-door.width/2,level,dimensions.length],[door.width/2,level,dimensions.length],door.width,'Optional rear wide',true);
    for(const side of [-1,1]) add('Rear-height','doors',[side*door.width/2,door.sill,dimensions.length],[side*door.width/2,door.sill+door.height,dimensions.length],door.height,'Optional rear high',true);
  }
  for(const window of windowLayout(dimensions)) {
    const x=window.side*dimensions.width/2;
    for(const level of [window.sill,window.sill+window.height]) add('passenger-window-width','windows',[x,level,window.start],[x,level,window.start+window.width],window.width,'Passenger window nominal wide',!verified('windowWidth'));
    for(const location of [window.start,window.start+window.width]) add('passenger-window-height','windows',[x,window.sill,location],[x,window.sill+window.height,location],window.height,'Passenger window nominal high',!verified('windowHeight'));
  }
  const driver=doors.driver;
  const cabWindows=[['driver-glass',-dimensions.cabWidth/2,driver.start+4,driver.sill+40,driver.width-8,24],['transition-glass',dimensions.cabWidth/2,dimensions.bodyFront-28,dimensions.cabFloor+6,24,60]];
  for(const [key,x,start,sill,width,height] of cabWindows) {
    for(const level of [sill,sill+height]) add(`${key}-width`,'windows',[x,level,start],[x,level,start+width],width,`${key==='driver-glass'?'Driver glass':'Transition glass'} wide`,true);
    for(const location of [start,start+width]) add(`${key}-height`,'windows',[x,sill,location],[x,sill+height,location],height,`${key==='driver-glass'?'Driver glass':'Transition glass'} high`,true);
  }
  const windshieldBottom=dimensions.cabFloor+40;
  const windshieldTop=dimensions.cabFloor+dimensions.cabHeight;
  add('windshield-width','windows',[-(dimensions.cabWidth-10)/2,windshieldBottom,derived.cabFront],[(dimensions.cabWidth-10)/2,windshieldBottom,derived.cabFront],dimensions.cabWidth-10,'Windshield wide',true);
  add('windshield-height','windows',[0,windshieldBottom,derived.cabFront],[0,windshieldTop,derived.cabFront+18],Math.hypot(18,dimensions.cabHeight-40),'Windshield slope',true);
  return segments;
}
export function formatDimension(inches) {
  const feet=Math.floor(inches/12);
  return `${feet}′ ${Number((inches-feet*12).toFixed(2))}″ (${inches} in)`;
}
