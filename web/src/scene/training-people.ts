import raw from './training-people-v1.json';
import type {Cell} from '../game/data.ts';
export class TrainingPeople {
  constructor(private image:HTMLImageElement){}
  draw(ctx:CanvasRenderingContext2D,pose:string,point:Cell){
    const f=(raw.frames as Record<string,{x:number;y:number;w:number;h:number;pivot:number[]}>)[`training.${pose}`];
    if(f)ctx.drawImage(this.image,f.x,f.y,f.w,f.h,Math.round(point[0]-f.pivot[0]),Math.round(point[1]-f.pivot[1]),f.w,f.h);
  }
}
let loading:Promise<TrainingPeople>|null=null;
export function loadTrainingPeople(){
  if(!loading)loading=new Promise<TrainingPeople>((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve(new TrainingPeople(image));image.onerror=()=>reject(new Error('Falha no atlas de treino.'));image.src=`${import.meta.env.BASE_URL}characters/training-people-v1.png`;
  }).catch(error=>{loading=null;throw error;});
  return loading;
}
