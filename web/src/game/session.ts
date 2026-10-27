import type {Game} from './domain.ts';
import {calendar,roster,standings} from './domain.ts';
import {clubs} from './data.ts';
import {careerObjectives,relationship} from './campaign.ts';
import {management} from './management.ts';

/** A session briefing is derived from the save: returning never advances time. */
export function sessionBriefing(g:Game){
 const table=standings(g),own=table.find(t=>t.club===g.club)!;
 const fixture=calendar(g)[g.round]?.find(pair=>pair.includes(g.club));
 const opponent=fixture?.find(id=>id!==g.club);
 const recent=g.results.filter(m=>m.home===g.club||m.away===g.club).slice(-3);
 const points=recent.reduce((sum,m)=>{const a=m.home===g.club?m.hg:m.ag,b=m.home===g.club?m.ag:m.hg;return sum+(a>b?3:a===b?1:0);},0);
 const players=roster(g),pending=players.filter(p=>relationship(g,p.id).promise?.status==='active');
 const contact=pending[0]??players.find(p=>!relationship(g,p.id).heard)??players[0];
 const focus=players.find(p=>p.id===management(g).focus);
 const ready=careerObjectives(g).filter(o=>!o.claimed&&o.current>=o.target);
 const last=recent.at(-1);
 return {ended:!fixture,opponent,home:fixture?.[0]===g.club,rank:table.findIndex(t=>t.club===g.club)+1,points:own.points,
  opponentRank:opponent===undefined?0:table.findIndex(t=>t.club===opponent)+1,
  opponentName:opponent===undefined?'Temporada encerrada':clubs[opponent].name,
  headline:!recent.length?'Seu projeto começa nesta rodada.':points>=7?'O time ganhou embalo.':points<=2?'É hora de construir uma reação.':'Cada decisão pode mudar a campanha.',
  pending,contact,focus,ready,last,
  suspended:players.filter(p=>(g.discipline?.[p.id]?.ban??0)>0),
  growth:focus?(management(g).growth[focus.id]??0):0,
  nextMilestone:careerObjectives(g).find(o=>!o.claimed&&o.current<o.target),
 };
}
