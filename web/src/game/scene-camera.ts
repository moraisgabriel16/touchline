import type {Cell,Location} from './data.ts';
export const trainingCamera={scale:.72,x:71,y:6};
export function sceneToWorld(location:Location,[x,y]:Cell):Cell{return location==='training'?[(x-trainingCamera.x)/trainingCamera.scale,(y-trainingCamera.y)/trainingCamera.scale]:[x,y];}
export function worldToScene(location:Location,[x,y]:Cell):Cell{return location==='training'?[Math.round(x*trainingCamera.scale+trainingCamera.x),Math.round(y*trainingCamera.scale+trainingCamera.y)]:[x,y];}
