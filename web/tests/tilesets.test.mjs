import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PNG } from 'pngjs';

const manifest=JSON.parse(fs.readFileSync('public/tilesets/manifest-v1.json','utf8'));
test('runtime tilesets contain 48 nonempty RGBA frames and a matching typed-app manifest',()=>{
  assert.equal(Object.keys(manifest.frames).length,48);
  assert.deepEqual(manifest,JSON.parse(fs.readFileSync('web/src/scene/atlas-v1.json','utf8')));
  for(const [name,sheet] of Object.entries(manifest.sheets)) {
    const png=PNG.sync.read(fs.readFileSync(`public/tilesets/${sheet.file}`));
    assert.equal(png.width,sheet.width);assert.equal(png.height,sheet.height);
    assert.ok(png.data.some((value,index)=>index%4===3&&value===0),'atlas must retain transparent background');
    const frames=Object.entries(manifest.frames).filter(([,frame])=>frame.sheet===name);
    assert.equal(frames.length,16);
    for(const [id,f] of frames) {
      assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=png.width&&f.y+f.h<=png.height,id);
      assert.ok(f.pivot[0]>=0&&f.pivot[0]<=f.w&&f.pivot[1]>=0&&f.pivot[1]<=f.h,id);
      let visible=0;
      for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++)visible+=png.data[((f.y+y)*png.width+f.x+x)*4+3]>0?1:0;
      assert.ok(visible>f.w*f.h*.1,`nonempty frame: ${id}`);
    }
  }
});
test('terrain tiles fit exact 64x32 diamonds and never paint outside the footprint',()=>{
  for(const [id,f] of Object.entries(manifest.frames).filter(([id])=>/oak_|terracotta|rug|concrete|ceramic|grass_|dirt/.test(id))) {
    assert.equal(f.w,64,id);assert.equal(f.h,32,id);
    const png=PNG.sync.read(fs.readFileSync(`public/tilesets/${manifest.sheets[f.sheet].file}`));
    for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(Math.abs((x+.5-32)/32)+Math.abs((y+.5-16)/16)>1)assert.equal(png.data[((f.y+y)*png.width+f.x+x)*4+3],0,id);
  }
});
test('the standalone terrain sheet has twelve complete 64x32 crops',()=>{
  const terrainMeta=JSON.parse(fs.readFileSync('public/tilesets/terrain-v1.json','utf8'));
  const terrain=PNG.sync.read(fs.readFileSync('public/tilesets/terrain-v1.png'));
  assert.equal(terrain.width,256);assert.equal(terrain.height,96);assert.equal(Object.keys(terrainMeta.frames).length,12);
  for(const [id,f] of Object.entries(terrainMeta.frames)) {
    const original=manifest.frames[id],source=PNG.sync.read(fs.readFileSync(`public/tilesets/${manifest.sheets[original.sheet].file}`));
    for(let y=0;y<32;y++)for(let x=0;x<64;x++)for(let c=0;c<4;c++)assert.equal(terrain.data[((f.y+y)*terrain.width+f.x+x)*4+c],source.data[((original.y+y)*source.width+original.x+x)*4+c]);
  }
});
