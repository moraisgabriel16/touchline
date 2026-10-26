import {loadCharacters} from '../scene/characters.ts';
import type {CharacterAtlas} from '../scene/characters.ts';
import {useEffect,useRef} from 'react';
import {clubs} from '../game/data.ts';
import type {LiveMatch,MatchTeam} from '../game/live-match.ts';

const colorDistance=(a:string,b:string)=>{const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16);return Math.hypot((x>>16)-(y>>16),((x>>8)&255)-((y>>8)&255),(x&255)-(y&255));};
const field=(x:number,y:number):[number,number]=>[320+(x*12-y*8-2)*24,61+(x*12+y*8)*11];
export function MatchCanvas({match,paused,reducedMotion=false,formation='4-4-2',ownClub=0}:{match:LiveMatch;paused:boolean;reducedMotion?:boolean;formation?:string;ownClub?:number}){
  const ref=useRef<HTMLCanvasElement>(null),current=useRef({match,paused,reducedMotion,formation,ownClub});current.current={match,paused,reducedMotion,formation,ownClub};
  useEffect(()=>{
    let atlas:CharacterAtlas|null=null,active=true;void loadCharacters().then(a=>{if(active)atlas=a;}).catch(()=>{});
    const ctx=ref.current!.getContext('2d')!;ctx.imageSmoothingEnabled=false;let frame=0,time=0,last=performance.now(),previousMinute=-1,minuteTime=0;
    let background:HTMLCanvasElement|null=null;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const draw=(now:number)=>{
      const {match:m,paused:stop,reducedMotion:reduce,formation:shape,ownClub:ours}=current.current;
      if(!stop&&!reduced.matches&&!reduce&&(m.phase==='first'||m.phase==='second'))time+=Math.min(.05,(now-last)/1000);last=now;
      if(previousMinute!==m.minute){previousMinute=m.minute;minuteTime=time;}
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
      const second=m.phase==='second'||m.phase==='full',running=m.phase==='first'||m.phase==='second';
      const attackHome=m.possession===m.home.club,attackingRight=attackHome!==second;
      const flight=(Math.sin(time*1.6)+1)/2;
      const latest=m.events[m.events.length-1],elapsed=Math.min(1,(time-minuteTime)*3);
      let ballX=attackingRight?.52+flight*.36:.48-flight*.36,ballY=.5+Math.sin(time*2.1)*.24;
      if(['goal','shot','save','penalty'].includes(latest.kind)){ballX=attackingRight?.70+elapsed*.30:.30-elapsed*.30;ballY=.5+Math.sin(time*2)*.035;}
      if(latest.kind==='corner'){ballX=attackingRight?1:0;ballY=.02;}
      if(latest.kind==='goal'&&elapsed===1){ballX=attackingRight?1.015:-.015;ballY=.5;}
      const actors:{x:number;y:number;team:MatchTeam;id:string;number:number}[]=[];
      for(const [teamIndex,t] of [m.home,m.away].entries())t.active.forEach((id,i)=>{
        const keeper=t.players.find(p=>p.id===id)?.position==='GOL';
        const slot=t.initial.indexOf(id),n=slot<0?i:slot;
        let x=keeper?.04:n<=4?.23:n<=8?.44:.68;
        let y=keeper?.5:n<=4?.16+((n-1)%4)*.225:n<=8?.17+((n-5)%4)*.22:.35+(n%2)*.3;
        if(!keeper){const rows=(t.club===ours?shape:'4-4-2').split('-').map(Number);let slot=Math.max(0,n-1),row=0;while(row<rows.length-1&&slot>=rows[row]){slot-=rows[row];row++;}x=[.23,.45,.68][row];y=.12+(slot+.5)*.76/rows[row];}
        const direction=(teamIndex===0)!==second;
        if(!keeper&&running){x+=Math.sin(time*1.8+i*1.7)*.026+(ballX-.5)*.14*(direction?1:-1);y+=Math.cos(time*1.4+i)*.025;}
        if(!direction)x=1-x;
        const p=field(x,y);actors.push({x:p[0],y:p[1],team:t,id,number:t.players.findIndex(p=>p.id===id)+1});
      });
      actors.sort((a,b)=>a.y-b.y).forEach(a=>{
        const x=Math.round(a.x),y=Math.round(a.y),home=a.team.club===m.home.club;
        const keeper=a.team.players.find(p=>p.id===a.id)?.position==='GOL';
        const homeColor=clubs[m.home.club].colors[0],rival=clubs[m.away.club];
        const shirt=keeper?'#db9848':home?homeColor:(colorDistance(rival.colors[0],homeColor)<110?rival.colors[1]:rival.colors[0]);
        ctx.fillStyle='#17362666';ctx.fillRect(x-5,y,11,2);
        if(atlas){ctx.save();ctx.translate(x,y);ctx.scale(.65,.65);atlas.drawKit(ctx,keeper?'keeper':'davi',[0,0],home!==second?'se':'nw',running&&!stop&&!reduced.matches&&!reduce,time*7+a.number,shirt);ctx.restore();}
        else{ctx.fillStyle=shirt;ctx.fillRect(x-4,y-17,8,10);ctx.fillStyle='#bf8960';ctx.fillRect(x-3,y-24,6,6);ctx.fillStyle='#203a3a';ctx.fillRect(x-3,y-7,6,7);}
        ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle=home?clubs[m.home.club].colors[1]:'#ffffff';ctx.fillText(String(a.number),x,y-9);
        if(a.team.yellow[a.id]){ctx.fillStyle='#f5cb52';ctx.fillRect(x+6,y-24,3,5);}
      });
      const b=field(running?ballX:.5,running?ballY:.5);ctx.fillStyle='#183b2c80';ctx.fillRect(Math.round(b[0]),Math.round(b[1])+1,5,2);ctx.fillStyle='#fcf0cc';ctx.fillRect(Math.round(b[0]),Math.round(b[1])-3,4,4);ctx.fillStyle='#36433c';ctx.fillRect(Math.round(b[0])+1,Math.round(b[1])-2,1,1);
      const refPoint=field(.5+Math.sin(time)*.02,.68);ctx.fillStyle='#161e28';ctx.fillRect(Math.round(refPoint[0]),Math.round(refPoint[1])-17,6,17);ctx.fillStyle='#d9c367';ctx.fillRect(Math.round(refPoint[0]),Math.round(refPoint[1])-14,6,7);
      ctx.font='9px monospace';ctx.textAlign='left';ctx.fillStyle='#d5d6b7';ctx.fillText('LIGA REGIONAL · TRANSMISSÃO',18,24);
      ctx.fillStyle='#ddb966';ctx.fillText(m.phase==='halftime'?'INTERVALO':m.phase==='full'?'FIM DE JOGO':`${second?'2º':'1º'} TEMPO · ${m.minute}′`,18,339);
      frame=requestAnimationFrame(draw);
    };frame=requestAnimationFrame(draw);return ()=>{active=false;cancelAnimationFrame(frame);};
  },[]);
  return <canvas ref={ref} width={640} height={360} className="match-canvas" aria-label="Partida isométrica animada com os jogadores das duas equipes. Placar e lances disponíveis em texto."/>;
}
