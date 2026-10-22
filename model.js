export const layerNames = {floor:'Floor',skin:'Outer skin',insulation:'Insulation',lining:'Inner lining',furniture:'Furniture',door:'Doors',wall:'Partitions',water:'Water',electric:'Electrical',air:'Air ducts'};
export const routeKinds = ['water','electric','air'];
export const boxKeys = ['x','y','z','width','height','depth'];
export function exampleDesign() {
  return {version:1,shell:{length:216,width:84,height:78},walls:{skin:0.06,insulation:1.5,lining:0.25},visible:Object.fromEntries(Object.keys(layerNames).map(key=>[key,!['skin','insulation','lining'].includes(key)])),items:[
    {id:'bed',kind:'furniture',name:'Example bed',x:9,y:0,z:2,width:66,height:22,depth:75,color:'#ad8e68'},
    {id:'cabinet',kind:'furniture',name:'Example galley',x:0,y:0,z:100,width:22,height:36,depth:65,color:'#668c88'},
    {id:'door',kind:'door',name:'Example door panel',x:52,y:0,z:170,width:28,height:72,depth:1.5,color:'#c4a273'},
    {id:'water',kind:'water',name:'Example water route',diameter:1,color:'#338cce',points:[[6,5,15],[6,5,140],[6,28,140]]},
    {id:'electric',kind:'electric',name:'Example wire route',diameter:0.5,color:'#d99530',points:[[79,8,15],[79,8,195],[79,65,195],[20,65,195]]},
    {id:'air',kind:'air',name:'Example air duct',diameter:4,color:'#84978f',points:[[73,72,15],[73,72,155]]}
  ]};
}
function numberIn(value,min,max,label) { if (!Number.isFinite(value)||value<min||value>max) throw new Error(`${label} must be between ${min} and ${max}.`); }
export function validateDesign(design) {
  if (!design || design.version!==1 || !design.shell || !design.walls || !design.visible || !Array.isArray(design.items)) throw new Error('Expected a Van Living version 1 design.');
  numberIn(design.shell.length,24,600,'Interior length');
  for (const key of ['width','height']) numberIn(design.shell[key],24,144,`Interior ${key}`);
  for (const key of ['skin','insulation','lining']) numberIn(design.walls[key],0.01,6,key);
  for (const key of Object.keys(layerNames)) if (typeof design.visible[key]!=='boolean') throw new Error(`Missing visibility: ${key}`);
  if (design.items.length>300) throw new Error('Limit: 300 components for lightweight rendering.');
  const identifiers=new Set();
  for (const item of design.items) {
    if (!item || typeof item.id!=='string'||!item.id||identifiers.has(item.id)) throw new Error('Component IDs must be unique.');
    identifiers.add(item.id);
    if (!Object.keys(layerNames).includes(item.kind)||['floor','skin','insulation','lining'].includes(item.kind)) throw new Error('Unknown component type.');
    if (typeof item.name!=='string'||!item.name.trim()||item.name.length>80||!/^#[0-9a-f]{6}$/i.test(item.color)) throw new Error('Invalid component name or color.');
    if (routeKinds.includes(item.kind)) {
      numberIn(item.diameter,0.125,24,'Diameter');
      if (!Array.isArray(item.points)||item.points.length<2||item.points.length>100) throw new Error('Routes need 2–100 points.');
      item.points.forEach((point,index)=>{
        if (!Array.isArray(point)||point.length!==3) throw new Error('Each route point needs X, Y, Z.');
        point.forEach(coordinate=>numberIn(coordinate,-600,600,'Route coordinate'));
        if (index && point.every((value,axis)=>value===item.points[index-1][axis])) throw new Error('Adjacent route points must differ.');
      });
    } else {
      for (const key of boxKeys) numberIn(item[key],['x','y','z'].includes(key)?-600:0.125,600,key);
    }
  }
  return design;
}
export function parsePoints(value) {
  return value.trim().split(/\r?\n/).map(line=>line.split(',').map(part=>part.trim()===''?NaN:Number(part)));
}
