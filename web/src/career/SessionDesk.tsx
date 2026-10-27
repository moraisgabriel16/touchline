import type {Game,Preparation} from '../game/domain.ts';
import {preparationError} from '../game/domain.ts';
import {sessionBriefing} from '../game/session.ts';
import {clubs} from '../game/data.ts';
import {FootballSprite} from '../art/FootballSprite.tsx';
import './session.css';

export function SessionDesk({game,onPrepare,onPlayer,onNavigate,onPlay,onClaim}:{game:Game;onPrepare:(a:Preparation)=>void;onPlayer:(id:string)=>void;onNavigate:(page:'Escalação'|'Minha carreira'|'Diretoria esportiva'|'Central do clube')=>void;onPlay:()=>void;onClaim:(key:string)=>void}){
 const b=sessionBriefing(game);
 return <section className="session-desk" aria-label="Agenda da rodada">
  <div className="session-heading"><div><span className="eyebrow">SUA AGENDA · {game.year} · {b.ended?'FIM DE TEMPORADA':`RODADA ${game.round+1}`}</span><h2>{b.headline}</h2><p>{game.managerName??'Treinador'}, seu clube está em {b.rank}º, com {b.points} pontos. Suas decisões ficam salvas para continuar depois.</p></div><span className="session-actions-left">{3-game.preparation.length}<small>ações disponíveis</small></span></div>
  <div className="session-grid">
   <article><span className="eyebrow">01 · PREPARAR</span><h3>{game.fitness<75?'Recuperar também é estratégia.':'Pronto para trabalhar?'}</h3><p>Condição {game.fitness}% · treino +{game.training}. Cada ação pode ser feita uma vez por rodada.</p>{(['rest','train'] as const).map(a=>{const reason=preparationError(game,a);return <div className="session-choice" key={a}><button className="button" disabled={!!reason} onClick={()=>onPrepare(a)}>{a==='rest'?'Recuperar equipe':'Treinar equipe'}</button><small>{reason||(a==='rest'?'+12 de condição, até 100.':`+${3+game.academy} de força; −6 de condição.`)}</small></div>;})}</article>
   <article><span className="eyebrow">02 · CUIDAR DO ELENCO</span><h3>{b.pending.length?'Você deu sua palavra.':'Conheça quem joga por você.'}</h3><p>{b.pending.length?`${b.pending.length} devolutiva(s) precisam ser entregues antes do apito.`:`Converse com ${b.contact.name} e descubra suas prioridades.`}</p><button className="button" disabled={b.ended} onClick={()=>onPlayer(b.contact.id)}>{b.pending.length?'Rever compromisso':'Conversar com atleta'}</button><p>{b.focus?`${b.focus.name}: ${b.growth} pontos de desenvolvimento acumulados. Cada 100 aumenta a força até o potencial.`:'Escolha um atleta para desenvolver com treinos e minutos em campo.'}</p><button className="text-button" onClick={()=>onNavigate('Diretoria esportiva')}>Acompanhar talentos ↗</button></article>
   <article className="session-fixture"><span className="eyebrow">03 · ENTRAR EM CAMPO</span>{b.opponent!==undefined&&<FootballSprite id={`${clubs[b.opponent].id}.crest`} size={48}/>}<h3>{b.opponentName}</h3><p>{b.ended?'Confira a classificação final, receba suas metas e comece uma nova temporada na Central do clube.':`${b.home?'Em casa':'Fora de casa'} · adversário em ${b.opponentRank}º lugar.`}</p>{b.suspended.length>0&&<p className="session-warning">Suspensos: {b.suspended.map(p=>p.name).join(', ')}. Revise os titulares.</p>}<button className="button" onClick={()=>onNavigate(b.ended?'Central do clube':'Escalação')}>{b.ended?'Planejar próxima temporada':'Revisar escalação'}</button>{!b.ended&&<button className="button primary" disabled={!!game.live} onClick={onPlay}>Ir para a partida</button>}</article>
  </div>
  {b.ready.length>0&&<div className="session-rewards"><strong>Seu trabalho rendeu recompensas.</strong>{b.ready.map(o=><button className="button" key={o.key} disabled={!!game.live} onClick={()=>onClaim(o.key)}>Receber: {o.title} · {o.xp} XP</button>)}</div>}
  {b.nextMilestone&&<div className="session-milestone"><div><strong>Próximo marco: {b.nextMilestone.title}</strong><p>{b.nextMilestone.description} · {b.nextMilestone.current}/{b.nextMilestone.target}</p></div><button className="text-button" onClick={()=>onNavigate('Minha carreira')}>Ver minha evolução ↗</button></div>}
 </section>;
}
