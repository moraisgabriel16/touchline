/** Technical extraction and packing only: original RGBA art is preserved separately. */
import fs from 'node:fs';
import { PNG } from 'pngjs';
const directions=['se','sw','ne','nw'],poses=['idle','walk_a','walk_b','action'];
const manifest={version:2,filter:'nearest',frameSize:[64,64],pivot:[32,58],standingHeight:40,sheets:{},frames:{}};
fs.mkdirSync('public/characters',{recursive:true});
for(const character of ['hero','helena','davi','keeper']){
  const source=PNG.sync.read(fs.readFileSync(`assets/characters/source/${character}-v2.png`));
  const {width,height,data}=source,seen=new Uint8Array(width*height),boxes=new Map();
  for(let start=0;start<seen.length;start++){
    if(seen[start]||data[start*4+3]<180)continue;
    const queue=[start];seen[start]=1;let minX=width,minY=height,maxX=0,maxY=0;
    for(let i=0;i<queue.length;i++){
      const p=queue[i],x=p%width,y=Math.floor(p/width);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const nx=x+dx,ny=y+dy,n=ny*width+nx;
        if(nx<0||ny<0||nx>=width||ny>=height||seen[n]||data[n*4+3]<180)continue;
        seen[n]=1;queue.push(n);
      }
    }
    if(queue.length<100)continue;
    const slot=Math.min(3,Math.floor((minY+maxY)/2/(height/4)))*4+Math.min(3,Math.floor((minX+maxX)/2/(width/4)));
    const old=boxes.get(slot);
    if(old){minX=Math.min(minX,old.x);minY=Math.min(minY,old.y);maxX=Math.max(maxX,old.x+old.w-1);maxY=Math.max(maxY,old.y+old.h-1);}
    boxes.set(slot,{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1});
  }
  if(boxes.size!==16)throw new Error(`${character}: expected 16 sprites, got ${boxes.size}`);
  // One scale per character, fixed feet anchor; never stretch individual poses.
  const idleHeights=[0,4,8,12].map(i=>boxes.get(i).h).sort((a,b)=>a-b);
  const scale=40/((idleHeights[1]+idleHeights[2])/2);
  const atlas=new PNG({width:256,height:256});
  for(let slot=0;slot<16;slot++){
    // Generated alternate strides had incorrect facing. Pack the approved opposite-view
    // stride mirrored into the canonical row, instead of shipping those rejected frames.
    const mirror=slot%4===2,sourceSlot=mirror?(Math.floor(slot/4)^1)*4+1:slot;
    const box=boxes.get(sourceSlot),w=Math.round(box.w*scale),h=Math.round(box.h*scale);
    const x=slot%4*64,y=Math.floor(slot/4)*64;
    // Optical anchor follows the head/core, never the outstretched hand or kicking foot.
    let headMin=width,headMax=0;
    for(let hy=0;hy<Math.floor(box.h*.23);hy++)for(let hx=0;hx<box.w;hx++)if(data[((box.y+hy)*width+box.x+hx)*4+3]>=180){headMin=Math.min(headMin,box.x+hx);headMax=Math.max(headMax,box.x+hx);}
    const headCenter=(headMin+headMax)/2,anchor=mirror?box.x+box.w-1-headCenter:headCenter-box.x,ox=x+32-Math.round(anchor*scale),oy=y+58-h;
    if(ox<x+1||ox+w>x+63||oy<y+1)throw new Error(character+': pose exceeds standard cell '+slot);
    for(let py=0;py<h;py++)for(let px=0;px<w;px++){
      const sx=box.x+Math.min(box.w-1,Math.floor(((mirror?w-1-px:px)+.5)/w*box.w)),sy=box.y+Math.min(box.h-1,Math.floor((py+.5)/h*box.h));
      for(let c=0;c<4;c++)atlas.data[((oy+py)*atlas.width+ox+px)*4+c]=data[(sy*width+sx)*4+c];
    }
    const id=`${character}.${directions[Math.floor(slot/4)]}.${poses[slot%4]}`;
    manifest.frames[id]={sheet:character,x,y,w:64,h:64,pivot:[32,58],content:{x:ox-x,y:oy-y,w,h},scale,source:box,sourceSlot,mirror};
  }
  const file=`${character}-v2.png`;fs.writeFileSync(`public/characters/${file}`,PNG.sync.write(atlas));
  manifest.sheets[character]={file,width:256,height:256};
  console.log(`${character}: 16 frames`);
}
const json=JSON.stringify(manifest,null,2)+'\n';
fs.writeFileSync('public/characters/manifest-v2.json',json);fs.writeFileSync('web/src/scene/characters-v2.json',json);
console.log('64 standard character frames packed.');
