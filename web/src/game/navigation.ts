import { rooms } from './data.ts';
import type { Cell, Location, Target } from './data.ts';
import { directionFromVector } from './character-motion.ts';
import type { Direction } from './character-motion.ts';

export const origin: Cell = [280, 53];
export const project = ([x,y]: Cell): Cell => [origin[0] + (x-y)*32, origin[1] + (x+y)*16];
export const unproject = ([x,y]: Cell): Cell => [(x-origin[0])/64 + (y-origin[1])/32, (y-origin[1])/32 - (x-origin[0])/64];
export const center = ([x,y]: Cell): Cell => project([x+.5,y+.5]);
export const equal = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const key = (cell: Cell) => cell.join(',');
const neighbors = ([x,y]: Cell): Cell[] => [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];

export function walkable(location: Location, [x,y]: Cell): boolean {
  const room = rooms[location];
  const [width,height]=room.size??[9,7];
  if (!Number.isInteger(x) || !Number.isInteger(y) || x<0 || y<0 || x>=width || y>=height) return false;
  if (room.npcs.some(npc => equal(npc.cell,[x,y]))) return false;
  return !room.props.some(prop => Math.abs(x-prop.cell[0]) <= prop.size[0]/2+.15 && Math.abs(y-prop.cell[1]) <= prop.size[1]/2+.15);
}

export function route(location: Location, from: Cell, to: Cell): Cell[] {
  if (!walkable(location,from) || !walkable(location,to)) return [];
  const queue: Cell[] = [from];
  const parents = new Map<string, Cell | null>([[key(from),null]]);
  for (let index=0; index<queue.length; index++) {
    const cell = queue[index];
    if (equal(cell,to)) {
      const path: Cell[] = [];
      let current: Cell | null = cell;
      while (current) { path.unshift(current); current = parents.get(key(current)) ?? null; }
      return path;
    }
    for (const next of neighbors(cell)) {
      if (walkable(location,next) && !parents.has(key(next))) { parents.set(key(next),cell); queue.push(next); }
    }
  }
  return [];
}

export function approach(location: Location, from: Cell, target: Cell): Cell[] {
  return neighbors(target).map(cell=>route(location,from,cell)).filter(path=>path.length).sort((a,b)=>a.length-b.length)[0] ?? [];
}

export type RoomEvent = { type: 'cell'; cell: Cell } | { type: 'interaction'; id: string } | { type: 'travel'; location: Location };

export class RoomEngine {
  location: Location;
  cell: Cell;
  position: Cell;
  path: Cell[] = [];
  pending: Target | null = null;
  destination: Cell | null = null;
  step = 0;
  facing = 1;
  direction:Direction='se';
  constructor(location: Location, cell: Cell) {
    this.location=location;
    this.cell=[...cell];
    this.position=center(cell);
  }
  orderTarget(target: Target) {
    const path=approach(this.location,this.path[0] ?? this.cell,target.cell);
    if (!path.length) return false;
    this.path=path;
    this.pending=target;
    this.destination=null;
    return true;
  }
  orderCell(cell: Cell) {
    const path=route(this.location,this.path[0] ?? this.cell,cell);
    if (!path.length) return false;
    this.path=path;
    this.pending=null;
    this.destination=center(cell);
    return true;
  }
  tick(delta: number): RoomEvent[] {
    if (!this.path.length) return [];
    const goal=center(this.path[0]);
    const dx=goal[0]-this.position[0], dy=goal[1]-this.position[1];
    const distance=Math.hypot(dx,dy);
    const travel=Math.max(0,Math.min(delta,.05))*155;
    this.step+=Math.max(0,Math.min(delta,.05))*12;
    if (Math.abs(dx)>.01) this.facing=dx>=0?1:-1;
    this.direction=directionFromVector(dx,dy,this.direction);
    if (distance>travel) {
      this.position=[this.position[0]+dx/distance*travel,this.position[1]+dy/distance*travel];
      return [];
    }
    this.position=goal;
    this.cell=this.path.shift()!;
    const events: RoomEvent[]=[{type:'cell',cell:this.cell}];
    if (!this.path.length) {
      this.step=0;
      this.destination=null;
      const target=this.pending;
      this.pending=null;
      if(target){const point=center(target.cell);this.direction=directionFromVector(point[0]-this.position[0],point[1]-this.position[1],this.direction);}
      if (target && 'destination' in target && target.destination) events.push({type:'travel',location:target.destination});
      else if (target?.interaction) events.push({type:'interaction',id:target.interaction});
    }
    return events;
  }
}
