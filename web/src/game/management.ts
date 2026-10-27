import {squadFor,schedule} from './data.ts';
import type {Player} from './data.ts';
import type {Game} from './domain.ts';
import type {LiveMatch} from './live-match.ts';
export interface Management {bought:string[];sold:string[];growth:Record<string,number>;focus?:string;debt:number;log:{year:number;round:number;text:string}[]}
export const emptyManagement=():Management=>({bought:[],sold:[],growth:{},debt:0,log:[]});
export const management=(g:Game)=>g.management??emptyManagement();
const names=['Caio Ventura','Breno Pacheco','Natan Freire','Rui Azevedo','André Sena','Cauã Vilar','Pedro Valença','Lucas Arantes','João Serpa','Eric Moura','Hugo Falcão','Alan Peixoto','Rafael Cunha','Murilo Reis','Dante Melo','Rômulo Vidal','Alex Porto','Cássio Duarte'];
export const marketPool:Player[]=names.map((name,i)=>({id:`market_${i}`,name,position:['GOL','ZAG','LD','LE','VOL','MEI','ATA','ZAG','ATA'][i%9],age:18+i%14,skill:62+(i*7)%17,condition:100}));
export const allOwned=(g:Game)=>[...squadFor(g.club),...g.recruits,...marketPool.filter(p=>management(g).bought.includes(p.id))];
export const potential=(p:Player)=>Math.min(95,p.skill+(p.age<=23?6:3));
export function currentRoster(g:Game){const m=management(g);return allOwned(g).filter(p=>!m.sold.includes(p.id)).map(p=>({...p,skill:Math.min(potential(p),p.skill+Math.floor((m.growth[p.id]??0)/100))}));}
export const wage=(p:Player)=>p.id.startsWith('market_')?(marketPool.find(q=>q.id===p.id)?.skill??p.skill)*6:200;
export const payroll=(g:Game)=>currentRoster(g).reduce((n,p)=>n+wage(p),0);
export const fee=(p:Player)=>Math.round((4500+(p.skill-60)*650+(p.age<=23?2000:0))/100)*100;
export const saleValue=(p:Player)=>Math.floor(fee(p)*.55/100)*100;
export const marketOpen=(g:Game)=>g.round<4||g.round>=11&&g.round<14;
export function offers(g:Game){const offset=Math.floor(g.round/3)*3+g.year-2027;return Array.from({length:9},(_,i)=>marketPool[(i+offset)%marketPool.length]).filter(p=>!management(g).bought.includes(p.id));}
const note=(m:Management,g:Game,text:string)=>({...m,log:[...m.log,{year:g.year,round:g.round+1,text}].slice(-40)});
const moneyMove=(g:Game,m:Management,label:string,amount:number):Game=>({...g,management:m,cash:g.cash+amount,ledger:[...g.ledger,{round:g.round+1,label,amount}].slice(-80)});
export function tradeError(g:Game,id:string,kind:'buy'|'sell'){
 if(g.live)return 'Espere o apito final.';
 if(g.round>=schedule(g.leagueSize).length)return 'Inicie a próxima temporada.';
 if(!marketOpen(g))return 'Janela fechada. Negocie nas rodadas 1–4 e 12–14.';
 const m=management(g),team=currentRoster(g);
 if(kind==='buy'){
  const p=offers(g).find(p=>p.id===id);if(!p)return 'Atleta indisponível nesta lista.';
  if(m.debt)return 'Quite as despesas pendentes antes de contratar.';
  if(team.length>=24)return 'Elenco completo: 24 atletas.';
  if(p.position==='GOL'&&team.filter(p=>p.position==='GOL').length>=3)return 'Limite de três goleiros no CT.';
  if(g.cash<fee(p)+wage(p)*3)return 'Reserve a taxa e três rodadas de salário do reforço.';
 }else{
  const p=team.find(p=>p.id===id);if(!p)return 'Atleta fora do elenco.';
  if(team.length<=16)return 'Mantenha pelo menos 16 atletas.';
  if(g.lineup.includes(id))return 'Retire o atleta dos onze titulares antes de vender.';
  if(p.position==='GOL'&&team.filter(p=>p.position==='GOL').length<=2)return 'Mantenha dois goleiros.';
  if(g.campaign.relations[id]?.promise?.status==='active')return 'Resolva o compromisso com o atleta antes da saída.';
  if(id==='m04'&&!g.hero.actions.includes('deliver_report'))return 'Conclua o relatório de Davi antes de negociar sua saída.';
 }
 return '';
}
export function trade(g:Game,id:string,kind:'buy'|'sell'):Game{
 if(tradeError(g,id,kind))return g;
 const m=structuredClone(management(g));
 if(kind==='buy'){const p=marketPool.find(p=>p.id===id)!;m.bought.push(id);return moneyMove(g,note(m,g,`Chegou ${p.name}. Taxa: R$ ${fee(p)}.`),`Contratação: ${p.name}`,-fee(p));}
 const p=currentRoster(g).find(p=>p.id===id)!;m.sold.push(id);if(m.focus===id)delete m.focus;
 const discipline={...g.discipline};delete discipline[id];
 return moneyMove({...g,discipline},note(m,g,`Saiu ${p.name}. Venda: R$ ${saleValue(p)}.`),`Venda: ${p.name}`,saleValue(p));
}
export function setFocus(g:Game,id:string):Game{if(g.live||g.round>=schedule(g.leagueSize).length||!currentRoster(g).some(p=>p.id===id))return g;return {...g,management:{...management(g),focus:id}};}
export function settleDevelopment(g:Game,live:LiveMatch):Management{
 let m=structuredClone(management(g));const p=currentRoster(g).find(p=>p.id===m.focus),base=allOwned(g).find(p=>p.id===m.focus);
 if(!p||!base)return m;
 const own=live.home.club===g.club?live.home:live.away,played=own.initial.includes(p.id)||live.changes.some(c=>c.in===p.id);
 const gain=(played?35:0)+(g.preparation.includes('train')?15+g.academy*5+((g.campaign.relations[p.id]?.trust??0)>=65?5:0):0),before=m.growth[p.id]??0;
 m.growth[p.id]=Math.min((potential(base)-base.skill)*100,before+gain);
 if(Math.floor(m.growth[p.id]/100)>Math.floor(before/100))m=note(m,g,`${p.name} evoluiu para força ${base.skill+Math.floor(m.growth[p.id]/100)}.`);
 return m;
}
export function validateManagement(g:Game):Management|undefined{
 if(g.management===undefined)return undefined;
 const m=g.management,fail=():never=>{throw new Error('Gestão do elenco inválida.');};
 if(!m||!Array.isArray(m.bought)||m.bought.length>18||new Set(m.bought).size!==m.bought.length||m.bought.some(id=>!marketPool.some(p=>p.id===id))||!Array.isArray(m.sold)||m.sold.length>42||new Set(m.sold).size!==m.sold.length||!m.growth||typeof m.growth!=='object'||Array.isArray(m.growth)||!Number.isSafeInteger(m.debt)||m.debt<0||m.debt>1e9||!Array.isArray(m.log)||m.log.length>40)return fail();
 const owned=allOwned(g),team=currentRoster(g);
 if(m.sold.some(id=>!owned.some(p=>p.id===id))||team.length<16||team.length>24||team.filter(p=>p.position==='GOL').length<2||team.filter(p=>p.position==='GOL').length>3||m.focus!==undefined&&!team.some(p=>p.id===m.focus))return fail();
 for(const [id,n] of Object.entries(m.growth)){const p=owned.find(p=>p.id===id);if(!p||!Number.isInteger(n)||n<0||n>(potential(p)-p.skill)*100)return fail();}
 if(m.log.some(l=>!l||!Number.isInteger(l.year)||l.year<2027||l.year>g.year||!Number.isInteger(l.round)||l.round<1||l.round>22||typeof l.text!=='string'||l.text.length>150))return fail();
 return {bought:[...m.bought],sold:[...m.sold],growth:{...m.growth},debt:m.debt,log:m.log.map(l=>({year:l.year,round:l.round,text:l.text})),...(m.focus?{focus:m.focus}:{})};
}
