import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PNG } from 'pngjs';

const catalog=JSON.parse(fs.readFileSync('data/football/asset-catalog-v1.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('public/football/manifest-v1.json','utf8'));
test('football catalog has 112 unique usable RGBA sprites across seven atlas sheets',()=>{
  assert.equal(catalog.categories.length,7);assert.equal(Object.keys(manifest.frames).length,112);
  assert.deepEqual(manifest,JSON.parse(fs.readFileSync('web/src/art/football-manifest-v1.json','utf8')));
  const ids=catalog.categories.flatMap(group=>group.items.map(item=>item.id));assert.equal(new Set(ids).size,112);
  for(const group of catalog.categories){
    assert.equal(group.items.length,16);const sheet=manifest.sheets[group.id],png=PNG.sync.read(fs.readFileSync(`public/football/${sheet.file}`));
    assert.equal(png.width,sheet.width);assert.equal(png.height,sheet.height);
    assert.ok(png.data.some((value,index)=>index%4===3&&value===0),'must preserve alpha');
    for(const item of group.items){const f=manifest.frames[item.id];assert.ok(f,item.id);assert.equal(f.sheet,group.id);assert.ok(f.w>0&&f.h>0&&f.x>=0&&f.y>=0&&f.x+f.w<=png.width&&f.y+f.h<=png.height);assert.ok(f.pivot[0]>=0&&f.pivot[0]<=f.w&&f.pivot[1]>=0&&f.pivot[1]<=f.h);let visible=0;for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)if(png.data[((f.y+y)*png.width+f.x+x)*4+3]>0)visible++;assert.ok(visible>f.w*f.h*.08,item.id);}
  }
});
test('twelve identities have full kits, and the original four retain their stadium and headquarters',()=>{
  assert.equal(catalog.clubs.length,12);
  assert.deepEqual(catalog.clubs.slice(0,4).map(club=>club.id),['aurora','ferroviaria','horizonte','ribeirense']);
  for(const [index,club] of catalog.clubs.entries())for(const suffix of index<4?['crest','home','away','flag','stadium','headquarters']:['crest','home','away','flag'])assert.ok(manifest.frames[`${club.id}.${suffix}`],club.id+'.'+suffix);
  for(const group of catalog.categories.filter(group=>group.id.startsWith('identity')))for(const item of group.items)assert.ok(item.id.startsWith(catalog.clubs[item.club].id+'.'),item.id);
});
test('varzea terrain uses 64x32 diamond footprints with transparent corners',()=>{
  const png=PNG.sync.read(fs.readFileSync('public/football/varzea-v1.png'));
  for(const item of catalog.categories.find(group=>group.id==='varzea').items.filter(item=>item.kind==='terrain')){
    const f=manifest.frames[item.id];assert.equal(f.w,64);assert.equal(f.h,32);
    for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(Math.abs((x+.5-32)/32)+Math.abs((y+.5-16)/16)>1)assert.equal(png.data[((f.y+y)*png.width+f.x+x)*4+3],0);
  }
});

test('match effects atlas has sixteen transparent, nonempty, bounded original frames',()=>{
 const manifest=JSON.parse(fs.readFileSync('web/src/football/match-effects-v1.json','utf8')),png=PNG.sync.read(fs.readFileSync('public/football/match-effects-v1.png'));
 assert.equal(png.width,64);assert.equal(png.height,64);assert.equal(Object.keys(manifest.frames).length,16);
 for(const f of Object.values(manifest.frames)){assert.deepEqual(f.pivot,[8,8]);let opaque=0;for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)if(png.data[((f.y+y)*png.width+f.x+x)*4+3])opaque++;assert.ok(opaque>0&&opaque<256);assert.equal(png.data[(f.y*png.width+f.x)*4+3],0);}
});
