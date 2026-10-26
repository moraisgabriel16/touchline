/** Technical sprite preparation: alpha-based extraction, nearest resizing and atlas packing. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const specs={
  residential:[
    ['oak_a',64,32,32,16],['oak_b',64,32,32,16],['terracotta',64,32,32,16],['rug',64,32,32,16],
    ['wall_left',32,64,32,48],['wall_right',32,64,0,48],['window_left',32,64,32,48],['door_panel',32,64,0,48],
    ['bed',128,80,64,48],['desk',77,62,38,43],['wardrobe',77,81,38,62],['box',45,35,22,24],
    ['plant',39,65,19,55],['chair',45,58,22,47],['fridge',54,80,27,66],['sofa',112,78,56,50],
  ],
  club:[
    ['concrete_a',64,32,32,16],['concrete_b',64,32,32,16],['ceramic',64,32,32,16],['rug',64,32,32,16],
    ['wall_left',32,64,32,48],['wall_right',32,64,0,48],['window_left',32,64,32,48],['door_panel',32,64,0,48],
    ['desk',135,92,67,58],['cabinet',77,81,38,62],['door',45,65,22,54],['plant',39,65,19,55],
    ['chair',45,58,22,47],['tactics_board',86,74,43,62],['bookcase',77,83,38,64],['water_cooler',38,65,19,55],
  ],
  training:[
    ['grass_a',64,32,32,16],['grass_b',64,32,32,16],['dirt',64,32,32,16],['concrete',64,32,32,16],
    ['fence_right',32,56,0,40],['fence_left',32,56,32,40],['gate',64,72,32,56],['door_panel',32,64,0,48],
    ['bench',106,65,53,39],['box',45,36,22,25],['goal',112,81,56,65],['door',45,65,22,54],
    ['cones',38,31,19,23],['ball',16,16,8,13],['bags',56,40,28,30],['flag',26,64,13,60],
  ],
};

function components(png) {
  const {width,height,data}=png,seen=new Uint8Array(width*height),slots=new Map();
  // Bounding boxes follow actual isolated components, not approximate generated grid lines.
  for(let start=0;start<seen.length;start++) {
    if(seen[start]||data[start*4+3]<180) continue;
    const queue=[start];seen[start]=1;
    let minX=width,minY=height,maxX=0,maxY=0;
    for(let index=0;index<queue.length;index++) {
      const p=queue[index],x=p%width,y=Math.floor(p/width);
      minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
        const nx=x+dx,ny=y+dy,n=ny*width+nx;
        if(nx<0||ny<0||nx>=width||ny>=height||seen[n]||data[n*4+3]<180) continue;
        seen[n]=1;queue.push(n);
      }
    }
    if(queue.length<300) continue;
    const col=Math.min(3,Math.floor((minX+maxX)/2/(width/4)));
    const row=Math.min(3,Math.floor((minY+maxY)/2/(height/4)));
    const slot=row*4+col;
    const previous=slots.get(slot);
    if(previous) {
      minX=Math.min(minX,previous.x);minY=Math.min(minY,previous.y);
      maxX=Math.max(maxX,previous.x+previous.w-1);maxY=Math.max(maxY,previous.y+previous.h-1);
    }
    slots.set(slot,{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,area:queue.length+(previous?.area??0)});
  }
  return slots;
}

fs.mkdirSync(path.join(root,'public/tilesets'),{recursive:true});
const manifest={version:1,tileWidth:64,tileHeight:32,filter:'nearest',sheets:{},frames:{}};
for(const [sheet,items] of Object.entries(specs)) {
  const input=PNG.sync.read(fs.readFileSync(path.join(root,`assets/tilesets/source/${sheet}-v1.png`)));
  const boxes=components(input);
  const atlas=new PNG({width:640,height:512});
  if(boxes.size!==16) throw new Error(`${sheet}: expected 16 isolated sprites, found ${boxes.size}`);
  for(let index=0;index<items.length;index++) {
    const [name,w,h,pivotX,pivotY]=items[index],box=boxes.get(index);
    const x=(index%4)*160+Math.floor((160-w)/2),y=Math.floor(index/4)*128+Math.floor((128-h)/2);
    for(let py=0;py<h;py++) for(let px=0;px<w;px++) {
      if(index<4 && Math.abs((px+.5-w/2)/(w/2))+Math.abs((py+.5-h/2)/(h/2))>1) continue;
      const sourceX=Math.min(box.w-1,Math.floor((px+.5)/w*box.w));
      let sourceY=Math.min(box.h-1,Math.floor((py+.5)/h*box.h));
      if(name==='wall_left'||name==='wall_right'||name==='window_left'||name==='door_panel'||name==='fence_left'||name==='fence_right') {
        // Rectify modular panel edges to the exact 2:1 world angle.
        const left=name.endsWith('left'),top=left?(w-px-.5)/2:(px+.5)/2;
        if(py+.5<top||py+.5>top+h-w/2) continue;
        const sourceTop=left?(box.w-sourceX-.5)/2:(sourceX+.5)/2;
        sourceY=Math.max(0,Math.min(box.h-1,Math.floor(sourceTop+(py+.5-top)/(h-w/2)*(box.h-box.w/2))));
      }
      const sx=box.x+sourceX,sy=box.y+sourceY;
      const src=(sy*input.width+sx)*4,dst=((y+py)*atlas.width+x+px)*4;
      // Preserve the generated RGBA; no background flattening or painted replacement.
      for(let channel=0;channel<4;channel++) atlas.data[dst+channel]=input.data[src+channel];
    }
    manifest.frames[`${sheet}.${name}`]={sheet,x,y,w,h,pivot:[pivotX,pivotY],source:{x:box.x,y:box.y,w:box.w,h:box.h}};
  }
  const file=`${sheet}-v1.png`;
  fs.writeFileSync(path.join(root,'public/tilesets',file),PNG.sync.write(atlas));
  manifest.sheets[sheet]={file,width:640,height:512};
  console.log(`${sheet}: 16 sprites, ${input.width}x${input.height} source -> 640x512 runtime atlas`);
}
const json=JSON.stringify(manifest,null,2)+'\n';
fs.writeFileSync(path.join(root,'public/tilesets/manifest-v1.json'),json);
fs.writeFileSync(path.join(root,'web/src/scene/atlas-v1.json'),json);
const terrain=new PNG({width:256,height:96}),terrainFrames={};
for(const [row,sheet] of Object.keys(specs).entries()) {
  const atlas=PNG.sync.read(fs.readFileSync(path.join(root,`public/tilesets/${sheet}-v1.png`)));
  for(let col=0;col<4;col++) {
    const id=`${sheet}.${specs[sheet][col][0]}`,frame=manifest.frames[id];
    PNG.bitblt(atlas,terrain,frame.x,frame.y,64,32,col*64,row*32);
    terrainFrames[id]={x:col*64,y:row*32,w:64,h:32,pivot:[32,16]};
  }
}
fs.writeFileSync(path.join(root,'public/tilesets/terrain-v1.png'),PNG.sync.write(terrain));
fs.writeFileSync(path.join(root,'public/tilesets/terrain-v1.json'),JSON.stringify({file:'terrain-v1.png',tileWidth:64,tileHeight:32,columns:4,rows:3,frames:terrainFrames},null,2)+'\n');
console.log('Packed 48 original sprites with named frames and foot pivots.');
