import {StartScreen} from './ui/StartScreen.tsx';
import {ACTIVE_SLOT,PLAYING_KEY,activeSlot,slotKey,writeSlot,checkpoint} from './game/slots.ts';
import {SAVE_KEY} from './game/storage.ts';
import './ui/start.css';
import {ManagerDesk} from './football/ManagerDesk.tsx';
import {trade,setFocus} from './game/management.ts';
import {Toast} from './ui/Toast.tsx';
import {CareerHub} from './career/CareerHub.tsx';
import {PlayerDossier} from './career/PlayerDossier.tsx';
import {claimObjective,interactWithPlayer,bestLineup,careerObjectives} from './game/campaign.ts';
import {usePreferences} from './ui/preferences.ts';
import './career/career.css';
import { MatchView } from './football/MatchView.tsx';
import { createMatch } from './game/live-match.ts';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { clubs, formations, mentalities, rooms, locationIds } from './game/data.ts';
import type { Cell, Location, Target } from './game/data.ts';
import { applyAction, getDialogue, journal, newGame, objective, playRound, playerById, progression, standings, strength, swapPlayer, travel, validateSave, calendar, roster, prepare, preparationError, upgrade, nextSeason } from './game/domain.ts';
import type { Game, Match, Preparation } from './game/domain.ts';
import { loadGame } from './game/storage.ts';
import { RoomCanvas } from './scene/RoomCanvas.tsx';
import { Crest, Icon } from './ui/Icon.tsx';
import { Modal } from './ui/Modal.tsx';
import { FootballSprite } from './art/FootballSprite.tsx';
import {CharacterLibrary} from './art/CharacterLibrary.tsx';
import { FootballLibrary } from './art/FootballLibrary.tsx';
import footballCatalog from '../../data/football/asset-catalog-v1.json';
import { FootballWorld, money } from './football/FootballWorld.tsx';
import { HowToPlay } from './football/HowToPlay.tsx';
import { ClubPicker } from './football/ClubPicker.tsx';

const pages=[['Ambientes','world'],['Minha carreira','journal'],['Central do clube','club'],['Diretoria esportiva','club'],['Elenco','team'],['Escalação','tactics'],['Campeonato','table'],['Partidas','matches'],['Mundo do futebol','world'],['Atlas de futebol','journal'],['Atlas de personagens','team'],['Como jogar','journal']] as const;
type Page=typeof pages[number][0];
type Popup={type:'dialogue';id:string}|{type:'journal'}|{type:'results';matches:Match[]}|{type:'reset'}|{type:'player';id:string}|{type:'import';game:Game}|{type:'error';message:string}|{type:'options'}|{type:'clubs'}|{type:'prematch'};
const positions:Record<string,Cell[]>={
  '4-4-2':[[50,86],[15,67],[38,70],[62,70],[85,67],[15,43],[38,48],[62,48],[85,43],[34,20],[66,20]],
  '4-3-3':[[50,86],[15,67],[38,70],[62,70],[85,67],[24,46],[50,50],[76,46],[18,21],[50,18],[82,21]],
  '3-5-2':[[50,86],[25,70],[50,73],[75,70],[14,47],[36,51],[50,35],[64,51],[86,47],[34,20],[66,20]],
};

function Table({game,compact=false}:{game:Game;compact?:boolean}) {
  return <div className="table-scroll"><table className={compact?'league compact':'league'}><thead><tr><th>#</th><th>Clube</th>{['PTS','J','V','E','D','GP','GC','SG'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
    {standings(game).map((row,index)=><tr key={row.club} className={row.club===game.club?'our-club':''}><td><span className="rank">{index+1}</span></td><td><FootballSprite id={`${footballCatalog.clubs[row.club].id}.crest`} size={24} className="club-badge"/><strong>{clubs[row.club].name}</strong>{row.club===game.club&&<span className="you-tag">VOCÊ</span>}</td>{[row.points,row.played,row.wins,row.draws,row.losses,row.gf,row.ga,row.gd].map((value,i)=><td key={i} className={i===0?'points':''}>{value}</td>)}</tr>)}
  </tbody></table></div>;
}

export default function App() {
  const [boot]=useState(()=>{
    try {const slot=activeSlot(localStorage);return {...loadGame({getItem:key=>localStorage.getItem(key.replace(SAVE_KEY,slotKey(slot))),setItem:(key,value)=>localStorage.setItem(key.replace(SAVE_KEY,slotKey(slot)),value)}),slot};}
    catch {return {game:newGame(),notice:'O navegador bloqueou o salvamento local. Exporte a partida antes de sair.',blocked:true,slot:0};}
  });
  const [slot,setSlot]=useState(boot.slot);
  const [inGame,setInGame]=useState(()=>{try{return sessionStorage.getItem(PLAYING_KEY)==='1';}catch{return false;}});
  const [game,setGame]=useState<Game>(boot.game);
  const [page,setPage]=useState<Page>('Ambientes');
  const [popup,setPopup]=useState<Popup|null>(boot.notice?{type:'error',message:boot.notice}:null);
  const [status,setStatus]=useState('Bem-vindo a Santa Aurora. Sua história começa aqui.');
  const [saving,setSaving]=useState('Salvando…');
  const [order,setOrder]=useState<{target:Target;sequence:number}|null>(null);
  const [outgoing,setOutgoing]=useState('');
  const [filter,setFilter]=useState('Todos');
  const fileInput=useRef<HTMLInputElement>(null);
  const baseStats=progression(game.hero),stats={...baseStats,xp:baseStats.xp+game.campaign.xp};
  const [preferences,setPreferences]=usePreferences();
  const [search,setSearch]=useState('');
  const club=clubs[game.club],players=roster(game),fixtures=calendar(game),totalRounds=fixtures.length;
  const [resetClub,setResetClub]=useState(game.club);
  const matchesPerRound=game.leagueSize/2;
  const location=game.hero.location,room=rooms[location];
  const currentTargets:Target[]=[...room.props.filter(prop=>prop.label),...room.npcs];
  const nextMatch=game.round<totalRounds?fixtures[game.round].find(pair=>pair.includes(game.club)):null;

  useEffect(()=>{
    if(!inGame)return;
    if (boot.blocked) {setSaving('Salvamento indisponível');return;}
    setSaving('Salvando…');
    const timer=setTimeout(()=>{try {writeSlot(window.localStorage,slot,game);setSaving('Salvo neste navegador');}catch {setSaving('Não salvo · exporte sua partida');}},200);
    return ()=>clearTimeout(timer);
  },[game,boot.blocked,inGame,slot]);

  function saveNow(){try{writeSlot(localStorage,slot,game);setSaving('Salvo neste navegador');setStatus('Carreira salva no slot '+(slot+1)+'.');return true;}catch{setSaving('Não salvo · exporte sua partida');setStatus('Não foi possível salvar. Exporte a partida para preservar seu progresso.');return false;}}
  function mainMenu(){if(!saveNow())return;try{sessionStorage.removeItem(PLAYING_KEY);}catch{}setPopup(null);setInGame(false);}
  function enterCareer(next:Game,id:number){writeSlot(localStorage,id,next);try{localStorage.setItem(ACTIVE_SLOT,String(id));sessionStorage.setItem(PLAYING_KEY,'1');}catch{}setSlot(id);setGame(next);setPopup(null);setPage('Ambientes');setOutgoing('');setOrder(null);setInGame(true);setStatus(`Bem-vindo, ${next.managerName??'treinador'}. Sua história continua.`);}
  function navigate(next:Page) {setPopup(null);setPage(next);setOrder(null);setStatus(next==='Ambientes'?'Clique para andar. Os pontos dourados guardam pessoas e histórias.':'A gestão acompanha você em qualquer lugar.');}
  function goTo(next:Location) {setOrder(null);setPopup(null);setGame(current=>travel(current,next));setStatus(`${rooms[next].name}. Clique no chão para explorar.`);}
  function play() {if(game.round>=totalRounds||game.live)return;if(Object.values(game.campaign.relations).some(r=>r.promise?.status==='active')){setPopup({type:'prematch'});return;}startMatch();}
  function startMatch() {if (game.round>=totalRounds||game.live) return;try{setGame({...game,live:createMatch(game)});setPopup(null);setStatus('A partida começou. Você pode acelerar, pausar ou pular cada tempo.');}catch(error){setStatus(error instanceof Error?error.message:'Não foi possível iniciar a partida.');}}
  function prepareTeam(action:Preparation){const error=preparationError(game,action);if(error){setStatus(error);return;}setGame(current=>prepare(current,action));setStatus('Preparação registrada. Confira os recursos e sua escalação.');}
  function improve(kind:'stadium'|'academy'){setGame(current=>upgrade(current,kind));setStatus('Instalação melhorada. O custo foi registrado no caixa.');}
  function resetCurrent(){setResetClub(game.club);setPopup({type:'reset'});}
  function download() {
    const url=URL.createObjectURL(new Blob([JSON.stringify(game,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='touchline-partida.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    setStatus('Partida exportada. Guarde o arquivo para continuar em outro navegador.');
  }
  async function importFile(file?:File) {
    if (!file) return;
    try {if (file.size>1_000_000) throw new Error('Arquivo grande demais. Escolha um save de TOUCHLINE.');setPopup({type:'import',game:validateSave(JSON.parse(await file.text()))});}
    catch (error) {setPopup({type:'error',message:error instanceof Error?error.message:'Não foi possível ler a partida.'});}
    if (fileInput.current) fileInput.current.value='';
  }
  function interact(id:string) {setPopup({type:'dialogue',id});setStatus('Escolha como continuar a conversa.');}
  function requestTarget(target:Target) {setOrder({target,sequence:Date.now()+Math.random()});}

  if(!inGame)return <StartScreen onEnter={enterCareer} reducedMotion={preferences.motion}/>;

  let body:ReactNode;
  if (page==='Ambientes') body=<>
    <div className="location-bar"><div className="place-heading"><span className="eyebrow">VILA DAS PALMEIRAS & AURORA ATLÉTICO</span><h1>{room.name}<span className="heading-dot">.</span></h1><p>{room.subtitle}</p></div>
      <div className="location-switch" aria-label="Acesso direto aos locais">{locationIds.map(id=><button key={id} aria-pressed={location===id} onClick={()=>goTo(id)}>{id==='training'?'CT':rooms[id].name}</button>)}</div>
    </div>
    <section className="career-shortcut"><div><strong>Há uma carreira além do próximo apito.</strong><p>Conversas, metas, compromissos e sua história na temporada.</p></div><button className="button" onClick={()=>navigate('Minha carreira')}>Abrir minha carreira ↗</button><button className="button" onClick={()=>navigate('Diretoria esportiva')}>Mercado & talentos ↗</button></section>
    <div className="environment-grid">
      <div className="world-column"><RoomCanvas key={location} location={location} cell={game.hero.positions[location]??room.spawn} trainingPlayers={players} reducedMotion={preferences.motion} onPlayer={id=>setPopup({type:'player',id})} blocked={popup!==null||!!game.live} talking={popup?.type==='dialogue'} order={order}
        onCell={cell=>setGame(current=>({...current,hero:{...current.hero,positions:{...current.hero.positions,[location]:cell}}}))}
        onInteraction={interact} onTravel={goTo} onStatus={setStatus}/>
        <div className="world-footnote"><span className="mouse-icon">↖</span><span>Clique no chão para andar. Aproxime-se das pessoas, examine objetos e entre pelas portas.</span><span className="placeholder-label">ARTE PROVISÓRIA</span></div>
        <section className="chapter-strip"><span className="chapter-number">01</span><div><span className="eyebrow">{game.round?`TEMPORADA ${game.year} · RODADA ${Math.min(game.round+1,totalRounds)}`:'SEU PRIMEIRO DIA'}</span><h3>{game.hero.actions.includes('deliver_report')?'Seu trabalho começa a deixar marcas.':'As raízes de uma nova história.'}</h3><p>{game.hero.actions.includes('deliver_report')?'Conheça o elenco, cumpra os combinados e construa a próxima vitória.':'Um caderno antigo. Uma oportunidade no Aurora. O resto é com você.'}</p></div><button className="text-button" onClick={()=>setPopup({type:'journal'})}>Ler meu diário <Icon name="arrow" size={16}/></button></section>
      </div>
      <aside className="room-aside"><section className="objective-panel"><span className="eyebrow">SEU PRÓXIMO PASSO</span><div className="objective-icon"><Icon name="journal"/></div><h3>{game.hero.actions.includes('deliver_report')?'Converse com os atletas e acompanhe suas metas em Minha carreira.':objective(game.hero)}</h3><p>Explore no seu ritmo. As escolhas podem esperar.</p><button className="text-button" onClick={()=>setPopup({type:'journal'})}>Abrir diário <Icon name="arrow" size={16}/></button></section>
        <section className="local-actions"><span className="eyebrow">NESTE AMBIENTE</span>{currentTargets.map(target=><button key={target.id} onClick={()=>requestTarget(target)}><span className="action-dot"/><span>{target.label}</span><span className="action-arrow" aria-hidden="true">↗</span></button>)}</section>
        <section className="attributes"><span className="eyebrow">SUA EVOLUÇÃO</span><div><span>Análise</span><strong>{stats.analysis}<small>/ 100</small></strong></div><div><span>Comunicação</span><strong>{stats.communication}<small>/ 100</small></strong></div><p>Helena · {stats.trust?'confiança em construção':'primeiro contato'}</p></section>
      </aside>
    </div>
  </>;
  else if(page==='Minha carreira') body=<CareerHub game={game} onClaim={key=>{setGame(current=>claimObjective(current,key));setStatus('Recompensa recebida. Carreira e caixa atualizados.');}} onPlayer={id=>setPopup({type:'player',id})} onPrepare={()=>navigate('Mundo do futebol')} onPlay={play}/>;
  else if (page==='Mundo do futebol') body=<FootballWorld game={game} onPrepare={prepareTeam} onUpgrade={improve} onTicket={ticket=>setGame(current=>({...current,ticket}))} onRoom={()=>{navigate('Ambientes');goTo('office');}}/>;
  else if(page==='Diretoria esportiva') body=<ManagerDesk game={game} onTrade={(id,kind)=>{setGame(current=>trade(current,id,kind));setStatus(kind==='buy'?'Reforço contratado. Ele já está no CT e pode ser escalado.':'Venda concluída. Caixa e folha atualizados.');}} onFocus={id=>{setGame(current=>setFocus(current,id));setStatus('Foco definido. Treino e participação nas próximas partidas geram evolução.');}} onPlayer={id=>setPopup({type:'player',id})} onPrepare={()=>navigate('Mundo do futebol')} onTactics={()=>navigate('Escalação')}/>;
  else if(page==='Como jogar') body=<HowToPlay/>;
  else if (page==='Central do clube') body=<>
    <div className="page-title"><span className="eyebrow">{club.name.toUpperCase()}</span><h1>O próximo capítulo é seu.</h1><p>O clube dentro de campo. Sua história em todos os outros lugares.</p></div>
    <div className="summary-grid"><div><span className="eyebrow">FORÇA DOS TITULARES</span><strong>{Math.round(strength(game,game.club))}<small>/ 100</small></strong></div><div><span className="eyebrow">SUA EQUIPE</span><strong>{game.formation}</strong><p>{game.mentality}</p></div><div><span className="eyebrow">SUA CARREIRA</span><strong>Nível {1+Math.floor(stats.xp/100)}</strong><p>{stats.xp} XP conquistados</p></div></div>
    <section className="next-match"><span className="eyebrow">{nextMatch?'PRÓXIMO COMPROMISSO':'FIM DA LIGA REGIONAL'}</span><h2>{nextMatch?`${clubs[nextMatch[0]].name} × ${clubs[nextMatch[1]].name}`:`${clubs[standings(game)[0].club].name} é campeão!`}</h2><p>{nextMatch?`Rodada ${game.round+1} · ${nextMatch[0]===game.club?'Em casa':'Fora de casa'} · Temporada ${game.year}`:'Consulte a campanha final ou inicie uma nova partida.'}</p><div className="button-row"><button className="button primary" onClick={()=>navigate('Escalação')}>Preparar escalação</button><button className="button" onClick={()=>navigate('Ambientes')}>Entrar nos ambientes <Icon name="arrow" size={16}/></button></div></section>
    <div className="club-actions"><button className="button" onClick={()=>setPopup({type:'clubs'})}>Escolher clube</button><button className="button" onClick={()=>navigate('Mundo do futebol')}>Preparar no clube</button>{game.round===totalRounds&&<button className="button primary" onClick={()=>{setGame(current=>nextSeason(current));setStatus('Nova temporada iniciada. Patrimônio e carreira preservados.');}}>Próxima temporada · {game.year+1}</button>}</div><p className="fine-print">Caixa: {money(game.cash)} · condição: {game.fitness}% · apoio: {game.support}/100 · ações: {3-game.preparation.length}/3.</p>{game.leagueSize===4&&<p className="season-message">Save antigo: a liga de quatro clubes será preservada até o fim desta temporada. A próxima terá 12 clubes.</p>}<section className="club-kit-collection"><div><span className="eyebrow">IDENTIDADE DO CLUBE</span><h3>As cores da nossa história.</h3></div><div className="club-kit-sample"><FootballSprite id={`${club.id}.home`} size={56} label="Camisa de casa"/><small>Casa</small></div><div className="club-kit-sample"><FootballSprite id={`${club.id}.away`} size={56} label="Camisa visitante"/><small>Visitante</small></div><label>Uniforme em uso<select aria-label="Uniforme em uso" value={game.kit} onChange={e=>setGame(current=>({...current,kit:e.target.value as Game['kit']}))}><option value="home">Casa</option><option value="away">Visitante</option></select></label><button className="text-button" onClick={()=>navigate('Atlas de futebol')}>Ver coleção ↗</button></section><div className="section-heading"><h2>Classificação</h2><button className="text-button" onClick={()=>navigate('Campeonato')}>Ver campeonato <Icon name="arrow" size={16}/></button></div><Table game={game} compact/>
  </>;
  else if(page==='Atlas de personagens') body=<CharacterLibrary/>;
  else if (page==='Atlas de futebol') body=<FootballLibrary/>;
  else if (page==='Elenco') body=<>
    <div className="page-title"><span className="eyebrow">{club.name.toUpperCase()}</span><h1>Seu elenco.</h1><p>{players.length} atletas. Um projeto. Escolha quem vai escrever a próxima rodada.</p></div>
    <div className="section-heading"><div className="filter-tabs">{['Todos','Titulares','Reservas'].map(value=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{value} <span>{value==='Todos'?players.length:value==='Titulares'?11:players.length-11}</span></button>)}</div><button className="button" onClick={()=>navigate('Escalação')}>Montar escalação <Icon name="arrow" size={16}/></button></div>
    <label className="roster-search">Buscar atleta<input type="search" placeholder="Nome ou posição…" value={search} onChange={e=>setSearch(e.target.value)}/><span>{players.filter(p=>(p.name+' '+p.position).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).length} encontrados</span></label>
    <div className="table-scroll"><table className="roster"><thead><tr><th>POS.</th><th>Jogador</th><th>Idade</th><th>Força</th><th>Condição</th><th>Situação</th><th/></tr></thead><tbody>{players.filter(p=>(filter==='Todos'||(filter==='Titulares')===game.lineup.includes(p.id))&&(p.name+' '+p.position).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).map(player=><tr key={player.id}><td><span className={`position-badge ${player.position==='GOL'?'keeper':''}`}>{player.position}</span></td><td><button className="player-name" onClick={()=>setPopup({type:'player',id:player.id})}>{player.name}</button></td><td>{player.age}</td><td><strong>{player.skill}</strong><span className="strength-track"><span style={{width:`${player.skill}%`}}/></span></td><td><span className="condition-dot"/>{game.fitness}%</td><td><span className={game.lineup.includes(player.id)?'squad-tag':'squad-tag reserve'}>{game.discipline?.[player.id]?.ban?'Suspenso':game.lineup.includes(player.id)?'Titular':'Reserva'}</span>{!!game.discipline?.[player.id]?.yellows&&<small> · {game.discipline[player.id].yellows} amarelo(s)</small>}</td><td><button aria-label={`Ver ${player.name}`} className="row-arrow" onClick={()=>setPopup({type:'player',id:player.id})}>↗</button></td></tr>)}</tbody></table></div>
  </>;
  else if (page==='Escalação') body=<>
    <div className="page-title"><span className="eyebrow">PRÉ-JOGO</span><h1>Um time com a sua ideia.</h1><p>Clique no titular dentro do campo e depois em um reserva para fazer a troca.</p></div>
    <div className="tactics-toolbar"><button className="button" onClick={()=>{setGame(current=>bestLineup(current));setOutgoing('');setStatus('Escalação ajustada por força, posição e disponibilidade.');}}>Escalar disponíveis</button><label>Formação<select value={game.formation} onChange={event=>setGame(current=>({...current,formation:event.target.value as Game['formation']}))}>{formations.map(value=><option key={value}>{value}</option>)}</select></label><label>Mentalidade<select value={game.mentality} onChange={event=>setGame(current=>({...current,mentality:event.target.value as Game['mentality']}))}>{mentalities.map(value=><option key={value}>{value}</option>)}</select></label><span>Força do time <strong>{Math.round(strength(game,game.club))}</strong></span></div>
    <div className="tactics-grid"><div className="pitch" aria-label="Campo de escalação"><div className="pitch-boundary"/><div className="pitch-midline"/><div className="pitch-circle"/><div className="pitch-box top"/><div className="pitch-box bottom"/>{game.lineup.map((id,index)=>{const p=playerById(id,game);return <button key={index} data-testid={`slot-${id}`} className={`player-token ${outgoing===id?'selected':''}`} style={{left:`${positions[game.formation][index][0]}%`,top:`${positions[game.formation][index][1]}%`}} onClick={()=>{setOutgoing(outgoing===id?'':id);setStatus(`Escolha um reserva para substituir ${p.name}.`);}}><span className="shirt-number"><FootballSprite id={`${club.id}.${game.kit}`} size={48}/><b>{index+1}</b></span><span className="token-name">{p.name.split(' ')[0]}</span><span className="token-meta">{p.position} · {p.skill}</span></button>;})}</div>
      <section className="bench"><span className="eyebrow">BANCO DE RESERVAS</span><h3>{outgoing?`Substituir ${playerById(outgoing,game).name.split(' ')[0]}`:'Quem entra no jogo?'}</h3><p>{outgoing?'Escolha abaixo quem entra no time.':'Selecione um titular no campo para liberar as trocas.'}</p>{players.filter(p=>!game.lineup.includes(p.id)).map(player=><button key={player.id} disabled={!outgoing} onClick={()=>{setGame(current=>swapPlayer(current,outgoing,player.id));setOutgoing('');setStatus(`${player.name} entrou na equipe titular.`);}}><span className="position-badge">{player.position}</span><span>{player.name}</span><strong>{player.skill}</strong></button>)}<small>Força e mentalidade afetam os resultados. A formação organiza o desenho do time. Posições ainda são livres neste protótipo. Suspensos ficam fora da próxima partida e são substituídos automaticamente na abertura. Três amarelos ou um vermelho suspendem por uma rodada.</small></section></div>
  </>;
  else if (page==='Campeonato') body=<>
    <div className="page-title"><span className="eyebrow">LIGA REGIONAL · {game.year}</span><h1>Cada ponto conta.</h1><p>{game.leagueSize} clubes. Turno e returno. Uma história para construir.</p></div>
    <div className="league-banner"><span>{game.round}/{totalRounds}</span><div><strong>{game.round===totalRounds?'Temporada encerrada':'Rodadas disputadas'}</strong><p>Vitória vale 3 pontos. Empate vale 1.</p></div>{game.round===totalRounds&&<span className="champion">★ {clubs[standings(game)[0].club].name}</span>}</div>
    <Table game={game}/><p className="fine-print">Desempate por pontos, vitórias, saldo de gols e gols marcados. Igualdade total usa a ordem estável dos clubes neste protótipo.</p>
  </>;
  else body=<>
    <div className="page-title"><span className="eyebrow">CALENDÁRIO REGIONAL</span><h1>O caminho até o título.</h1><p>Todos os confrontos e os resultados reais da sua temporada.</p></div>
    <div className="fixtures-grid">{fixtures.map((pairs,round)=><section key={round} className={`fixture-round ${round===game.round?'upcoming':''}`}><div className="fixture-heading"><h3>Rodada {round+1}</h3><span>{round<game.round?'CONCLUÍDA':round===game.round?'PRÓXIMA':'A DISPUTAR'}</span></div>{pairs.map(([home,away],index)=>{const match=game.results[round*matchesPerRound+index];return <div className="fixture" key={index}><span className={`match-kit ${home===game.club?'our-name':''}`}><FootballSprite id={`${clubs[home].id}.home`} size={24}/>{clubs[home].name}</span><strong>{match?`${match.hg} : ${match.ag}`:'×'}</strong><span className={`match-kit ${away===game.club?'our-name':''}`}><FootballSprite id={`${clubs[away].id}.away`} size={24}/>{clubs[away].name}</span></div>;})}</section>)}</div>
  </>;

  let modal:ReactNode=null;
  if (popup) {
    const close=()=>setPopup(null);
    let title='',eyebrow='SUA HISTÓRIA',children:ReactNode;
    if (popup.type==='dialogue') {
      const data=getDialogue(game.hero,popup.id);title=data.speaker;
      children=<><p className="dialogue-copy">{data.text}</p><div className="modal-actions">{data.choices.map(choice=><button key={choice.action} className="button primary" onClick={()=>{if (choice.action==='management') navigate('Elenco');else if (choice.action!=='close') {const action=choice.action;setGame(current=>({...current,hero:applyAction(current.hero,action)}));setStatus('Diário e evolução atualizados.');}close();}}>{choice.label}<Icon name="arrow" size={16}/></button>)}</div></>;
    } else if (popup.type==='journal') {
      title='Seu caminho no Aurora.';eyebrow='DIÁRIO PESSOAL';children=<><ol className="journal-list">{journal(game.hero).map((note,index)=><li key={index}><span>{String(index+1).padStart(2,'0')}</span><p>{note}</p></li>)}</ol><button className="button primary" onClick={close}>Voltar ao ambiente</button></>;
    } else if (popup.type==='results') {
      title=`Rodada ${popup.matches[0].round} encerrada.`;eyebrow='APITO FINAL';children=<><div className="result-list">{popup.matches.map(match=><div key={match.home}><span>{clubs[match.home].name}</span><strong>{match.hg} <i>×</i> {match.ag}</strong><span>{clubs[match.away].name}</span></div>)}</div><p>A classificação foi atualizada. A súmula e as estatísticas dos atletas estão em Minha carreira.</p><div className="button-row"><button className="button primary" onClick={close}>Continuar</button><button className="button" onClick={()=>navigate('Campeonato')}>Ver classificação</button><button className="button" onClick={()=>navigate('Minha carreira')}>{careerObjectives(game).some(o=>!o.claimed&&o.current>=o.target)?'Receber recompensas ↗':'Ver súmula e carreira ↗'}</button></div></>;
    } else if(popup.type==='prematch') {
      title='Há compromissos antes do apito.';eyebrow='ANTES DA PARTIDA';children=<><p>Você combinou devolutivas de treino com atletas. Iniciar esta partida sem entregá-las fará o prazo vencer e prejudicará a confiança deles.</p><ul>{Object.entries(game.campaign.relations).filter(([,r])=>r.promise?.status==='active').map(([id])=><li key={id}>{playerById(id,game).name}</li>)}</ul><div className="button-row"><button className="button primary" onClick={()=>{navigate('Ambientes');goTo('training');}}>Voltar ao CT</button><button className="button" onClick={startMatch}>Jogar mesmo assim</button></div></>;
    } else if(popup.type==='clubs') {
      title='Qual será o seu clube?';eyebrow='NOVA CARREIRA';children=<ClubPicker onSelect={club=>{setResetClub(club);setPopup({type:'reset'});}}/>;
    } else if (popup.type==='reset') {
      title='Começar uma nova história?';eyebrow='NOVA PARTIDA';children=<><p><strong>{clubs[resetClub].name}</strong> será seu clube. A temporada, a escalação e a progressão de RPG salvas neste navegador serão substituídas. Você pode exportar a partida atual antes de continuar.</p><div className="modal-actions"><button className="button danger" onClick={()=>{try{checkpoint(localStorage,slot);}catch{setPopup({type:'error',message:'Não foi possível preservar uma cópia. Exporte antes de reiniciar.'});return;}setGame({...newGame(resetClub),managerName:game.managerName??'Treinador'});setOutgoing('');navigate('Ambientes');setStatus('Uma nova história começa em Santa Aurora.');}}>Confirmar nova partida</button><button className="button" onClick={download}>Exportar partida atual</button><button className="text-button" onClick={close}>Voltar sem reiniciar</button></div></>;
    } else if (popup.type==='player') {
      const p=playerById(popup.id,game);title=p.name;eyebrow='PERFIL & RELACIONAMENTO';children=<PlayerDossier key={p.id} game={game} id={p.id} onAction={action=>{setGame(current=>interactWithPlayer(current,p.id,action));setStatus('Conversa registrada no vínculo com o atleta.');}} onTactics={()=>navigate('Escalação')}/>;
    } else if (popup.type==='import') {
      title='Continuar esta partida?';eyebrow='IMPORTAR SAVE';children=<><p>Rodada {popup.game.round} de {calendar(popup.game).length} · {clubs[popup.game.club].name} · {progression(popup.game.hero).xp} XP · {rooms[popup.game.hero.location].name}.</p><p>A partida atual será substituída pelo arquivo selecionado.</p><div className="button-row"><button className="button primary" onClick={()=>{try{checkpoint(localStorage,slot);}catch{setPopup({type:'error',message:'Não foi possível preservar uma cópia antes da importação.'});return;}setGame(popup.game);setOutgoing('');navigate('Ambientes');setStatus('Partida importada com sucesso.');}}>Confirmar importação</button><button className="button" onClick={close}>Cancelar</button></div></>;
    } else if (popup.type==='options') {
      title='Sua partida.';eyebrow='SALVAMENTO E OPÇÕES';children=<><div className="settings-group"><label><input type="checkbox" checked={preferences.motion} onChange={e=>setPreferences(p=>({...p,motion:e.target.checked}))}/>Reduzir animações dos ambientes e partidas</label><label><input type="checkbox" checked={preferences.contrast} onChange={e=>setPreferences(p=>({...p,contrast:e.target.checked}))}/>Aumentar contraste dos textos</label></div><p>Carreira de {game.managerName??'Treinador'} · slot {slot+1}. O progresso é salvo neste navegador. Exporte um arquivo para levar sua história a outro dispositivo.</p><div className="modal-actions"><button className="button primary" onClick={saveNow}>Salvar agora</button><button className="button" onClick={mainMenu}>Menu inicial e carreiras</button><button className="button" onClick={download}>Exportar partida</button><button className="button" onClick={()=>fileInput.current?.click()}>Importar partida</button><button className="button" onClick={resetCurrent}>Nova partida</button><button className="text-button" onClick={close}>Voltar ao jogo</button></div></>;
    } else {
      title='Sobre sua partida';eyebrow='AVISO';children=<><p role="alert">{popup.message}</p><button className="button primary" onClick={close}>Entendi</button></>;
    }
    modal=<Modal title={title} eyebrow={eyebrow} onClose={close}>{children}</Modal>;
  }

  return <div className={`app-shell ${preferences.motion?'reduced-motion':''} ${preferences.contrast?'high-contrast':''}`}>
    <aside className="sidebar"><div className="brand"><Crest/><div><strong>TOUCHLINE</strong><small>RAÍZES DO FUTEBOL</small></div></div><div className="nav-caption">SUA CARREIRA</div><nav aria-label="Navegação principal">{pages.map(([name,icon])=><button key={name} aria-current={page===name?'page':undefined} onClick={()=>navigate(name)}><Icon name={icon}/><span>{name}</span>{page===name&&<span className="nav-indicator"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="career-profile"><div className="avatar-monogram">{(game.managerName??'V')[0].toUpperCase()}</div><div><strong>{game.managerName??'Seu caminho no futebol'}</strong><span>Nível {1+Math.floor(stats.xp/100)} · {stats.xp} XP</span></div></div><div className="xp-track"><span style={{width:`${stats.xp%100}%`}}/></div><div className="save-tools"><button onClick={saveNow}><Icon name="download" size={16}/>Salvar agora</button><button onClick={mainMenu}><Icon name="world" size={16}/>Menu inicial</button><button onClick={download}><Icon name="download" size={16}/>Exportar partida</button><button onClick={()=>fileInput.current?.click()}><Icon name="upload" size={16}/>Importar partida</button><button onClick={resetCurrent}><Icon name="reset" size={16}/>Nova partida</button></div><small className="build-label">ALPHA JOGÁVEL · v0.6<br/>Clubes e universo fictícios.</small></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="club-identity"><FootballSprite id={`${club.id}.crest`} size={36} label={`Brasão do ${club.name}`}/><div><strong>{club.name}</strong><span>{club.city} <i>·</i> Liga Regional {game.year}</span></div></div><div className="round-control"><span>{game.round<totalRounds?`RODADA ${String(game.round+1).padStart(2,'0')} / ${String(totalRounds).padStart(2,'0')}`:'TEMPORADA CONCLUÍDA'}</span><button className="button primary" aria-label="Jogar próxima rodada" disabled={game.round>=totalRounds||!!game.live} onClick={play}><span className="desktop-text">Jogar próxima rodada</span><span className="mobile-text">Jogar rodada</span><Icon name="arrow" size={17}/></button><button className="mobile-options" aria-label="Opções da partida" onClick={()=>setPopup({type:'options'})}>···</button></div></header>
      <main><div className="breadcrumbs"><span>SEU MUNDO <span>/</span> <strong>{page}</strong></span><span className={saving.startsWith('Salvo')?'save-state':'save-state pending'} aria-live="polite"><span/>{saving}</span></div><div className="club-actions"><button className="text-button" onClick={()=>navigate('Como jogar')}>Como jogar ↗</button><button className="text-button" onClick={()=>navigate('Mundo do futebol')}>Ir ao mundo do futebol ↗</button></div>{body}<footer className="page-footer"><span role="status">{status}</span><span>UM JOGO SOBRE FUTEBOL. E SOBRE QUEM VIVE ELE.</span></footer></main>
    </div><input className="hidden-input" ref={fileInput} type="file" accept=".json,application/json" onChange={event=>void importFile(event.target.files?.[0])} aria-label="Selecionar arquivo de partida"/><Toast message={status}/>{modal}{game.live&&<MatchView game={game} reducedMotion={preferences.motion} onExport={download} saving={saving} onChange={live=>setGame(current=>({...current,live}))} onFinish={live=>{const next=playRound(game,live);setGame(next);setPopup({type:'results',matches:next.results.slice(-matchesPerRound)});setStatus(`Rodada ${next.round} concluída. Resultados, disciplina e caixa atualizados.`);}}/>}
  </div>;
}
