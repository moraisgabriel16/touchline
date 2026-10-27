# TOUCHLINE — Raízes do Futebol · Webapp

Gestão de futebol com ambientes isométricos e elementos de RPG, inteiramente por
cliques. Esta é a versão ativa do projeto, preparada para a **Vercel**.
React + TypeScript + Vite nas telas; Canvas 2D original nos ambientes. Não precisa
de Godot instalado, servidor próprio, banco, conta ou chave de API para jogar.

## Transmissão de partidas — v0.7

Passes, domínio, finalização, defesa e comemoração derivados dos eventos reais
da simulação. Portador e finalizador identificados, câmera geral ou acompanhando
a jogada, galeria de finalizações e replay com barra de tempo, pausa e ritmos de
0,5×/1×/2×. Modo ampliado e placar do lance separados do placar atual. Placar, cartões,
substituições e saves preservam as regras anteriores.

Atlas procedural original de 16 efeitos: `npm run assets:match`.
Guia e limites: [docs/BROADCAST.md](docs/BROADCAST.md).

## Tela inicial e carreiras — v0.6

Ao abrir, escolha **Nova carreira** ou **Continuar carreira**. Defina seu nome,
um dos 12 clubes e um dos três slots independentes. **Minhas carreiras** permite
carregar, exportar, importar em slot vazio, liberar e restaurar a última cópia.
O save anterior permanece no slot 1, com nome escolhido ao continuar.

Durante o jogo, use **Salvar agora** ou **Menu inicial**. O autosave continua
ativo. Recarregar a aba retoma a sessão; voltar pelo menu permite trocar de
carreira. Tudo é local ao navegador, sem conta online.

Regras e recuperação: [docs/SAVES_UI.md](docs/SAVES_UI.md).

## Gestão esportiva — v0.5

Abra **Diretoria esportiva**: mercado de agentes livres com compra/venda,
folha por atleta, previsão de caixa, janelas, relatório do próximo adversário,
foco de desenvolvimento, premiação da liga e galeria de títulos.
Os reforços entram no CT, nas conversas e na escalação. Força desenvolvida é
usada nas partidas seguintes. Saves antigos continuam compatíveis.

Design, regras, limites e próximos incrementos: [docs/MANAGER_DESIGN.md](docs/MANAGER_DESIGN.md).

## Pacote de carreira e polimento — v0.4

- Minha carreira: metas, recompensas únicas, forma recente, confiança da diretoria,
  agenda, súmulas dos últimos 22 jogos e arquivo das últimas 20 temporadas.
- Todos os atletas acessíveis pelo CT e pelo elenco. Confiança, respeito, afinidade,
  rivalidade, prioridades, memória e compromissos de devolutiva com prazo real.
- Três conversas relevantes por rodada; repetição não gera recompensas. Treine e
  entregue o combinado antes da partida; quebra de promessa pode ser reconhecida.
- Registros persistentes de jogos, titularidades e gols do seu elenco, coletados
  nas partidas novas. XP de metas soma à evolução do protagonista.
- Busca no elenco, escalação automática de disponíveis, formação refletida na
  transmissão, avisos visíveis, opções de contraste e movimento reduzido.
- Save schema 4 migra versões 1–3 e mantém partidas em andamento. Cópia anterior
  à migração é preservada quando há espaço no armazenamento do navegador.

Abra **Minha carreira** para começar. Regras em `docs/CAREER_RELEASE_V04.md`.
Esta é uma alpha jogável; transferências entre clubes da liga, contratos, demissões e carreiras em outros
clubes continuam como próximas entregas.

## Pixel art e tilesets

### Personagens

O **CT** mostra o elenco inteiro: 18 atletas e até seis contratações, incluindo
reservas, com estações, goleiros e seleção por nome. São animações ambientes;
os bônus de treino continuam no Mundo do futebol. Veja `docs/TRAINING_CENTER.md`.

Protagonista, Helena, atletas e goleiros usam atlas padronizados: **64 quadros** com
quatro direções isométricas, repouso, duas poses de caminhada e gesto de conversa.
O protagonista caminha por clique; os NPCs se viram para ele e gesticulam nos
diálogos. Fontes/prompts em `assets/characters/source/`, runtime em
`public/characters/`. Guia ativo: `docs/SPRITE_STANDARD.md`. O menu **Atlas de
personagens** mostra folhas, pivôs e downloads; os arquivos anteriores estão preservados.
Para reempacotar: `npm run assets:characters`.

### Coleção de futebol

A aba **Atlas de futebol** reúne sete atlas e **112 elementos**: brasões e
camisas casa/visitante de 12 identidades, estádios, sedes, torcida e futebol de
várzea. Os brasões aparecem na interface, e as camisas do clube escolhido na central.
Você pode visualizar cada elemento e baixar o PNG pelo próprio jogo.

As abas **Litoral e serra** e **Bairros e caminhos** reúnem os oito estilos
adicionais, cada um com brasão, casa, visitante e bandeira. Os 12 clubes agora
podem ser escolhidos para uma carreira de gestão com elenco e liga próprios.
Guia dos estilos: `docs/TEAM_STYLES.md`.

Arquivos: `public/football/`. Originais/prompts: `assets/football/source/`.
Para reempacotar: `npm run assets:football`. Detalhes em `docs/FOOTBALL_ATLASES.md`.
Em **Mundo do futebol**, estádio, sede/CT, torcida e várzea são áreas isométricas
de decisões por clique. Todas as 112 peças aparecem na identidade e nos cenários.
As artes são estáticas, e a caminhada permanece nos três ambientes originais.

### Ambientes atuais

Os três ambientes já usam **atlas PNG originais em pixel art**: residencial, clube
e campo de treino. São 48 elementos, incluindo pisos 64×32, paredes, janelas,
móveis e equipamentos. Arquivos em `public/tilesets/`, com recortes e pivôs em
`manifest-v1.json`. A grade adicional `terrain-v1.png` reúne os 12 pisos.

Originais e prompts: `assets/tilesets/source/`. Para reproduzir o empacotamento,
execute `npm run assets:pack`. Instruções em `docs/TILESETS.md`. Os personagens
usam os atlas descritos acima; os desenhos geométricos anteriores são fallback.

## Rodar localmente

Requisito: **Node.js 24.x** e npm.

```sh
npm ci
npm run dev
```

Abra o endereço Local exibido pelo Vite (normalmente http://127.0.0.1:5173).
No Windows, você também pode dar dois cliques em **Jogar.cmd**; ele instala as
dependências se necessário e abre a versão web. Mantenha seu terminal aberto.

```sh
npm run build
npm run preview
```

O build de produção está em `dist/`. Não abra `index.html` por duplo clique:
use o servidor local ou a hospedagem, pois o app utiliza módulos JavaScript.

## Hospedar na Vercel

1. Envie esta pasta do projeto para um repositório Git. Não inclua `.tools/`,
   `.godot/`, `node_modules/`, saves pessoais ou arquivos `.env`.
2. Na Vercel, importe o repositório como um novo projeto.
3. Se `TOUCHLINE` estiver dentro de um monorepo, selecione essa pasta como
   **Root Directory**. Se o repositório contém esta pasta na raiz, mantenha `.`.
4. Confira as configurações:

| Campo | Valor |
| --- | --- |
| Framework Preset | Vite |
| Node.js | 24.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Variáveis de ambiente | Nenhuma nesta versão |

5. Clique em Deploy. O `vercel.json` já declara framework, build, saída e headers.

O projeto é estático e todos os dados autorais são empacotados no build.
Não há funções serverless, WebSocket ou dependência de armazenamento no servidor.
A navegação é interna na página inicial, sem rotas de servidor ou rewrites.
Não foi feito deploy na sua conta; a configuração e os arquivos estão prontos.

Referências oficiais: [Vite na Vercel](https://vite.dev/guide/static-deploy.html#vercel),
[configuração de build](https://vercel.com/docs/builds/configure-a-build) e
[Node.js na Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Como jogar

Guia completo: **Como jogar** no menu ou `docs/COMO_JOGAR.md`.

- **Escolher clube:** na Central, selecione uma das 12 equipes e confirme a nova
  carreira. Cada uma tem 18 atletas, R$ 18.000, condição 94 e apoio 45/100.
- **Mundo do futebol:** entre no estádio, sede/CT, praça da torcida e várzea.
  Você tem três ações por rodada: treino, recuperação, torcida ou contratação.
- **Finanças:** escolha o ingresso, receba bilheteria em casa e acompanhe cotas,
  operação/salários e melhorias no extrato. Estádio e CT têm três níveis.
- **Uniformes:** escolha casa/visitante na Central; o kit aparece na escalação.

- **Ambientes:** clique no chão para andar. Clique nos pontos dourados ou nos
  botões ao lado para se aproximar de objetos, pessoas e portas.
- **Primeiro trecho de RPG:** estude a caixa de Antônio, converse com Helena na
  diretoria, aceite observar Davi, entre no CT, registre as notas e entregue o
  relatório. Você pode adiar escolhas e observar antes de aceitar a tarefa.
- **Diário:** registra experiências e consequências; completar o fluxo rende
  100 XP, nível 2, Análise 3, Comunicação 2 e uma memória de confiança de Helena.
- **Elenco:** consulte os atletas, filtre titulares/reservas e abra perfis.
- **Escalação:** clique no titular no campo e em um reserva para trocar.
- **Campeonato / Partidas:** dispute 22 rodadas, 132 jogos e acompanhe a tabela. No fim, Próxima temporada mantém patrimônio, elenco e RPG.
- **Nova partida:** pede confirmação antes de substituir temporada e carreira.
- No celular, o botão **··· / Opções da partida** abre exportação, importação e
  reinício. A navegação superior desliza horizontalmente.

Não é necessário teclado nem arrastar. Há controles HTML acessíveis por teclado
como alternativa; os mesmos alvos do Canvas estão em botões com nomes visíveis.

## Salvamento

O jogo salva automaticamente no **localStorage deste navegador e endereço**.
Recarregar a página mantém escalação, rodadas, posição segura, diário e progressão.
Ao caminhar, é salvo o último ponto seguro alcançado, sem atravessar móveis.

Use **Exportar partida** para baixar um JSON e **Importar partida** para continuar
em outro navegador/dispositivo. A importação valida schema, clube, finanças, contratações, IDs, calendário,
resultados, posições e ordem das ações antes de pedir confirmação de substituição.
Recompensas são derivadas das ações e não podem ser duplicadas por revisitar NPCs.
Um save incompatível no navegador é copiado para a chave `.recovery` antes de
iniciar um estado novo. Erros de armazenamento são informados e não interrompem
os controles; exportar continua disponível.

Não há sincronização em nuvem. Limpar dados do navegador remove o save local.
Saves do localhost, previews da Vercel e domínio de produção são separados: leve
seu arquivo exportado para migrar. Use uma aba por partida; não há coordenação
entre abas simultâneas. Não há compatibilidade de saves com Godot. Saves web schema 1, 2 e 3 migram para schema 4
preservando a liga antiga por seis rodadas; a temporada seguinte adota 12 clubes.

## Testes

```sh
npm test
npm run build
npm run test:e2e
npm run assets:pack
```

- `npm test`: lógica pura com o test runner do Node.
- `npm run build`: TypeScript estrito e produção Vite.
- `npm run test:e2e`: build e Playwright em servidor de produção isolado na porta
  5274. Não reutiliza servidores de outros projetos.
- `npm run assets:pack`: recria atlas e manifests dos originais preservados; não
  faz chamadas à API nem gera novas imagens.
- `npm run assets:football`: reempacota os sete atlas da coleção de futebol.
- No Windows, os testes usam Edge se instalado; nos demais ambientes, instale o
  Chromium do Playwright antes: `npx playwright install chromium`.

Os testes cobrem liga determinística, tabela, trocas, RPG, rotas, saves inválidos,
exportação/importação, clique no Canvas, fluxo de 22 rodadas, continuidade de temporada, preparação, contratações, caixa e telas mobile.
Capturas reais: `artifacts/web/desktop.png` e `artifacts/web/mobile.png`.
Veja `docs/VALIDATION.md` para os resultados e os limites de verificação.

## Estrutura

```text
web/src/game/       estado, dados, navegação, liga, RPG e armazenamento
web/src/scene/      motor de movimento e renderização Canvas
web/src/ui/         ícones originais e modal acessível
web/src/App.tsx     telas integradas e ações do jogador
web/src/styles.css layout responsivo e identidade visual
web/tests/         testes de domínio e de navegador
data/              clubes, atletas, ambientes e narrativa autorais
public/            favicon SVG original
vercel.json        configuração de deploy
```

## Escopo real e próximos passos

São 12 clubes selecionáveis, com 18 atletas cada. Os elencos dos clubes adicionais
são construídos de forma determinística. A sua partida usa eventos por minuto,
com visualização isométrica, dois tempos de 30 segundos em 1×, pausa, velocidades
até 8× e salto até intervalo/final. Até cinco substituições no intervalo alteram
os atletas e sua força; expulsões reduzem o efetivo. Três amarelos acumulados ou
vermelho suspendem por uma partida, com substituição automática de suspensos na
abertura. A disciplina persistente é do próprio elenco. O jogo em andamento é
salvo e validado por reexecução determinística, incluindo as decisões de intervalo.
Os outros jogos da rodada usam o motor agregado anterior de nove ataques por equipe.
A formação organiza a escalação e o posicionamento visual na transmissão;
a tática ainda não modifica instruções individuais do motor.
Veja `docs/MATCH_DAY.md` e `docs/COMO_JOGAR.md` para regras e limitações.
O RNG web é determinístico e diferente do RNG do protótipo Godot. A progressão
pessoal ainda não aplica bônus ao resultado de futebol.

Arte, diálogos e animações são provisórios. NPCs são estáticos. Não há contas,
multiplayer, mercado entre clubes, contratos individuais, lesões, envelhecimento,
agenda com relógio simulado ou viagem com custo/duração. Também não há acréscimos,
prorrogação, disputa de pênaltis ou física completa de bola. A economia é simplificada,
com despesas pendentes sem juros, condição coletiva e seis recrutamentos da várzea por carreira. O mercado possui 18 agentes livres fixos, sem recompra; não é uma simulação de transferências entre os clubes da liga.
As quatro arquiteturas e paletas de torcida são compartilhadas entre os 12 clubes. Portas mudam de
local após aproximação, ainda sem fade. A versão web usa rotas em grade por BFS,
com bloqueio de móveis e sem cortar cantos; não depende de uma física nativa.
A renderização é em 640×360, nearest, escalada para caber na área disponível;
esta versão responsiva não promete escala inteira em todas as janelas.

Próximos incrementos em `docs/IMPLEMENTATION_PLAN.md`. O protótipo Godot e seus
testes permanecem preservados como histórico; `Jogar-Godot.cmd` abre essa versão.
As instruções antigas estão em `docs/GODOT_PROTOTYPE.md` e não descrevem o webapp.
