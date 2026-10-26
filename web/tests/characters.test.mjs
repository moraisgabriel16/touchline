import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PNG} from 'pngjs';
import {directionFromVector,characterPose} from '../src/game/character-motion.ts';
import {trainingGoal,trainingPitch} from '../src/game/training-session.ts';
import {trainingRoster} from '../src/game/training-roster.ts';
import {squadFor} from '../src/game/data.ts';
import {project} from '../src/game/navigation.ts';
import {sceneToWorld,worldToScene} from '../src/game/scene-camera.ts';
const manifest=JSON.parse(fs.readFileSync('public/characters/manifest-v1.json','utf8'));
test('48 character frames have consistent feet anchors, complete RGBA crops and distinct walk poses',()=>{
  assert.deepEqual(manifest,JSON.parse(fs.readFileSync('web/src/scene/characters-v1.json','utf8')));
  assert.equal(Object.keys(manifest.frames).length,48);
  for(const character of ['hero','helena','davi']){
    const p=PNG.sync.read(fs.readFileSync(`public/characters/${character}-v1.png`));assert.equal(p.width,192);assert.equal(p.height,224);
    for(const direction of ['se','sw','ne','nw']){
      const samples=[];
      for(const pose of ['idle','walk_a','walk_b','talk']){
        const f=manifest.frames[`${character}.${direction}.${pose}`];assert.ok(f);assert.deepEqual(f.pivot,[24,50]);assert.equal(f.w,48);assert.equal(f.h,56);assert.ok(f.x>=0&&f.y>=0&&f.x+48<=p.width&&f.y+56<=p.height);
        let visible=0,bottom=0;const pixels=[];
        for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){const offset=((f.y+y)*p.width+f.x+x)*4,alpha=p.data[offset+3];if(alpha){visible++;bottom=Math.max(bottom,y);}if(x===0||y===0||x===47||y===55)assert.equal(alpha,0,'sprite must not touch frame border');for(let c=0;c<4;c++)pixels.push(p.data[offset+c]);}
        assert.ok(visible>250);assert.equal(bottom,49,'feet must stay on common baseline');samples.push(Buffer.from(pixels));
      }
      assert.notDeepEqual(samples[1],samples[2],`${character}.${direction} walk frames`);
    }
  }
});

test('training atlas includes 16 complete poses, including four seated reserves',()=>{
  const m=JSON.parse(fs.readFileSync('public/characters/training-people-v1.json','utf8'));
  assert.deepEqual(m,JSON.parse(fs.readFileSync('web/src/scene/training-people-v1.json','utf8')));assert.equal(Object.keys(m.frames).length,16);
  const p=PNG.sync.read(fs.readFileSync('public/characters/training-people-v1.png'));
  for(const id of ['run_ne_a','run_ne_b','run_sw_a','run_sw_b','pass','receive','shoot','prepare','reserve_1','reserve_2','reserve_3','reserve_4','keeper_ready','keeper_save','coach','stretch']){
    const f=m.frames[`training.${id}`];assert.ok(f);assert.deepEqual(f.pivot,[24,50]);let visible=0;
    for(let y=0;y<56;y++)for(let x=0;x<48;x++){const alpha=p.data[((f.y+y)*p.width+f.x+x)*4+3];if(alpha)visible++;if(x===0||y===0||x===47||y===55)assert.equal(alpha,0,id);}
    assert.ok(visible>200,id);
  }
});

test('all roster players train, with stable identity, safe spacing and keepers in the goalmouth',()=>{
  assert.equal(trainingGoal.x,trainingPitch.right);assert.ok(trainingGoal.back>trainingGoal.x);
  const base=squadFor(0),players=[...base,...base.slice(11,17).map((p,i)=>({...p,id:`extra_${i}`}))];
  for(let time=0;time<60;time+=.25){
    const actors=trainingRoster(players,time);assert.equal(actors.length,24);assert.deepEqual(actors.map(a=>a.id),players.map(p=>p.id));
    for(const a of actors){assert.ok(a.cell[0]>=1&&a.cell[0]<13.5&&a.cell[1]>1&&a.cell[1]<9);if(a.ball)assert.ok(a.ball[0]>=1&&a.ball[0]<13.5);if(a.position==='GOL'&&a.id!=='extra_0')assert.ok(a.cell[1]>trainingGoal.top&&a.cell[1]<trainingGoal.bottom);}
    for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++){const a=project(actors[i].cell),b=project(actors[j].cell);assert.ok(Math.abs(a[0]-b[0])>=18||Math.abs(a[1]-b[1])>=32,`${actors[i].number}/${actors[j].number} overlap at ${time}`);}
  }
  for(let club=0;club<12;club++)assert.equal(trainingRoster(squadFor(club),0).length,18);
  assert.notDeepEqual(trainingRoster(base,0).map(a=>a.cell),trainingRoster(base,2).map(a=>a.cell));
});

test('standard v2 atlas has shared cells, optical pivots, role scale and approved mirror provenance',()=>{
  const m=JSON.parse(fs.readFileSync('public/characters/manifest-v2.json','utf8'));assert.deepEqual(m,JSON.parse(fs.readFileSync('web/src/scene/characters-v2.json','utf8')));assert.equal(Object.keys(m.frames).length,64);
  for(const character of ['hero','helena','davi','keeper']){
    const p=PNG.sync.read(fs.readFileSync(`public/characters/${character}-v2.png`));assert.equal(p.width,256);assert.equal(p.height,256);let scale;
    for(const [row,dir] of ['se','sw','ne','nw'].entries())for(const [col,pose] of ['idle','walk_a','walk_b','action'].entries()){
      const f=m.frames[`${character}.${dir}.${pose}`];assert.deepEqual(f.pivot,[32,58]);assert.equal(f.w,64);assert.equal(f.h,64);assert.ok(f.content.x>0&&f.content.x+f.content.w<64&&f.content.y>0);if(pose==='idle')assert.ok(f.content.h>=38&&f.content.h<=42,character);scale??=f.scale;assert.equal(f.scale,scale);
      assert.equal(f.mirror,col===2);assert.equal(f.sourceSlot,col===2?(row^1)*4+1:row*4+col);
      let visible=0,bottom=0;for(let y=0;y<64;y++)for(let x=0;x<64;x++){const alpha=p.data[((f.y+y)*256+f.x+x)*4+3];if(alpha){visible++;bottom=Math.max(bottom,y);}if(x===0||x===63||y===0||y===63)assert.equal(alpha,0);}
      assert.ok(visible>250);assert.equal(bottom,57);
    }
  }
});

test('training camera preserves pointer coordinates for the expanded walkable scene',()=>{
  for(const cell of [[0,0],[6.5,.5],[12.5,9.5],[14,10]]){const p=project(cell),r=sceneToWorld('training',worldToScene('training',p));assert.ok(Math.abs(p[0]-r[0])<.75&&Math.abs(p[1]-r[1])<.75);}
  assert.deepEqual(sceneToWorld('office',[10,20]),[10,20]);
});

test('24 training athletes have no opaque sprite intersections over the sampled animation cycle',()=>{
  const m=JSON.parse(fs.readFileSync('public/characters/manifest-v2.json','utf8'));
  const images=Object.fromEntries(['davi','keeper'].map(k=>[k,PNG.sync.read(fs.readFileSync(`public/characters/${k}-v2.png`))]));
  const base=squadFor(0),players=[...base,...base.slice(11,17).map((p,i)=>({...p,id:`extra_${i}`}))];
  for(let time=0;time<60;time+=.25){
    const actors=trainingRoster(players,time).map(a=>{
      const role=a.position==='GOL'?'keeper':'davi',pose=a.action?'action':a.moving?(Math.floor(a.phase/2)%2?'walk_b':'walk_a'):'idle',f=m.frames[`${role}.${a.direction}.${pose}`],p=project(a.cell);
      return {a,f,img:images[role],x:Math.round(p[0]-32)+f.content.x,y:Math.round(p[1]-58)+f.content.y};
    });
    for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++){
      const a=actors[i],b=actors[j],left=Math.max(a.x,b.x),right=Math.min(a.x+a.f.content.w,b.x+b.f.content.w),top=Math.max(a.y,b.y),bottom=Math.min(a.y+a.f.content.h,b.y+b.f.content.h);
      for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
        const ax=a.f.x+a.f.content.x+x-a.x,ay=a.f.y+a.f.content.y+y-a.y,bx=b.f.x+b.f.content.x+x-b.x,by=b.f.y+b.f.content.y+y-b.y;
        assert.ok(a.img.data[(ay*256+ax)*4+3]<=180||b.img.data[(by*256+bx)*4+3]<=180,`${a.a.name}/${b.a.name} intersect at ${time}s`);
      }
    }
  }
});
test('screen vectors choose four isometric directions and animation stops at idle',()=>{
  assert.equal(directionFromVector(32,16),'se');assert.equal(directionFromVector(-32,16),'sw');assert.equal(directionFromVector(32,-16),'ne');assert.equal(directionFromVector(-32,-16),'nw');assert.equal(directionFromVector(0,0,'nw'),'nw');
  assert.equal(characterPose(false,10),'idle');assert.equal(characterPose(true,0),'walk_a');assert.equal(characterPose(true,2),'walk_b');assert.equal(characterPose(true,4),'walk_a');assert.equal(characterPose(false,0,true),'talk');
});
