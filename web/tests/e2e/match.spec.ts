import {test,expect} from './game-session.ts';

test('partida dura 30s por tempo, pausa no intervalo e aceita troca persistente',async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install();await page.goto('/');
  await page.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Dia de jogo.',exact:true})).toBeVisible();
  await page.clock.runFor(5000);await expect(page.locator('.match-clock')).toContainText('7′');
  await page.getByRole('button',{name:'Pausar',exact:true}).click();const clock=await page.locator('.match-clock').textContent();
  await page.clock.runFor(2000);await expect(page.locator('.match-clock')).toHaveText(clock!);
  await page.screenshot({path:'artifacts/web/match-live.png',fullPage:true});
  await page.getByRole('button',{name:'Retomar partida',exact:true}).click();await page.clock.runFor(25200);
  await expect(page.locator('.match-clock')).toContainText('45′');await expect(page.locator('.halftime-panel')).toBeVisible();
  await page.getByLabel('Jogador que sai',{exact:true}).selectOption('d01');await page.getByLabel('Jogador que entra',{exact:true}).selectOption('d05');
  await page.getByRole('button',{name:'Confirmar substituição',exact:true}).click();await expect(page.locator('.halftime-panel')).toContainText('1/5');
  await page.clock.runFor(300);await page.reload();await expect(page.locator('.halftime-panel')).toContainText('1/5');
  await page.screenshot({path:'artifacts/web/match-halftime.png',fullPage:true});
  await page.getByRole('button',{name:'Começar segundo tempo',exact:true}).click();await page.getByLabel('Velocidade da partida',{exact:true}).selectOption('4');
  await page.clock.runFor(7600);await expect(page.locator('.match-clock')).toContainText('90′');
  await page.getByRole('button',{name:'Encerrar partida e atualizar rodada',exact:true}).click();await expect(page.locator('.result-list>div')).toHaveCount(6);
  await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect(page.locator('.round-control')).toContainText('02');expect(errors).toEqual([]);
});

test('pular preserva intervalo, não duplica rodada, mobile e save retomam partida',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();
  await page.getByRole('button',{name:'Pular para o intervalo',exact:true}).click();
  await expect(page.locator('.halftime-panel')).toBeVisible();await expect(page.locator('.round-control')).toContainText('01');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('.match-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth)).toBe(true);
  await page.screenshot({path:'artifacts/web/match-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Começar segundo tempo',exact:true}).click();await page.getByRole('button',{name:'Pausar',exact:true}).click();
  await expect(page.getByText('Salvo neste navegador',{exact:true})).toBeVisible();await page.reload();
  await expect(page.locator('.match-clock')).toContainText('2º tempo');await page.getByRole('button',{name:'Pular para o apito final',exact:true}).click();
  await page.getByRole('button',{name:'Encerrar partida e atualizar rodada',exact:true}).click();await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.locator('.round-control')).toContainText('02');
});

test('ambientes refinados mantêm atlas e navegação carregados',async({page})=>{
  await page.goto('/');await expect(page.locator('canvas')).toHaveAttribute('data-art-state','ready');
  await page.locator('canvas').screenshot({path:'artifacts/web/apartment-refined.png'});
  await page.getByRole('button',{name:'Diretoria',exact:true}).click();await expect(page.locator('canvas')).toHaveAttribute('data-art-state','ready');
  await page.locator('canvas').screenshot({path:'artifacts/web/office-refined.png'});
  await page.getByRole('button',{name:'CT',exact:true}).click();await expect(page.locator('canvas')).toHaveAttribute('data-character-state','ready');await page.locator('canvas').screenshot({path:'artifacts/web/training-refined.png'});
});
