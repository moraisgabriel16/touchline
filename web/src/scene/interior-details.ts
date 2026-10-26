import type {Cell,Location} from '../game/data.ts';
import {project,center} from '../game/navigation.ts';
function poly(c:CanvasRenderingContext2D,p:Cell[],fill:string,stroke?:string){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
function wallPanel(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string){const a=project([x,y]),b=project([x+w,y]);poly(c,[[a[0],a[1]-h],[b[0],b[1]-h],b,a],fill,'#665540');return a;}
/** Original pixel geometry supplements the existing atlas without changing navigation. */
export function interiorDetails(c:CanvasRenderingContext2D,location:Location){
  c.save();
  // Window light remains attached to the floor plane.
  poly(c,[[.1,2.3],[.1,3.1],[3.7,5.2],[4.2,4.2]].map(p=>project(p as Cell)),'#f4d99916');
  if(location==='apartment'){
    wallPanel(c,5.7,0,1.5,38,'#77674f');
    for(let i=0;i<9;i++)wallPanel(c,5.77+i*.145,0,.11,11+(i%3)*3,['#627c76','#a66f50','#c4ad73'][i%3]);
    const a=project([3,0]);poly(c,[[a[0]-3,a[1]-40],[a[0]+15,a[1]-31],[a[0]+15,a[1]-16],[a[0]-3,a[1]-25]],'#efe4c6','#755a40');
    c.fillStyle='#9d6b4f';c.fillRect(a[0]+4,a[1]-30,4,6);
    const w=project([0,2]);poly(c,[[w[0]-1,w[1]-43],[w[0]-1,w[1]-9],[w[0]-11,w[1]-4],[w[0]-8,w[1]-39]],'#c0b78b');
    // Bedside textile and a framed memory above the headboard.
    const p=project([0,1]);poly(c,[[p[0],p[1]-34],[p[0]-23,p[1]-22],[p[0]-23,p[1]-7],[p[0],p[1]-19]],'#6d5442','#c2a66b');
    poly(c,[[p[0]-3,p[1]-30],[p[0]-19,p[1]-22],[p[0]-19,p[1]-12],[p[0]-3,p[1]-20]],'#769087');
  }else{
    const p=wallPanel(c,3.4,0,1.45,36,'#52645a');
    // Tactical board, chalk pitch and magnets follow the right wall.
    for(let i=0;i<5;i++){const a=project([3.55+i*.23,0]);c.fillStyle=i%2?'#d4b46b':'#cdd8ba';c.fillRect(Math.round(a[0]),Math.round(a[1]-23-(i%2)*5),2,2);}
    poly(c,[[p[0]+4,p[1]-31],[p[0]+40,p[1]-13],[p[0]+40,p[1]-1],[p[0]+4,p[1]-19]],'#00000000','#b0bea1');
    const q=project([7.6,0]);poly(c,[[q[0]-9,q[1]-44],[q[0]+11,q[1]-34],[q[0]+11,q[1]-16],[q[0]-9,q[1]-26]],'#e6dfc4','#7f6c4f');
    for(let i=0;i<3;i++){c.fillStyle='#8b9b88';c.fillRect(q[0]-4+i*5,q[1]-31+i*2,3,4);}
    // Club honours on a wall shelf, kept clear of the circulation floor.
    const t=project([1,0]);poly(c,[[t[0]-5,t[1]-17],[t[0]+29,t[1]],[t[0]+34,t[1]-3],[t[0],t[1]-20]],'#805a39');
    for(let i=0;i<3;i++){const x=t[0]+i*10,y=t[1]+i*5;c.fillStyle='#d6b46a';c.fillRect(x,y-27,7,5);c.fillRect(x+2,y-22,3,7);c.fillStyle='#71573b';c.fillRect(x,y-15,7,3);}
  }
  c.restore();
}
export function deskChair(c:CanvasRenderingContext2D,cell:Cell){
  const p=center(cell);poly(c,[[p[0]-6,p[1]+1],[p[0]+7,p[1]-6],[p[0]+18,p[1]],[p[0]+5,p[1]+7]],'#394c4b','#a68c5b');
  poly(c,[[p[0]+5,p[1]+7],[p[0]+18,p[1]],[p[0]+18,p[1]-15],[p[0]+5,p[1]-8]],'#334b4c','#718477');
}
