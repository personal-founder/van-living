import {derivedDimensions,doorLayout} from './model.js?v=11';

export function structureLayout(dimensions) {
  const derived=derivedDimensions(dimensions);
  const entry=doorLayout(dimensions).entry;
  const steps=[];
  for(let level=dimensions.firstStepHeight;level<dimensions.floorHeight;level=dimensions.firstStepHeight+steps.length*dimensions.stepRise) steps.push(level);
  const wellDepth=steps.length*dimensions.stepTread;
  const railBottom=Math.min(dimensions.cabFloor-10,dimensions.floorHeight-12);
  const parts=[];
  const add=(name,layer,width,height,depth,x,y,z,color)=>parts.push({name,layer,width,height,depth,x,y,z,color});
  const wellBottom=dimensions.firstStepHeight-1.2;
  add('stepwell-pan','floor',wellDepth,1.2,entry.width,dimensions.width/2-wellDepth,wellBottom,entry.start,'#53665d');
  const cheek=(entry.width-dimensions.stepWidth)/2;
  for(const location of [entry.start,entry.start+entry.width-cheek]) add('stepwell-cheek','floor',wellDepth,dimensions.floorHeight-wellBottom,cheek,dimensions.width/2-wellDepth,wellBottom,location,'#667a70');
  for(const [index,level] of steps.entries()) {
    const x=dimensions.width/2-(index+1)*dimensions.stepTread;
    const next=steps[index+1]??dimensions.floorHeight;
    add(`tread-${index}`,'floor',dimensions.stepTread,1.2,dimensions.stepWidth,x,level-1.2,entry.start+cheek,'#71897c');
    add(`riser-${index}`,'floor',1.2,next-level,dimensions.stepWidth,x,level,entry.start+cheek,'#53665d');
  }
  for(const side of [-1,1]) add('frame-rail','chassis',6,8,dimensions.length-9,side<0?-20:14,railBottom,3,'#35433e');
  for(const location of [derived.cabFront,dimensions.bodyFront,derived.rearAxle,dimensions.length-14]) add('crossmember','chassis',40,6,4,-20,railBottom+2,location,'#35433e');
  for(const location of [dimensions.bodyFront,derived.rearAxle,dimensions.length-14]) for(const side of [-1,1]) add('body-floor-support','chassis',6,dimensions.floorHeight-2-railBottom-8,4,side<0?-20:14,railBottom+8,location,'#53665d');
  for(const location of [dimensions.frontOverhang,derived.rearAxle]) for(const side of [-1,1]) add('suspension-support','chassis',6,railBottom-dimensions.tireDiameter/2,14,side<0?-20:14,dimensions.tireDiameter/2,location-7,'#4c5a53');
  add('rear-bumper','chassis',dimensions.width,8,6,-dimensions.width/2,dimensions.rearBumperBottom,dimensions.length-6,'#35433e');
  add('rear-valance','rear',dimensions.width,dimensions.floorHeight-dimensions.rearBumperBottom-8,3,-dimensions.width/2,dimensions.rearBumperBottom+8,dimensions.length-3,'#aabbb1');
  add('front-bumper','cab',84,8,5,-42,dimensions.frontBumperBottom,0,'#536965');
  add('front-fascia','cab',76,dimensions.cabFloor+36-dimensions.frontBumperBottom-8,2,-38,dimensions.frontBumperBottom+8,1,'#aebeb7');
  const shoulder=(dimensions.width-dimensions.cabWidth)/2;
  for(const side of [-1,1]) add('cab-body-shoulder','front',shoulder,dimensions.cabHeight,4,side<0?-dimensions.width/2:dimensions.cabWidth/2,dimensions.cabFloor,dimensions.bodyFront-4,'#bac9c0');
  add('cab-body-header','front',dimensions.width,dimensions.height-dimensions.cabFloor-dimensions.cabHeight,6,-dimensions.width/2,dimensions.cabFloor+dimensions.cabHeight,dimensions.bodyFront-4,'#bac9c0');
  add('cab-body-sill','floor',dimensions.width,2,6,-dimensions.width/2,dimensions.cabFloor-2,dimensions.bodyFront-4,'#667a72');
  const midFloor=(dimensions.cabFloor+dimensions.floorHeight)/2;
  add('cab-transition-step','floor',36,midFloor-dimensions.cabFloor,8,-18,dimensions.cabFloor,dimensions.bodyFront-6,'#667a72');
  add('cab-transition-landing','floor',36,dimensions.floorHeight-midFloor,2,-18,midFloor,dimensions.bodyFront,'#667a72');
  return {steps,wellDepth,railBottom,parts,walkThroughTop:dimensions.cabFloor+dimensions.cabHeight-2,axles:[{z:dimensions.frontOverhang,width:dimensions.frontTrack},{z:derived.rearAxle,width:dimensions.rearTrack+10}],wheelCenterHeight:dimensions.tireDiameter/2};
}

