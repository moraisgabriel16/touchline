import {validateSave} from './domain.ts';
import type {Game} from './domain.ts';
import {SAVE_KEY} from './storage.ts';
export const ACTIVE_SLOT='touchline.active-slot.v1';
export const PLAYING_KEY='touchline.playing.v1';
export const slotKey=(slot:number)=>{if(!Number.isInteger(slot)||slot<0||slot>2)throw new Error('Slot inválido.');return slot===0?SAVE_KEY:`${SAVE_KEY}.slot-${slot+1}`;};
type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export interface SaveSlot {id:number;game?:Game;occupied:boolean;corrupt:boolean;date:string|null}
export function activeSlot(storage:Pick<Storage,'getItem'>){const raw=storage.getItem(ACTIVE_SLOT);return raw==='1'?1:raw==='2'?2:0;}
export function listSlots(storage:Pick<Storage,'getItem'>):SaveSlot[]{return [0,1,2].map(id=>{const raw=storage.getItem(slotKey(id));if(!raw)return {id,occupied:false,corrupt:false,date:null};try{return {id,occupied:true,corrupt:false,game:validateSave(JSON.parse(raw)),date:storage.getItem(`${slotKey(id)}.date`)};}catch{return {id,occupied:true,corrupt:true,date:null};}});}
export function writeSlot(storage:Pick<Storage,'setItem'>,id:number,game:Game){storage.setItem(slotKey(id),JSON.stringify(game));try{storage.setItem(`${slotKey(id)}.date`,new Date().toISOString());}catch{/* The game itself is already persisted. */}}
export function createSlot(storage:Store,id:number,game:Game){if(storage.getItem(slotKey(id)))throw new Error('Este slot já está ocupado. Escolha um slot vazio.');writeSlot(storage,id,validateSave(game));}
export function removeSlot(storage:Store,id:number){const key=slotKey(id),raw=storage.getItem(key);if(raw)storage.setItem(`${key}.backup`,raw);storage.removeItem(key);storage.removeItem(`${key}.date`);}
export function restoreSlot(storage:Store,id:number){const key=slotKey(id);if(storage.getItem(key))throw new Error('O slot precisa estar vazio para restaurar.');const raw=storage.getItem(`${key}.backup`);if(!raw)throw new Error('Nenhuma cópia de segurança disponível.');const game=validateSave(JSON.parse(raw));writeSlot(storage,id,game);return game;}
export function checkpoint(storage:Store,id:number){const key=slotKey(id),raw=storage.getItem(key);if(raw)storage.setItem(`${key}.backup`,raw);}
export function cleanName(value:string){return value.trim().replace(/\s+/g,' ');}
export function validName(value:unknown):value is string{return typeof value==='string'&&value===cleanName(value)&&value.length>=2&&value.length<=32&&!/[\u0000-\u001f\u007f]/.test(value);}
