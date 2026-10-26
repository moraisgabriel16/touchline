import type {Cell,Player} from './data.ts';
import type {Direction} from './character-motion.ts';
import {directionFromVector} from './character-motion.ts';

export type Drill='passes'|'finalização'|'agilidade'|'condução'|'goleiros';
export interface TrainingAthlete {id:string;name:string;number:number;position:string;cell:Cell;direction:Direction;moving:boolean;action:boolean;phase:number;drill:Drill;ball?:Cell;ballHeight?:number}
const lerp=(a:Cell,b:Cell,t:number):Cell=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
export const trainingStations:Cell[]=[[3,3],[6.2,2.6],[4.4,5.25],[7.5,5.45],[9.9,3.25],[10.7,6.45],[3.1,7.6],[6.3,7.7],[9.5,8],[2.1,2.25],[5.25,3.6]];
/** Stable membership, no teleporting between stations or changing appearance mid-stride. */
export function trainingRoster(players:readonly Player[],time:number):TrainingAthlete[]{
  const stations=trainingStations;
  const t=Math.max(0,time),outfield=players.filter(p=>p.position!=='GOL'),keepers=players.filter(p=>p.position==='GOL');
  return players.map((player,index)=>{
    if(player.position==='GOL'){
      const keeperIndex=keepers.findIndex(p=>p.id===player.id),side=keeperIndex%2,phase=(t+keeperIndex*2)%6;
      const cell:Cell=keeperIndex<2?[side?1.6:12,4.8+Math.sin(t*.8+side)*.5]:[8.6+Math.sin(t*.8)*.25,1.75];
      const direction:Direction=keeperIndex>=2?'sw':side?'se':'nw';
      const source:Cell=keeperIndex>=2?[cell[0],cell[1]+1.6]:[cell[0]+(side?1.6:-1.6),cell[1]];
      const end:Cell=keeperIndex>=2?[cell[0],cell[1]+.15]:[cell[0]+(side?.15:-.15),cell[1]];
      const flight=Math.min(1,Math.max(0,(phase-1.2)/1.1));
      return {id:player.id,name:player.name,number:index+1,position:player.position,cell,direction,moving:Math.abs(Math.cos(t*.8+side))>.25,action:phase>2&&phase<2.7,phase:t*12+index,drill:'goleiros',ball:phase<2.6?lerp(source,end,flight):undefined,ballHeight:Math.sin(flight*Math.PI)*6+flight*24};
    }
    const i=outfield.findIndex(p=>p.id===player.id),pair=Math.floor(i/2),member=i%2,station=stations[pair%stations.length],overflow=Math.floor(pair/stations.length);
    const base:Cell=[station[0],station[1]+overflow*.55],phase=(t+pair*.7)%4,stroke=(Math.sin(t*.65+pair)+1)/2;
    let a:Cell,b:Cell,drill:Drill;
    if(pair%4===0){a=[base[0]-.65,base[1]+.75];b=[base[0]+.65,base[1]-.75];drill='passes';}
    else if(pair%4===1){a=[base[0]-.7,base[1]];b=[base[0]+.7,base[1]];drill='agilidade';}
    else if(pair%4===2){a=[base[0],base[1]-.6];b=[base[0],base[1]+.6];drill='condução';}
    else{a=[base[0]-.8,base[1]-.4];b=[base[0]+.8,base[1]+.4];drill='finalização';}
    if(member===0&&i+1>=outfield.length)drill='condução';
    const moving=drill==='agilidade'||drill==='condução';
    const progress=member?1-stroke:stroke;
    const cell=moving?lerp(member?a:b,member?b:a,progress*.32):member?b:a;
    const target=member?a:b;
    const forward=Math.cos(t*.65+pair)>=0;
    const direction=moving?directionFromVector((b[0]-a[0])*32-(b[1]-a[1])*32,((b[0]-a[0])+(b[1]-a[1]))*16):directionFromVector((target[0]-cell[0]-target[1]+cell[1])*32,(target[0]-cell[0]+target[1]-cell[1])*16);
    let face=moving&&forward?({se:'nw',nw:'se',ne:'sw',sw:'ne'} as const)[direction]:direction;
    let action=!moving&&(member?phase>1.9&&phase<2.3:phase<.3);
    let ball=drill==='condução'?[cell[0]+.15,cell[1]+.12] as Cell:member===0&&drill!=='agilidade'?(phase<2?lerp(a,b,phase/2):lerp(b,a,(phase-2)/2)):undefined;
    let ballHeight=0;
    if(drill==='finalização'){
      const target:Cell=[12.85,4.1+member*.9],shot=(t+pair*.7+member*2)%6,flight=Math.min(1,Math.max(0,(shot-1.3)/1.25));
      face=directionFromVector((target[0]-cell[0]-target[1]+cell[1])*32,(target[0]-cell[0]+target[1]-cell[1])*16);
      action=shot>1.25&&shot<1.65;ball=shot<2.8?lerp(cell,target,flight):undefined;ballHeight=Math.sin(flight*Math.PI)*10;
    }
    return {id:player.id,name:player.name,number:index+1,position:player.position,cell,direction:face,moving,action,phase:t*12+pair,drill,ball,ballHeight};
  });
}
