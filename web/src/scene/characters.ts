import raw from './characters-v2.json';
import type { Cell } from '../game/data.ts';
import type { Direction } from '../game/character-motion.ts';
import { characterPose } from '../game/character-motion.ts';
export class CharacterAtlas {
  private kits=new Map<string,CharacterAtlas>();
  constructor(private images:Record<string,HTMLImageElement|HTMLCanvasElement>){}
  /** Runtime kit palette: preserve the shared atlas cells, faces, feet and poses. */
  drawKit(ctx:CanvasRenderingContext2D,character:'davi'|'keeper',point:Cell,direction:Direction,moving:boolean,step:number,shirt:string){
    const key=character+shirt;
    if(!this.kits.has(key)){
      const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
      const c=canvas.getContext('2d')!;c.drawImage(this.images[character],0,0);
      const pixels=c.getImageData(0,0,256,256),rgb=parseInt(shirt.replace('#',''),16),target=[rgb>>16,(rgb>>8)&255,rgb&255];
      for(let i=0;i<pixels.data.length;i+=4){
        const [r,g,b,a]=pixels.data.slice(i,i+4);
        const jersey=character==='davi'?r>100&&g>55&&b<g*.48&&r>g*1.12:g>r*1.09&&g>b*1.12;
        if(a&&jersey){const light=Math.min(1.35,Math.max(.42,(character==='davi'?r:g)/190));for(let k=0;k<3;k++)pixels.data[i+k]=Math.round(Math.min(255,target[k]*light));}
      }
      c.putImageData(pixels,0,0);this.kits.set(key,new CharacterAtlas({...this.images,[character]:canvas}));
    }
    this.kits.get(key)!.draw(ctx,character,point,direction,moving,step);
  }
  draw(ctx:CanvasRenderingContext2D,character:string,point:Cell,direction:Direction,moving=false,step=0,talking=false,action=false){
    const pose=action?'action':characterPose(moving,step,talking);
    const id=`${character}.${direction}.${pose==='talk'?(character==='davi'?'idle':'action'):pose}`;
    const f=(raw.frames as Record<string,{sheet:string;x:number;y:number;w:number;h:number;pivot:number[]}>)[id];
    if(!f)return;
    ctx.drawImage(this.images[f.sheet],f.x,f.y,f.w,f.h,Math.round(point[0]-f.pivot[0]),Math.round(point[1]-f.pivot[1]),f.w,f.h);
  }
}
let loading:Promise<CharacterAtlas>|null=null;
export function loadCharacters():Promise<CharacterAtlas>{
  if(!loading)loading=Promise.all(Object.entries(raw.sheets).map(([key,sheet])=>new Promise<[string,HTMLImageElement]>((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve([key,image]);image.onerror=()=>reject(new Error(`Falha no atlas de ${key}`));image.src=`${import.meta.env.BASE_URL}characters/${sheet.file}`;
  }))).then(images=>new CharacterAtlas(Object.fromEntries(images))).catch(error=>{loading=null;throw error;});
  return loading;
}
