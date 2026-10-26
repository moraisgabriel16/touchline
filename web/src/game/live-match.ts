import { clubs, squadFor, schedule } from './data.ts';
import type { Player } from './data.ts';
import type { Game } from './domain.ts';

export type MatchPhase='first'|'halftime'|'second'|'full';
export type EventKind='kickoff'|'shot'|'save'|'goal'|'foul'|'yellow'|'red'|'corner'|'offside'|'penalty'|'substitution'|'halftime'|'full';
export interface MatchEvent { minute:number; kind:EventKind; team:number; player?:string; text:string }
export interface Discipline { yellows:number; ban:number }
export interface MatchTeam { club:number; players:Player[]; initial:string[]; active:string[]; used:string[]; sentOff:string[]; yellow:Record<string,number>; goals:number; shots:number; fouls:number; corners:number; bonus:number }
export interface LiveMatch { round:number; home:MatchTeam; away:MatchTeam; minute:number; phase:MatchPhase; events:MatchEvent[]; changes:{out:string;in:string}[]; seed:number; possession:number }
const copy=<T,>(value:T):T=>structuredClone(value);
const ownRoster=(g:Game)=>[...squadFor(g.club),...g.recruits];
export function eligibleLineup(g:Game):string[]{
  const available=ownRoster(g).filter(p=>!(g.discipline?.[p.id]?.ban));
  const ids=g.lineup.filter(id=>available.some(p=>p.id===id));
  for(const p of available)if(ids.length<11&&!ids.includes(p.id))ids.push(p.id);
  if(!ids.some(id=>available.find(p=>p.id===id)?.position==='GOL')){
    const keeper=available.find(p=>p.position==='GOL');if(keeper)ids[0]=keeper.id;
  }
  return ids;
}
export function createMatch(g:Game):LiveMatch {
  const pair=schedule(g.leagueSize)[g.round]?.find(p=>p.includes(g.club));
  if(!pair)throw new Error('Não há partida nesta rodada.');
  const team=(club:number):MatchTeam=>{
    const players=club===g.club?ownRoster(g):squadFor(club),active=club===g.club?eligibleLineup(g):players.slice(0,11).map(p=>p.id);
    if(active.length<7)throw new Error('São necessários ao menos sete atletas disponíveis.');
    const bonus=club===g.club?g.training+(g.fitness-90)/10+(club===pair[0]?g.support/30:0):clubs[club].strength-players.slice(0,11).reduce((s,p)=>s+p.skill,0)/11;
    return {club,players,initial:[...active],active,used:[...active,...(club===g.club?players.filter(p=>g.discipline?.[p.id]?.ban).map(p=>p.id):[])],sentOff:[],yellow:{},goals:0,shots:0,fouls:0,corners:0,bonus};
  };
  return {round:g.round+1,home:team(pair[0]),away:team(pair[1]),minute:0,phase:'first',events:[{minute:0,kind:'kickoff',team:pair[0],text:'Bola rolando. Começa o primeiro tempo!'}],changes:[],seed:(g.seed+g.round*997)>>>0,possession:pair[0]};
}
function rng(seed:number){let n=seed>>>0;return ()=>{n=(n+0x6D2B79F5)>>>0;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function teamStrength(t:MatchTeam,minute=0){return t.active.reduce((sum,id)=>sum+(t.players.find(p=>p.id===id)?.skill??0)-Math.max(0,minute-(t.initial.includes(id)?0:45))*.035,0)/11+t.bonus;}
export function advanceMatch(input:LiveMatch,ownClub:number,mentality:Game['mentality']):LiveMatch{
  if(input.phase!=='first'&&input.phase!=='second')return input;
  const m=copy(input);m.minute++;
  const random=rng(m.seed+m.minute*7919),homeShare=Math.max(.3,Math.min(.7,.52+(teamStrength(m.home,m.minute)-teamStrength(m.away,m.minute))/160));
  const attack=random()<homeShare?m.home:m.away,defend=attack===m.home?m.away:m.home;m.possession=attack.club;
  const pick=(t:MatchTeam)=>t.active[Math.floor(random()*t.active.length)];
  const event=(kind:EventKind,team:MatchTeam,text:string,player?:string)=>m.events.push({minute:m.minute,kind,team:team.club,text,...(player?{player}:{})});
  const name=(t:MatchTeam,id:string)=>t.players.find(p=>p.id===id)?.name??'Atleta';
  let penalty=false;
  if(random()<.115){
    const offender=pick(defend);defend.fouls++;event('foul',defend,`${name(defend,offender)} comete falta.`,offender);
    const card=random();
    if(card<.40){
      const red=card<.045||(defend.yellow[offender]??0)>=1;
      if(red){if(card>=.045){defend.yellow[offender]=2;event('yellow',defend,`Segundo amarelo para ${name(defend,offender)}.`,offender);}defend.sentOff.push(offender);defend.active=defend.active.filter(id=>id!==offender);event('red',defend,`${name(defend,offender)} expulso${card<.045?' por cartão vermelho direto':' pelo segundo amarelo'}!`,offender);}
      else{defend.yellow[offender]=1;event('yellow',defend,`Cartão amarelo para ${name(defend,offender)}.`,offender);}
    }
    if(random()<.09){penalty=true;event('penalty',attack,'Pênalti! A bola vai para a marca da cal.');}
  }
  if(!penalty&&random()<.025)event('offside',attack,'Impedimento. A jogada foi interrompida.');
  else if(penalty||random()<.20){
    const shooters=attack.active.filter(id=>attack.players.find(p=>p.id===id)?.position!=='GOL');
    const shooter=shooters[Math.floor(random()*shooters.length)]??pick(attack);attack.shots++;
    event('shot',attack,`${name(attack,shooter)} ${penalty?'cobra o pênalti':'finaliza'}!`,shooter);
    const risk=mentality==='Ofensiva'?.035:mentality==='Defensiva'?-.035:0;
    const chance=penalty?.74:Math.max(.08,Math.min(.4,.145+(teamStrength(attack,m.minute)-teamStrength(defend,m.minute))/230+(attack.club===m.home.club?.02:0)+(attack.club===ownClub?risk:risk*.8)+(!defend.active.some(id=>defend.players.find(p=>p.id===id)?.position==='GOL')?.12:0)));
    if(random()<chance&&attack.goals<9){attack.goals++;event('goal',attack,`GOL! ${name(attack,shooter)} marca para ${clubs[attack.club].name}!`,shooter);}
    else {event('save',defend,penalty?'Pênalti defendido!':'A defesa afasta a finalização.');if(random()<.34){attack.corners++;event('corner',attack,'Escanteio. O ataque mantém a pressão.');}}
  }
  if(m.home.active.length<7||m.away.active.length<7){const winner=m.home.active.length<7?m.away:m.home;winner.goals=Math.min(9,Math.max(3,winner.goals,(winner===m.home?m.away:m.home).goals+1));m.phase='full';event('full',winner,'Partida encerrada: adversário com menos de sete atletas.');}
  else if(m.minute===45){m.phase='halftime';event('halftime',attack,'Intervalo. É hora de ajustar a equipe.');}
  else if(m.minute===90){m.phase='full';event('full',attack,'Apito final!');}
  return m;
}
export function skipPeriod(input:LiveMatch,club:number,mentality:Game['mentality']){let m=input;while(m.phase==='first'||m.phase==='second')m=advanceMatch(m,club,mentality);return m;}
export function substitutionError(m:LiveMatch,club:number,out:string,incoming:string){
  if(m.phase!=='halftime')return 'As substituições estão disponíveis no intervalo.';
  const t=m.home.club===club?m.home:m.away;
  if(m.changes.length>=5)return 'Limite de cinco substituições atingido.';
  if(!t.active.includes(out)||t.used.includes(incoming)||!t.players.some(p=>p.id===incoming))return 'Escolha um atleta em campo e um reserva que ainda não entrou.';
  if(t.players.find(p=>p.id===out)?.position==='GOL'&&t.players.find(p=>p.id===incoming)?.position!=='GOL')return 'Substitua o goleiro por outro goleiro.';
  return '';
}
export function substitute(m:LiveMatch,club:number,out:string,incoming:string):LiveMatch{
  if(substitutionError(m,club,out,incoming))return m;
  const next=copy(m),t=next.home.club===club?next.home:next.away;
  t.active=t.active.map(id=>id===out?incoming:id);t.used.push(incoming);next.changes.push({out,in:incoming});
  next.events.push({minute:45,kind:'substitution',team:club,player:incoming,text:`Sai ${t.players.find(p=>p.id===out)!.name}; entra ${t.players.find(p=>p.id===incoming)!.name}.`});return next;
}
export function resumeMatch(m:LiveMatch,club:number):LiveMatch{
  if(m.phase!=='halftime')return m;
  const next=copy(m),rival=next.home.club===club?next.away:next.home;
  const out=rival.active.filter(id=>rival.players.find(p=>p.id===id)?.position!=='GOL').slice(-2);
  const bench=rival.players.filter(p=>!rival.used.includes(p.id)&&p.position!=='GOL').slice(0,2);
  out.forEach((id,i)=>{if(!bench[i])return;rival.active=rival.active.map(p=>p===id?bench[i].id:p);rival.used.push(bench[i].id);next.events.push({minute:45,kind:'substitution',team:rival.club,player:bench[i].id,text:`${clubs[rival.club].short}: entra ${bench[i].name}.`});});
  next.phase='second';next.events.push({minute:45,kind:'kickoff',team:club,text:'Começa o segundo tempo. Os times trocam de lado.'});return next;
}
/** Rebuild from trusted career inputs, including every halftime decision. */
export function validateLive(value:unknown,g:Game):LiveMatch{
  const fail=()=>{throw new Error('Partida em andamento inválida.');};
  if(!value||typeof value!=='object')return fail();
  const raw=value as LiveMatch;
  if(!Number.isInteger(raw.minute)||raw.minute<0||raw.minute>90||!Array.isArray(raw.changes)||raw.changes.length>5||!['first','halftime','second','full'].includes(raw.phase))return fail();
  let expected=createMatch(g);
  while(expected.minute<Math.min(45,raw.minute)&&expected.phase==='first')expected=advanceMatch(expected,g.club,g.mentality);
  for(const change of raw.changes){if(!change||typeof change.out!=='string'||typeof change.in!=='string')return fail();const next=substitute(expected,g.club,change.out,change.in);if(next===expected)return fail();expected=next;}
  if(raw.phase==='second'||(raw.phase==='full'&&raw.minute>45))expected=resumeMatch(expected,g.club);
  while(expected.minute<raw.minute&&expected.phase==='second')expected=advanceMatch(expected,g.club,g.mentality);
  // Compare canonical known fields, rejecting changed scores, players, cards or logs.
  const canonical=(v:unknown):string=>JSON.stringify(v,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);
  if(canonical(raw)!==canonical(expected))return fail();return expected;
}
export function updatedDiscipline(g:Game,m:LiveMatch):Record<string,Discipline>{
  const result:Record<string,Discipline>={};
  for(const [id,d] of Object.entries(g.discipline??{}))result[id]={yellows:d.yellows,ban:Math.max(0,d.ban-1)};
  const own=m.home.club===g.club?m.home:m.away;
  for(const [id,count] of Object.entries(own.yellow)){if(count===2&&own.sentOff.includes(id))continue;const d=result[id]??{yellows:0,ban:0};d.yellows+=count;if(d.yellows>=3){d.yellows=0;d.ban=Math.max(1,d.ban);}result[id]=d;}
  for(const id of own.sentOff){const d=result[id]??{yellows:0,ban:0};d.ban=Math.max(1,d.ban);result[id]=d;}
  return result;
}

