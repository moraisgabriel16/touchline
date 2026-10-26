/** Technical extraction and packing only: original RGBA art is preserved separately. */
import fs from 'node:fs';
import { PNG } from 'pngjs';
const names=['run_ne_a','run_ne_b','run_sw_a','run_sw_b','pass','receive','shoot','prepare','reserve_1','reserve_2','reserve_3','reserve_4','keeper_ready','keeper_save','coach','stretch'];
const heights=[42,42,42,42,42,42,42,42,32,32,32,32,34,42,42,28];
const manifest={version:1,filter:'nearest',frameSize:[48,56],pivot:[24,50],sheets:{},frames:{}};
fs.mkdirSync('public/characters',{recursive:true});
for(const character of ['training-people']){
  const source=PNG.sync.read(fs.readFileSync(`assets/characters/source/${character}-v1.png`));
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
  const atlas=new PNG({width:192,height:224});
  for(let slot=0;slot<16;slot++){
    const box=boxes.get(slot),poseScale=Math.min(heights[slot]/box.h,40/box.w),w=Math.round(box.w*poseScale),h=Math.round(box.h*poseScale);
    const x=slot%4*48,y=Math.floor(slot/4)*56,ox=x+24-Math.floor(w/2),oy=y+50-h;
    for(let py=0;py<h;py++)for(let px=0;px<w;px++){
      const sx=box.x+Math.min(box.w-1,Math.floor((px+.5)/w*box.w)),sy=box.y+Math.min(box.h-1,Math.floor((py+.5)/h*box.h));
      for(let c=0;c<4;c++)atlas.data[((oy+py)*atlas.width+ox+px)*4+c]=data[(sy*width+sx)*4+c];
    }
    const id=`training.${names[slot]}`;
    manifest.frames[id]={sheet:character,x,y,w:48,h:56,pivot:[24,50],source:box};
  }
  const file=`${character}-v1.png`;fs.writeFileSync(`public/characters/${file}`,PNG.sync.write(atlas));
  manifest.sheets[character]={file,width:192,height:224};
  console.log(`${character}: 16 frames`);
}
const json=JSON.stringify(manifest,null,2)+'\n';
fs.writeFileSync('public/characters/training-people-v1.json',json);fs.writeFileSync('web/src/scene/training-people-v1.json',json);
console.log('16 training poses packed.');
