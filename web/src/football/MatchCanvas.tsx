import {broadcastFrame,projectPitch} from '../game/broadcast.ts';
import {directionFromVector} from '../game/character-motion.ts';
import {loadCharacters} from '../scene/characters.ts';
import type {CharacterAtlas} from '../scene/characters.ts';
import {useEffect,useRef} from 'react';
import {clubs} from '../game/data.ts';
import type {LiveMatch} from '../game/live-match.ts';

const colorDistance=(a:string,b:string)=>{const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16);return Math.hypot((x>>16)-(y>>16),((x>>8)&255)-((y>>8)&255),(x&255)-(y&255));};
const field=(x:number,y:number):[number,number]=>[320+(x*12-y*8-2)*24,61+(x*12+y*8)*11];
export function MatchCanvas({match,paused,reducedMotion=false,formation='4-4-2',ownClub=0,speed=1,replay=false,follow=false,replayProgress=0,replayPlaying=true}:{match:LiveMatch;paused:boolean;reducedMotion?:boolean;formation?:string;ownClub?:number;speed?:number;replay?:boolean;follow?:boolean;replayProgress?:number;replayPlaying?:boolean}){
  const ref=useRef<HTMLCanvasElement>(null),current=useRef({match,paused,reducedMotion,formation,ownClub,speed,replay,follow,replayProgress,replayPlaying});current.current={match,paused,reducedMotion,formation,ownClub,speed,replay,follow,replayProgress,replayPlaying};
  useEffect(()=>{
    let atlas:CharacterAtlas|null=null,active=true;void loadCharacters().then(a=>{if(active)atlas=a;}).catch(()=>{});
    const ctx=ref.current!.getContext('2d')!;ctx.imageSmoothingEnabled=false;let frame=0,time=0,last=performance.now(),previousMinute=-1,minuteTime=0;
    let background:HTMLCanvasElement|null=null;const positions=new Map<string,[number,number]>();let camera:[number,number]=[320,180];const effects=new Image();effects.src=`${import.meta.env.BASE_URL}football/match-effects-v1.png`;
    const effect=(kind:number,index:number,x:number,y:number,size=16)=>{if(effects.complete&&effects.naturalWidth)ctx.drawImage(effects,index*16,kind*16,16,16,Math.round(x-size/2),Math.round(y-size/2),size,size);};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const draw=(now:number)=>{
      const {match:m,paused:stop,reducedMotion:reduce,formation:shape,ownClub:ours,speed:rate,replay:review,follow:tracking,replayProgress:position,replayPlaying:playing}=current.current;
      const dt=Math.min(.05,(now-last)/1000);if((!stop||review)&&!reduced.matches&&!reduce&&(review||m.phase==='first'||m.phase==='second'))time+=dt*(review?1:rate);last=now;
      if(review)time=position*6;
      if(previousMinute!==m.minute){previousMinute=m.minute;minuteTime=time;}
      const progress=review?position:Math.min(1,(time-minuteTime)*1.5);
      const scene=broadcastFrame(m,progress,shape,ours,review),focus=projectPitch(scene.ball),zoom=background&&tracking&&!reduce&&!reduced.matches?1.13:1;
      camera=[camera[0]+(Math.max(285,Math.min(355,focus[0]))-camera[0])*Math.min(1,(review?playing?dt:0:!stop?dt:0)*3),camera[1]+(Math.max(160,Math.min(200,focus[1]))-camera[1])*Math.min(1,(review?playing?dt:0:!stop?dt:0)*3)];
      ctx.save();ctx.translate(320,180);ctx.scale(zoom,zoom);ctx.translate(zoom===1?-320:-camera[0],zoom===1?-180:-camera[1]);
      if(background)ctx.drawImage(background,0,0);
      else{
      ctx.fillStyle='#102e35';ctx.fillRect(0,0,640,360);
      const poly=(points:[number,number][],fill:string,stroke?:string)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}};
      const box=(x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>poly([field(x,y),field(x+w,y),field(x+w,y+h),field(x,y+h)],fill,stroke);
      const line=(a:[number,number],b:[number,number],color='#e5e7c6')=>{ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...a.map(Math.round) as [number,number]);ctx.lineTo(...b.map(Math.round) as [number,number]);ctx.stroke();};
      box(-.08,-.16,1.16,1.32,'#566a63');
      for(let row=0;row<4;row++){
        const y=-.12-row*.026;box(-.06,y,1.12,.021,row%2?'#b08e63':'#8b7356');
        for(let i=0;i<80;i++){const [x,py]=field(-.045+i/73,y);ctx.fillStyle=i%4===0?clubs[m.home.club].colors[1]:i%3?'#c9b989':'#496c70';ctx.fillRect(Math.round(x),Math.round(py)-3,2,3);}
      }
      box(-.025,-.025,1.05,1.05,'#376347');
      for(let i=0;i<12;i++)box(i/12,0,1/12,1,i%2?'#507e46':'#48743f');
      for(let i=0;i<900;i++){const [x,y]=field(((i*73)%997)/997,((i*47)%991)/991);ctx.fillStyle=i%2?'#9dbb7430':'#163e2530';ctx.fillRect(Math.round(x),Math.round(y),1,1);}
      box(0,0,1,1,'#00000000','#dce5ba');line(field(.5,0),field(.5,1));
      poly(Array.from({length:49},(_,i)=>field(.5+Math.cos(i/48*Math.PI*2)*.09,.5+Math.sin(i/48*Math.PI*2)*.14)),'#00000000','#dce5ba');
      box(0,.2,.16,.6,'#00000000','#dce5ba');box(.84,.2,.16,.6,'#00000000','#dce5ba');box(0,.35,.055,.3,'#00000000','#dce5ba');box(.945,.35,.055,.3,'#00000000','#dce5ba');
      for(const x of [0,1]){
        const a=field(x,.40),b=field(x,.60),depth=x===0?-11:11;
        poly([a,b,[b[0]+depth,b[1]-5],[a[0]+depth,a[1]-5]],'#c9d7bb30','#acc3b0');
        for(let i=0;i<=5;i++){const t=i/5,p:[number,number]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];line([p[0],p[1]-18],[p[0]+depth,p[1]-5],'#a8c1ad80');}
        line(a,[a[0],a[1]-20],'#f5edd5');line(b,[b[0],b[1]-20],'#f5edd5');line([a[0],a[1]-20],[b[0],b[1]-20],'#f5edd5');
      }
      background=document.createElement('canvas');background.width=640;background.height=360;background.getContext('2d')!.drawImage(ref.current!,0,0);
      }
      const second=m.minute>45||m.phase==='second',moving=(review?playing:!stop)&&!reduce&&!reduced.matches;
      const actors=scene.actors.map(a=>{const target=projectPitch(a.point),previous=positions.get(a.id)??target;const smooth=review?Math.min(1,dt*14):Math.min(1,dt*22*rate);const p:[number,number]=review?target:moving?[previous[0]+(target[0]-previous[0])*smooth,previous[1]+(target[1]-previous[1])*smooth]:(reduce||reduced.matches?target:previous);positions.set(a.id,p);return {...a,x:Math.round(p[0]),y:Math.round(p[1])};}).sort((a,b)=>a.y-b.y);
      for(const a of actors){
        const home=a.club===m.home.club,team=home?m.home:m.away,homeColor=clubs[m.home.club].colors[0],rival=clubs[m.away.club];
        const shirt=a.keeper?'#db9848':home?homeColor:(colorDistance(rival.colors[0],homeColor)<110?rival.colors[1]:rival.colors[0]);
        const x=a.x,y=a.y,jump=a.action==='celebrate'&&moving?Math.round(Math.abs(Math.sin(time*15))*4):0;
        ctx.fillStyle='#17362666';ctx.fillRect(x-5,y,11,2);
        if(scene.carrier===a.id)effect(2,Math.floor(time*4)%4,x,y+1,18);
        const vector=projectPitch(a.direction),origin=projectPitch([0,0]);const direction=directionFromVector(vector[0]-origin[0],vector[1]-origin[1],home!==second?'se':'nw');
        if(atlas){ctx.save();ctx.translate(x,y-jump);if(a.action==='dive')ctx.rotate((home!==second?1:-1)*1.0);ctx.scale(.65,.65);atlas.drawKit(ctx,a.keeper?'keeper':'davi',[0,0],direction,a.action==='run'&&moving,time*14+a.number,shirt,a.action==='kick');ctx.restore();}
        else{ctx.fillStyle=shirt;ctx.fillRect(x-4,y-17,8,10);ctx.fillStyle='#bf8960';ctx.fillRect(x-3,y-24,6,6);ctx.fillStyle='#203a3a';ctx.fillRect(x-3,y-7,6,7);}
        if(a.action==='celebrate'){ctx.fillStyle=shirt;ctx.fillRect(x-7,y-23-jump,3,9);ctx.fillRect(x+5,y-23-jump,3,9);effect(3,Math.floor(time*5)%4,x,y-32-jump,14);}
        ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#fff4d6';ctx.fillText(String(a.number),x,y-9-jump);
        if(team.yellow[a.id]){ctx.fillStyle='#f5cb52';ctx.fillRect(x+6,y-24,3,5);}
        if(scene.carrier===a.id||a.id===scene.shooter&&progress>.55){const name=team.players.find(p=>p.id===a.id)?.name.split(' ').at(-1)??'';ctx.font='7px monospace';ctx.fillStyle='#14333dda';ctx.fillRect(x-name.length*2.2-3,y+5,name.length*4.4+6,11);ctx.fillStyle='#f4e5b5';ctx.fillText(name,x,y+13);}
      }
      const carrier=actors.find(a=>a.id===scene.carrier),b=carrier?[carrier.x+3,carrier.y]:projectPitch(scene.ball);
      ctx.fillStyle='#183b2c90';ctx.fillRect(Math.round(b[0])-2,Math.round(b[1])+1,6,2);
      if(effects.complete&&effects.naturalWidth)effect(0,Math.floor(time*12)%4,b[0],b[1]-3-scene.height,12);else{ctx.fillStyle='#fcf0cc';ctx.fillRect(Math.round(b[0])-2,Math.round(b[1])-5,4,4);}
      if(scene.impact)effect(1,Math.min(3,Math.floor((progress-.82)*24)),b[0],b[1],24);
      const refPoint=field(.48,.69);ctx.fillStyle='#161e28';ctx.fillRect(Math.round(refPoint[0]),Math.round(refPoint[1])-17,6,17);ctx.fillStyle='#d9c367';ctx.fillRect(Math.round(refPoint[0]),Math.round(refPoint[1])-14,6,7);
      const disciplinary=m.events.filter(e=>e.minute===m.minute).find(e=>e.kind==='red')??m.events.filter(e=>e.minute===m.minute).find(e=>e.kind==='yellow');
      if(disciplinary){ctx.fillStyle=disciplinary.kind==='red'?'#ef624b':'#f5d56a';ctx.fillRect(refPoint[0]+6,refPoint[1]-25,4,6);}
      ctx.restore();
      ctx.fillStyle='#112d35dd';ctx.fillRect(13,12,260,22);ctx.fillStyle=scene.outcome==='goal'?'#f4ce7b':'#dfdfbf';ctx.font='9px monospace';ctx.textAlign='left';ctx.fillText(scene.label,22,26);
      if(review){ctx.fillStyle='#e9cb80';ctx.fillRect(516,14,109,22);ctx.fillStyle='#193b40';ctx.fillText('REPLAY · 6 s',526,28);ctx.fillStyle='#d4b272';ctx.fillRect(16,350,608*progress,3);}
      ctx.font='9px monospace';ctx.textAlign='left';ctx.fillStyle='#d5d6b7';ctx.fillText(review?'RECONSTITUIÇÃO DO LANCE':'LIGA REGIONAL · AO VIVO',18,324);
      ctx.fillStyle='#ddb966';ctx.fillText(review?`LANCE AOS ${m.minute} MINUTOS`:m.phase==='halftime'?'INTERVALO':m.phase==='full'?'FIM DE JOGO':`${second?'2º':'1º'} TEMPO · ${m.minute}′`,18,339);
      frame=requestAnimationFrame(draw);
    };frame=requestAnimationFrame(draw);return ()=>{active=false;cancelAnimationFrame(frame);};
  },[]);
  return <canvas ref={ref} width={640} height={360} className="match-canvas" data-broadcast={replay?'replay':'live'} aria-label="Partida isométrica animada com os jogadores das duas equipes. Placar e lances disponíveis em texto."/>;
}
