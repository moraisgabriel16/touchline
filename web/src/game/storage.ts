import { newGame, validateSave } from './domain.ts';
import type { Game } from './domain.ts';

export const SAVE_KEY='touchline.web.save.v1';
export function loadGame(storage: Pick<Storage,'getItem'|'setItem'>) {
  try {
    const raw=storage.getItem(SAVE_KEY);
    if (!raw) return {game:newGame(),notice:'',blocked:false};
    try {
      const parsed=JSON.parse(raw),game=validateSave(parsed);
      if(parsed.schema!==game.schema){try{storage.setItem(`${SAVE_KEY}.before-v4`,raw);}catch{/* A full storage quota must not invalidate an otherwise readable save. */}}
      return {game,notice:'',blocked:false};
    }
    catch {
      // Preserve the original before any automatic save replaces it.
      storage.setItem(`${SAVE_KEY}.recovery`,raw);
      return {game:newGame(),notice:'O save anterior era incompatível. Uma cópia de recuperação foi preservada neste navegador.',blocked:false};
    }
  } catch {
    return {game:newGame(),notice:'O navegador não permitiu acessar o salvamento. Use Exportar partida para guardar seu progresso.',blocked:true};
  }
}
export function saveGame(storage: Pick<Storage,'setItem'>,game: Game) {
  storage.setItem(SAVE_KEY,JSON.stringify(game));
}
