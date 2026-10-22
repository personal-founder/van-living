export const brochure = 'https://forestriverbus.com/brochures/Starcraft-Allstar-XL-Freightliner-Brochure.pdf';
export const viewDirections = {front:[0,0,-1],rear:[0,0,1],left:[-1,0,0],right:[1,0,0],top:[0,1,0],bottom:[0,-1,0]};
export const fieldDefinitions = [
  ['length','Overall length',480,'Published'],['width','Body width',102,'Published; excludes mirrors'],['height','Overall height',131,'Published'],
  ['interiorWidth','Interior width',98,'Published'],['interiorHeight','Interior height',79.75,'Published'],['floorHeight','Ground to interior floor',44,'Published'],['wheelbase','Wheelbase',291,'Published for brochure configuration'],
  ['bodyFront','Nose to passenger body',128,'Estimate'],['interiorLength','Passenger clear length',348,'Estimate'],['cabLength','Cab enclosure length',72,'Estimate; excludes hood'],['cabWidth','Cab enclosure width',86,'Estimate'],['cabHeight','Cab enclosure height',74,'Estimate'],['cabFloor','Ground to cab floor',34,'Estimate'],
  ['frontOverhang','Nose to front axle',46,'Estimate'],['tireDiameter','Tire outside diameter',39,'Estimate'],['frontTrack','Front tire center spacing',80,'Estimate'],['rearTrack','Rear dual-pair center spacing',80,'Estimate']
];
export function blankDesign() {
  return {version:2,vehicle:'Starcraft Allstar XL Freightliner · 40 ft / wide body target',dimensions:Object.fromEntries(fieldDefinitions.map(([key,,value])=>[key,value])),visible:{roof:true,left:true,right:true,front:true,rear:true,floor:true,cab:true,wheels:true,dimensions:true},cutaway:true,items:[]};
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
  if(Math.abs(dimensions.interiorLength-(dimensions.length-dimensions.bodyFront-4))>0.01) throw new Error('Passenger clear length must equal overall length minus nose-to-body distance minus the two 2-inch end panels.');
  if (dimensions.interiorWidth>=dimensions.width||derived.roofThickness<=0||derived.rearOverhang<=dimensions.tireDiameter/2||dimensions.frontOverhang<=dimensions.tireDiameter/2||derived.cabFront<=0||dimensions.cabFloor+dimensions.cabHeight>dimensions.height||derived.interiorStart<dimensions.bodyFront||dimensions.frontTrack+12>dimensions.width||dimensions.rearTrack+20>dimensions.width||dimensions.tireDiameter>=dimensions.floorHeight*2) throw new Error('Dimensions conflict: check body clearances, cab, wheels, and axle locations.');
  for (const key of Object.keys(blankDesign().visible)) if(typeof design.visible[key]!=='boolean') throw new Error(`Missing visibility setting: ${key}`);
  return design;
}
export function formatDimension(inches) {
  const feet=Math.floor(inches/12);
  return `${feet}′ ${Number((inches-feet*12).toFixed(2))}″ (${inches} in)`;
}
