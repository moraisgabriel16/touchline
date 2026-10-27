import {relationship,interactWithPlayer,socialError,claimObjective,careerObjectives,bestLineup,personality} from '../src/game/campaign.ts';
import {createMatch,advanceMatch,skipPeriod,resumeMatch,substitute,substitutionError,validateLive,updatedDiscipline,teamStrength} from '../src/game/live-match.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, getDialogue, newGame, playRound, progression, standings, swapPlayer, travel, validateSave, prepare, preparationError, upgrade, capacity, attendance, calendar, nextSeason, roster, strength } from '../src/game/domain.ts';
import { clubs, locationIds, rooms } from '../src/game/data.ts';
import type { Cell } from '../src/game/data.ts';
import { approach, center, RoomEngine, route, walkable } from '../src/game/navigation.ts';
import { loadGame, saveGame, SAVE_KEY } from '../src/game/storage.ts';

test('liga tem 132 jogos únicos e 22 rodadas consistentes e determinísticas',()=>{
  let a=newGame(),b=newGame();
  for(let r=0;r<22;r++){a=playRound(a);b=playRound(b);assert.deepEqual(a,b);const last=a.results.slice(-6);assert.equal(new Set(last.flatMap(m=>[m.home,m.away])).size,12);assert.deepEqual(validateSave(a),a);}
  assert.equal(a.results.length,132);assert.equal(new Set(a.results.map(m=>`${m.home}-${m.away}`)).size,132);
  assert.equal(playRound(a),a);
  const table=standings(a);table.forEach(row=>{assert.equal(row.played,22);assert.equal(row.wins+row.draws+row.losses,22);assert.equal(row.points,row.wins*3+row.draws);});
  assert.equal(table.reduce((n,r)=>n+r.gf-r.ga,0),0);assert.equal(table.reduce((n,r)=>n+r.wins-r.losses,0),0);
});
test('tabela respeita pontuação e desempates',()=>{
  const g=newGame();g.results=[{round:1,home:0,away:1,hg:1,ag:1},{round:1,home:2,away:3,hg:3,ag:0}];
  const table=standings(g);assert.deepEqual(table.filter(r=>r.played).map(r=>r.club),[2,0,1,3]);assert.equal(table[0].gd,3);
});
test('troca mantém 11 titulares únicos e recusa ID inválido',()=>{
  const g=newGame();assert.equal(swapPlayer(g,'g01','d01'),g);assert.equal(swapPlayer(g,'not-found','g02'),g);
  const changed=swapPlayer(g,'g01','g02');assert.equal(changed.lineup.length,11);assert.equal(new Set(changed.lineup).size,11);assert.ok(changed.lineup.includes('g02'));assert.ok(!changed.lineup.includes('g01'));
});
test('RPG permite adiar e observar antes do aceite, com recompensas únicas',()=>{
  let hero=newGame().hero;assert.equal(applyAction(hero,'deliver_report'),hero);
  hero=applyAction(hero,'read_notebook');hero=applyAction(hero,'observe_davi');assert.equal(progression(hero).xp,50);
  assert.equal(applyAction(hero,'deliver_report'),hero);hero=applyAction(hero,'accept_task');
  assert.equal(getDialogue(hero,'helena').choices[0].action,'deliver_report');hero=applyAction(hero,'deliver_report');
  assert.deepEqual(progression(hero),{xp:100,analysis:3,communication:2,trust:1});
  assert.equal(applyAction(hero,'deliver_report'),hero);
});
test('todos os alvos têm rota de aproximação sem obstáculos ou corte de cantos',()=>{
  for(const id of locationIds){
    const room=rooms[id];assert.ok(walkable(id,room.spawn));assert.deepEqual(route(id,room.spawn,[-1,0]),[]);
    for(const target of [...room.props.filter(p=>p.label),...room.npcs]){
      assert.equal(walkable(id,target.cell),false);const path=approach(id,room.spawn,target.cell);assert.ok(path.length,target.id);
      path.forEach((cell,index)=>{assert.ok(walkable(id,cell));if(index){const prev=path[index-1];assert.equal(Math.abs(cell[0]-prev[0])+Math.abs(cell[1]-prev[1]),1);}});
    }
  }
});
test('nova ordem durante movimento não teleporta e porta só dispara ao chegar',()=>{
  const e=new RoomEngine('apartment',rooms.apartment.spawn),door=rooms.apartment.props.find(p=>p.destination)!;
  e.orderCell([3,5]);e.tick(.02);e.tick(.02);const before=[...e.position];e.orderTarget(door);assert.deepEqual(e.position,before);
  const events=[];for(let i=0;i<2000&&e.path.length;i++) events.push(...e.tick(.02));
  assert.ok(events.some(event=>event.type==='travel'&&event.location==='office'));assert.ok(!e.path.length);
  assert.ok(Math.hypot(e.position[0]-center(door.cell)[0],e.position[1]-center(door.cell)[1])<37);
});
test('save round-trip mantém liga, RPG e posição segura',()=>{
  let g=travel(playRound(newGame()),'office');g.hero.actions=['read_notebook','accept_task'];g.hero.positions.office=[7,5];
  assert.deepEqual(validateSave(JSON.parse(JSON.stringify(g))),g);
});
test('importação rejeita dados incompatíveis, adulterados e recompensas fora de ordem',()=>{
  const samples:unknown[]=[null,{},[],{...newGame(),schema:99},{...newGame(),cash:-1},{...newGame(),club:12},{...newGame(),recruits:[{}]},{...newGame(),training:99},{...newGame(),lineup:Array(11).fill('g01')},{...newGame(),round:1},{...newGame(),hero:{...newGame().hero,actions:['deliver_report']}},{...newGame(),hero:{...newGame().hero,positions:{apartment:[1,2] as Cell}}}];
  for(const sample of samples) assert.throws(()=>validateSave(sample));
  const g=playRound(newGame());g.results[0].hg=-1;assert.throws(()=>validateSave(g));
});

test('os 12 clubes têm elencos distintos e só aceitam seus próprios atletas',()=>{
  const ids=new Set<string>();
  for(let club=0;club<clubs.length;club++){
    const g=newGame(club),squad=roster(g);assert.equal(squad.length,18);assert.equal(g.lineup.length,11);assert.deepEqual(validateSave(g),g);
    squad.forEach(p=>{assert.ok(!ids.has(p.id));ids.add(p.id);});
    assert.equal(swapPlayer(g,g.lineup[0],roster(newGame((club+1)%12))[17].id),g);
    assert.ok(swapPlayer(g,g.lineup[0],squad[17].id).lineup.includes(squad[17].id));
  }
  assert.equal(ids.size,216);
});

test('preparação limita ações, evita repetições e afeta força, condição e apoio',()=>{
  const initial=newGame();let g=prepare(initial,'train');assert.equal(g.training,3);assert.equal(g.fitness,88);assert.ok(strength(g,g.club)>strength(initial,initial.club));assert.equal(prepare(g,'train'),g);
  g=prepare(g,'rest');assert.equal(g.fitness,100);g=prepare(g,'fans');assert.equal(g.cash,17000);assert.equal(g.support,55);assert.equal(g.preparation.length,3);assert.equal(prepare(g,'scout'),g);assert.ok(preparationError(g,'scout'));
  g=playRound(g);assert.deepEqual(g.preparation,[]);assert.equal(g.training,0);assert.equal(g.fitness,95);assert.deepEqual(validateSave(g),g);
  assert.equal(prepare({...initial,fitness:50},'train').training,0);
});

test('várzea contrata reservas escaláveis com limite e IDs persistentes',()=>{
  let g=newGame(11);g=prepare(g,'scout');assert.equal(roster(g).length,19);assert.equal(g.cash,16500);
  const recruit=g.recruits[0];assert.equal(recruit.id,'recruit_11_0');g=swapPlayer(g,g.lineup[10],recruit.id);assert.ok(g.lineup.includes(recruit.id));assert.deepEqual(validateSave(g),g);
  assert.equal(prepare(g,'scout'),g);
  for(let i=1;i<6;i++)g=prepare(playRound(g),'scout');
  assert.equal(g.recruits.length,6);g=playRound(g);assert.equal(prepare(g,'scout'),g);
});

test('instalações cobram o preço, respeitam saldo e melhoram capacidade e treino',()=>{
  let g=upgrade(newGame(),'stadium');assert.equal(g.cash,10000);assert.equal(capacity(g),4500);assert.equal(upgrade(g,'stadium'),g);
  g=prepare(g,'train');g=upgrade(g,'academy');assert.equal(g.cash,4000);assert.equal(g.training,4);assert.equal(g.academy,1);assert.deepEqual(validateSave(g),g);
  assert.ok(attendance({...g,ticket:10})>attendance({...g,ticket:30}));
});

test('rodada contabiliza bilheteria só em casa, cota e operação sem caixa negativo',()=>{
  let g=newGame();const expected=g.cash+attendance(g)*g.ticket+2500-4500;g=playRound(g);assert.equal(g.cash,expected);assert.equal(g.ledger.length,3);
  const awayClub=calendar(newGame())[0][0][1],away=playRound({...newGame(awayClub),cash:0});assert.equal(away.cash,0);assert.equal(away.ledger.length,2);assert.equal(away.ledger.some(e=>e.label.startsWith('Bilheteria')),false);
});

test('save antigo migra preservando seis rodadas e próxima temporada amplia a liga',()=>{
  let legacy={...newGame(),leagueSize:4 as const};legacy=playRound(legacy);
  const raw={schema:1,seed:legacy.seed,lineup:legacy.lineup,formation:legacy.formation,mentality:legacy.mentality,round:legacy.round,results:legacy.results,hero:legacy.hero};
  let migrated=validateSave(raw);assert.equal(migrated.leagueSize,4);assert.equal(migrated.round,1);assert.deepEqual(migrated.results,legacy.results);assert.equal(calendar(migrated).length,6);
  assert.equal(nextSeason(migrated),migrated);
  while(migrated.round<6)migrated=playRound(migrated);
  migrated=prepare(migrated,'fans');const next=nextSeason(migrated);assert.equal(next.year,2028);assert.equal(next.round,0);assert.equal(next.leagueSize,12);assert.equal(next.cash,migrated.cash);assert.equal(next.support,migrated.support);assert.deepEqual(validateSave(next),next);
});
test('navegação direta preserva dados da carreira e posição anterior',()=>{
  const g=newGame();g.hero.actions=['read_notebook'];g.hero.positions.apartment=[4,5];const next=travel(g,'office');
  assert.equal(progression(next.hero).xp,20);assert.deepEqual(next.hero.positions.apartment,[4,5]);assert.equal(next.hero.location,'office');
});

test('CT novo realoca posições antigas ocupadas sem perder carreira e rejeita posições inválidas novas',()=>{
  const g=playRound(newGame());g.hero.location='training';g.hero.actions=['read_notebook'];g.hero.positions.training=[2,0];delete g.hero.sceneVersion;
  const migrated=validateSave(g);assert.deepEqual(migrated.hero.positions.training,rooms.training.spawn);assert.equal(migrated.round,1);assert.equal(migrated.cash,g.cash);assert.deepEqual(migrated.hero.actions,g.hero.actions);
  const priorLayout={...g,hero:{...g.hero,sceneVersion:2 as const,positions:{training:[6,0] as Cell}}};assert.deepEqual(validateSave(priorLayout).hero.positions.training,rooms.training.spawn);assert.equal(validateSave(priorLayout).hero.sceneVersion,3);
  assert.throws(()=>validateSave({...g,hero:{...g.hero,sceneVersion:2}}));
  assert.throws(()=>validateSave({...g,hero:{...g.hero,positions:{training:[5,2.5]}}}));
});
test('salvamento automático carrega e protege save incompatível com cópia de recuperação',()=>{
  const data=new Map<string,string>();const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
  const g=playRound(newGame());saveGame(storage,g);assert.deepEqual(loadGame(storage).game,g);
  data.set(SAVE_KEY,'{corrompido');const recovered=loadGame(storage);assert.ok(recovered.notice);assert.equal(data.get(`${SAVE_KEY}.recovery`),'{corrompido');assert.equal(recovered.game.round,0);
});
test('armazenamento bloqueado ou sem espaço não apaga partida anterior',()=>{
  const storage={getItem:()=>'{corrompido',setItem:()=>{throw new Error('QuotaExceeded');}};
  assert.ok(loadGame(storage).blocked);assert.throws(()=>saveGame(storage,newGame()));
});

test('partida para no intervalo, troca até cinco sem retorno e salva cada fase',()=>{
  const g=newGame();let m=createMatch(g);assert.deepEqual(validateSave({...g,live:m}).live,m);
  assert.equal(substitute(m,g.club,m.home.active[0],m.home.players[11].id),m);
  m=skipPeriod(m,g.club,g.mentality);assert.equal(m.phase,'halftime');assert.equal(m.minute,45);
  assert.deepEqual(validateSave({...g,live:m}).live,m);
  const own=m.home;const reserve=own.players.filter(p=>!own.used.includes(p.id)&&p.position!=='GOL');
  for(let i=0;i<5;i++){const out=m.home.active.filter(id=>m.home.players.find(p=>p.id===id)?.position!=='GOL')[i];m=substitute(m,g.club,out,reserve[i].id);}
  assert.equal(m.changes.length,5);assert.ok(substitutionError(m,g.club,m.home.active[1],m.changes[0].out));
  assert.deepEqual(validateLive(m,g),m);m=resumeMatch(m,g.club);assert.equal(m.phase,'second');
  m=skipPeriod(m,g.club,g.mentality);assert.equal(m.phase,'full');assert.equal(m.minute,90);
  assert.deepEqual(validateSave({...g,live:m}).live,m);
  const finished=playRound({...g,live:m},m);assert.equal(finished.round,1);assert.equal(finished.live,undefined);
  const score=finished.results.find(r=>r.home===g.club||r.away===g.club)!;assert.equal(score.hg,m.home.goals);assert.equal(score.ag,m.away.goals);
});
test('pular e acompanhar geram os mesmos lances, placar e cartões',()=>{
  const g=newGame(7);let a=createMatch(g),b=createMatch(g);
  for(let i=0;i<45;i++)a=advanceMatch(a,g.club,g.mentality);
  b=skipPeriod(b,g.club,g.mentality);assert.deepEqual(a,b);a=resumeMatch(a,g.club);b=resumeMatch(b,g.club);
  for(let i=0;i<45;i++)a=advanceMatch(a,g.club,g.mentality);
  b=skipPeriod(b,g.club,g.mentality);assert.deepEqual(a,b);
  assert.equal(a.events.filter(e=>e.kind==='goal'&&e.team===a.home.club).length,a.home.goals);
  assert.equal(a.events.filter(e=>e.kind==='goal'&&e.team===a.away.club).length,a.away.goals);
  for(const t of [a.home,a.away]){assert.equal(t.active.length,11-t.sentOff.length);assert.equal(new Set(t.used).size,t.used.length);assert.ok(t.shots>=t.goals);}
});
test('disciplina suspende por uma rodada, impede entrada e reseta na nova temporada',()=>{
  const g=newGame();g.discipline={g01:{yellows:0,ban:1},d01:{yellows:2,ban:0}};
  const m=createMatch(g);assert.ok(!m.home.active.includes('g01'));assert.ok(m.home.active.includes('g02'));
  const half=skipPeriod(m,g.club,g.mentality);assert.ok(substitutionError(half,g.club,half.home.active[0],'g01'));
  m.home.yellow={d01:1};m.home.sentOff=['d02'];const d=updatedDiscipline(g,m);
  assert.equal(d.g01.ban,0);assert.equal(d.d01.ban,1);assert.equal(d.d01.yellows,0);assert.equal(d.d02.ban,1);
  let end=newGame();while(end.round<22)end=playRound(end);assert.deepEqual(nextSeason(end).discipline,{});
});
test('save de partida rejeita placar, cartão e troca adulterados',()=>{
  const g=newGame(),m=skipPeriod(createMatch(g),g.club,g.mentality);
  const changed=structuredClone(m);changed.home.goals++;assert.throws(()=>validateSave({...g,live:changed}));
  assert.throws(()=>validateSave({...g,discipline:{unknown:{yellows:0,ban:1}}}));
  const bad=structuredClone(m);bad.changes=[{out:'not-found',in:'g02'}];assert.throws(()=>validateLive(bad,g));
  const red=structuredClone(m);red.home.sentOff.push(red.home.active[0]);assert.throws(()=>validateLive(red,g));
});
test('expulsão reduz força e troca usa os atributos do reserva',()=>{
  const g=newGame(),m=createMatch(g),before=teamStrength(m.home);m.home.active.pop();assert.ok(teamStrength(m.home)<before);
  let half=skipPeriod(createMatch(g),g.club,g.mentality);const reserve=half.home.players.find(p=>!half.home.used.includes(p.id)&&p.position!=='GOL')!;
  const out=half.home.active.find(id=>half.home.players.find(p=>p.id===id)?.position!=='GOL')!,old=teamStrength(half.home),oldSkill=half.home.players.find(p=>p.id===out)!.skill;
  half=substitute(half,g.club,out,reserve.id);assert.ok(Math.abs(teamStrength(half.home)-old-(reserve.skill-oldSkill)/11)<1e-8);
});

test('schema 2 migra sem recalcular resultados e aceita JSON com propriedades reordenadas',()=>{
  const previous=playRound(newGame()),old={...previous,schema:2};
  const migrated=validateSave(old);assert.equal(migrated.schema,4);assert.deepEqual(migrated.results,previous.results);
  const g=newGame(),m=skipPeriod(createMatch(g),g.club,g.mentality);
  const sorted=JSON.parse(JSON.stringify(m,(_k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>b.localeCompare(a))):v));
  assert.deepEqual(validateLive(sorted,g),m);
});

test('conversas têm orçamento, são privadas e não repetem ganhos',()=>{
  let g=newGame();g=interactWithPlayer(g,'m04','listen');const r=relationship(g,'m04');
  assert.equal(r.heard,true);assert.equal(r.trust,51);assert.equal(relationship(g,'g01').trust,50);
  assert.equal(interactWithPlayer(g,'m04','listen'),g);assert.equal(interactWithPlayer(g,'unknown','listen'),g);
  g=interactWithPlayer(g,'g01','listen');g=interactWithPlayer(g,'d01','listen');assert.ok(socialError(g,'d02','listen'));
  assert.equal(Object.keys(g.campaign.relations).length,3);assert.deepEqual(validateSave(JSON.parse(JSON.stringify(g))),g);
  g=playRound(g);const before=relationship(g,'m04').trust;g=interactWithPlayer(g,'m04','listen');assert.equal(relationship(g,'m04').trust,before);
  assert.deepEqual(personality('m04'),personality('m04'));
});
test('promessa exige escuta e treino, entrega é única e quebra tem reparação',()=>{
  let g=newGame();assert.ok(socialError(g,'m04','promise'));g=interactWithPlayer(g,'m04','listen');g=playRound(g);
  g=interactWithPlayer(g,'m04','promise');assert.equal(relationship(g,'m04').promise?.status,'active');
  assert.equal(interactWithPlayer(g,'m04','deliver'),g);g=prepare(g,'train');g=interactWithPlayer(g,'m04','deliver');
  assert.equal(relationship(g,'m04').trust,55);assert.equal(relationship(g,'m04').fulfilled,1);assert.equal(interactWithPlayer(g,'m04','deliver'),g);
  g=playRound(g);assert.equal(relationship(g,'m04').promise?.status,'fulfilled');assert.ok(socialError(g,'m04','promise'));
  for(let i=0;i<3;i++)g=playRound(g);g=interactWithPlayer(g,'m04','promise');const trust=relationship(g,'m04').trust;g=playRound(g);
  assert.equal(relationship(g,'m04').promise?.status,'broken');assert.equal(relationship(g,'m04').trust,trust-8);
  g=interactWithPlayer(g,'m04','repair');assert.equal(relationship(g,'m04').promise?.status,'repairing');assert.equal(relationship(g,'m04').trust,trust-8);
  assert.equal(careerObjectives(g).find(o=>o.id==='reliable')?.current,1);
});
test('feedback exige observação real e permanece único após memórias antigas expirarem',()=>{
  let g=newGame();assert.ok(socialError(g,'m04','feedback'));g.hero=applyAction(g.hero,'observe_davi');
  g=interactWithPlayer(g,'m04','feedback');assert.equal(relationship(g,'m04').respect,52);
  for(let i=0;i<14;i++){g=playRound(g);g=interactWithPlayer(g,'m04','listen');}
  assert.ok(!relationship(g,'m04').memories.some(m=>m.id.endsWith(':feedback')));
  g=playRound(g);assert.ok(socialError(g,'m04','feedback'));assert.equal(relationship(g,'m04').respect,52);
});
test('recompensa é explícita, única, preservada por save e social não altera força',()=>{
  let g=newGame();const force=strength(g,g.club);g=interactWithPlayer(g,'m04','listen');assert.equal(strength(g,g.club),force);
  assert.equal(claimObjective(g,'2027:first_win'),g);while(!careerObjectives(g)[0].current&&g.round<22)g=playRound(g);
  assert.equal(careerObjectives(g)[0].current,1);const cash=g.cash;g=claimObjective(g,'2027:first_win');assert.equal(g.cash,cash+1500);assert.equal(g.campaign.xp,30);
  assert.equal(claimObjective(g,'2027:first_win'),g);g=validateSave(JSON.parse(JSON.stringify(g)));assert.equal(claimObjective(g,'2027:first_win'),g);
});
test('súmulas, participantes e gols reais persistem; suspenso não recebe participação',()=>{
  let g=newGame();g.discipline={g01:{yellows:0,ban:1}};const m=skipPeriod(resumeMatch(skipPeriod(createMatch(g),g.club,g.mentality),g.club),g.club,g.mentality);
  g=playRound(g,m);assert.equal(g.campaign.records.g01,undefined);assert.equal(g.campaign.records.g02.apps,1);
  assert.equal(g.campaign.reports[0].hg,m.home.goals);assert.equal(Object.values(g.campaign.records).reduce((n,r)=>n+r.goals,0),m.events.filter(e=>e.team===g.club&&e.kind==='goal').length);
  while(g.round<22)g=playRound(g);const records=structuredClone(g.campaign.records),relations=structuredClone(g.campaign.relations);g=nextSeason(g);
  assert.equal(g.campaign.seasons.length,1);assert.equal(g.campaign.seasons[0].year,2027);assert.deepEqual(g.campaign.records,records);assert.deepEqual(g.campaign.relations,relations);
  assert.deepEqual(validateSave(g),g);
});
test('migração de schema 3 preserva jogo em andamento e valida os campos novos',()=>{
  const fresh=newGame(),live=skipPeriod(createMatch(fresh),fresh.club,fresh.mentality);const {campaign,...old}=fresh;void campaign;
  const g=validateSave({...old,schema:3,live});assert.deepEqual(g.live,live);assert.equal(g.campaign.reports.length,0);
  assert.throws(()=>validateSave({...g,campaign:null}));const bad=interactWithPlayer(g.live?{...g,live:undefined}:g,'m04','listen');
  bad.campaign.relations.m04.trust=101;assert.throws(()=>validateSave(bad));
  assert.throws(()=>validateSave({...g,campaign:{...g.campaign,records:{intruder:{apps:1,starts:1,goals:0}}}}));
});
test('escalação automática respeita disponibilidade e composição e não muda partida ativa',()=>{
  let g=newGame();g.discipline={g01:{yellows:0,ban:1},d02:{yellows:0,ban:1}};g=bestLineup(g);
  assert.equal(new Set(g.lineup).size,11);assert.ok(!g.lineup.includes('g01'));assert.ok(!g.lineup.includes('d02'));assert.ok(g.lineup.includes('g02'));
  assert.equal(g.lineup.filter(id=>roster(g).find(p=>p.id===id)?.position==='GOL').length,1);g={...g,live:createMatch(g)};
  assert.equal(bestLineup(g),g);assert.equal(prepare(g,'train'),g);assert.equal(upgrade(g,'academy'),g);assert.equal(interactWithPlayer(g,'m04','listen'),g);
});

import {trade,tradeError,offers,fee,wage,payroll,setFocus,management,marketPool,emptyManagement,potential,allOwned} from '../src/game/management.ts';
test('mercado cobra taxa, integra reforço à partida e rejeita duplicação e janela fechada',()=>{
 let g=newGame();const p=offers(g).find(p=>p.position==='ZAG')!,cash=g.cash;
 g=trade(g,p.id,'buy');assert.equal(g.cash,cash-fee(p));assert.equal(roster(g).length,19);assert.equal(payroll(g),3600+wage(p));assert.equal(trade(g,p.id,'buy'),g);
 g=swapPlayer(g,'d01',p.id);const live=createMatch(g);assert.ok(live.home.initial.includes(p.id));assert.deepEqual(validateSave({...g,live}).live,live);
 assert.equal(trade({...g,live},'market_2','buy').cash,g.cash);
 for(let i=0;i<4;i++)g=playRound(g);assert.match(tradeError(g,'market_2','buy'),/Janela/);assert.deepEqual(validateSave(g),g);
});
test('venda preserva história, impede titular e goleiro indispensável, não permite recompra',()=>{
 let g=newGame(),id='d05';g=interactWithPlayer(g,id,'listen');const before=g.campaign.relations[id];const cash=g.cash;
 assert.ok(tradeError(g,g.lineup[0],'sell'));assert.ok(tradeError(g,'g02','sell'));
 g=trade(g,id,'sell');assert.ok(g.cash>cash);assert.equal(roster(g).length,17);assert.deepEqual(g.campaign.relations[id],before);assert.equal(trade(g,id,'sell'),g);assert.deepEqual(validateSave(g),g);
 const candidate=offers(g).find(p=>p.position==='ZAG')!;g=trade(g,candidate.id,'buy');g=trade(g,candidate.id,'sell');assert.ok(!offers(g).some(p=>p.id===candidate.id));assert.deepEqual(validateSave(g),g);
});
test('venda exige cumprir promessa e preserva mínimo do elenco',()=>{
 let g=interactWithPlayer(newGame(),'d05','listen');g=playRound(g);g=interactWithPlayer(g,'d05','promise');assert.match(tradeError(g,'d05','sell'),/compromisso/);
 g=trade(g,'d06','sell');g=trade(g,'m06','sell');assert.equal(roster(g).length,16);assert.match(tradeError(g,'a04','sell'),/16/);
});
test('folha produz dívida explícita e próxima renda quita; contratação respeita caixa',()=>{
 const awayClub=calendar(newGame())[0][0][1];let g=playRound({...newGame(awayClub),cash:0});assert.equal(g.cash,0);assert.equal(management(g).debt,2000);assert.match(tradeError(g,offers(g)[0].id,'buy'),/pendentes/);
 g={...g,cash:10000};const due=management(g).debt;g=playRound(g);assert.equal(management(g).debt,0);assert.ok(due>0);assert.deepEqual(validateSave(g),g);
 assert.match(tradeError({...newGame(),cash:0},'market_1','buy'),/Reserve/);
});
test('foco evolui com treino e minutos, aplica força real e respeita potencial',()=>{
 let g=setFocus(newGame(),'m04');const base=roster(g).find(p=>p.id==='m04')!;
 for(let i=0;i<2;i++)g=playRound(prepare(g,'train'));
 assert.equal(management(g).growth.m04,100);assert.equal(roster(g).find(p=>p.id==='m04')!.skill,base.skill+1);assert.deepEqual(validateSave(g),g);
 const live=createMatch(g);assert.equal(setFocus({...g,live},'d01').management?.focus,'m04');assert.equal(live.home.players.find(p=>p.id==='m04')?.skill??live.away.players.find(p=>p.id==='m04')!.skill,base.skill+1);
 g={...g,management:{...management(g),growth:{m04:(potential(base)-base.skill)*100}}};g=playRound(prepare(g,'train'));assert.equal(roster(g).find(p=>p.id==='m04')!.skill,potential(base));
});
test('save antigo sem gestão preserva jogo; dados financeiros e posse adulterados são rejeitados',()=>{
 const g=newGame(),live=createMatch(g);assert.deepEqual(validateSave({...g,live}).live,live);
 for(const m of [{...emptyManagement(),bought:['market_99']},{...emptyManagement(),bought:['market_1','market_1']},{...emptyManagement(),sold:['missing']},{...emptyManagement(),growth:{m04:90000}},{...emptyManagement(),debt:-1},{...emptyManagement(),focus:'missing'}])assert.throws(()=>validateSave({...g,management:m}));
});
test('premiação de temporada é única e troféu fica no histórico',()=>{
 let g=newGame();for(let i=0;i<22;i++)g=playRound(g);assert.equal(g.ledger.filter(e=>e.label.startsWith('Premiação da liga')).length,1);assert.equal(playRound(g),g);const cash=g.cash;const next=nextSeason(g);assert.equal(next.cash,cash);assert.equal(next.campaign.seasons.length,1);assert.deepEqual(validateSave(next),next);
});
test('mercado e várzea compartilham limite de 24 atletas e três goleiros',()=>{
 let g={...newGame(),cash:1000000};g=trade(g,'market_0','buy');assert.equal(roster(g).filter(p=>p.position==='GOL').length,3);assert.match(preparationError(g,'scout'),/goleiros/);
 for(const p of offers(g).filter(p=>p.position!=='GOL').slice(0,5))g=trade(g,p.id,'buy');assert.equal(roster(g).length,24);assert.match(preparationError(g,'scout'),/24/);assert.ok(tradeError(g,offers(g)[0].id,'buy'));assert.deepEqual(validateSave(g),g);
});

import {listSlots,createSlot,removeSlot,restoreSlot,writeSlot,slotKey,checkpoint,cleanName,validName} from '../src/game/slots.ts';
function memorySlots(){const data=new Map<string,string>();return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};}
test('slots preservam save legado e isolam três carreiras com nomes',()=>{
 const s=memorySlots(),old=playRound(newGame());s.setItem(SAVE_KEY,JSON.stringify(old));createSlot(s,1,{...newGame(2),managerName:'Ana Lima'});createSlot(s,2,{...newGame(3),managerName:'José Silva'});
 const slots=listSlots(s);assert.equal(slots.length,3);assert.deepEqual(slots[0].game,old);assert.equal(slots[1].game?.managerName,'Ana Lima');assert.throws(()=>createSlot(s,1,newGame()));assert.equal(s.getItem(SAVE_KEY),JSON.stringify(old));assert.throws(()=>slotKey(3));
});
test('liberar slot cria backup restaurável e nunca sobrescreve carreira ocupada',()=>{
 const s=memorySlots(),g={...newGame(),managerName:'Marina'};createSlot(s,0,g);removeSlot(s,0);assert.equal(listSlots(s)[0].occupied,false);assert.deepEqual(restoreSlot(s,0),g);assert.throws(()=>restoreSlot(s,0));
 checkpoint(s,0);writeSlot(s,0,playRound(g));assert.equal(JSON.parse(s.getItem(`${SAVE_KEY}.backup`)!).round,0);assert.equal(listSlots(s)[0].game?.round,1);
});
test('falha ao criar backup impede remoção de save; slots corrompidos ficam isolados',()=>{
 const s=memorySlots();createSlot(s,0,newGame());const raw=s.getItem(SAVE_KEY);assert.throws(()=>removeSlot({...s,setItem:()=>{throw new Error('quota');}},0));assert.equal(s.getItem(SAVE_KEY),raw);
 s.setItem(slotKey(1),'{inválido');assert.equal(listSlots(s)[1].corrupt,true);assert.equal(listSlots(s)[1].occupied,true);assert.equal(listSlots(s)[0].game?.round,0);assert.throws(()=>createSlot(s,1,newGame()));
});
test('nome normalizado persiste em exportação e partida ativa; nomes inválidos são rejeitados',()=>{
 assert.equal(cleanName('  Ana   Maria  '),'Ana Maria');assert.ok(validName('João Silva'));assert.ok(!validName(' '));assert.ok(!validName('A'));assert.ok(!validName('x'.repeat(33)));
 const g={...newGame(),managerName:'João Silva'},live=createMatch(g),s=memorySlots();createSlot(s,2,{...g,live});assert.deepEqual(listSlots(s)[2].game,{...g,live});
 for(const managerName of ['', ' a ', 'x'.repeat(33),'<\u0000>'])assert.throws(()=>validateSave({...g,managerName}));
});

import {broadcastFrame,lastShotReplay} from '../src/game/broadcast.ts';
test('transmissão usa autor real, domínio vinculado e resultado registrado sem alterar simulação',()=>{
 const g=newGame();let m=createMatch(g);while(m.minute<90&&!m.events.some(e=>e.minute===m.minute&&e.kind==='goal')){if(m.phase==='halftime')m=resumeMatch(m,g.club);m=advanceMatch(m,g.club,g.mentality);}
 const before=JSON.stringify(m),shot=m.events.find(e=>e.minute===m.minute&&e.kind==='shot');assert.ok(shot);const frame=broadcastFrame(m,.5,g.formation,g.club,true);assert.equal(frame.shooter,shot.player);assert.equal(frame.carrier,shot.player);assert.deepEqual(frame.ball,frame.actors.find(a=>a.id===shot.player)!.point);
 const end=broadcastFrame(m,1,g.formation,g.club,true);assert.equal(end.outcome,'goal');assert.ok(end.actors.some(a=>a.action==='celebrate'));assert.equal(JSON.stringify(m),before);
});
test('defesa intercepta antes da linha, expulsos ausentes e segundo tempo inverte campo',()=>{
 const g=newGame();let m=createMatch(g);while(m.phase==='first'&&!m.events.some(e=>e.minute===m.minute&&e.kind==='save'))m=advanceMatch(m,g.club,g.mentality);
 const frame=broadcastFrame(m,1,g.formation,g.club,true);assert.equal(frame.outcome,'save');assert.ok(frame.ball[0]>0&&frame.ball[0]<1);assert.ok(frame.actors.some(a=>a.id===frame.carrier));
 const original=broadcastFrame(createMatch(g),0);const second=broadcastFrame({...createMatch(g),minute:46,phase:'second'},0);const keeper=original.actors.find(a=>a.keeper&&a.club===g.club)!;assert.equal(second.actors.find(a=>a.id===keeper.id)!.point[0],1-keeper.point[0]);
 const sent=m.home.active[2];const reduced={...m,home:{...m.home,active:m.home.active.filter(id=>id!==sent),sentOff:[sent]}};assert.ok(!broadcastFrame(reduced,.5).actors.some(a=>a.id===sent));
});
test('replay reconstitui escalação após troca e não modifica o save nem o placar',()=>{
 let g=newGame(),m=skipPeriod(createMatch(g),g.club,g.mentality);m=substitute(m,g.club,'d01','d05');m=resumeMatch(m,g.club);m=skipPeriod(m,g.club,g.mentality);g={...g,live:m};const raw=JSON.stringify(g),replay=lastShotReplay(g)!;assert.ok(replay.minute>45);assert.ok((replay.home.club===g.club?replay.home:replay.away).active.includes('d05'));assert.equal(JSON.stringify(g),raw);assert.equal(lastShotReplay(newGame()),null);
 for(const progress of [0,.2,.5,.7,1]){const frame=broadcastFrame(replay,progress,g.formation,g.club,true);assert.ok([...frame.ball,...frame.actors.flatMap(a=>a.point)].every(Number.isFinite));assert.equal(new Set(frame.actors.map(a=>a.id)).size,frame.actors.length);}
});

import {shotReplay,replayClips} from '../src/game/broadcast.ts';
test('galeria seleciona apenas finalizações existentes e reconstrói lances antigos sem trocar o placar atual',()=>{
 let g=newGame(),m=skipPeriod(createMatch(g),g.club,g.mentality);m=substitute(m,g.club,'d01','d05');m=skipPeriod(resumeMatch(m,g.club),g.club,g.mentality);g={...g,live:m};const clips=replayClips(m);assert.ok(clips.length>2);assert.equal(new Set(clips.map(c=>c.minute)).size,clips.length);
 const first=shotReplay(g,clips[0].minute)!;assert.ok(first.home.initial.includes('d01'));assert.ok(!first.home.active.includes('d05'));assert.equal(first.minute,clips[0].minute);assert.equal(shotReplay(g,-1),null);assert.equal(shotReplay(g,91),null);assert.equal(shotReplay(g,.5),null);assert.equal(shotReplay(newGame(),1),null);
 const before=JSON.stringify(g);for(const clip of clips){const snapshot=shotReplay(g,clip.minute)!;assert.equal(snapshot.minute,clip.minute);assert.ok(snapshot.events.some(e=>e.kind==='shot'&&e.minute===clip.minute));assert.ok(['Gol','Defesa / corte','Finalização'].includes(clip.outcome));}assert.equal(JSON.stringify(g),before);
});
import {sessionBriefing} from '../src/game/session.ts';
test('agenda preserva o save, identifica o adversário e prioriza compromissos',()=>{
 let g=newGame();const before=JSON.stringify(g),b=sessionBriefing(g);
 assert.equal(b.opponent,calendar(g)[0].find(p=>p.includes(g.club))!.find(id=>id!==g.club));
 assert.equal(JSON.stringify(g),before);assert.equal(b.ended,false);
 g=interactWithPlayer(g,'m04','listen');g=playRound(g);g=interactWithPlayer(g,'m04','promise');
 assert.equal(sessionBriefing(g).contact.id,'m04');assert.equal(sessionBriefing(g).pending.length,1);
 g=prepare(g,'train');g=interactWithPlayer(g,'m04','deliver');assert.equal(sessionBriefing(g).pending.length,0);
 while(g.round<22)g=playRound(g);assert.equal(sessionBriefing(g).ended,true);assert.equal(sessionBriefing(g).opponent,undefined);
});
test('novos marcos sobrevivem ao save sem duplicação e renovam na temporada seguinte',()=>{
 let g=newGame();assert.equal(claimObjective(g,'2027:finish_season'),g);
 while(g.round<22)g=playRound(g);
 const cash=g.cash,xp=g.campaign.xp;g=claimObjective(g,'2027:finish_season');
 assert.equal(g.cash,cash+2000);assert.equal(g.campaign.xp,xp+100);
 g=validateSave(JSON.parse(JSON.stringify(g)));assert.equal(claimObjective(g,'2027:finish_season'),g);
 for(const id of ['five_wins','twenty_points']){const o=careerObjectives(g).find(o=>o.id===id)!;if(o.current===o.target){g=claimObjective(g,o.key);assert.equal(claimObjective(g,o.key),g);assert.deepEqual(validateSave(g),g);}}
 g=nextSeason(g);const fresh=careerObjectives(g).find(o=>o.id==='finish_season')!;assert.equal(fresh.claimed,false);assert.equal(fresh.current,0);assert.equal(fresh.key,'2028:finish_season');
 assert.deepEqual(validateSave(g),g);
});
