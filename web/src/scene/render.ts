import {interiorDetails,deskChair} from './interior-details.ts';
import { center, origin, project } from '../game/navigation.ts';
import { rooms } from '../game/data.ts';
import type { Cell, Location, Prop, Target, Player } from '../game/data.ts';
import type { RoomEngine } from '../game/navigation.ts';
import type { TileAtlas } from './tilesets.ts';
import type { CharacterAtlas } from './characters.ts';
import { directionFromVector } from '../game/character-motion.ts';
import {drawTrainingRoom} from './training-room.ts';

const color = (hex: string) => `#${hex}`;
function shade(hex: string, amount: number) {
  const n=parseInt(hex,16);
  return `rgb(${[n>>16,(n>>8)&255,n&255].map(value=>Math.round(value*amount)).join(',')})`;
}
function polygon(ctx: CanvasRenderingContext2D, points: Cell[], fill: string, stroke?: string) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();
  if (stroke) {ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
function line(ctx: CanvasRenderingContext2D,a: Cell,b: Cell,stroke: string,width=1) {
  ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();
}
function local([x,y]: Cell): Cell {return [(x-y)*32,(x+y)*16];}
export function corners(prop: Prop): Cell[] {
  const [sx,sy]=prop.size, p=center(prop.cell);
  return [[-sx/2,-sy/2],[sx/2,-sy/2],[sx/2,sy/2],[-sx/2,sy/2]].map(v=>{const point=local(v as Cell);return [p[0]+point[0],p[1]+point[1]];});
}
function inside(point: Cell, poly: Cell[]) {
  let result=false;
  for (let i=0,j=poly.length-1;i<poly.length;j=i++) {
    const [xi,yi]=poly[i],[xj,yj]=poly[j];
    if (((yi>point[1])!==(yj>point[1])) && point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi) result=!result;
  }
  return result;
}
export const targetsFor = (engine: RoomEngine): Target[] => [...rooms[engine.location].props.filter(p=>p.label),...rooms[engine.location].npcs];
export function hitTarget(engine: RoomEngine, point: Cell): Target | null {
  const sorted=targetsFor(engine).sort((a,b)=>center(b.cell)[1]-center(a.cell)[1]);
  return sorted.find(target=>{
    const p=center(target.cell), h='height' in target?target.height:40;
    if (Math.abs(point[0]-p[0])<12 && Math.abs(point[1]-(p[1]-h-12))<10) return true;
    if ('size' in target) {
      const b=corners(target),t=b.map(([x,y])=>[x,y-target.height] as Cell);
      return inside(point,[t[0],t[1],b[1],b[2],b[3],t[3]]);
    }
    return point[0]>=p[0]-13 && point[0]<=p[0]+13 && point[1]>=p[1]-43 && point[1]<=p[1]+4;
  }) ?? null;
}
function propSprite(ctx: CanvasRenderingContext2D,prop: Prop,highlight: boolean,location:Location,atlas:TileAtlas|null) {
  const b=corners(prop),t=b.map(([x,y])=>[x,y-prop.height] as Cell),p=center(prop.cell);
  if(atlas) {
    const sheet=location==='apartment'?'residential':location==='office'?'club':'training';
    const sprite=prop.kind==='bed'?'residential.bed':prop.kind==='desk'?`${sheet}.desk`:prop.kind==='cabinet'?`${sheet}.${location==='apartment'?'wardrobe':'cabinet'}`:prop.kind==='plant'?`${sheet}.plant`:prop.kind==='box'?`${location==='training'?'training':'residential'}.box`:prop.kind==='bench'?'training.bench':`${sheet}.${location==='apartment'?'door_panel':'door'}`;
    polygon(ctx,b.map(([x,y])=>[x+2,y+2]),highlight?'rgba(229,184,105,.25)':'rgba(14,30,27,.14)',highlight?'#e2bc78':undefined);
    if(prop.kind==='desk')deskChair(ctx,prop.cell);
    atlas.draw(ctx,sprite,p,prop.kind==='door'&&location==='apartment'?{w:45,h:65,pivot:[22,54]}:{});
    return;
  }
  polygon(ctx,b.map(([x,y])=>[x+3,y+4]),'rgba(14,30,27,.19)');
  polygon(ctx,[b[1],b[2],t[2],t[1]],shade(prop.color,.72));
  polygon(ctx,[b[2],b[3],t[3],t[2]],shade(prop.color,.55));
  polygon(ctx,t,color(prop.color),highlight?'#ffe0a0':shade(prop.color,1.13));
  ctx.save();ctx.translate(...p);
  const h=prop.height;
  const rect=(x:number,y:number,w:number,height:number,fill:string)=>{ctx.fillStyle=fill;ctx.fillRect(x,y,w,height);};
  if (prop.kind==='bed') {
    polygon(ctx,[[-prop.size[0]*16,-h-10],[0,-h-23],[prop.size[0]*16,-h-10],[0,-h+2]],'#e8dcc1');
    for (let i=0;i<3;i++) line(ctx,[-19+i*5,10-h],[20+i*5,-10-h],'#94aaa1');
  }
  if (prop.kind==='desk') {
    rect(-13,-h-16,25,16,'#203c47');rect(-11,-h-14,21,11,'#8cb8b1');
    polygon(ctx,[[-16,2-h],[9,-10-h],[19,-5-h],[-6,7-h]],'#e2d2ae');
    line(ctx,[-11,3-h],[6,-5-h],'#a19c83');
  }
  if (prop.kind==='box') {
    line(ctx,[0,-h-6],[0,-h+5],'#f1d39a',3);
    rect(-4,-h+7,8,3,'#674e35');
  }
  if (prop.kind==='plant') {
    rect(-1,-h-23,3,25,'#536a41');
    for (const [x,y] of [[-10,-23],[1,-31],[-7,-39]]) {rect(x,y-h,12,7,'#708f62');rect(x+2,y-h,8,3,'#93a879');}
  }
  if (prop.kind==='cabinet') {line(ctx,[0,-h+12],[0,5],shade(prop.color,.45));rect(5,-12,2,5,'#d9b779');}
  if (prop.kind==='door') {rect(-10,-h+3,20,h-3,'#1c3838');rect(5,-h/2,3,3,'#f4d491');line(ctx,[-11,-h],[-11,3],'#d4b788',2);}
  ctx.restore();
}
function person(ctx: CanvasRenderingContext2D,position: Cell,shirt: string,hair: string,step=0,facing=1) {
  ctx.save();ctx.translate(Math.round(position[0]),Math.round(position[1]));
  polygon(ctx,[[-11,0],[0,-4],[11,0],[0,5]],'rgba(16,34,31,.28)');
  const s=Math.round(Math.sin(step)*2);
  const rect=(x:number,y:number,w:number,h:number,fill:string)=>{ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);};
  rect(-6,-12,5,12+s,'#293e4e');rect(1,-12,5,12-s,'#293e4e');
  rect(-7,-1+s,6,3,'#172a34');rect(1,-1-s,7,3,'#172a34');
  rect(-8,-27,16,16,color(shirt));rect(-8,-26,4,14,shade(shirt,.8));rect(-3,-27,6,3,'#eee0bd');
  rect(-11,-23+s,4,13,'#bb8766');rect(8,-23-s,4,13,'#d6a17b');
  rect(-6,-38,13,13,'#d6a17b');rect(-7,-40,14,6,color(hair));rect(-7,-36,3,7,color(hair));
  rect(facing>=0?4:-4,-32,2,2,'#302d2c');ctx.restore();
}
export function drawRoom(ctx: CanvasRenderingContext2D,engine: RoomEngine,hover: string | null,atlas:TileAtlas|null=null,characters:CharacterAtlas|null=null,talking=false,time=0,trainingPlayers:readonly Player[]=[],selectedPlayer='') {
  if(engine.location==='training'){drawTrainingRoom(ctx,engine,hover,atlas,characters,time,talking,trainingPlayers,selectedPlayer);return;}
  const room=rooms[engine.location];
  ctx.clearRect(0,0,640,360);ctx.fillStyle='#18333b';ctx.fillRect(0,0,640,360);
  const left=project([0,7]),right=project([9,0]),front=project([9,7]);
  polygon(ctx,[[left[0],left[1]+5],[origin[0],origin[1]+5],[right[0],right[1]+5],[front[0],front[1]+9]],'#10272e');
  {
    polygon(ctx,[left,origin,[origin[0],origin[1]-45],[left[0],left[1]-45]],shade(room.wall,.81));
    polygon(ctx,[origin,right,[right[0],right[1]-45],[origin[0],origin[1]-45]],color(room.wall));
    line(ctx,[left[0],left[1]-45],[origin[0],origin[1]-45],shade(room.wall,1.16));
    line(ctx,[origin[0],origin[1]-45],[right[0],right[1]-45],shade(room.wall,1.16));
  }
  if(atlas) {
    const sheet=engine.location==='apartment'?'residential':'club';
    for(let y=0;y<7;y++) atlas.draw(ctx,`${sheet}.${y===2?'window_left':'wall_left'}`,project([0,y]));
    for(let x=0;x<9;x++) atlas.draw(ctx,`${sheet}.wall_right`,project([x,0]));
  }
  for (let x=0;x<9;x++) for (let y=0;y<7;y++) {
    const p=project([x,y]);
    polygon(ctx,[p,[p[0]+32,p[1]+16],[p[0],p[1]+32],[p[0]-32,p[1]+16]],shade(room.floor,(x+y)%2? .94:1),shade(room.floor,.87));
    if(atlas) {
      const variant=(x*7+y*3)%5===0?'b':'a';
      const sprite=engine.location==='apartment'?`residential.oak_${variant}`:`club.concrete_${variant}`;
      atlas.draw(ctx,sprite,center([x,y]));
    }
  }
  {
    if(atlas) atlas.draw(ctx,engine.location==='apartment'?'residential.rug':'club.rug',project([4.5,5]),{w:160,h:80});
    else polygon(ctx,[[3,4],[6,4],[6,6],[3,6]].map(p=>project(p as Cell)),'#4b7276','#bbb69d');
    const w=project([0,2.5]);
    if(!atlas) {
      polygon(ctx,[[w[0]-21,w[1]-28],[w[0]+17,w[1]-47],[w[0]+17,w[1]-27],[w[0]-21,w[1]-8]],'#c8d9bd','#e4dfbe');
      line(ctx,[w[0]-2,w[1]-18],[w[0]-2,w[1]-38],'#e4dfbe',2);
    }
    if (engine.location==='office') {
      const banner=project([5,0]);
      polygon(ctx,[[banner[0]-18,banner[1]-39],[banner[0]+11,banner[1]-24],[banner[0]+11,banner[1]-7],[banner[0]-18,banner[1]-22]],'#203c49');
      line(ctx,[banner[0]-12,banner[1]-30],[banner[0]+5,banner[1]-21],'#dab16d',2);
    }
  }
  interiorDetails(ctx,engine.location);
  if (engine.destination) {
    const [x,y]=engine.destination;
    polygon(ctx,[[x-9,y],[x,y-5],[x+9,y],[x,y+5]],'rgba(236,194,117,.1)','#f2c87c');
  }
  const entities: {y:number;draw:()=>void}[] = room.props.map(prop=>({y:center(prop.cell)[1],draw:()=>propSprite(ctx,prop,hover===prop.id||engine.pending?.id===prop.id,engine.location,atlas)}));
  room.npcs.forEach(npc=>entities.push({y:center(npc.cell)[1],draw:()=>{
    const point=center(npc.cell),dx=engine.position[0]-point[0],dy=engine.position[1]-point[1],near=Math.hypot(dx,dy)<85;
    if(characters){polygon(ctx,[[point[0]-10,point[1]],[point[0],point[1]-4],[point[0]+10,point[1]],[point[0],point[1]+4]],'rgba(16,34,31,.22)');characters.draw(ctx,npc.id,point,near?directionFromVector(dx,dy):'sw',false,0,talking&&near);}
    else person(ctx,point,npc.shirt,npc.hair);
  }}));
  entities.push({y:engine.position[1],draw:()=>{
    if(characters){const p=engine.position;polygon(ctx,[[p[0]-10,p[1]],[p[0],p[1]-4],[p[0]+10,p[1]],[p[0],p[1]+4]],'rgba(16,34,31,.22)');characters.draw(ctx,'hero',p,engine.direction,engine.path.length>0,engine.step,talking);}
    else person(ctx,engine.position,'d6b16b','3b3331',engine.step,engine.facing);
  }});
  entities.sort((a,b)=>a.y-b.y).forEach(entity=>entity.draw());
  for (const target of targetsFor(engine)) {
    const p=center(target.cell),h='height' in target?target.height:40,y=p[1]-h-12;
    polygon(ctx,[[p[0],y-3],[p[0]+3,y],[p[0],y+3],[p[0]-3,y]],hover===target.id?'#fff0bd':'#dfb777');
    if (hover===target.id || engine.pending?.id===target.id) {
      ctx.font='10px monospace';ctx.textAlign='center';
      const name=target.label??'', width=ctx.measureText(name).width+12;
      ctx.fillStyle='#102b33';ctx.fillRect(Math.round(p[0]-width/2),y-23,width,16);
      ctx.fillStyle='#f5dfb6';ctx.fillText(name,Math.round(p[0]),y-12);
    }
  }
}
