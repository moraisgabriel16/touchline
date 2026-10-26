import raw from './atlas-v1.json';
import type { Cell } from '../game/data.ts';

interface Frame {sheet:string;x:number;y:number;w:number;h:number;pivot:number[]}
interface Metadata {sheets:Record<string,{file:string}>;frames:Record<string,Frame>}
const metadata=raw as Metadata;
export interface SpriteSize {w?:number;h?:number;pivot?:Cell}

export class TileAtlas {
  private images:Record<string,HTMLImageElement>;
  constructor(images:Record<string,HTMLImageElement>) {this.images=images;}
  draw(ctx:CanvasRenderingContext2D,id:string,point:Cell,size:SpriteSize={}) {
    const frame=metadata.frames[id];
    if(!frame) throw new Error(`Unknown tileset sprite: ${id}`);
    const w=size.w??frame.w,h=size.h??frame.h;
    const pivot=size.pivot??[frame.pivot[0]*w/frame.w,frame.pivot[1]*h/frame.h];
    ctx.drawImage(this.images[frame.sheet],frame.x,frame.y,frame.w,frame.h,Math.round(point[0]-pivot[0]),Math.round(point[1]-pivot[1]),w,h);
  }
}
let loading:Promise<TileAtlas>|null=null;
export function loadTilesets():Promise<TileAtlas> {
  if(!loading) loading=Promise.all(Object.entries(metadata.sheets).map(([key,sheet])=>new Promise<[string,HTMLImageElement]>((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve([key,image]);
    image.onerror=()=>reject(new Error(`Não foi possível carregar o tileset ${key}.`));
    image.src=`${import.meta.env.BASE_URL}tilesets/${sheet.file}`;
  }))).then(images=>new TileAtlas(Object.fromEntries(images))).catch(error=>{loading=null;throw error;});
  return loading;
}
