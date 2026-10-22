import * as THREE from 'three';
import {dimensionText,selectDimensions} from './model.js?v=10';

const namespace='http://www.w3.org/2000/svg';
function svgNode(name,attributes={}) {
  const node=document.createElementNS(namespace,name);
  Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,String(value)));
  return node;
}
export function createDimensionOverlay(svg) {
  const measure=document.createElement('canvas').getContext('2d');
  measure.font='600 12px system-ui';
  return {
    draw(camera,segments,design,width,height) {
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      svg.replaceChildren();
      svg.setAttribute('data-label-count','0');
      if(!design.visible.dimensions) return;
      const defs=svgNode('defs');
      const marker=svgNode('marker',{id:'dimension-arrow',markerWidth:8,markerHeight:8,refX:7,refY:4,orient:'auto-start-reverse',markerUnits:'userSpaceOnUse'});
      marker.append(svgNode('path',{d:'M 0 0 L 8 4 L 0 8 Z',fill:'#263c38'}));defs.append(marker);svg.append(defs);
      const project=position=>{const point=new THREE.Vector3(...position).project(camera);return {x:(point.x+1)*width/2,y:(1-point.y)*height/2,z:point.z};};
      const candidates=segments.map(segment=>{
        const start=project(segment.start);const end=project(segment.end);
        return {...segment,startScreen:start,endScreen:end,screenLength:start.z>1||end.z>1||start.z< -1||end.z< -1?0:Math.hypot(end.x-start.x,end.y-start.y)};
      });
      const chosen=selectDimensions(candidates,design.dimensionMode,design.dimensionGroups);
      const occupied=[];
      for(const segment of chosen) {
        const start=segment.startScreen;const end=segment.endScreen;
        const unitX=(end.x-start.x)/segment.screenLength;const unitY=(end.y-start.y)/segment.screenLength;
        const middle={x:(start.x+end.x)/2,y:(start.y+end.y)/2};
        const normal={x:-unitY,y:unitX};
        const sign=(middle.x-width/2)*normal.x+(middle.y-height/2)*normal.y>=0?1:-1;
        const text=dimensionText(segment.value,segment.title,segment.estimated);
        const labelWidth=Math.ceil(measure.measureText(text).width)+16;
        const labelHeight=23;
        let angle=Math.atan2(unitY,unitX)*180/Math.PI;
        if(angle>90)angle-=180;if(angle< -90)angle+=180;
        const radians=angle*Math.PI/180;
        const boxWidth=Math.abs(Math.cos(radians))*labelWidth+Math.abs(Math.sin(radians))*labelHeight;
        const boxHeight=Math.abs(Math.sin(radians))*labelWidth+Math.abs(Math.cos(radians))*labelHeight;
        let position;
        let bounds;
        for(let lane=0;lane<26;lane++) {
          const distance=sign*(22+lane*25);
          position={x:middle.x+normal.x*distance,y:middle.y+normal.y*distance};
          position.x=Math.max(boxWidth/2+5,Math.min(width-boxWidth/2-5,position.x));
          position.y=Math.max(boxHeight/2+92,Math.min(height-boxHeight/2-58,position.y));
          bounds={left:position.x-boxWidth/2-3,right:position.x+boxWidth/2+3,top:position.y-boxHeight/2-3,bottom:position.y+boxHeight/2+3};
          if(!occupied.some(other=>bounds.left<other.right&&bounds.right>other.left&&bounds.top<other.bottom&&bounds.bottom>other.top))break;
        }
        occupied.push(bounds);
        const shift={x:position.x-middle.x,y:position.y-middle.y};
        const lineStart={x:start.x+shift.x,y:start.y+shift.y};
        const lineEnd={x:end.x+shift.x,y:end.y+shift.y};
        const annotation=svgNode('g',{'data-dimension-key':segment.key,'data-category':segment.category});
        const title=svgNode('title');title.textContent=`${text}${segment.estimated?' — schematic estimate, not measured':' — manufacturer reference'}`;annotation.append(title);
        for(const [anchor,tip] of [[start,lineStart],[end,lineEnd]]) annotation.append(svgNode('line',{x1:anchor.x,y1:anchor.y,x2:tip.x,y2:tip.y,stroke:'#68817a','stroke-width':0.8,'stroke-dasharray':'3 3'}));
        annotation.append(svgNode('line',{x1:lineStart.x,y1:lineStart.y,x2:lineEnd.x,y2:lineEnd.y,stroke:'#263c38','stroke-width':1.2,'marker-start':'url(#dimension-arrow)','marker-end':'url(#dimension-arrow)'}));
        const caption=svgNode('g',{transform:`translate(${position.x} ${position.y}) rotate(${angle})`});
        caption.append(svgNode('rect',{x:-labelWidth/2,y:-labelHeight/2,width:labelWidth,height:labelHeight,rx:3,fill:'#ffffff',stroke:segment.estimated?'#9a7844':'#9caaa4','stroke-width':0.8}));
        const label=svgNode('text',{'text-anchor':'middle','dominant-baseline':'central',fill:'#182d27','font-family':'system-ui, sans-serif','font-size':12,'font-weight':600});label.textContent=text;caption.append(label);annotation.append(caption);svg.append(annotation);
      }
      svg.setAttribute('data-label-count',String(chosen.length));
    }
  };
}
