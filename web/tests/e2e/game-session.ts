import {test as base,expect} from '@playwright/test';
import {newGame} from '../../src/game/domain.ts';
// Existing gameplay suites start from a saved, active session; onboarding is tested separately.
export const test=base.extend({page:async({page},use)=>{
 await page.addInitScript(game=>{if(!sessionStorage.getItem('touchline.e2e.initialized')){if(!localStorage.getItem('touchline.web.save.v1'))localStorage.setItem('touchline.web.save.v1',JSON.stringify(game));sessionStorage.setItem('touchline.playing.v1','1');sessionStorage.setItem('touchline.e2e.initialized','1');}},newGame());
 await use(page);
}});
export {expect};
