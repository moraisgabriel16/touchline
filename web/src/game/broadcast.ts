import type {LiveMatch} from './live-match.ts';
import {createMatch,advanceMatch,resumeMatch,substitute} from './live-match.ts';
import type {Game} from './domain.ts';
export type Point=[number,number];
export interface BroadcastActor {id:string;club:number;keeper:boolean;number:number;point:Point;direction:Point;action:'run'|'idle'|'kick'|'dive'|'celebrate'}
export interface BroadcastFrame {actors:BroadcastActor[];ball:Point;height:number;carrier?:string;shooter?:string;label:string;outcome:'goal'|'save'|'pass'|'stoppage';impact:boolean;progress:number}
export const projectPitch=([x,y]:Point):Point=>[320+(x*12-y*8-2)*24,61+(x*12+y*8)*11];
const lerp=(a:Point,b:Point,t:number):Point=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
/** Visual choreography is derived from recorded events. It never mutates the football simulation. */
export function broadcastFrame(m:LiveMatch,progress:number,formation='4-4-2',ownClub=0,replay=false):BroadcastFrame{
 const t=clamp(progress),second=m.minute>45||m.phase==='second',running=replay||m.phase==='first'||m.phase==='second';
 const events=m.events.filter(e=>e.minute===m.minute),shot=events.find(e=>e.kind==='shot'),goal=events.find(e=>e.kind==='goal'),save=events.find(e=>e.kind==='save'),card=events.find(e=>e.kind==='red')??events.find(e=>e.kind==='yellow'),foul=events.find(e=>e.kind==='foul'),offside=events.find(e=>e.kind==='offside'),penalty=events.some(e=>e.kind==='penalty');
 const attack=shot?.team??m.possession,team=m.home.club===attack?m.home:m.away,defend=team===m.home?m.away:m.home,right=(team===m.home)!==second;
 const bases:BroadcastActor[]=[];
 for(const side of [m.home,m.away])side.active.forEach((id,i)=>{
  const p=side.players.find(p=>p.id===id)!,keeper=p.position==='GOL',orientation=(side===m.home)!==second;
  let slot=side.initial.indexOf(id);if(slot<0){const change=m.changes.find(c=>c.in===id);slot=change?side.initial.indexOf(change.out):i;}slot=Math.max(0,slot-1);
  const rows=(side.club===ownClub?formation:'4-4-2').split('-').map(Number);let row=0;while(row<2&&slot>=rows[row]){slot-=rows[row];row++;}
  let x=keeper?.035:[.24,.47,.72][row],y=keeper?.5:.10+(Math.min(slot,rows[row]-1)+.5)*.8/rows[row];
  if(!orientation)x=1-x;
  bases.push({id,club:side.club,keeper,number:side.players.findIndex(p=>p.id===id)+1,point:[x,y],direction:orientation?[1,0]:[-1,0],action:'idle'});
 });
 const forwards=bases.filter(a=>a.club===attack&&!a.keeper),shooter=forwards.find(a=>a.id===shot?.player)??forwards[(m.minute+2)%Math.max(1,forwards.length)],passer=forwards.filter(a=>a.id!==shooter?.id)[m.minute%Math.max(1,forwards.length-1)]??shooter;
 if(!running||!shooter||!passer)return {actors:bases,ball:[.5,.5],height:0,label:m.phase==='halftime'?'INTERVALO':m.phase==='full'?'APITO FINAL':'SAÍDA DE BOLA',outcome:'stoppage',impact:false,progress:t};
 const receiverStart:[number,number]=penalty?[right?.88:.12,.5]:[right?.65:.35,.30+(m.minute%5)*.10];
 const receiverEnd:Point=penalty?receiverStart:[right?.80:.20,.36+(m.minute%3)*.12];
 const passStart=passer.point.slice() as Point,receiver=lerp(receiverStart,receiverEnd,clamp((t-.28)/.30));
 const target:Point=[save?(right?.97:.03):(right?1.025:-.025),.45+(m.minute%3)*.05];
 const defender=bases.find(a=>a.club===defend.club&&a.keeper)??bases.find(a=>a.club===defend.club);
 let ball:Point,height=0,carrier:string|undefined,label:string;
 if(t<.28&&!penalty){ball=lerp(passStart,receiverStart,t/.28);height=Math.sin(t/.28*Math.PI)*3;label='PASSE PARA O ATAQUE';carrier=t<.04?passer.id:undefined;}
 else if(t<.58){ball=receiver;carrier=shooter.id;label=penalty?'PREPARAÇÃO DO PÊNALTI':'DOMÍNIO E CONDUÇÃO';}
 else if(shot){const u=clamp((t-.58)/.27);ball=lerp(receiverEnd,target,u);height=Math.sin(u*Math.PI)*8;label=penalty?'COBRANÇA DE PÊNALTI':'FINALIZAÇÃO';}
 else {const destination:Point=passStart;ball=lerp(receiverEnd,destination,clamp((t-.58)/.42));label='CIRCULAÇÃO DA BOLA';if(t>.96)carrier=passer.id;}
 if(shot&&t>=.85){label=goal?'GOOOL!':save?'DEFESA / CORTE':'FINALIZAÇÃO';if(save&&defender){ball=[right?.97:.03,target[1]];carrier=defender.id;}else ball=target;height=0;}
 for(const a of bases){
  const original=a.point.slice() as Point;
  if(a.id===shooter.id){a.point=receiver;a.action=t>=.55&&t<.7&&!!shot?'kick':goal&&t>.85?'celebrate':t>.28&&t<.58?'run':'idle';a.direction=[right?1:-1,0];}
  else if(a.id===passer.id){a.action=t<.12?'kick':'idle';a.direction=[receiver[0]-a.point[0],receiver[1]-a.point[1]];}
  else if(a.id===defender?.id&&shot){a.point=lerp(original,[right?.97:.03,target[1]],clamp((t-.58)/.27));a.action=t>.65&&t<.95?'dive':'idle';a.direction=[right?-1:1,target[1]-.5];}
  else if(!a.keeper){a.point=[Math.min(.95,Math.max(.05,original[0]+(ball[0]-.5)*.13)),Math.min(.94,Math.max(.06,original[1]+(ball[1]-.5)*.1))];a.direction=[a.point[0]-original[0],a.point[1]-original[1]];a.action=goal&&a.club===attack&&t>.85?'celebrate':'run';}
 }
 // Keep readable sprite footprints while retaining the ball carrier and goalkeeper anchors.
 for(let pass=0;pass<4;pass++)for(let i=0;i<bases.length;i++)for(let j=i+1;j<bases.length;j++){
  const a=bases[i],b=bases[j],pa=projectPitch(a.point),pb=projectPitch(b.point),dx=pb[0]-pa[0],dy=pb[1]-pa[1];
  if(Math.abs(dx)>=12||Math.abs(dy)>=23)continue;
  const locked=(actor:BroadcastActor)=>actor.id===shooter.id||actor.id===passer.id||actor.keeper;
  if(locked(a)&&locked(b))continue;
  const push=(12-Math.abs(dx))*(dx>=0?1:-1),shift=(actor:BroadcastActor,pixels:number)=>{actor.point=[Math.max(.025,Math.min(.975,actor.point[0]+pixels/576)),Math.max(.04,Math.min(.96,actor.point[1]-pixels/384))];};
  if(locked(a))shift(b,push);else if(locked(b))shift(a,-push);else{shift(a,-push/2);shift(b,push/2);}
 }
 if(!shot&&(card||foul||offside)){label=card?(card.kind==='red'?'CARTÃO VERMELHO':'CARTÃO AMARELO'):offside?'IMPEDIMENTO':'FALTA';for(const a of bases)a.action='idle';ball=receiver;carrier=undefined;}
 return {actors:bases,ball,height,carrier,shooter:shot?.player,label,outcome:goal?'goal':save?'save':shot?'pass':card||foul||offside?'stoppage':'pass',impact:!!shot&&t>=.82&&t<.96,progress:t};
}
export function replayClips(m:LiveMatch){
 return m.events.filter(e=>e.kind==='shot').map(shot=>{
  const events=m.events.filter(e=>e.minute===shot.minute),team=m.home.club===shot.team?m.home:m.away;
  return {minute:shot.minute,club:shot.team,player:team.players.find(p=>p.id===shot.player)?.name??'Atleta',outcome:events.some(e=>e.kind==='goal')?'Gol':events.some(e=>e.kind==='save')?'Defesa / corte':'Finalização',penalty:events.some(e=>e.kind==='penalty')};
 });
}
/** Reconstruct an existing shot without changing the ongoing match. */
export function shotReplay(g:Game,minute:number):LiveMatch|null{
 if(!Number.isInteger(minute)||!g.live?.events.some(e=>e.kind==='shot'&&e.minute===minute))return null;
 let m=createMatch(g);while(m.minute<minute&&m.phase!=='full'){
  if(m.phase==='halftime'){for(const c of g.live!.changes)m=substitute(m,g.club,c.out,c.in);m=resumeMatch(m,g.club);}
  m=advanceMatch(m,g.club,g.mentality);
 }
 return m.minute===minute?m:null;
}
export function lastShotReplay(g:Game):LiveMatch|null{const minute=g.live?.events.filter(e=>e.kind==='shot').at(-1)?.minute;return minute===undefined?null:shotReplay(g,minute);}
