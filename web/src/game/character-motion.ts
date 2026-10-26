export type Direction='se'|'sw'|'ne'|'nw';
export function directionFromVector(dx:number,dy:number,previous:Direction='se'):Direction {
  if(Math.abs(dx)+Math.abs(dy)<.01)return previous;
  return dy>=0?(dx>=0?'se':'sw'):(dx>=0?'ne':'nw');
}
export function characterPose(moving:boolean,step:number,talking=false):'idle'|'walk_a'|'walk_b'|'talk'{
  if(talking)return 'talk';
  return moving?(Math.floor(step/2)%2===0?'walk_a':'walk_b'):'idle';
}
