import {allOwned,potential,management,wage} from '../game/management.ts';
import {useState} from 'react';
import type {Game} from '../game/domain.ts';
import {roster} from '../game/domain.ts';
import {relationship,personality,relationLabel,socialActions,socialError} from '../game/campaign.ts';
import type {SocialAction} from '../game/campaign.ts';

export function PlayerDossier({game,id,onAction,onTactics}:{game:Game;id:string;onAction:(action:SocialAction)=>void;onTactics:()=>void}){
  const player=roster(game).find(p=>p.id===id)!,r=relationship(game,id),profile=personality(id),record=game.campaign.records[id];
  const [confirm,setConfirm]=useState(false),[greeting,setGreeting]=useState(false);
  const used=Object.values(game.campaign.relations).filter(r=>r.lastTalk===game.year*100+game.round).length;
  const actions=(Object.keys(socialActions) as SocialAction[]).filter(a=>a!=='feedback'||id==='m04').filter(a=>a!=='deliver'||r.promise?.status==='active').filter(a=>a!=='repair'||r.promise?.status==='broken');
  return <div className="player-dossier">
    <div className="dossier-identity"><div className={`dossier-avatar ${player.position==='GOL'?'keeper':''}`}/><div><span className="eyebrow">{player.position} · {player.age} ANOS · {game.lineup.includes(id)?'TITULAR':'RESERVA'}</span><strong>{profile.trait}</strong><p>Prioridade: {r.heard?profile.priority:'a descobrir na conversa'}</p></div></div>
    <div className="dossier-record"><span><b>{player.skill}</b>Força</span><span><b>{record?.apps??0}</b>Jogos registrados</span><span><b>{record?.goals??0}</b>Gols registrados</span><span><b>{game.discipline?.[id]?.ban?'Suspenso':game.fitness+'%'}</b>Disponibilidade</span></div>
    <p className="dossier-help">Potencial de força: {potential(allOwned(game).find(p=>p.id===id)!)} · Evolução acumulada: {management(game).growth[id]??0} pontos · Salário: R$ {wage(player)} / rodada. Defina o foco na Diretoria esportiva.</p>
    <div className="relationship-grid">{([['Confiança','trust'],['Respeito','respect'],['Afinidade','affinity'],['Rivalidade','rivalry']] as const).map(([label,key])=><div key={key}><span>{label}</span><strong>{relationLabel(r[key],key)}</strong><div className={`relation-track ${key}`}><i style={{width:`${r[key]}%`}}/></div></div>)}</div>
    {r.promise&&<div className={`promise-note ${r.promise.status}`}><b>{r.promise.status==='active'?'Compromisso pendente':r.promise.status==='fulfilled'?'Palavra cumprida':r.promise.status==='broken'?'Compromisso quebrado':'Reconstruindo a confiança'}</b><span>Devolutiva do treino · rodada {r.promise.round}/{r.promise.year}{r.promise.status==='active'?' · antes de jogar':''}</span></div>}
    <blockquote className="athlete-reply">“{greeting?`Bom te ver por aqui. ${r.heard?'Seguimos trabalhando juntos.':'Quando tiver um momento, vamos conversar.'}`:r.reply}”</blockquote>
    <div className="dossier-conversation-heading"><h3>Conversa individual</h3><span>{3-used}/3 conversas na rodada</span></div>
    <p className="dossier-help">Ouça suas prioridades e cumpra os combinados. Cada atleta tem uma conversa relevante por rodada; entregar uma devolutiva já combinada não gasta outra.</p>
    {confirm?<div className="promise-confirm"><strong>Assumir este compromisso?</strong><p>Você precisa treinar a equipe e voltar aqui para entregar a devolutiva antes da próxima partida. Deixar passar o prazo prejudica a confiança.</p><div className="button-row"><button className="button primary" onClick={()=>{onAction('promise');setConfirm(false);setGreeting(false);}}>Confirmar compromisso</button><button className="button" onClick={()=>setConfirm(false)}>Voltar sem prometer</button></div></div>:<div className="social-actions">{actions.map(action=>{const error=socialError(game,id,action),content=socialActions[action];return <div key={action}><button className="button" disabled={!!error} onClick={()=>{setGreeting(false);if(action==='promise')setConfirm(true);else onAction(action);}}>{content.label}<span aria-hidden="true">↗</span></button><small>{error||content.description}</small></div>;})}</div>}
    <div className="dossier-quick"><button className="text-button" onClick={()=>setGreeting(true)}>Cumprimentar · gratuito</button><button className="text-button" onClick={onTactics}>Ver escalação ↗</button></div>
    <details className="dossier-memories"><summary>Memórias do vínculo · {r.memories.length}</summary>{r.memories.length?<ol>{[...r.memories].reverse().map(m=><li key={m.id}><small>{m.year} · rodada {m.round}</small><span>{m.text}</span></li>)}</ol>:<p>A história de vocês começa na primeira conversa.</p>}</details>
  </div>;
}
