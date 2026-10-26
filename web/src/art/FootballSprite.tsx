import raw from './football-manifest-v1.json';

interface Frame {sheet:string;x:number;y:number;w:number;h:number;pivot:number[]}
export const footballManifest=raw as {sheets:Record<string,{file:string;width:number;height:number}>;frames:Record<string,Frame>};
export function footballSheet(id:string) {return `${import.meta.env.BASE_URL}football/${footballManifest.sheets[id].file}`;}

export function FootballSprite({id,size=80,label='',className=''}:{id:string;size?:number;label?:string;className?:string}) {
  const frame=footballManifest.frames[id],sheet=footballManifest.sheets[frame.sheet];
  return <svg className={`football-sprite ${className}`} width={size} height={size} viewBox={`${frame.x} ${frame.y} ${frame.w} ${frame.h}`} role={label?'img':undefined} aria-label={label||undefined} aria-hidden={label?undefined:true} style={{overflow:'hidden',imageRendering:'pixelated',flexShrink:0}}>
    <image href={footballSheet(frame.sheet)} width={sheet.width} height={sheet.height} style={{imageRendering:'pixelated'}}/>
  </svg>;
}

export async function downloadFootballSprite(id:string) {
  const frame=footballManifest.frames[id];
  const image=new Image();image.src=footballSheet(frame.sheet);await image.decode();
  const canvas=document.createElement('canvas');canvas.width=frame.w;canvas.height=frame.h;
  const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,frame.x,frame.y,frame.w,frame.h,0,0,frame.w,frame.h);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Não foi possível preparar o PNG.')),'image/png'));
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${id}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
