import {payroll,management} from '../game/management.ts';
import { useState } from 'react';
import { clubs } from '../game/data.ts';
import { attendance, calendar, capacity, preparationError, upgradeCost } from '../game/domain.ts';
import type { Game, Preparation } from '../game/domain.ts';
import { FootballSprite } from '../art/FootballSprite.tsx';
import catalog from '../../../data/football/asset-catalog-v1.json';
import './football-world.css';

export const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const areas=[
  {id:'stadiums',title:'Estádio',subtitle:'Bilheteria, estrutura e mando de campo.',sprite:'aurora.stadium'},
  {id:'facilities',title:'Sede e CT',subtitle:'Treino, recuperação e desenvolvimento.',sprite:'club.reception'},
  {id:'crowd',title:'Praça da torcida',subtitle:'Apoio que chega às arquibancadas.',sprite:'aurora.supporters_flags'},
  {id:'varzea',title:'Campo de várzea',subtitle:'Observe talentos e reforce o elenco.',sprite:'varzea.pitch'},
] as const;
type Area=typeof areas[number]['id'];
export function FootballWorld({game,onPrepare,onUpgrade,onTicket,onRoom}:{game:Game;onPrepare:(action:Preparation)=>void;onUpgrade:(kind:'stadium'|'academy')=>void;onTicket:(price:number)=>void;onRoom:()=>void}) {
  const [area,setArea]=useState<Area|null>(null),[selected,setSelected]=useState('');
  const club=clubs[game.club],group=catalog.categories.find(group=>group.id===area);
  const ended=game.round>=calendar(game).length;
  function action(id:Preparation,label:string,description:string){const reason=preparationError(game,id);return <div className="preparation-action" key={id}><button className="button primary" disabled={!!reason} onClick={()=>onPrepare(id)}>{label}</button><p>{reason||description}</p></div>;}
  return <>
    <div className="page-title"><span className="eyebrow">{club.name.toUpperCase()} · FUTEBOL POR CLIQUES</span><h1>O clube vive aqui.</h1><p>Entre nos locais, prepare sua equipe e leve as decisões para a rodada.</p></div>
    <div className="football-resources" aria-label="Recursos do clube"><div><small>CAIXA</small><strong>{money(game.cash)}</strong></div><div><small>AÇÕES DA RODADA</small><strong>{3-game.preparation.length} / 3</strong></div><div><small>CONDIÇÃO</small><strong>{game.fitness}%</strong></div><div><small>APOIO</small><strong>{game.support} / 100</strong></div></div>
    <div className="football-destinations">{areas.map(place=><button key={place.id} aria-label={`Entrar · ${place.title}`} aria-pressed={place.id===area} onClick={()=>{setArea(place.id);setSelected('');}}><FootballSprite id={place.id==='stadiums'?`${clubs[game.club%4].id}.stadium`:place.id==='crowd'?`${clubs[game.club%4].id}.supporters_flags`:place.sprite} size={96}/><strong>Entrar · {place.title}</strong><small>{place.subtitle}</small></button>)}</div>
    {!area&&<p className="football-library-note">Escolha um local acima. Cada rodada oferece três ações de preparação. Jogar a rodada renova as ações e encerra o bônus de treino.</p>}
    {area&&group&&<div className="football-place"><section><div className="section-heading"><h2>{areas.find(place=>place.id===area)!.title}</h2><span className="eyebrow">CLIQUE NOS ELEMENTOS</span></div>
      <div className={`football-island ${area}`} aria-label={`Cenário isométrico · ${group.title}`}>
        <svg className="island-ground" viewBox="0 0 640 420" aria-hidden="true"><path d="M20 180 320 30 620 180 320 330Z" fill={area==='varzea'?'#aa895e':'#829b77'} stroke="#567064" strokeWidth="3"/><path d="M20 180v24l300 150 300-150v-24L320 330Z" fill="#566c56"/><path d="m80 180 240-120 240 120-240 120Z" fill="none" stroke="#ccd2a3" strokeDasharray="4 8"/></svg>
        {group.items.map((item,index)=>{const row=Math.floor(index/4),col=index%4;return <button key={item.id} className={`island-prop ${selected===item.id?'selected':''}`} style={{left:`${50+(col-row)*12}%`,top:`${9+(col+row)*11}%`}} aria-label={`Examinar ${item.label}`} title={item.label} onClick={()=>setSelected(item.id)}><FootballSprite id={item.id} size={area==='crowd'?62:78}/><span>●</span></button>;})}
      </div><p className="selected-prop" aria-live="polite">{group.items.find(item=>item.id===selected)?.label??'Clique em uma peça do cenário para identificá-la.'}</p><p className="fine-print">Vista de instalações por clique. As quatro arquiteturas e as paletas de torcida são compartilhadas entre os 12 clubes; cada clube mantém seu próprio brasão e uniforme.</p>
    </section><aside className="football-decisions">
      {area==='stadiums'&&<><h3>Preparar o mando</h3><p>Capacidade: <strong>{capacity(game).toLocaleString('pt-BR')}</strong> · Público previsto: <strong>{attendance(game).toLocaleString('pt-BR')}</strong>.</p><label>Preço do ingresso<select aria-label="Preço do ingresso" value={game.ticket} disabled={ended} onChange={e=>onTicket(Number(e.target.value))}>{[10,20,30].map(price=><option key={price} value={price}>{money(price)}</option>)}</select></label><p>Previsão bruta em casa: {money(attendance(game)*game.ticket)}. Ingresso caro reduz a procura. Jogos fora não geram bilheteria.</p><button className="button" disabled={ended||game.stadium>=3||game.cash<upgradeCost(game,'stadium')} onClick={()=>onUpgrade('stadium')}>Ampliar estádio · {money(upgradeCost(game,'stadium'))}</button><p>Nível {game.stadium}/3. Cada ampliação acrescenta 1.500 lugares, sem consumir ação.</p></>}
      {area==='facilities'&&<><h3>Preparar a equipe</h3>{action('train','Treinar a equipe',`+${3+game.academy} de força nesta rodada; −6 de condição.`)}{action('rest','Recuperar a equipe','+12 de condição, até 100. Não custa dinheiro.')}<button className="button" disabled={ended||game.academy>=3||game.cash<upgradeCost(game,'academy')} onClick={()=>onUpgrade('academy')}>Melhorar CT · {money(upgradeCost(game,'academy'))}</button><p>CT nível {game.academy}/3. Cada nível melhora o bônus de treino e os talentos da várzea.</p><button className="text-button" onClick={onRoom}>Entrar na diretoria e conversar ↗</button></>}
      {area==='crowd'&&<><h3>Construir apoio</h3><FootballSprite id={`${club.id}.flag`} size={96}/>{action('fans','Encontrar a torcida · R$ 1.000','+10 de apoio permanente, até 100. Consome uma ação.')}<p>Mais apoio aumenta o público e a chance de marcar em casa. Vitória dá +3 de apoio; derrota tira 2. Os grupos desenhados são estáticos.</p></>}
      {area==='varzea'&&<><h3>Talentos do bairro</h3>{action('scout','Observar e contratar · R$ 1.500','Contrata um reserva de 62–76 de força, conforme rodada e CT. Consome uma ação.')}<p>{game.recruits.length}/6 recrutamentos da várzea realizados. O novo atleta aparece no Elenco e pode entrar na Escalação. As posições de troca são livres.</p>{game.recruits.filter(player=>!management(game).sold.includes(player.id)).map(player=><p key={player.id}><strong>{player.name}</strong> · {player.position} · força {player.skill}</p>)}</>}
    </aside></div>}
    <section className="football-ledger"><h2>Movimento do caixa</h2><p>A cada rodada: R$ 2.500 de cota. Operação: R$ 900 + folha de {money(payroll(game))}. Despesas pendentes: {money(management(game).debt)}. O saldo não pago é cobrado na próxima rodada e impede novas contratações.</p>{game.ledger.length?<ul>{game.ledger.slice(-8).reverse().map((entry,index)=><li key={index}><span>R{entry.round} · {entry.label}</span><strong>{money(entry.amount)}</strong></li>)}</ul>:<p>Nenhum lançamento ainda. O clube começa com R$ 18.000.</p>}</section>
  </>;
}
