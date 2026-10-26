import { useState } from 'react';
import catalog from '../../../data/football/asset-catalog-v1.json';
import { downloadFootballSprite, FootballSprite, footballManifest, footballSheet } from './FootballSprite.tsx';
import { Modal } from '../ui/Modal.tsx';
import './football.css';

export function FootballLibrary() {
  const [category,setCategory]=useState('identity');
  const [selected,setSelected]=useState<string|null>(null);
  const [error,setError]=useState('');
  const group=catalog.categories.find(group=>group.id===category)!;
  const item=selected?catalog.categories.flatMap(group=>group.items).find(item=>item.id===selected):null;
  const frame=selected?footballManifest.frames[selected]:null;
  return <>
    <div className="page-title"><span className="eyebrow">BIBLIOTECA DE PIXEL ART · {catalog.categories.reduce((total,group)=>total+group.items.length,0)} ELEMENTOS</span><h1>O futebol tem suas cores.</h1><p>Estádios, clubes, uniformes e a gente que faz o jogo acontecer.</p></div>
    <div className="football-tabs" aria-label="Categorias de arte">{catalog.categories.map(group=><button key={group.id} aria-label={group.title} aria-pressed={category===group.id} onClick={()=>setCategory(group.id)}>{group.title}<span>{group.items.length}</span></button>)}</div>
    <div className="football-library-header"><div><h2>{group.title}</h2><p>{group.brief}</p></div><a className="button" download={`${category}-v1.png`} href={footballSheet(category)}>Baixar atlas PNG ↓</a></div>
    <div className="football-asset-grid">{group.items.map(item=><button className="football-asset-card" key={item.id} onClick={()=>{setSelected(item.id);setError('');}} aria-label={`Ver ${item.label}`}><span className="football-asset-preview"><FootballSprite id={item.id} size={120}/></span><strong>{item.label}</strong><small>{footballManifest.frames[item.id].w} × {footballManifest.frames[item.id].h} px <span>↗</span></small></button>)}</div>
    <p className="football-library-note">Coleção de assets estáticos. Em Mundo do futebol, os cenários têm ações de treino, torcida, estádio e várzea. A caminhada com personagem continua nos três ambientes originais. A torcida ainda não tem animação. <a href={`${import.meta.env.BASE_URL}football/manifest-v1.json`} download="football-manifest-v1.json">Baixar mapa de recortes JSON</a></p>
    {item&&frame&&<Modal title={item.label} eyebrow="ATLAS DE FUTEBOL · v1" onClose={()=>setSelected(null)}><div className="football-detail-preview"><FootballSprite id={item.id} size={220} label={item.label}/></div><p>{frame.w} × {frame.h} pixels · PNG com transparência · perspectiva {['crest','shirt','flag'].includes(item.kind)?'frontal para interface':'isométrica para cenários'}.</p><p className="football-id">ID: {item.id} · pivô [{frame.pivot.join(', ')}]</p>{error&&<p role="alert">{error}</p>}<div className="button-row"><button className="button primary" onClick={()=>void downloadFootballSprite(item.id).catch(()=>setError('O PNG não carregou. Tente novamente.'))}>Baixar elemento PNG</button><button className="button" onClick={()=>setSelected(null)}>Voltar à coleção</button></div></Modal>}
  </>;
}
