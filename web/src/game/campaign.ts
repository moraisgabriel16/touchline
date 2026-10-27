import {currentRoster,allOwned} from './management.ts';
import dialogue from '../../../data/social/conversations.json' with {type:'json'};
import type {Game} from './domain.ts';
import type {LiveMatch} from './live-match.ts';
import {clubs,schedule} from './data.ts';

export interface Memory {id:string;year:number;round:number;text:string}
export interface Relationship {trust:number;respect:number;affinity:number;rivalry:number;heard:boolean;feedbackDone:boolean;fulfilled:number;lastTalk:number;lastPromise:number;reply:string;memories:Memory[];promise?:{year:number;round:number;status:'active'|'fulfilled'|'broken'|'repairing'}}
export interface AthleteRecord {apps:number;starts:number;goals:number}
export interface MatchReport {year:number;round:number;home:number;away:number;hg:number;ag:number;shots:[number,number];events:{minute:number;text:string;kind:string}[]}
export interface SeasonRecord {year:number;position:number;points:number;club:number}
export interface Campaign {xp:number;claimed:string[];relations:Record<string,Relationship>;records:Record<string,AthleteRecord>;reports:MatchReport[];seasons:SeasonRecord[]}
export const newCampaign=():Campaign=>({xp:0,claimed:[],relations:{},records:{},reports:[],seasons:[]});
export type SocialAction=keyof typeof dialogue.actions;
export const socialActions=dialogue.actions;
const turn=(g:Game)=>g.year*100+g.round;
const squad=currentRoster;
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function personality(id:string){const hash=[...id].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);return {trait:dialogue.traits[hash%4],priority:id==='m04'?'desenvolvimento':dialogue.priorities[(hash>>>3)%4]};}
export function relationship(g:Game,id:string):Relationship{return g.campaign.relations[id]??{trust:50,respect:50,affinity:30,rivalry:0,heard:false,feedbackDone:false,fulfilled:0,lastTalk:-1,lastPromise:-1,reply:'Ainda não conversamos. Vamos nos conhecer no CT?',memories:[]};}
export function relationLabel(value:number,axis='trust'){return axis==='rivalry'?(value<20?'Sem conflito':value<50?'Atrito recente':'Conflito aberto'):value<30?'Abalado':value<50?'Reservado':value<65?'Em construção':value<80?'Consolidado':'Muito próximo';}
function remember(r:Relationship,g:Game,id:string,text:string){r.memories=[...r.memories,{id:`${turn(g)}:${id}`,year:g.year,round:g.round+1,text}].slice(-12);}
export function socialError(g:Game,id:string,action:SocialAction):string{
  if(g.live)return 'Converse depois da partida.';
  if(!squad(g).some(p=>p.id===id))return 'Atleta fora do seu elenco.';
  if(g.round>=schedule(g.leagueSize).length)return 'As conversas voltam na próxima temporada.';
  const r=relationship(g,id);
  if(action==='deliver')return r.promise?.status!=='active'?'Não há devolutiva pendente.':!g.preparation.includes('train')?'Treine a equipe nesta rodada antes de entregar a devolutiva.':'';
  if(r.lastTalk===turn(g))return 'Vocês já tiveram uma conversa relevante nesta rodada.';
  if(Object.values(g.campaign.relations).filter(r=>r.lastTalk===turn(g)).length>=3)return 'As três conversas desta rodada já foram utilizadas.';
  if(action==='feedback'&&(id!=='m04'||!g.hero.actions.includes('observe_davi')))return 'Observe Davi no CT primeiro.';
  if(action==='feedback'&&r.feedbackDone)return 'Essa observação já foi discutida.';
  if(action==='promise'){
    if(!r.heard)return 'Ouça o atleta antes de combinar o acompanhamento.';
    if(r.promise?.status==='active')return 'Já existe uma devolutiva combinada.';
    if(turn(g)-r.lastPromise<4)return 'Conclua este ciclo de acompanhamento antes de combinar outro (quatro rodadas).';
  }
  if(action==='repair'&&r.promise?.status!=='broken')return 'Não há compromisso quebrado a reparar.';
  return '';
}
export function interactWithPlayer(g:Game,id:string,action:SocialAction):Game{
  if(!(action in socialActions)||socialError(g,id,action))return g;
  const r=structuredClone(relationship(g,id));
  if(action!=='deliver')r.lastTalk=turn(g);
  if(action==='listen'){const first=!r.heard;r.heard=true;if(first){r.affinity=clamp(r.affinity+2);r.trust=clamp(r.trust+1);}r.reply=dialogue.listen[personality(id).priority as keyof typeof dialogue.listen];remember(r,g,'listen','Você ouviu a prioridade do atleta.');}
  if(action==='feedback'){r.feedbackDone=true;r.respect=clamp(r.respect+2);r.reply='Abrir espaço eu consigo. Recebendo de costas, ainda fico em dúvida. Obrigado por explicar a jogada comigo.';remember(r,g,'feedback','Você discutiu a observação de Davi com cuidado.');}
  if(action==='promise'){r.lastPromise=turn(g);r.promise={year:g.year,round:g.round+1,status:'active'};r.reply='Combinado. Depois do treino, vamos rever juntos o que posso trabalhar. Espero a devolutiva antes da próxima partida.';remember(r,g,'promise',`Devolutiva combinada antes da partida da rodada ${g.round+1}.`);}
  if(action==='deliver'){r.fulfilled++;r.promise!.status='fulfilled';r.trust=clamp(r.trust+4);r.respect=clamp(r.respect+1);r.reply='Você voltou e cumpriu o combinado. Vamos manter esse acompanhamento.';remember(r,g,'deliver','Você treinou a equipe e cumpriu a devolutiva.');}
  if(action==='repair'){r.promise!.status='repairing';r.rivalry=clamp(r.rivalry-1);r.reply='Agradeço por reconhecer. Quero ver como vai ser daqui para frente.';remember(r,g,'repair','Você reconheceu a falha. A confiança depende das próximas atitudes.');}
  return {...g,campaign:{...g.campaign,relations:{...g.campaign.relations,[id]:r}}};
}
export function settleCampaign(g:Game,match:LiveMatch):Campaign{
  const c=structuredClone(g.campaign),own=match.home.club===g.club?match.home:match.away;
  for(const r of Object.values(c.relations))if(r.promise?.status==='active'&&(r.promise.year<g.year||r.promise.year===g.year&&r.promise.round<=g.round+1)){
    r.promise.status='broken';r.trust=clamp(r.trust-8);r.rivalry=clamp(r.rivalry+3);r.reply='Eu esperei a devolutiva, mas a partida chegou e você não voltou. Podemos falar sobre isso?';remember(r,g,'broken','O prazo passou sem a devolutiva combinada.');
  }
  const participants=new Set([...own.initial,...match.changes.map(c=>c.in)]);
  for(const id of participants){const record=c.records[id]??{apps:0,starts:0,goals:0};record.apps++;if(own.initial.includes(id))record.starts++;record.goals+=match.events.filter(e=>e.kind==='goal'&&e.team===g.club&&e.player===id).length;c.records[id]=record;}
  c.reports=[...c.reports,{year:g.year,round:g.round+1,home:match.home.club,away:match.away.club,hg:match.home.goals,ag:match.away.goals,shots:[match.home.shots,match.away.shots] as [number,number],events:match.events.filter(e=>['goal','red','yellow','substitution','penalty','full'].includes(e.kind)).map(e=>({minute:e.minute,text:e.text,kind:e.kind})).slice(-50)}].slice(-22);
  return c;
}
export function seasonStats(g:Game){const games=g.results.filter(m=>m.home===g.club||m.away===g.club),results=games.map(m=>{const a=m.home===g.club?m.hg:m.ag,b=m.home===g.club?m.ag:m.hg;return a>b?'V':a===b?'E':'D';});return {played:games.length,wins:results.filter(r=>r==='V').length,points:results.reduce((n,r)=>n+(r==='V'?3:r==='E'?1:0),0),form:results.slice(-5)};}
export function careerObjectives(g:Game){const stats=seasonStats(g);return [
  {id:'first_win',title:'A primeira vitória',description:'Vença uma partida da temporada.',current:Math.min(1,stats.wins),target:1,cash:1500,xp:30},
  {id:'ten_points',title:'Um projeto que pontua',description:'Some dez pontos na liga.',current:Math.min(10,stats.points),target:10,cash:3000,xp:60},
  {id:'bonds',title:'Conheça o vestiário',description:'Ouça cinco atletas diferentes.',current:Math.min(5,Object.values(g.campaign.relations).filter(r=>r.heard).length),target:5,cash:0,xp:40},
  {id:'reliable',title:'Palavra cumprida',description:'Cumpra uma devolutiva de treino.',current:Math.min(1,Object.values(g.campaign.relations).filter(r=>r.fulfilled>0).length),target:1,cash:0,xp:40}
  ].map(o=>({...o,key:o.id==='bonds'||o.id==='reliable'?o.id:`${g.year}:${o.id}`,claimed:g.campaign.claimed.includes(o.id==='bonds'||o.id==='reliable'?o.id:`${g.year}:${o.id}`)}));}
export function claimObjective(g:Game,key:string):Game{
  const o=careerObjectives(g).find(o=>o.key===key);if(!o||o.claimed||o.current<o.target||g.live)return g;
  return {...g,cash:g.cash+o.cash,ledger:o.cash?[...g.ledger,{round:Math.max(1,g.round),label:`Meta: ${o.title}`,amount:o.cash}].slice(-80):g.ledger,campaign:{...g.campaign,xp:g.campaign.xp+o.xp,claimed:[...g.campaign.claimed,key]}};
}
export function boardAssessment(g:Game){const s=seasonStats(g),expectation=clubs[g.club].strength>=70?1.6:1.2;return {confidence:clamp(Math.round(55+(s.points-s.played*expectation)*3)),target:clubs[g.club].strength>=70?'Parte superior da tabela':'Campanha competitiva',message:s.played===0?'A diretoria espera o início do trabalho.':s.points/s.played>=expectation?'O desempenho está dentro do esperado.':'A diretoria espera uma reação nas próximas rodadas.'};}
export function bestLineup(g:Game):Game{
  if(g.live)return g;const all=squad(g).filter(p=>!g.discipline?.[p.id]?.ban).sort((a,b)=>b.skill-a.skill||a.id.localeCompare(b.id)),keeper=all.find(p=>p.position==='GOL');
  if(all.length<11||!keeper)return g;
  const pick=[keeper.id],groups=g.formation.split('-').map(Number);
  const kinds=[['LD','LE','ZAG'],['VOL','MEI'],['ATA']];
  groups.forEach((count,index)=>{for(const p of all.filter(p=>kinds[index].includes(p.position)&&!pick.includes(p.id)).slice(0,count))pick.push(p.id);});
  for(const p of all.filter(p=>p.position!=='GOL'&&!pick.includes(p.id)))if(pick.length<11)pick.push(p.id);
  return pick.length===11?{...g,lineup:pick}:g;
}
/** Strict bounded data validation; no unknown save fields are retained. */
export function validateCampaign(value:unknown,g:Game):Campaign{
  const fail=():never=>{throw new Error('Dados de carreira inválidos.');};
  if(!value||typeof value!=='object')return fail();const c=value as Campaign;
  const integer=(n:unknown,min:number,max:number)=>Number.isSafeInteger(n)&&Number(n)>=min&&Number(n)<=max;
  const obj=(v:unknown)=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const str=(s:unknown,max:number)=>typeof s==='string'&&s.length<=max;
  const ids=allOwned(g).map(p=>p.id);
  if(!integer(c.xp,0,1e7)||!Array.isArray(c.claimed)||c.claimed.length>16000||new Set(c.claimed).size!==c.claimed.length||c.claimed.some(k=>!str(k,40)||!(/^(bonds|reliable|\d{4}:(first_win|ten_points))$/).test(k))||!obj(c.relations)||!obj(c.records)||!Array.isArray(c.reports)||c.reports.length>22||!Array.isArray(c.seasons)||c.seasons.length>20)return fail();
  for(const [id,r] of Object.entries(c.relations)){
    if(!ids.includes(id)||!obj(r)||![r.trust,r.respect,r.affinity,r.rivalry].every(n=>integer(n,0,100))||typeof r.heard!=='boolean'||typeof r.feedbackDone!=='boolean'||!integer(r.fulfilled,0,100000)||!integer(r.lastTalk,-1,turn(g))||!integer(r.lastPromise,-1,turn(g))||!str(r.reply,600)||!Array.isArray(r.memories)||r.memories.length>12)return fail();
    for(const m of r.memories)if(!obj(m)||!str(m.id,80)||!str(m.text,300)||!integer(m.year,2027,g.year)||!integer(m.round,1,22))return fail();
    if(r.promise&&(!obj(r.promise)||!integer(r.promise.year,2027,g.year)||!integer(r.promise.round,1,22)||!['active','fulfilled','broken','repairing'].includes(r.promise.status)))return fail();
  }
  for(const [id,r] of Object.entries(c.records))if(!ids.includes(id)||!obj(r)||![r.apps,r.starts,r.goals].every(n=>integer(n,0,1e7))||r.starts>r.apps)return fail();
  for(const r of c.reports)if(!obj(r)||!integer(r.year,2027,g.year)||!integer(r.round,1,22)||!integer(r.home,0,11)||!integer(r.away,0,11)||r.home===r.away||![r.home,r.away].includes(g.club)||![r.hg,r.ag].every(n=>integer(n,0,9))||!Array.isArray(r.shots)||r.shots.length!==2||r.shots.some(n=>!integer(n,0,90))||!Array.isArray(r.events)||r.events.length>50||r.events.some(e=>!obj(e)||!integer(e.minute,0,90)||!str(e.text,400)||!['goal','red','yellow','substitution','penalty','full'].includes(e.kind)))return fail();
  for(const s of c.seasons)if(!obj(s)||!integer(s.year,2027,g.year)||!integer(s.position,1,12)||!integer(s.points,0,66)||!integer(s.club,0,11))return fail();
  return {xp:c.xp,claimed:[...c.claimed],relations:Object.fromEntries(Object.entries(c.relations).map(([id,r])=>[id,{trust:r.trust,respect:r.respect,affinity:r.affinity,rivalry:r.rivalry,heard:r.heard,feedbackDone:r.feedbackDone,fulfilled:r.fulfilled,lastTalk:r.lastTalk,lastPromise:r.lastPromise,reply:r.reply,memories:r.memories.map(m=>({id:m.id,year:m.year,round:m.round,text:m.text})),...(r.promise?{promise:{year:r.promise.year,round:r.promise.round,status:r.promise.status}}:{})}])),records:Object.fromEntries(Object.entries(c.records).map(([id,r])=>[id,{apps:r.apps,starts:r.starts,goals:r.goals}])),reports:c.reports.map(r=>({year:r.year,round:r.round,home:r.home,away:r.away,hg:r.hg,ag:r.ag,shots:[...r.shots] as [number,number],events:r.events.map(e=>({minute:e.minute,text:e.text,kind:e.kind}))})),seasons:c.seasons.map(s=>({year:s.year,position:s.position,points:s.points,club:s.club}))};
}

