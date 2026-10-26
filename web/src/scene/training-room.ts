import {center,project} from '../game/navigation.ts';
import type {RoomEngine} from '../game/navigation.ts';
import type {Cell,Player} from '../game/data.ts';
import {rooms} from '../game/data.ts';
import {directionFromVector} from '../game/character-motion.ts';
import {trainingPitch as field,trainingGoal as goal} from '../game/training-session.ts';
import type {TileAtlas} from './tilesets.ts';
import type {CharacterAtlas} from './characters.ts';
import {trainingRoster} from '../game/training-roster.ts';
import {trainingCamera} from '../game/scene-camera.ts';

function poly(ctx:CanvasRenderingContext2D,points:Cell[],fill:string,stroke?:string){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function line(ctx:CanvasRenderingContext2D,a:Cell,b:Cell,color:string,width=1){ctx.beginPath();ctx.moveTo(Math.round(a[0]),Math.round(a[1]));ctx.lineTo(Math.round(b[0]),Math.round(b[1]));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
const raised=(p:Cell,h:number):Cell=>[p[0],p[1]-h];
function groundRect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string){poly(ctx,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(p=>project(p as Cell)),fill,stroke);}
function shadow(ctx:CanvasRenderingContext2D,p:Cell,w=8){poly(ctx,[[p[0]-w,p[1]],[p[0],p[1]-3],[p[0]+w,p[1]],[p[0],p[1]+3]],'#19392c44');}
function goalStructure(ctx:CanvasRenderingContext2D,shape=goal){
  const a=project([shape.x,shape.top]),b=project([shape.x,shape.bottom]),c=project([shape.back,shape.top]),d=project([shape.back,shape.bottom]);
  const at=raised(a,shape.height),bt=raised(b,shape.height),ct=raised(c,shape.height-3),dt=raised(d,shape.height-3);
  poly(ctx,[at,bt,dt,ct],'#e0e8d31a');poly(ctx,[ct,dt,d,c],'#dce8d329');poly(ctx,[bt,dt,d,b],'#cedec724');
  // Mesh follows the same projected 3D planes as the posts; never a rotated flat icon.
  for(let i=0;i<=10;i++){
    const t=i/10,top=project([shape.back,shape.top+(shape.bottom-shape.top)*t]),front=project([shape.x,shape.top+(shape.bottom-shape.top)*t]);
    line(ctx,raised(top,shape.height-3),top,'#d8e1ce66');line(ctx,raised(front,shape.height),raised(top,shape.height-3),'#e1e8d477');
  }
  for(let i=0;i<=7;i++){const h=(shape.height-3)*i/7;line(ctx,raised(c,h),raised(d,h),'#dce5d066');}
  line(ctx,c,ct,'#96a59b',2);line(ctx,d,dt,'#96a59b',2);line(ctx,ct,dt,'#bbc7b5',2);
  line(ctx,a,c,'#c2cbb4',2);line(ctx,b,d,'#c2cbb4',2);line(ctx,at,ct,'#d7ddcb',2);line(ctx,bt,dt,'#d7ddcb',2);
  line(ctx,a,at,'#f2f0dc',3);line(ctx,b,bt,'#f2f0dc',3);line(ctx,at,bt,'#f2f0dc',3);
}
function bench(ctx:CanvasRenderingContext2D){
  const a=project([.55,.25]),b=project([3.65,.25]),c=project([3.65,.85]),d=project([.55,.85]);
  poly(ctx,[raised(a,48),raised(b,48),raised(c,48),raised(d,48)],'#203f50','#547781');
  line(ctx,raised(d,48),raised(c,48),'#d6b56a',2);
  for(const p of [a,b])line(ctx,p,raised(p,48),'#29454b',2);
  const seat=[[.55,.78],[3.65,.78],[3.65,1.12],[.55,1.12]].map(p=>raised(project(p as Cell),12));
  poly(ctx,seat,'#bf9558','#6f623e');line(ctx,seat[3],seat[2],'#dab471',2);
  for(let i=0;i<4;i++){
    const x=.7+i*.85,p=project([x,.95]),q=project([x+.65,.95]);
    line(ctx,raised(p,20),raised(q,20),'#c99b5e',4);
    line(ctx,p,raised(p,12),'#30464a',2);line(ctx,q,raised(q,12),'#30464a',2);
  }
}
function cone(ctx:CanvasRenderingContext2D,p:Cell){shadow(ctx,p,4);poly(ctx,[[p[0]-3,p[1]],[p[0],p[1]-8],[p[0]+3,p[1]]],'#e89a45','#b76a31');line(ctx,[p[0]-1,p[1]-4],[p[0]+1,p[1]-4],'#f5deb1');}


export function drawTrainingRoom(ctx:CanvasRenderingContext2D,engine:RoomEngine,hover:string|null,atlas:TileAtlas|null,characters:CharacterAtlas|null,time:number,talking:boolean,players:readonly Player[],selectedPlayer:string){
  const session=trainingRoster(players,time),entities:{y:number;draw:()=>void}[]=[];
  ctx.clearRect(0,0,640,360);ctx.fillStyle='#18333b';ctx.fillRect(0,0,640,360);
  ctx.save();ctx.translate(trainingCamera.x,trainingCamera.y);ctx.scale(trainingCamera.scale,trainingCamera.scale);
  const footprint=[[0,0],[14,0],[14,10],[0,10]].map(p=>project(p as Cell));
  poly(ctx,footprint.map(([x,y])=>[x,y+7]),'#10282c');poly(ctx,footprint,'#8d967e');
  if(atlas){for(let y=0;y<10;y++)atlas.draw(ctx,'training.fence_left',project([0,y]));for(let x=0;x<14;x++)atlas.draw(ctx,'training.fence_right',project([x,0]));}
  groundRect(ctx,.95,1.2,12.85,7.7,'#527743');
  for(let stripe=0;stripe<13;stripe++)groundRect(ctx,1+stripe*.98,1.2,.98,7.7,stripe%2?'#557c47':'#507543');
  for(let i=0;i<360;i++){const p=project([1.05+((i*73)%1261)/100,1.25+((i*47)%749)/100]);ctx.fillStyle=i%3?'#72915766':'#314f3344';ctx.fillRect(Math.round(p[0]),Math.round(p[1]),i%4===0?2:1,1);}
  for(let x=0;x<14;x++)line(ctx,project([x,9]),project([x+1,9]),'#a9b29c');
  groundRect(ctx,field.left,field.top,field.right-field.left,field.bottom-field.top,'#ffffff00','#dce3c0');
  line(ctx,project([field.center[0],field.top]),project([field.center[0],field.bottom]),'#dce3c0');
  poly(ctx,Array.from({length:49},(_,i)=>project([field.center[0]+Math.cos(i/48*Math.PI*2),field.center[1]+Math.sin(i/48*Math.PI*2)])),'#ffffff00','#dce3c0');
  for(const [x,w] of [[10.7,1.95],[field.left,1.95]])groundRect(ctx,x,3.1,w,3.7,'#ffffff00','#dce3c0');
  groundRect(ctx,11.85,4,.8,2,'#ffffff00','#dce3c0');groundRect(ctx,field.left,4,.8,2,'#ffffff00','#dce3c0');
  for(const p of [field.center,[10.9,5] as Cell,[3.1,5] as Cell]){const q=project(p);ctx.fillStyle='#e6e7c8';ctx.fillRect(Math.round(q[0])-1,Math.round(q[1])-1,2,2);}
  for(const p of [[field.left,field.top],[field.right,field.top],[field.right,field.bottom],[field.left,field.bottom]] as Cell[]){const q=project(p);line(ctx,q,raised(q,9),'#d6d9bc');poly(ctx,[raised(q,9),[q[0]+5,q[1]-7],raised(q,5)],'#ddae54');}
  // Track edging and technical area stay outside the exercise stations.
  groundRect(ctx,0,9.1,12.5,.85,'#a99e7c');
  for(let i=0;i<24;i++)groundRect(ctx,i*.52,9.12,.48,.76,i%2?'#ada485':'#a1987b');
  groundRect(ctx,8.4,.1,2.5,.65,'#d8d6b000','#d8d6b0');
  const board=project([11.6,.35]);
  poly(ctx,[[board[0]-17,board[1]-33],[board[0]+15,board[1]-17],[board[0]+15,board[1]+1],[board[0]-17,board[1]-15]],'#244943','#b6b68c');
  line(ctx,[board[0]-13,board[1]-26],[board[0]+10,board[1]-14],'#d0d6af');
  for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#dbaf55':'#d5ddc0';ctx.fillRect(Math.round(board[0]-10+i*5),Math.round(board[1]-20+i*2),2,2);}
  for(const x of [4.9,5.15,5.4]){const p=project([x,.5]);ctx.fillStyle='#c8ddd3';ctx.fillRect(Math.round(p[0])-2,Math.round(p[1])-10,4,9);ctx.fillStyle='#528a94';ctx.fillRect(Math.round(p[0])-2,Math.round(p[1])-7,4,4);}
  bench(ctx);
  function ball(p:Cell,height=0){const q=project(p);entities.push({y:q[1],draw:()=>{shadow(ctx,q,3);const b:Cell=[q[0],q[1]-height];if(atlas)atlas.draw(ctx,'training.ball',b,{w:7,h:7,pivot:[3,6]});else{ctx.fillStyle='#f1ecd7';ctx.fillRect(b[0]-2,b[1]-5,5,5);}}});}
  session.forEach(athlete=>{
    const p=project(athlete.cell),selected=selectedPlayer===athlete.id||hover===athlete.id||(hover==='davi'&&athlete.id==='m04');
    entities.push({y:p[1],draw:()=>{
      shadow(ctx,p);if(selected)poly(ctx,[[p[0]-12,p[1]],[p[0],p[1]-6],[p[0]+12,p[1]],[p[0],p[1]+6]],'#d6b57122','#e9c475');
      if(characters)characters.draw(ctx,athlete.position==='GOL'?'keeper':'davi',p,athlete.direction,athlete.moving,athlete.phase,false,athlete.action);
      else{ctx.fillStyle=athlete.position==='GOL'?'#56895b':'#d5ac54';ctx.fillRect(p[0]-5,p[1]-26,10,20);}
      ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillStyle='#15323dc9';ctx.fillRect(Math.round(p[0])-6,Math.round(p[1])-49,12,10);ctx.fillStyle='#f4e7bf';ctx.fillText(String(athlete.number),Math.round(p[0]),Math.round(p[1])-41);
      if(selected){const label=athlete.name+' · '+athlete.drill;ctx.font='10px monospace';const w=ctx.measureText(label).width+12;ctx.fillStyle='#102b33';ctx.fillRect(Math.round(p[0]-w/2),p[1]-68,w,15);ctx.fillStyle='#f5dfb6';ctx.fillText(label,Math.round(p[0]),p[1]-57);}
    }});
    if(athlete.ball)ball(athlete.ball,athlete.ballHeight??0);
  });
  for(const base of [[5.3,2.6],[6.2,2.6],[7.1,2.6],[2,7.5],[3,7.5],[4,7.5],[10,2.1],[11,2.1]] as Cell[]){const p=project(base);entities.push({y:p[1],draw:()=>cone(ctx,p)});}
  const equipment=project([.45,4.5]),bags=project([.7,7.8]),water=project([4.4,.45]);
  const staff=project([10,.4]);entities.push({y:staff[1],draw:()=>{shadow(ctx,staff);if(characters)characters.draw(ctx,'helena',staff,'sw');}});
  if(atlas){entities.push({y:equipment[1],draw:()=>atlas.draw(ctx,'training.box',equipment,{w:30,h:24})},{y:bags[1],draw:()=>atlas.draw(ctx,'training.bags',bags,{w:36,h:26})},{y:water[1],draw:()=>atlas.draw(ctx,'club.water_cooler',water,{w:22,h:38})});}
  for(const p of [[.5,4.8],[.7,4.9],[.35,5]] as Cell[])ball(p);
  for(const shape of [goal,{...goal,x:field.left,back:.7}])entities.push({y:project([shape.x,(shape.top+shape.bottom)/2])[1]+2,draw:()=>goalStructure(ctx,shape)});
  const ga=project([12.7,9.8]),gb=project([13.7,9.8]);entities.push({y:(ga[1]+gb[1])/2,draw:()=>{line(ctx,ga,raised(ga,23),'#c1c8b6',3);line(ctx,gb,raised(gb,23),'#c1c8b6',3);line(ctx,raised(ga,18),raised(gb,18),'#92a697');}});
  if(engine.destination){const p=engine.destination;poly(ctx,[[p[0]-8,p[1]],[p[0],p[1]-4],[p[0]+8,p[1]],[p[0],p[1]+4]],'#e4bd6233','#e5c276');}
  const npc=rooms.training.npcs[0],np=center(npc.cell),dx=engine.position[0]-np[0],dy=engine.position[1]-np[1],near=Math.hypot(dx,dy)<85;
  // Davi already belongs to the Aurora squad: never render a second copy of him.
  if(!players.some(p=>p.id==='m04'))entities.push({y:np[1],draw:()=>{shadow(ctx,np);if(characters)characters.draw(ctx,'davi',np,near?directionFromVector(dx,dy):'sw',false,0,talking&&near);}});
  entities.push({y:engine.position[1],draw:()=>{shadow(ctx,engine.position);if(characters)characters.draw(ctx,'hero',engine.position,engine.direction,engine.path.length>0,engine.step,talking);else{ctx.fillStyle='#d6b16b';ctx.fillRect(engine.position[0]-6,engine.position[1]-30,12,25);}}});
  entities.sort((a,b)=>a.y-b.y).forEach(entity=>entity.draw());
  for(const target of [...rooms.training.props.filter(p=>p.label),npc]){
    const p=center(target.cell),y=p[1]-('height'in target?target.height:40)-12,active=hover===target.id||engine.pending?.id===target.id;
    poly(ctx,[[p[0],y-3],[p[0]+3,y],[p[0],y+3],[p[0]-3,y]],active?'#fff0bd':'#dfb777');
    if(active){ctx.font='10px monospace';ctx.textAlign='center';const label=target.label??'',w=ctx.measureText(label).width+12;ctx.fillStyle='#102b33';ctx.fillRect(Math.round(p[0]-w/2),y-23,w,16);ctx.fillStyle='#f5dfb6';ctx.fillText(label,Math.round(p[0]),y-12);}
  }
  ctx.restore();
}
