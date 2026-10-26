import competition from '../../../data/competitions/regional_demo.json' with { type: 'json' };
import environments from '../../../data/locations/environments.json' with { type: 'json' };
import narrative from '../../../data/narrative/first_steps.json' with { type: 'json' };
import catalog from '../../../data/football/asset-catalog-v1.json' with { type: 'json' };

export type Cell = [number, number];
export type Location = 'apartment' | 'office' | 'training';
export type Action = 'read_notebook' | 'accept_task' | 'observe_davi' | 'deliver_report';
export interface Player { id: string; name: string; position: string; age: number; skill: number; condition: number }
export interface Club { id: string; name: string; short: string; city: string; strength: number; colors: string[] }
export interface Prop { id: string; cell: Cell; size: Cell; height: number; color: string; kind: string; label?: string; interaction?: string; destination?: Location }
export interface NPC { id: string; cell: Cell; label: string; interaction: string; shirt: string; hair: string }
export type Target = Prop | NPC;
export interface Room { name: string; subtitle: string; floor: string; wall: string; spawn: Cell; size?:Cell; props: Prop[]; npcs: NPC[] }
export interface Choice { label: string; action: Action | 'close' | 'management' }
export interface Dialogue { speaker: string; text: string; choices: Choice[] }
export interface Effect { flag: string; xp?: number; analysis?: number; communication?: number; trust?: number; note: string }

export const clubs: Club[] = catalog.clubs.map((club,index)=>({...club,...competition.clubs[index],id:club.id,short:competition.clubs[index]?.short??['MCO','SCO','SPE','FCE','RBA','FEN','BVA','VNE'][index-4],city:competition.clubs[index]?.city??['Costa Coral','Serra do Cobre','Pedra Clara','Vila Cerrado','Barro Novo','Enseada Azul','Vale das Rotas','Vila Neon'][index-4],strength:competition.clubs[index]?.strength??[65,68,69,66,64,70,67,68][index-4]}));
export const players: Player[] = competition.players;
const firstNames=['Mateus','João','Samuel','Diego','Renato','Felipe','Ícaro','Tiago','Danilo','Gabriel','Eduardo','Vítor','Leandro','Marcos','Otávio','Nicolas','César','Bento'];
const surnames=['Nunes','Ramos','Alves','Lima','Barros','Tavares','Santos','Prado','Pires','Rocha','Duarte','Leal','Castro','Sales','Paiva','Matos','Freitas','Amaral'];
export function squadFor(club:number): Player[] {
  if(club===0)return players;
  return players.map((p,index)=>({...p,id:`${clubs[club].id}_${p.id}`,name:`${firstNames[(index+club*3)%18]} ${surnames[(index*5+club)%18]}`,age:19+(index*3+club)%17,skill:Math.max(40,Math.min(90,p.skill-67+clubs[club].strength)),condition:100}));
}
export const rooms = environments as unknown as Record<Location, Room>;
export const story = narrative as unknown as {
  start_note: string;
  objectives: Record<string, string>;
  dialogues: Record<string, Dialogue>;
  effects: Record<Action, Effect>;
};
export const locationIds = Object.keys(rooms) as Location[];
export const actions = Object.keys(story.effects) as Action[];
export const formations = ['4-4-2', '4-3-3', '3-5-2'] as const;
export const mentalities = ['Defensiva', 'Equilibrada', 'Ofensiva'] as const;
export const fixtures: [number, number][][] = [
  [[0,1],[2,3]], [[0,2],[3,1]], [[3,0],[1,2]],
  [[1,0],[3,2]], [[2,0],[1,3]], [[0,3],[2,1]],
];
/** Circle schedule: each pair meets once per half; home/away reverse after 11 rounds. */
export function schedule(size:number): [number,number][][] {
  if(size===4)return fixtures;
  let ring=Array.from({length:size},(_,i)=>i);
  const first:[number,number][][]=[];
  for(let round=0;round<size-1;round++){
    first.push(Array.from({length:size/2},(_,i)=>round%2?[ring[size-1-i],ring[i]]:[ring[i],ring[size-1-i]]) as [number,number][]);
    ring=[ring[0],ring[size-1],...ring.slice(1,-1)];
  }
  return [...first,...first.map(pairs=>pairs.map(([home,away])=>[away,home] as [number,number]))];
}
