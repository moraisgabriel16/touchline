import {test,expect} from './game-session.ts';
test('agenda prepara equipe, retoma save e oferece navegação no celular',async({page})=>{
 await page.goto('/');const desk=page.getByRole('region',{name:'Agenda da rodada'});
 await expect(desk).toBeVisible();await desk.getByRole('button',{name:'Treinar equipe',exact:true}).click();
 await expect(desk).toContainText('Condição 88%');await expect(desk.getByRole('button',{name:'Treinar equipe',exact:true})).toBeDisabled();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('touchline.web.save.v1')!).preparation.includes('train'));
 await page.reload();await expect(desk).toContainText('Condição 88%');
 await page.setViewportSize({width:390,height:844});await desk.getByRole('button',{name:'Revisar escalação'}).click();
 await expect(page.getByRole('heading',{name:'Um time com a sua ideia.'})).toBeVisible();
 await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('button',{name:'Ambientes',exact:true}).click();
 await desk.getByRole('button',{name:'Conversar com atleta'}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('dialog').getByRole('button',{name:'Fechar'}).click();
 await expect(page.locator('body')).toHaveJSProperty('scrollWidth',390);
 await desk.scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/web/session-mobile.png'});
});
