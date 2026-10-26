import {newCampaign,settleCampaign,validateCampaign} from './campaign.ts';
import type {Campaign} from './campaign.ts';
import { createMatch, skipPeriod, resumeMatch, validateLive, updatedDiscipline } from './live-match.ts';
import type { LiveMatch, Discipline } from './live-match.ts';
import { actions, clubs, schedule, formations, mentalities, players, squadFor, rooms, story, locationIds } from './data.ts';
import type { Action, Cell, Dialogue, Location, Player } from './data.ts';
import { walkable } from './navigation.ts';

export interface Hero { location: Location; positions: Partial<Record<Location,Cell>>; actions: Action[]; sceneVersion?:2|3 }
export interface Match { round: number; home: number; away: number; hg: number; ag: number }
export interface Game {
  live?:LiveMatch; discipline?:Record<string,Discipline>;
  schema: 4; campaign:Campaign; seed: number; lineup: string[]; formation: typeof formations[number];
  mentality: typeof mentalities[number]; round: number; results: Match[]; hero: Hero;
  club: number; leagueSize: 4|12; year: number; cash: number; support: number; fitness: number;
  training: number; preparation: Preparation[]; stadium: number; academy: number;
  ticket: number; kit: 'home'|'away'; recruits: Player[]; ledger: Entry[];
}
export interface Entry { round:number; label:string; amount:number }
export type Preparation='train'|'rest'|'fans'|'scout';
export const roster = (game:Game):Player[]=>[...squadFor(game.club),...game.recruits];
export const playerById = (id:string,game?:Game)=> (game?roster(game):players).find(player=>player.id===id)!;
export const calendar = (game:Game)=>schedule(game.leagueSize);
export const newGame = (club=0): Game => ({schema:4,campaign:newCampaign(),seed:2027,lineup:squadFor(club).slice(0,11).map(p=>p.id),formation:'4-4-2',mentality:'Equilibrada',round:0,results:[],hero:{location:'apartment',positions:{},actions:[],sceneVersion:3},club,leagueSize:12,year:2027,cash:18000,support:45,fitness:94,training:0,preparation:[],stadium:0,academy:0,ticket:20,kit:'home',recruits:[],ledger:[]});
export const capacity = (game:Game)=>3000+game.stadium*1500;
export function attendance(game:Game){
  const demand=(.35+game.support/180)*({10:1.2,20:1,30:.72}[game.ticket]??1);
  return Math.min(capacity(game),Math.floor(capacity(game)*demand));
}
const book=(game:Game,label:string,amount:number):Game=>({...game,cash:game.cash+amount,ledger:[...game.ledger,{round:game.round+1,label,amount}].slice(-80)});
export function preparationError(game:Game,action:Preparation):string {
  if(game.live)return 'A partida já está em andamento.';
  if(game.round>=calendar(game).length)return 'A temporada terminou. Inicie a próxima temporada.';
  if(game.preparation.length>=3)return 'Você usou as três ações desta rodada.';
  if(game.preparation.includes(action))return 'Essa ação já foi feita nesta rodada.';
  if(action==='train'&&game.fitness<55)return 'Condição abaixo de 55. Recupere a equipe antes de treinar.';
  if(action==='fans'&&game.cash<1000)return 'É preciso ter R$ 1.000 no caixa.';
  if(action==='scout'&&game.cash<1500)return 'É preciso ter R$ 1.500 no caixa.';
  if(action==='scout'&&game.recruits.length>=6)return 'Limite de seis contratações da várzea atingido.';
  return '';
}
export function prepare(game:Game,action:Preparation):Game {
  if(preparationError(game,action))return game;
  let next={...game,preparation:[...game.preparation,action]};
  if(action==='train')next={...next,training:3+game.academy,fitness:game.fitness-6};
  if(action==='rest')next={...next,fitness:Math.min(100,game.fitness+12)};
  if(action==='fans')next={...book(next,'Encontro com a torcida',-1000),support:Math.min(100,game.support+10)};
  if(action==='scout'){
    const index=game.recruits.length,template=squadFor(game.club)[11+index];
    const player={...template,id:`recruit_${game.club}_${index}`,name:['Luan Terra','Raul Campos','Ivo Farias','Enzo Luz','Dênis Lago','Yuri Pontes'][index],age:18+index,skill:62+(game.round+game.club)%9+game.academy*2};
    next={...book(next,`Contratação: ${player.name}`,-1500),recruits:[...game.recruits,player]};
  }
  return next;
}
export function upgradeCost(game:Game,kind:'stadium'|'academy'){return (kind==='stadium'?8000:6000)*(game[kind]+1);}
export function upgrade(game:Game,kind:'stadium'|'academy'):Game {
  const cost=upgradeCost(game,kind);
  if(game.live)return game;
  if(game[kind]>=3||game.cash<cost||game.round>=calendar(game).length)return game;
  return {...book(game,kind==='stadium'?'Ampliação do estádio':'Melhoria do CT',-cost),[kind]:game[kind]+1,training:kind==='academy'&&game.preparation.includes('train')?4+game.academy:game.training};
}
export function nextSeason(game:Game):Game {
  if(game.round<calendar(game).length)return game;
  const table=standings(game),place=table.findIndex(row=>row.club===game.club);
  return {...game,campaign:{...game.campaign,seasons:[...game.campaign.seasons,{year:game.year,position:place+1,points:table[place].points,club:game.club}].slice(-20)},leagueSize:12,seed:(game.seed+1)>>>0,year:Math.min(9999,game.year+1),round:0,results:[],preparation:[],training:0,fitness:94,ledger:[],discipline:{}};
}
export function flags(hero: Hero): Set<string> { return new Set(hero.actions.map(action=>story.effects[action].flag)); }
export function progression(hero: Hero) {
  return hero.actions.reduce((stats,action)=>{
    const effect=story.effects[action];
    return {xp:stats.xp+(effect.xp??0),analysis:stats.analysis+(effect.analysis??0),communication:stats.communication+(effect.communication??0),trust:stats.trust+(effect.trust??0)};
  },{xp:0,analysis:1,communication:1,trust:0});
}
export function objective(hero: Hero) {
  const f=flags(hero);
  return story.objectives[f.has('report')?'done':f.has('accepted')?(f.has('observed')?'report':'observe'):f.has('notebook')?'meet':'start'];
}
export function getDialogue(hero: Hero,id: string): Dialogue {
  const f=flags(hero);
  let key=id;
  if (id==='helena') key=f.has('report')?'helena_done':f.has('accepted')?(f.has('observed')?'helena_report':'helena_wait'):'helena';
  if (id==='notebook' && f.has('notebook')) key='notebook_done';
  if (id==='davi' && f.has('observed')) key='davi_done';
  return story.dialogues[key];
}
export function applyAction(hero: Hero, action: Action): Hero {
  if (!actions.includes(action) || hero.actions.includes(action)) return hero;
  const f=flags(hero);
  if (action==='deliver_report' && !(f.has('accepted') && f.has('observed'))) return hero;
  return {...hero,actions:[...hero.actions,action]};
}
export const journal = (hero: Hero) => [story.start_note,...hero.actions.map(action=>story.effects[action].note)];
export function swapPlayer(game: Game,outgoing: string,incoming: string): Game {
  if (game.live)return game;
  if (!game.lineup.includes(outgoing) || game.lineup.includes(incoming) || !roster(game).some(p=>p.id===incoming)) return game;
  return {...game,lineup:game.lineup.map(id=>id===outgoing?incoming:id)};
}
export function strength(game: Game,club: number) {
  return club===game.club?game.lineup.reduce((total,id)=>total+playerById(id,game).skill,0)/11+game.training+(game.fitness-90)/10:clubs[club].strength;
}
// Mulberry32: browser/Node reproducibility. Different RNG from the legacy Godot prototype.
function random(seed: number) {
  return () => { let t=seed+=0x6D2B79F5; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
}
export function playRound(game: Game, completed?:LiveMatch): Game {
  if (game.round>=calendar(game).length) return game;
  let live=completed??game.live??createMatch(game);
  if(completed)validateLive(completed,game);
  live=skipPeriod(live,game.club,game.mentality);
  live=skipPeriod(resumeMatch(live,game.club),game.club,game.mentality);
  const rng=random(game.seed+game.round*997);
  const results=calendar(game)[game.round].map(([home,away])=>{
    if(home===game.club||away===game.club)return {round:game.round+1,home,away,hg:live.home.goals,ag:live.away.goals};
    let hg=0,ag=0;
    const risk=({Defensiva:-.04,Equilibrada:0,Ofensiva:.05}[game.mentality]);
    const fanBonus=home===game.club?game.support/2500:0;
    const hp=Math.max(.02,Math.min(.5,.16+(strength(game,home)-strength(game,away))/220+.025+fanBonus+(home===game.club?risk:away===game.club?-risk:0)));
    const ap=Math.max(.02,Math.min(.5,.16+(strength(game,away)-strength(game,home))/220+(away===game.club?risk:home===game.club?-risk:0)));
    for (let attack=0;attack<9;attack++) { if (rng()<hp) hg++; if (rng()<ap) ag++; }
    return {round:game.round+1,home,away,hg,ag};
  });
  const own=results.find(match=>match.home===game.club||match.away===game.club)!;
  let next=game;
  if(own.home===game.club)next=book(next,`Bilheteria: ${attendance(game)} pessoas`,attendance(game)*game.ticket);
  const win=own.home===game.club?own.hg>own.ag:own.ag>own.hg;
  const draw=own.hg===own.ag;
  next=book(next,'Cota da rodada',2500);
  next=book(next,'Operação e salários',-Math.min(next.cash,4500));
  const {live: _live,...career}=next;
  return {...career,campaign:settleCampaign(game,live),discipline:updatedDiscipline(game,live),round:game.round+1,results:[...game.results,...results],preparation:[],training:0,fitness:Math.max(40,game.fitness-5),support:Math.min(100,Math.max(10,game.support+(win?3:draw?0:-2)))};
}
export function standings(game: Game) {
  const table=clubs.slice(0,game.leagueSize).map((_,club)=>({club,points:0,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0}));
  for (const match of game.results) {
    const h=table[match.home],a=table[match.away];
    h.played++;a.played++;h.gf+=match.hg;h.ga+=match.ag;a.gf+=match.ag;a.ga+=match.hg;
    if (match.hg===match.ag) {h.points++;a.points++;h.draws++;a.draws++;}
    else {const w=match.hg>match.ag?h:a,l=match.hg>match.ag?a:h;w.points+=3;w.wins++;l.losses++;}
  }
  table.forEach(row=>{row.gd=row.gf-row.ga;});
  return table.sort((a,b)=>b.points-a.points||b.wins-a.wins||b.gd-a.gd||b.gf-a.gf||a.club-b.club);
}

/** Validate unknown storage/imports before touching the current game. */
export function validateSave(value: unknown): Game {
  const fail=(): never=>{throw new Error('Partida inválida ou de uma versão incompatível.');};
  if (!value || typeof value!=='object') return fail();
  const raw=value as Record<string,unknown>;
  const g=(raw.schema===1?{...newGame(),...raw,schema:4,campaign:newCampaign(),club:0,leagueSize:4}:(raw.schema===2||raw.schema===3)?{...raw,schema:4,campaign:newCampaign()}:raw) as unknown as Game;
  if (g.schema!==4 || ![4,12].includes(g.leagueSize) || !Number.isInteger(g.club) || g.club<0 || g.club>=g.leagueSize) return fail();
  if (!Number.isSafeInteger(g.seed) || g.seed<0 || g.seed>0xffffffff || !Number.isInteger(g.round) || g.round<0 || g.round>calendar(g).length) return fail();
  for(const [field,min,max] of [['year',2027,9999],['cash',0,1e10],['support',10,100],['fitness',40,100],['stadium',0,3],['academy',0,3]] as const)if(!Number.isSafeInteger(g[field])||g[field]<min||g[field]>max)return fail();
  if(![10,20,30].includes(g.ticket)||!['home','away'].includes(g.kit)||!Array.isArray(g.preparation)||g.preparation.length>3||new Set(g.preparation).size!==g.preparation.length||g.preparation.some(a=>!['train','rest','fans','scout'].includes(a)))return fail();
  if(g.training!==(g.preparation.includes('train')?3+g.academy:0))return fail();
  if(!Array.isArray(g.recruits)||g.recruits.length>6)return fail();
  for(const [index,p] of g.recruits.entries())if(!p||p.id!==`recruit_${g.club}_${index}`||typeof p.name!=='string'||p.name.length>60||!players.some(base=>base.position===p.position)||!Number.isInteger(p.age)||p.age<16||p.age>45||!Number.isInteger(p.skill)||p.skill<1||p.skill>100||p.condition!==100)return fail();
  if(!Array.isArray(g.ledger)||g.ledger.length>80||g.ledger.some(e=>!e||!Number.isInteger(e.round)||e.round<1||e.round>calendar(g).length||typeof e.label!=='string'||e.label.length>100||!Number.isSafeInteger(e.amount)||Math.abs(e.amount)>1e8))return fail();
  if (!Array.isArray(g.lineup) || g.lineup.length!==11 || new Set(g.lineup).size!==11 || g.lineup.some(id=>!roster(g).some(p=>p.id===id))) return fail();
  const perRound=g.leagueSize/2;
  if (!formations.includes(g.formation) || !mentalities.includes(g.mentality) || !Array.isArray(g.results) || g.results.length!==g.round*perRound) return fail();
  for (let i=0;i<g.results.length;i++) {
    const m=g.results[i],r=Math.floor(i/perRound),pair=calendar(g)[r][i%perRound];
    if (!m || m.round!==r+1 || m.home!==pair[0] || m.away!==pair[1] || !Number.isInteger(m.hg) || !Number.isInteger(m.ag) || m.hg<0 || m.hg>9 || m.ag<0 || m.ag>9) return fail();
  }
  if (!g.hero || !locationIds.includes(g.hero.location) || !Array.isArray(g.hero.actions) || g.hero.actions.length>actions.length || new Set(g.hero.actions).size!==g.hero.actions.length || g.hero.actions.some(a=>!actions.includes(a))) return fail();
  let replay: Hero={location:'apartment',positions:{},actions:[]};
  for (const action of g.hero.actions) {const next=applyAction(replay,action);if (next===replay) return fail();replay=next;}
  if (!g.hero.positions || typeof g.hero.positions!=='object' || Array.isArray(g.hero.positions)) return fail();
  if(g.hero.sceneVersion!==undefined&&g.hero.sceneVersion!==2&&g.hero.sceneVersion!==3)return fail();
  const positions={...g.hero.positions},oldCell=positions.training;
  // Layout migration: preserve career if a formerly valid CT tile now contains the bench/goal.
  if(g.hero.sceneVersion!==3&&Array.isArray(oldCell)&&oldCell.length===2&&oldCell.every(Number.isInteger)&&oldCell[0]>=0&&oldCell[0]<9&&oldCell[1]>=0&&oldCell[1]<7&&!walkable('training',oldCell)){
    const [x,y]=oldCell,wasBlocked=g.hero.sceneVersion===2?((y===0&&x>=1&&x<=3)||(x===0&&y===4)||(x===8&&y>=2&&y<=4)||(x===8&&y===6)||(x===5&&y===0)):((y===1&&x<=2)||(x===1&&y===5)||(x===8&&y===5)||(x===5&&y===2));
    if(!wasBlocked)positions.training=[...rooms.training.spawn];
  }
  for (const [id,cell] of Object.entries(positions)) {
    if (!locationIds.includes(id as Location) || !Array.isArray(cell) || cell.length!==2 || !walkable(id as Location,cell)) return fail();
  }
  if(g.discipline!==undefined){
    if(!g.discipline||typeof g.discipline!=='object'||Array.isArray(g.discipline))return fail();
    for(const [id,d] of Object.entries(g.discipline))if(!roster(g).some(p=>p.id===id)||!d||Object.keys(d).some(k=>!['yellows','ban'].includes(k))||!Number.isInteger(d.yellows)||d.yellows<0||d.yellows>2||!Number.isInteger(d.ban)||d.ban<0||d.ban>1)return fail();
  }
  const campaign=validateCampaign(g.campaign,g);
  const live=g.live===undefined?undefined:validateLive(g.live,g);
  // Reconstruct known fields so extra properties never enter application state.
  return {...(live?{live}:{}),...(g.discipline?{discipline:structuredClone(g.discipline)}:{}),schema:4,campaign,club:g.club,leagueSize:g.leagueSize,year:g.year,cash:g.cash,support:g.support,fitness:g.fitness,training:g.training,preparation:[...g.preparation],stadium:g.stadium,academy:g.academy,ticket:g.ticket,kit:g.kit,recruits:g.recruits.map(p=>({id:p.id,name:p.name,position:p.position,age:p.age,skill:p.skill,condition:p.condition})),ledger:g.ledger.map(e=>({round:e.round,label:e.label,amount:e.amount})),seed:g.seed,lineup:[...g.lineup],formation:g.formation,mentality:g.mentality,round:g.round,results:g.results.map(m=>({round:m.round,home:m.home,away:m.away,hg:m.hg,ag:m.ag})),hero:{location:g.hero.location,actions:[...g.hero.actions],sceneVersion:3,positions:Object.fromEntries(Object.entries(positions).map(([id,cell])=>[id,[...cell]]))}};
}

export function travel(game: Game, location: Location): Game {
  return {...game,hero:{...game.hero,location,positions:{...game.hero.positions,[location]:game.hero.positions[location]??rooms[location].spawn}}};
}
