import { useEffect, useRef, useState } from 'react';
import type { Cell, Location, Target, Player } from '../game/data.ts';
import { RoomEngine, unproject } from '../game/navigation.ts';
import { drawRoom, hitTarget } from './render.ts';
import { loadTilesets } from './tilesets.ts';
import type { TileAtlas } from './tilesets.ts';
import { loadCharacters } from './characters.ts';
import type { CharacterAtlas } from './characters.ts';
import {sceneToWorld} from '../game/scene-camera.ts';
import {trainingRoster} from '../game/training-roster.ts';
import {project} from '../game/navigation.ts';
import './training.css';

interface Props {
  location: Location; cell: Cell; blocked: boolean; talking:boolean; order: {target:Target;sequence:number} | null;
  trainingPlayers:Player[]; reducedMotion?:boolean; onPlayer?:(id:string)=>void;
  onCell: (cell: Cell)=>void; onInteraction:(id:string)=>void; onTravel:(location:Location)=>void;
  onStatus:(text:string)=>void;
}

export function RoomCanvas(props: Props) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const engine=useRef<RoomEngine | null>(null);
  const current=useRef(props);
  current.current=props;
  const hovered=useRef<string | null>(null);
  const [hoverName,setHoverName]=useState('');
  const atlas=useRef<TileAtlas|null>(null);
  const characters=useRef<CharacterAtlas|null>(null);
  const clock=useRef(0);
  const [selectedPlayer,setSelectedPlayer]=useState('');
  const [trainingState,setTrainingState]=useState<'loading'|'ready'|'error'|'unused'>(props.location==='training'?'loading':'unused');
  const [characterState,setCharacterState]=useState<'loading'|'ready'|'error'>('loading');
  const [artState,setArtState]=useState<'loading'|'ready'|'error'>('loading');
  useEffect(()=>{
    let active=true;
    loadTilesets().then(value=>{if(active){atlas.current=value;setArtState('ready');}}).catch(()=>{if(active)setArtState('error');});
    loadCharacters().then(value=>{if(active){characters.current=value;setCharacterState('ready');if(props.location==='training')setTrainingState('ready');}}).catch(()=>{if(active){setCharacterState('error');if(props.location==='training')setTrainingState('error');}});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    const model=new RoomEngine(props.location,props.cell);
    engine.current=model;
    const ctx=canvas.current!.getContext('2d',{alpha:false})!;
    ctx.imageSmoothingEnabled=false;
    let frame=0,last=performance.now(),active=true,sceneTime=0,previousBlocked=false;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const animate=(now:number)=>{
      if (!active) return;
      if(!current.current.blocked&&!reducedMotion.matches&&!current.current.reducedMotion)sceneTime+=Math.max(0,Math.min((now-last)/1000,.05));
      if (!current.current.blocked) for (const event of model.tick((now-last)/1000)) {
        if (event.type==='cell') current.current.onCell(event.cell);
        if (event.type==='interaction') current.current.onInteraction(event.id);
        if (event.type==='travel') current.current.onTravel(event.location);
      }
      last=now;
      clock.current=sceneTime;
      if(!current.current.blocked||!previousBlocked)drawRoom(ctx,model,hovered.current,atlas.current,characters.current,current.current.talking,sceneTime,current.current.trainingPlayers,selected.current);
      previousBlocked=current.current.blocked;
      frame=requestAnimationFrame(animate);
    };
    frame=requestAnimationFrame(animate);
    return ()=>{active=false;cancelAnimationFrame(frame);engine.current=null;};
    // Position is persisted at each safe waypoint; do not recreate on every step.
  },[props.location]);
  useEffect(()=>{
    if (props.order && !props.blocked && engine.current) {
      if (engine.current.orderTarget(props.order.target)) props.onStatus(`Indo até ${props.order.target.label?.toLocaleLowerCase('pt-BR')}…`);
      else props.onStatus('Não há passagem até esse ponto.');
    }
  },[props.order]);
  function point(event: React.PointerEvent<HTMLCanvasElement>): Cell {
    const bounds=event.currentTarget.getBoundingClientRect();
    return sceneToWorld(props.location,[(event.clientX-bounds.left)*640/bounds.width,(event.clientY-bounds.top)*360/bounds.height]);
  }
  const selected=useRef('');selected.current=selectedPlayer;
  const trainees=props.location==='training'?trainingRoster(props.trainingPlayers,0):[];
  return <><div className="scene-frame">
    <div className="scene-corner"><span className="live-dot"/> SANTA AURORA · 2027</div>
    <canvas ref={canvas} width={640} height={360} data-art-state={artState} data-character-state={characterState} data-training-state={trainingState} data-training-count={trainees.length} aria-label="Ambiente isométrico. Clique no chão para andar ou nos pontos dourados para interagir. Os mesmos pontos estão disponíveis nos botões ao lado."
      onPointerMove={event=>{const p=point(event),target=engine.current?hitTarget(engine.current,p):null;const athlete=props.location==='training'?trainingRoster(props.trainingPlayers,clock.current).find(a=>{const q=project(a.cell);return Math.abs(q[0]-p[0])<12&&p[1]<=q[1]&&p[1]>q[1]-42;}):null;hovered.current=target?.id??athlete?.id??null;setHoverName(target?.label??(athlete?`${athlete.name} · ${athlete.drill}`:''));}}
      onPointerLeave={()=>{hovered.current=null;setHoverName('');}}
      onPointerDown={event=>{
        if (props.blocked || !engine.current || event.button!==0) return;
        const p=point(event),target=hitTarget(engine.current,p);
        const athlete=props.location==='training'?trainingRoster(props.trainingPlayers,clock.current).find(a=>{const q=project(a.cell);return Math.abs(q[0]-p[0])<12&&p[1]<=q[1]&&p[1]>q[1]-42;}):null;
        if(athlete&&props.onPlayer){setSelectedPlayer(athlete.id);props.onPlayer(athlete.id);return;}
        if (target) {engine.current.orderTarget(target);props.onStatus(`Indo até ${target.label?.toLocaleLowerCase('pt-BR')}…`);}
        else {const tile=unproject(p).map(Math.floor) as Cell;if (!engine.current.orderCell(tile)) props.onStatus('Escolha um ponto livre no chão.');else props.onStatus('Caminhando…');}
      }} />
    <div className="scene-caption"><span>{artState==='error'?'Falha ao carregar a arte. Recarregue para tentar novamente.':characterState==='error'?'Falha ao carregar os personagens. Recarregue para tentar novamente.':trainingState==='error'?'Falha ao carregar as poses de treino. Recarregue para tentar novamente.':artState==='loading'||characterState==='loading'||trainingState==='loading'?'Carregando pixel art…':hoverName||(props.location==='training'?'Treino em andamento · passes, finalização e preparação física.':'Seu próximo passo começa aqui.')}</span><span>CLIQUE PARA EXPLORAR ↗</span></div>
  </div>{props.location==='training'&&<section className="training-roster-panel"><div className="training-roster-heading"><strong>{trainees.length}/{props.trainingPlayers.length} atletas em treino</strong><span>Selecione um nome para localizar no campo</span></div><div className="training-roster-list">{trainees.map(a=><button key={a.id} aria-pressed={a.id===selectedPlayer} onClick={()=>setSelectedPlayer(a.id===selectedPlayer?'':a.id)}><b>{a.number}</b><span>{a.name}<small>{a.position} · {a.drill}</small></span></button>)}</div>{selectedPlayer&&props.onPlayer&&<div className="training-talk-action"><span>{trainees.find(a=>a.id===selectedPlayer)?.name} · disponível na pausa</span><button className="button" onClick={()=>props.onPlayer!(selectedPlayer)}>Conversar com o atleta ↗</button></div>}<p>Todos participam, incluindo reservas e contratações. Os exercícios são visuais; os bônus continuam na ação de treino da gestão.</p></section>}</>;
}
