import {test,expect} from './game-session.ts';
import type {Page} from '@playwright/test';
const nav=(p:Page,name:string)=>p.getByRole('navigation').getByRole('button',{name,exact:true}).click();
async function finish(p:Page){await p.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();await p.getByRole('button',{name:'Pular para o intervalo',exact:true}).click();await p.getByRole('button',{name:'Começar segundo tempo',exact:true}).click();await p.getByRole('button',{name:'Pular para o apito final',exact:true}).click();await p.getByRole('button',{name:'Encerrar partida e atualizar rodada',exact:true}).click();await p.getByRole('button',{name:'Continuar',exact:true}).click();}
async function davi(p:Page){await nav(p,'Elenco');await p.getByRole('button',{name:'Davi Nascimento',exact:true}).click();}

test('carreira conecta conversa, promessa, treino, recompensa, súmula e save',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
  await nav(page,'Minha carreira');await expect(page.getByRole('heading',{name:'Um passo de cada vez.',exact:true})).toBeVisible();
  await page.screenshot({path:'artifacts/web/career-hub.png',fullPage:true});
  await davi(page);await page.getByRole('button',{name:'Ouvir o atleta',exact:false}).click();await expect(page.locator('.athlete-reply')).toContainText('plano claro');await expect(page.getByRole('button',{name:'Ouvir o atleta',exact:false})).toBeDisabled();
  await page.getByRole('button',{name:'Fechar janela',exact:true}).click();await finish(page);
  await davi(page);await page.getByRole('button',{name:'Combinar devolutiva do treino',exact:false}).click();await page.getByRole('button',{name:'Confirmar compromisso',exact:true}).click();await expect(page.locator('.promise-note')).toContainText('Compromisso pendente');
  await page.screenshot({path:'artifacts/web/player-relationship.png',fullPage:true});await page.getByRole('button',{name:'Fechar janela',exact:true}).click();
  await page.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Há compromissos');await page.getByRole('button',{name:'Voltar ao CT',exact:true}).click();
  await nav(page,'Mundo do futebol');await page.getByRole('button',{name:'Entrar · Sede e CT',exact:true}).click();await page.getByRole('button',{name:'Treinar a equipe',exact:true}).click();
  await davi(page);await page.getByRole('button',{name:'Entregar devolutiva combinada',exact:false}).click();await expect(page.locator('.promise-note')).toContainText('Palavra cumprida');await page.getByRole('button',{name:'Fechar janela',exact:true}).click();
  await nav(page,'Minha carreira');const reward=page.locator('.objective-cards article').filter({hasText:'Palavra cumprida'});await reward.getByRole('button',{name:'Receber recompensa',exact:true}).click();await expect(reward.getByRole('button',{name:'Recebido',exact:true})).toBeDisabled();
  await page.locator('.report-card').first().click();await expect(page.getByRole('dialog')).toContainText('SÚMULA');await page.getByRole('button',{name:'Fechar janela',exact:true}).click();
  await expect(page.getByText('Salvo neste navegador',{exact:true})).toBeVisible();await page.reload();await davi(page);await expect(page.locator('.promise-note')).toContainText('Palavra cumprida');expect(errors).toEqual([]);
});

test('CT abre ficha por clique e seleção; busca, escalação e conforto funcionam no mobile',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'CT',exact:true}).click();await expect(page.locator('canvas')).toHaveAttribute('data-character-state','ready');
  await page.locator('.training-roster-list button').filter({hasText:'Davi Nascimento'}).click();await page.getByRole('button',{name:'Conversar com o atleta',exact:false}).click();await expect(page.getByRole('dialog')).toContainText('Davi Nascimento');await page.getByRole('button',{name:'Fechar janela',exact:true}).click();
  await nav(page,'Elenco');await page.getByRole('searchbox').fill('Davi');await expect(page.locator('.roster tbody tr')).toHaveCount(1);await page.getByRole('button',{name:'Davi Nascimento',exact:true}).click();await page.getByRole('button',{name:'Ver escalação',exact:false}).click();await page.getByRole('button',{name:'Escalar disponíveis',exact:true}).click();await expect(page.locator('.player-token')).toHaveCount(11);
  await page.getByRole('button',{name:'Opções da partida',exact:true}).click();await page.getByLabel('Reduzir animações dos ambientes e partidas',{exact:true}).check();await page.getByLabel('Aumentar contraste dos textos',{exact:true}).check();await page.getByRole('button',{name:'Voltar ao jogo',exact:true}).click();
  await nav(page,'Minha carreira');await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/web/career-mobile.png',fullPage:true});
  await page.reload();await expect(page.locator('.app-shell')).toHaveClass(/reduced-motion/);await expect(page.locator('.app-shell')).toHaveClass(/high-contrast/);
});
