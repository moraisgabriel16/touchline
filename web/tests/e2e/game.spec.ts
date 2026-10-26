import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('CT tem elenco completo em treino, gol alinhado e caminho até Davi e a saída',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');await page.getByRole('button',{name:'CT',exact:true}).click();
  const canvas=page.locator('canvas');await expect(canvas).toHaveAttribute('data-training-state','ready');await expect(canvas).toHaveAttribute('data-character-state','ready');
  await expect(canvas).toHaveAttribute('data-training-count','18');await expect(page.locator('.training-roster-list button')).toHaveCount(18);await expect(page.getByText('18/18 atletas em treino',{exact:true})).toBeVisible();
  const before=await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL());
  await expect.poll(()=>canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL())).not.toBe(before);
  await page.screenshot({path:'artifacts/web/training-upgraded.png',fullPage:true});
  await canvas.screenshot({path:'artifacts/web/training-scene-v2.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
  expect(await canvas.evaluate(async c=>{const frames=new Set<string>();for(let i=0;i<12;i++){await new Promise<void>(r=>requestAnimationFrame(()=>r()));frames.add((c as HTMLCanvasElement).toDataURL());}return frames.size;})).toBe(1);
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/web/training-upgraded-mobile.png',fullPage:true});
  await target(page,'Observar Davi','Registrar observação · +30 XP');await target(page,'Entrar na diretoria');await expect(page.getByRole('heading',{name:'Diretoria.',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});

test('atlas padronizados têm grade de inspeção, transparência e download',async({page})=>{
  await page.goto('/');await page.getByRole('navigation').getByRole('button',{name:'Atlas de personagens',exact:true}).click();await expect(page.locator('.character-atlas-review img')).toHaveCount(4);
  await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.character-atlas-review img')].map(i=>(i as HTMLImageElement).decode()));});
  await expect(page.locator('.character-atlas-review svg')).toHaveCount(4);await page.getByRole('checkbox').uncheck();await expect(page.locator('.character-atlas-review svg')).toHaveCount(0);await page.getByRole('checkbox').check();
  const download=page.waitForEvent('download');await page.locator('.character-atlas-cards section').last().getByRole('link',{name:'Baixar atlas PNG ↓'}).click();expect((await download).suggestedFilename()).toBe('keeper-v2.png');
  await page.screenshot({path:'artifacts/web/character-atlas-standard-v2.png',fullPage:true});await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('CT inclui os seis recrutados, sem omitir reservas, e permite localizar por nome',async({page})=>{
  await page.goto('/');await page.getByRole('navigation').getByRole('button',{name:'Mundo do futebol',exact:true}).click();await page.getByRole('button',{name:'Entrar · Campo de várzea',exact:true}).click();
  for(let i=0;i<6;i++){await page.getByRole('button',{name:'Observar e contratar · R$ 1.500',exact:true}).click();await page.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();await finishMatch(page);await page.getByRole('button',{name:'Continuar',exact:true}).click();}
  await page.getByRole('navigation').getByRole('button',{name:'Ambientes',exact:true}).click();await page.getByRole('button',{name:'CT',exact:true}).click();const canvas=page.locator('canvas');await expect(canvas).toHaveAttribute('data-character-state','ready');await expect(canvas).toHaveAttribute('data-training-count','24');await expect(page.locator('.training-roster-list button')).toHaveCount(24);
  await page.locator('.training-roster-list button').filter({hasText:'Luan Terra'}).click();await expect(page.locator('.training-roster-list button').filter({hasText:'Luan Terra'})).toHaveAttribute('aria-pressed','true');
  await canvas.screenshot({path:'artifacts/web/training-all-24.png'});await page.screenshot({path:'artifacts/web/training-roster-24.png',fullPage:true});
});

test('carreira integra escolha de clube, instalações, torcida, várzea, uniforme e guia',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await mkdir('artifacts/web',{recursive:true});await page.goto('/');
  await page.getByRole('navigation').getByRole('button',{name:'Central do clube',exact:true}).click();
  await page.getByRole('button',{name:'Escolher clube',exact:true}).click();await expect(page.locator('.club-picker button')).toHaveCount(12);
  await page.getByRole('button',{name:'Escolher Atlético Vila Neon',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Atlético Vila Neon');await page.getByRole('button',{name:'Confirmar nova partida',exact:true}).click();await expect(page.locator('.topbar')).toContainText('Atlético Vila Neon');
  const nav=(name:string)=>page.getByRole('navigation').getByRole('button',{name,exact:true}).click();
  await nav('Mundo do futebol');
  for(const [name,file] of [['Estádio','stadium'],['Sede e CT','ct'],['Praça da torcida','fans'],['Campo de várzea','varzea']]){
    await page.getByRole('button',{name:`Entrar · ${name}`,exact:true}).click();await expect(page.locator('.island-prop')).toHaveCount(16);await page.locator('.island-prop').last().click();
    await page.evaluate(async()=>{const sources=[...new Set([...document.querySelectorAll('.football-island image')].map(image=>image.getAttribute('href')!))];await Promise.all(sources.map(async src=>{const image=new Image();image.src=src;await image.decode();}));});
    await page.screenshot({path:`artifacts/web/playable-${file}.png`,fullPage:true});
  }
  await page.getByRole('button',{name:'Observar e contratar · R$ 1.500',exact:true}).click();await expect(page.getByText('Luan Terra',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Entrar · Sede e CT',exact:true}).click();await page.getByRole('button',{name:'Treinar a equipe',exact:true}).click();await expect(page.getByRole('button',{name:'Treinar a equipe',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Melhorar CT · R$ 6.000',exact:true}).click();
  await page.getByRole('button',{name:'Entrar · Praça da torcida',exact:true}).click();await page.getByRole('button',{name:'Encontrar a torcida · R$ 1.000',exact:true}).click();await expect(page.locator('.football-resources')).toContainText('0 / 3');
  await page.getByRole('button',{name:'Entrar · Estádio',exact:true}).click();await page.getByLabel('Preço do ingresso',{exact:true}).selectOption('30');await page.getByRole('button',{name:'Ampliar estádio · R$ 8.000',exact:true}).click();
  await nav('Central do clube');await page.getByLabel('Uniforme em uso',{exact:true}).selectOption('away');
  await nav('Escalação');await page.locator('.player-token').last().click();await page.getByRole('button',{name:/Luan Terra/}).click();await expect(page.getByTestId('slot-recruit_11_0')).toBeVisible();await expect(page.locator('.player-token image').first()).toHaveAttribute('href',/identity-city-v1.png/);await page.screenshot({path:'artifacts/web/playable-kits.png',fullPage:true});
  await page.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();await finishMatch(page);await expect(page.locator('.result-list>div')).toHaveCount(6);await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.getByText('Salvo neste navegador')).toBeVisible();await page.reload();await expect(page.locator('.topbar')).toContainText('Atlético Vila Neon');
  await nav('Mundo do futebol');await expect(page.locator('.football-resources')).toContainText('3 / 3');await page.getByRole('button',{name:'Entrar · Sede e CT',exact:true}).click();await expect(page.getByText(/CT nível 1\/3/)).toBeVisible();await page.getByRole('button',{name:'Recuperar a equipe',exact:true}).click();
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/web/playable-mobile.png',fullPage:true});
  await nav('Como jogar');await expect(page.getByRole('heading',{name:'Do bairro ao campeonato.',exact:true})).toBeVisible();await expect(page.getByText(/A liga de 12 clubes tem 22 rodadas/)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/web/how-to-play-mobile.png',fullPage:true});expect(errors).toEqual([]);
});

async function target(page:Page,label:string,choice?:string){
  await page.getByRole('button',{name:label,exact:true}).click();
  if(choice) {await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:choice,exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);}
}
test('RPG, portas, gestão e save formam um fluxo completo por cliques',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');await expect(page.getByRole('heading',{name:'Apartamento.',exact:true})).toBeVisible();
  await target(page,'Caixa de Antônio','Guardar para depois');
  await target(page,'Caixa de Antônio','Estudar o caderno · +20 XP');
  await target(page,'Sair para o clube');await expect(page.getByRole('heading',{name:'Diretoria.',exact:true})).toBeVisible();
  await target(page,'Helena Duarte','Quero conhecer o clube primeiro');
  await target(page,'Helena Duarte','Aceitar a observação no CT');
  await target(page,'Entrar no CT');await expect(page.getByRole('heading',{name:'Centro de treinamento.',exact:true})).toBeVisible();
  await target(page,'Observar Davi','Registrar observação · +30 XP');
  await target(page,'Entrar na diretoria');await expect(page.getByRole('heading',{name:'Diretoria.',exact:true})).toBeVisible();
  await target(page,'Helena Duarte','Entregar observação · +50 XP');
  await expect(page.getByText('Nível 2 · 100 XP')).toBeVisible();
  await page.getByRole('button',{name:'Abrir diário',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Entreguei o primeiro relatório');await page.getByRole('button',{name:'Voltar ao ambiente'}).click();
  await page.getByRole('navigation').getByRole('button',{name:'Escalação'}).click();await page.getByTestId('slot-g01').click();await page.getByRole('button',{name:/GOL.*Vinícius/}).click();await expect(page.getByTestId('slot-g02')).toBeVisible();
  await page.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();await finishMatch(page);await expect(page.getByRole('dialog')).toContainText('Rodada 1 encerrada');await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.getByText('Salvo neste navegador')).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'Diretoria.',exact:true})).toBeVisible();await expect(page.getByText('Nível 2 · 100 XP')).toBeVisible();
  await target(page,'Helena Duarte','Até a próxima, Helena');await expect(page.getByText('Nível 2 · 100 XP')).toBeVisible();
  await page.getByRole('navigation').getByRole('button',{name:'Escalação'}).click();await expect(page.getByTestId('slot-g02')).toBeVisible();
  expect(errors).toEqual([]);
});
test('22 rodadas encerram a liga, próxima temporada preserva carreira e reinício pede confirmação',async({page})=>{
  await page.goto('/');for(let i=1;i<=22;i++){await page.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();await finishMatch(page);await expect(page.getByRole('dialog')).toContainText(`Rodada ${i} encerrada`);await page.getByRole('button',{name:'Continuar',exact:true}).click();}
  await expect(page.getByRole('button',{name:'Jogar próxima rodada',exact:true})).toBeDisabled();
  await page.getByRole('navigation').getByRole('button',{name:'Campeonato',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(12);await expect(page.getByText('Temporada encerrada',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Nova partida',exact:true}).click();await page.getByRole('button',{name:'Voltar sem reiniciar'}).click();await expect(page.getByRole('button',{name:'Jogar próxima rodada',exact:true})).toBeDisabled();
  await page.getByRole('navigation').getByRole('button',{name:'Central do clube',exact:true}).click();await page.getByRole('button',{name:'Próxima temporada · 2028',exact:true}).click();await expect(page.getByRole('button',{name:'Jogar próxima rodada',exact:true})).toBeEnabled();await expect(page.locator('.topbar')).toContainText('2028');
  await page.getByRole('button',{name:'Nova partida',exact:true}).click();await page.getByRole('button',{name:'Confirmar nova partida'}).click();await expect(page.getByRole('heading',{name:'Apartamento.',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Jogar próxima rodada',exact:true})).toBeEnabled();
});
test('canvas recebe clique de chão e interação no próprio cenário',async({page})=>{
  await page.goto('/');const canvas=page.locator('canvas');const bounds=(await canvas.boundingBox())!;
  // Cell [3,5] then box [5,3]; native scene coordinates map proportionally.
  await canvas.click({position:{x:216/640*bounds.width,y:197/360*bounds.height}});
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('touchline.web.save.v1')??'null')?.hero?.positions?.apartment)).toEqual([3,5]);
  await canvas.click({position:{x:344/640*bounds.width,y:189/360*bounds.height}});
  await expect(page.getByRole('dialog')).toContainText('A caixa de Antônio');await page.getByRole('button',{name:'Guardar para depois'}).click();
});
test('importação inválida preserva estado; exportação e importação válidas funcionam',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Jogar próxima rodada',exact:true}).click();await finishMatch(page);await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await page.locator('input[type=file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"schema":99}')});await expect(page.getByRole('dialog')).toContainText('Partida inválida');await page.getByRole('button',{name:'Entendi'}).click();await expect(page.getByText('RODADA 02 / 22',{exact:true})).toBeVisible();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar partida',exact:true}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('touchline-partida.json');const savePath=(await download.path())!;
  await page.getByRole('button',{name:'Nova partida',exact:true}).click();await page.getByRole('button',{name:'Confirmar nova partida'}).click();await page.locator('input[type=file]').setInputFiles(savePath);await page.getByRole('button',{name:'Confirmar importação'}).click();await expect(page.getByText('RODADA 02 / 22',{exact:true})).toBeVisible();
});
test('desktop e celular têm interface utilizável e sem overflow global',async({page})=>{
  await mkdir('artifacts/web',{recursive:true});await page.goto('/');await expect(page.locator('canvas')).toHaveAttribute('data-art-state','ready');await page.screenshot({path:'artifacts/web/desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await expect(page.getByRole('heading',{name:'Apartamento.',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'artifacts/web/mobile.png',fullPage:true});await page.getByRole('button',{name:'Opções da partida'}).click();await expect(page.getByRole('button',{name:'Exportar partida',exact:true})).toBeVisible();await page.getByRole('button',{name:'Voltar ao jogo'}).click();
  await page.getByRole('navigation').getByRole('button',{name:'Escalação'}).click();await page.getByTestId('slot-g01').click();await page.getByRole('button',{name:/GOL.*Vinícius/}).click();await expect(page.getByTestId('slot-g02')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('os três ambientes usam os atlas PNG publicados sem erros de carregamento',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const failed:string[]=[];page.on('requestfailed',request=>failed.push(request.url()));
  await mkdir('artifacts/web',{recursive:true});await page.goto('/');
  for(const [button,file] of [['Apartamento','apartment-pixel-art'],['Diretoria','office-pixel-art'],['CT','training-pixel-art']]) {
    await page.getByRole('button',{name:button,exact:true}).click();
    await expect(page.locator('canvas')).toHaveAttribute('data-art-state','ready');
    await expect(page.locator('canvas')).toHaveAttribute('data-character-state','ready');
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
    await page.screenshot({path:`artifacts/web/${file}.png`,fullPage:true});
  }
  expect(errors).toEqual([]);expect(failed).toEqual([]);
});
test('falha de imagem informa o jogador e preserva a interação pelo fallback',async({page})=>{
  await page.route('**/tilesets/residential-v1.png',route=>route.abort());
  await page.goto('/');await expect(page.locator('canvas')).toHaveAttribute('data-art-state','error');
  await expect(page.getByText('Falha ao carregar a arte. Recarregue para tentar novamente.')).toBeVisible();
  await target(page,'Caixa de Antônio','Guardar para depois');
});
test('biblioteca de futebol exibe sete categorias e exporta uniformes recortados',async({page})=>{
  const failures:string[]=[];page.on('pageerror',error=>failures.push(error.message));
  await page.goto('/');await page.getByRole('navigation').getByRole('button',{name:'Atlas de futebol',exact:true}).click();
  await expect(page.locator('.football-asset-card')).toHaveCount(16);
  await page.getByRole('button',{name:'Ver Casa · Aurora Atlético',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Casa · Aurora Atlético');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Baixar elemento PNG',exact:true}).click();expect((await pending).suggestedFilename()).toBe('aurora.home.png');await page.getByRole('button',{name:'Voltar à coleção'}).click();
  await expect(page.getByText('BIBLIOTECA DE PIXEL ART · 112 ELEMENTOS')).toBeVisible();
  for(const [tab,file] of [['Brasões e uniformes','identity'],['Estádios','stadiums'],['Clubes e instalações','facilities'],['Torcida','crowd'],['Futebol de várzea','varzea'],['Litoral e serra','identity-coast'],['Bairros e caminhos','identity-city']]){
    await page.getByRole('button',{name:tab,exact:true}).click();await expect(page.locator('.football-asset-card')).toHaveCount(16);
    await page.evaluate(async()=>{const sources=[...new Set([...document.querySelectorAll('.football-asset-preview image')].map(image=>image.getAttribute('href')!))];await Promise.all(sources.map(async src=>{const image=new Image();image.src=src;await image.decode();}));});
    await page.screenshot({path:`artifacts/web/football-${file}.png`,fullPage:true});
  }
  await page.getByRole('button',{name:'Ver Visitante · Atlético Vila Neon',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('frontal para interface');
  const newDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Baixar elemento PNG',exact:true}).click();expect((await newDownload).suggestedFilename()).toBe('vila_neon.away.png');
  await page.getByRole('button',{name:'Voltar à coleção'}).click();
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(failures).toEqual([]);
  await page.screenshot({path:'artifacts/web/football-team-styles-mobile.png',fullPage:true});
});

async function finishMatch(page:Page){
  await page.getByRole('button',{name:'Pular para o intervalo',exact:true}).click();
  await page.getByRole('button',{name:'Começar segundo tempo',exact:true}).click();
  await page.getByRole('button',{name:'Pular para o apito final',exact:true}).click();
  await page.getByRole('button',{name:'Encerrar partida e atualizar rodada',exact:true}).click();
}
