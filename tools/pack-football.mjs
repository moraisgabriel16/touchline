import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/football/asset-catalog-v1.json'),'utf8'));

function findSprites(png) {
  const {width,height,data}=png,seen=new Uint8Array(width*height),boxes=new Map();
  for(let start=0;start<seen.length;start++) {
    if(seen[start]||data[start*4+3]<180)continue;
    const queue=[start];seen[start]=1;
    let minX=width,minY=height,maxX=0,maxY=0;
    for(let i=0;i<queue.length;i++) {
      const p=queue[i],x=p%width,y=Math.floor(p/width);
      minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) {
        const nx=x+dx,ny=y+dy,n=ny*width+nx;
        if(nx<0||ny<0||nx>=width||ny>=height||seen[n]||data[n*4+3]<180)continue;
        seen[n]=1;queue.push(n);
      }
    }
    if(queue.length<180)continue;
    const slot=Math.min(3,Math.floor((minY+maxY)/2/(height/4)))*4+Math.min(3,Math.floor((minX+maxX)/2/(width/4)));
    const old=boxes.get(slot);
    if(old){minX=Math.min(minX,old.x);minY=Math.min(minY,old.y);maxX=Math.max(maxX,old.x+old.w-1);maxY=Math.max(maxY,old.y+old.h-1);}
    boxes.set(slot,{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1});
  }
  return boxes;
}
const sizes={crest:[64,64],shirt:[64,80],flag:[80,72],miniature:[144,112],building:[128,112],interior:[144,112],crowd:[88,88],prop:[112,112],terrain:[64,32]};
const manifest={version:1,filter:'nearest',sheets:{},frames:{}};
fs.mkdirSync(path.join(root,'public/football'),{recursive:true});
for(const category of catalog.categories) {
  const png=PNG.sync.read(fs.readFileSync(path.join(root,`assets/football/source/${category.id}-v1.png`)));
  const boxes=findSprites(png),atlas=new PNG({width:768,height:640});
  if(boxes.size!==16)throw new Error(`${category.id}: expected 16 asset slots, found ${boxes.size}`);
  for(const [index,item] of category.items.entries()) {
    const box=boxes.get(index),max=sizes[item.kind]??sizes.prop;
    const scale=Math.min(max[0]/box.w,max[1]/box.h);
    const w=item.kind==='terrain'?64:Math.max(1,Math.round(box.w*scale));
    const h=item.kind==='terrain'?32:Math.max(1,Math.round(box.h*scale));
    const x=index%4*192+Math.floor((192-w)/2),y=Math.floor(index/4)*160+Math.floor((160-h)/2);
    for(let py=0;py<h;py++)for(let px=0;px<w;px++) {
      if(item.kind==='terrain'&&Math.abs((px+.5-32)/32)+Math.abs((py+.5-16)/16)>1)continue;
      const sx=box.x+Math.min(box.w-1,Math.floor((px+.5)/w*box.w)),sy=box.y+Math.min(box.h-1,Math.floor((py+.5)/h*box.h));
      const src=(sy*png.width+sx)*4,dst=((y+py)*atlas.width+x+px)*4;
      for(let c=0;c<4;c++)atlas.data[dst+c]=png.data[src+c];
    }
    const pivot=['crest','shirt','flag'].includes(item.kind)?[Math.floor(w/2),Math.floor(h/2)]:item.kind==='terrain'?[32,16]:[Math.floor(w/2),h-1];
    manifest.frames[item.id]={sheet:category.id,x,y,w,h,pivot,source:box};
  }
  const file=`${category.id}-v1.png`;fs.writeFileSync(path.join(root,'public/football',file),PNG.sync.write(atlas));
  manifest.sheets[category.id]={file,width:768,height:640};
  console.log(`${category.id}: 16 frames -> ${file}`);
}
const text=JSON.stringify(manifest,null,2)+'\n';
fs.writeFileSync(path.join(root,'public/football/manifest-v1.json'),text);
fs.mkdirSync(path.join(root,'web/src/art'),{recursive:true});
fs.writeFileSync(path.join(root,'web/src/art/football-manifest-v1.json'),text);
console.log(`${Object.keys(manifest.frames).length} football assets packed.`);
