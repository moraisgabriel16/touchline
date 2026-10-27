import {shotReplay,replayClips} from '../game/broadcast.ts';
import {useEffect,useRef,useState} from 'react';
import type {Game} from '../game/domain.ts';
import {clubs} from '../game/data.ts';
import {advanceMatch,resumeMatch,skipPeriod,substitute,substitutionError} from '../game/live-match.ts';
import type {LiveMatch} from '../game/live-match.ts';
import {FootballSprite} from '../art/FootballSprite.tsx';
import {MatchCanvas} from './MatchCanvas.tsx';
import './match.css';

export function MatchView({game,onChange,onFinish,onExport,saving,reducedMotion=false}:{game:Game;onChange:(m:LiveMatch)=>void;onFinish:(m:LiveMatch)=>void;onExport:()=>void;saving:string;reducedMotion?:boolean}){
  const m=game.live!,dialog=useRef<HTMLDialogElement>(null),[speed,setSpeed]=useState(1),[paused,setPaused]=useState(false),[out,setOut]=useState(''),[incoming,setIncoming]=useState('');
  const [replay,setReplay]=useState<LiveMatch|null>(null),[replayId,setReplayId]=useState(0),[follow,setFollow]=useState(false);
  const [replayProgress,setReplayProgress]=useState(0),[replayPaused,setReplayPaused]=useState(false),[replaySpeed,setReplaySpeed]=useState(1),[immersive,setImmersive]=useState(false);
  const clips=replayClips(m),clip=clips.find(c=>c.minute===replay?.minute),clipIndex=clips.findIndex(c=>c.minute===replay?.minute);
  function openReplay(minute:number){const snapshot=shotReplay(game,minute);if(!snapshot)return;const still=reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;setPaused(true);setReplay(snapshot);setReplayId(id=>id+1);setReplayProgress(still?1:0);setReplayPaused(still);}
  useEffect(()=>{
    if(!replay||replayPaused)return;let last=performance.now();
    const timer=setInterval(()=>{const now=performance.now(),dt=Math.min(.15,(now-last)/1000);last=now;if(document.hidden)return;setReplayProgress(p=>Math.min(1,p+dt*replaySpeed/6));},50);
    return ()=>clearInterval(timer);
  },[replay,replayPaused,replaySpeed]);
  useEffect(()=>{if(replayProgress>=1)setReplayPaused(true);},[replayProgress]);
  const current=useRef({m,speed,paused,onChange});current.current={m,speed,paused,onChange};
  useEffect(()=>{const d=dialog.current!;d.showModal();return ()=>d.close();},[]);
  useEffect(()=>{
    let last=performance.now(),credit=0;
    const timer=setInterval(()=>{
      const now=performance.now(),dt=Math.min(.25,(now-last)/1000);last=now;
      const c=current.current;
      if(c.paused||document.hidden||!(c.m.phase==='first'||c.m.phase==='second')){credit=0;return;}
      credit+=dt*c.speed*1.5;let next=c.m;
      while(credit>=1&&(next.phase==='first'||next.phase==='second')){next=advanceMatch(next,game.club,game.mentality);credit--;}
      if(next!==c.m){current.current.m=next;c.onChange(next);}
    },50);return ()=>clearInterval(timer);
  },[game.club,game.mentality]);
  const own=m.home.club===game.club?m.home:m.away;
  const error=substitutionError(m,game.club,out,incoming);
  const latest=m.events.slice(-1)[0];
  function change(next:LiveMatch){setReplay(null);current.current.m=next;onChange(next);}
  return <dialog ref={dialog} className={`match-dialog ${immersive?'match-immersive':''}`} aria-labelledby="match-title" onCancel={e=>{e.preventDefault();setPaused(true);setReplayPaused(true);}}>
    <header className="match-header"><div><span className="eyebrow">RODADA {m.round} · {game.year}</span><h2 id="match-title">Dia de jogo.</h2></div><span className="match-clock">{m.minute}′ <small>{m.phase==='halftime'?'Intervalo':m.phase==='full'?'Encerrado':m.phase==='first'?'1º tempo':'2º tempo'}</small></span></header>
    <div className="match-scoreboard"><span><FootballSprite id={`${clubs[m.home.club].id}.crest`} size={40}/><b>{clubs[m.home.club].name}</b></span><strong>{m.home.goals}<i>:</i>{m.away.goals}</strong><span><FootballSprite id={`${clubs[m.away.club].id}.crest`} size={40}/><b>{clubs[m.away.club].name}</b></span></div>
    <p className="match-save">Progresso: {saving}. <button className="text-button" onClick={onExport}>Exportar partida em andamento ↓</button></p>
    <div className="match-layout"><div><MatchCanvas key={replay?`replay-${replayId}`:'live'} match={replay??m} paused={paused} speed={speed} replay={!!replay} replayProgress={replayProgress} replayPlaying={!replayPaused} follow={follow} reducedMotion={reducedMotion} formation={game.formation} ownClub={game.club}/><div className="broadcast-toolbar"><button className="button" disabled={!m.events.some(e=>e.kind==='shot')} onClick={()=>openReplay(clips.at(-1)!.minute)}>Rever último lance</button><button className="button" aria-pressed={follow} onClick={()=>setFollow(v=>!v)}>{follow?'Câmera: acompanhar':'Câmera: geral'}</button><button className="button" aria-pressed={immersive} onClick={()=>setImmersive(v=>!v)}>{immersive?'Mostrar painel completo':'Ampliar transmissão'}</button>{replay&&<button className="button primary" onClick={()=>{setReplay(null);}}>Voltar à transmissão</button>}</div>{replay&&clip&&<section className="replay-desk" aria-label="Controles do replay"><div className="replay-context"><span>REPLAY · {clip.minute}′ · {clip.outcome}{clip.penalty?' · pênalti':''}</span><strong>{clip.player}</strong><small>{clubs[clip.club].name} · placar neste lance: {replay.home.goals} × {replay.away.goals}. O placar acima é o atual.</small></div><label>Lance para rever<select aria-label="Lance para rever" value={replay.minute} onChange={e=>openReplay(Number(e.target.value))}>{clips.map(c=><option value={c.minute} key={c.minute}>{c.minute}′ · {c.player} · {c.outcome}</option>)}</select></label><label className="replay-timeline">Posição do replay <output>{(replayProgress*6).toFixed(1)} / 6.0 s</output><input aria-label="Posição do replay" type="range" min="0" max="1000" value={Math.round(replayProgress*1000)} onChange={e=>{setReplayPaused(true);setReplayProgress(Number(e.target.value)/1000);}}/></label><div className="replay-buttons"><button className="button" disabled={clipIndex<=0} onClick={()=>openReplay(clips[clipIndex-1].minute)}>Lance anterior</button><button className="button primary" onClick={()=>{if(replayProgress>=1)setReplayProgress(0);setReplayPaused(p=>!p);}}>{replayProgress>=1?'Repetir replay':replayPaused?'Reproduzir replay':'Pausar replay'}</button><button className="button" disabled={clipIndex>=clips.length-1} onClick={()=>openReplay(clips[clipIndex+1].minute)}>Próximo lance</button><label>Ritmo<select aria-label="Velocidade do replay" value={replaySpeed} onChange={e=>setReplaySpeed(Number(e.target.value))}>{[.5,1,2].map(n=><option value={n} key={n}>{n}×</option>)}</select></label></div></section>}
      <p className="match-commentary" role="status">{replay?`Replay da finalização aos ${replay.minute} minutos. O relógio da partida está pausado.`:latest.text}</p>
      <div className="match-controls">{m.phase==='first'||m.phase==='second'?<><button className="button primary" onClick={()=>{setReplay(null);setPaused(p=>!p);}}>{paused?'Retomar partida':'Pausar'}</button><label>Velocidade<select aria-label="Velocidade da partida" value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[1,2,4,8].map(n=><option key={n} value={n}>{n}×</option>)}</select></label><button className="button" onClick={()=>change(skipPeriod(m,game.club,game.mentality))}>{m.phase==='first'?'Pular para o intervalo':'Pular para o apito final'}</button></>:m.phase==='halftime'?<button className="button primary" onClick={()=>{change(resumeMatch(m,game.club));setPaused(false);setOut('');setIncoming('');}}>Começar segundo tempo</button>:<button className="button primary" onClick={()=>onFinish(m)}>Encerrar partida e atualizar rodada</button>}</div>
      <p className="match-hint">1×: 30 segundos por tempo, além do intervalo. Pular mantém todos os lances e cartões. Esc pausa; voltar ao navegador não avança o relógio.</p>
      {m.phase==='halftime'&&<section className="halftime-panel"><span className="eyebrow">VESTIÁRIO · {m.changes.length}/5 TROCAS</span><h3>Quem volta para o segundo tempo?</h3><div className="substitution-selectors"><label>Sai<select aria-label="Jogador que sai" value={out} onChange={e=>setOut(e.target.value)}><option value="">Selecione um titular</option>{own.active.map(id=><option key={id} value={id}>{own.players.find(p=>p.id===id)!.name}{own.yellow[id]?' · amarelo':''}</option>)}</select></label><label>Entra<select aria-label="Jogador que entra" value={incoming} onChange={e=>setIncoming(e.target.value)}><option value="">Selecione um reserva</option>{own.players.filter(p=>!own.used.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name} · {p.position} · {p.skill}</option>)}</select></label></div><button className="button" disabled={!!error} onClick={()=>{change(substitute(m,game.club,out,incoming));setOut('');setIncoming('');}}>Confirmar substituição</button><p>{out&&incoming?error:'Até cinco trocas no intervalo. Quem sai não volta; expulsos não podem ser substituídos.'}</p></section>}
    </div><aside className="match-sidebar"><h3>O jogo em números</h3><div className="match-stats">{[['Finalizações',m.home.shots,m.away.shots],['Faltas',m.home.fouls,m.away.fouls],['Escanteios',m.home.corners,m.away.corners],['Amarelos',m.events.filter(e=>e.kind==='yellow'&&e.team===m.home.club).length,m.events.filter(e=>e.kind==='yellow'&&e.team===m.away.club).length],['Expulsões',m.home.sentOff.length,m.away.sentOff.length]].map(([label,a,b])=><div key={label}><b>{a}</b><span>{label}</span><b>{b}</b></div>)}</div><h3>Lance a lance</h3><ol className="match-events">{[...m.events].reverse().map((e,i)=><li key={`${m.events.length-i}`} className={`event-${e.kind}`}><time>{e.minute}′</time><span>{e.text}{e.kind==='shot'&&<button className="event-replay" aria-label={`Rever lance aos ${e.minute} minutos`} onClick={()=>openReplay(e.minute)}>Rever jogada ↗</button>}</span></li>)}</ol></aside></div>
  </dialog>;
}

