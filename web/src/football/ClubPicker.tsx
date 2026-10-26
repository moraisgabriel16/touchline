import { clubs } from '../game/data.ts';
import { FootballSprite } from '../art/FootballSprite.tsx';
export function ClubPicker({onSelect}:{onSelect:(club:number)=>void}){
  return <><p>Escolha o clube da nova carreira. Todos têm 18 atletas, caixa de R$ 18.000 e instalações iniciais iguais. A força dos elencos varia. A partida atual só será substituída após confirmar.</p><div className="club-picker">{clubs.map((club,index)=><button key={club.id} onClick={()=>onSelect(index)} aria-label={`Escolher ${club.name}`}><FootballSprite id={`${club.id}.crest`} size={64}/><strong>{club.name}</strong><small>{club.city} · força base {club.strength}</small><span className="picker-kits"><FootballSprite id={`${club.id}.home`} size={44}/><FootballSprite id={`${club.id}.away`} size={44}/></span></button>)}</div></>;
}
