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
  function change(next:LiveMatch){current.current.m=next;onChange(next);}
  return <dialog ref={dialog} className="match-dialog" aria-labelledby="match-title" onCancel={e=>{e.preventDefault();setPaused(true);}}>
    <header className="match-header"><div><span className="eyebrow">RODADA {m.round} · {game.year}</span><h2 id="match-title">Dia de jogo.</h2></div><span className="match-clock">{m.minute}′ <small>{m.phase==='halftime'?'Intervalo':m.phase==='full'?'Encerrado':m.phase==='first'?'1º tempo':'2º tempo'}</small></span></header>
    <div className="match-scoreboard"><span><FootballSprite id={`${clubs[m.home.club].id}.crest`} size={40}/><b>{clubs[m.home.club].name}</b></span><strong>{m.home.goals}<i>:</i>{m.away.goals}</strong><span><FootballSprite id={`${clubs[m.away.club].id}.crest`} size={40}/><b>{clubs[m.away.club].name}</b></span></div>
    <p className="match-save">Progresso: {saving}. <button className="text-button" onClick={onExport}>Exportar partida em andamento ↓</button></p>
    <div className="match-layout"><div><MatchCanvas match={m} paused={paused} reducedMotion={reducedMotion} formation={game.formation} ownClub={game.club}/><p className="match-commentary" role="status">{latest.text}</p>
      <div className="match-controls">{m.phase==='first'||m.phase==='second'?<><button className="button primary" onClick={()=>setPaused(p=>!p)}>{paused?'Retomar partida':'Pausar'}</button><label>Velocidade<select aria-label="Velocidade da partida" value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[1,2,4,8].map(n=><option key={n} value={n}>{n}×</option>)}</select></label><button className="button" onClick={()=>change(skipPeriod(m,game.club,game.mentality))}>{m.phase==='first'?'Pular para o intervalo':'Pular para o apito final'}</button></>:m.phase==='halftime'?<button className="button primary" onClick={()=>{change(resumeMatch(m,game.club));setPaused(false);setOut('');setIncoming('');}}>Começar segundo tempo</button>:<button className="button primary" onClick={()=>onFinish(m)}>Encerrar partida e atualizar rodada</button>}</div>
      <p className="match-hint">1×: 30 segundos por tempo, além do intervalo. Pular mantém todos os lances e cartões. Esc pausa; voltar ao navegador não avança o relógio.</p>
      {m.phase==='halftime'&&<section className="halftime-panel"><span className="eyebrow">VESTIÁRIO · {m.changes.length}/5 TROCAS</span><h3>Quem volta para o segundo tempo?</h3><div className="substitution-selectors"><label>Sai<select aria-label="Jogador que sai" value={out} onChange={e=>setOut(e.target.value)}><option value="">Selecione um titular</option>{own.active.map(id=><option key={id} value={id}>{own.players.find(p=>p.id===id)!.name}{own.yellow[id]?' · amarelo':''}</option>)}</select></label><label>Entra<select aria-label="Jogador que entra" value={incoming} onChange={e=>setIncoming(e.target.value)}><option value="">Selecione um reserva</option>{own.players.filter(p=>!own.used.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name} · {p.position} · {p.skill}</option>)}</select></label></div><button className="button" disabled={!!error} onClick={()=>{change(substitute(m,game.club,out,incoming));setOut('');setIncoming('');}}>Confirmar substituição</button><p>{out&&incoming?error:'Até cinco trocas no intervalo. Quem sai não volta; expulsos não podem ser substituídos.'}</p></section>}
    </div><aside className="match-sidebar"><h3>O jogo em números</h3><div className="match-stats">{[['Finalizações',m.home.shots,m.away.shots],['Faltas',m.home.fouls,m.away.fouls],['Escanteios',m.home.corners,m.away.corners],['Amarelos',m.events.filter(e=>e.kind==='yellow'&&e.team===m.home.club).length,m.events.filter(e=>e.kind==='yellow'&&e.team===m.away.club).length],['Expulsões',m.home.sentOff.length,m.away.sentOff.length]].map(([label,a,b])=><div key={label}><b>{a}</b><span>{label}</span><b>{b}</b></div>)}</div><h3>Lance a lance</h3><ol className="match-events">{[...m.events].reverse().map((e,i)=><li key={`${m.events.length-i}`} className={`event-${e.kind}`}><time>{e.minute}′</time><span>{e.text}</span></li>)}</ol></aside></div>
  </dialog>;
}

