/** Original code-drawn match effects. No external art or raster editing. */
import fs from 'node:fs';
import {PNG} from 'pngjs';
const png=new PNG({width:64,height:64});const frames={};
function pixel(frame,x,y,c){if(x<0||y<0||x>=16||y>=16)return;const offset=(((frame>>2)*16+y)*64+(frame%4)*16+x)*4;png.data.set(c,offset);}
for(let f=0;f<16;f++){
 const kind=['ball','impact','selection','spark'][f>>2],n=f%4;frames[`${kind}_${n}`]={x:(f%4)*16,y:(f>>2)*16,w:16,h:16,pivot:[8,8]};
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){
  const d=Math.hypot(x-7.5,y-7.5);
  if(kind==='ball'&&d<3.7)pixel(f,x,y,d>2.9?[136,156,137,255]:(x+n+y*2)%7<2?[43,62,59,255]:[250,244,210,255]);
  if(kind==='impact'&&Math.abs(d-(2+n*1.6))<.65&&(x+y+n)%3!==0)pixel(f,x,y,[243,224,153,220-n*40]);
  if(kind==='selection'&&Math.abs(Math.hypot((x-7.5)/1.5,(y-7.5)*1.5)-4.5)<.8)pixel(f,x,y,[238,198+n*10,104,230]);
  if(kind==='spark'&&((x===8&&Math.abs(y-8)<5-n)||(y===8&&Math.abs(x-8)<5-n)))pixel(f,x,y,[255,231,159,255-n*40]);
 }
}
fs.mkdirSync('public/football',{recursive:true});fs.writeFileSync('public/football/match-effects-v1.png',PNG.sync.write(png));fs.writeFileSync('web/src/football/match-effects-v1.json',JSON.stringify({version:1,image:'match-effects-v1.png',size:[64,64],cell:[16,16],frames},null,2)+'\n');console.log('16 original effect frames generated.');
