# Validação — TOUCHLINE Web

Ambiente: Windows, Node 24.18.0, npm 11.16.0, React 19.3.1,
TypeScript 7.0.2, Vite 8.3.5, Playwright 1.64.1 com Microsoft Edge headless.
Versões exatas das dependências em package-lock.json.

## Resultados finais

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Domínio, armazenamento e tilesets | npm test | 63 testes aprovados |
| TypeScript e produção | npm run build | Sem erros; dist gerado |
| Navegador sobre produção | npm run test:e2e | 24 percursos aprovados (v0.8) |
| HTTP do preview local | GET http://127.0.0.1:5173/ | 200 |
| Layout desktop | Playwright, 1440×1000 | Captura inspecionada |
| Layout mobile | Playwright, 390×844 | Captura inspecionada, sem overflow global |

O teste de navegador usa o build de produção e um servidor próprio na porta
5274, com reuseExistingServer=false para não acessar outros projetos locais.
O script test:e2e inclui o build antes de iniciar o Playwright.

## Controles do replay — melhoria incremental

Galeria de todas as finalizações da partida atual, atalhos no lance a lance,
seleção anterior/próxima, pausa, barra de tempo e velocidades 0,5×/1×/2×.
O contexto mostra autor, clube, resultado e placar no lance; o principal mantém
placar atual. Modo ampliado remove informações secundárias; no celular o campo
permanece visível durante a rolagem dos controles.

Novo teste de lógica verifica seleção válida, rejeição de minutos inexistentes,
escalação histórica anterior às trocas e estado atual intacto. Novo percurso
Playwright testa pausa, deslocamento manual, reprodução a 0,5×, navegação entre
lances, modo ampliado, viewport mobile e acesso pelo histórico. Os 23 percursos
da suíte passaram; os dois do replay foram repetidos após o ajuste visual mobile.
Capturas: replay-controls-desktop.png e replay-controls-mobile.png.

Build: JavaScript 447,92 kB (137,56 kB gzip), CSS 65,92 kB (14,57 kB gzip).
Sem alteração no formato do save ou na simulação de resultados. Ainda local.

## Transmissão — v0.7 · 26/10/2026

Três testes de domínio verificam finalizador/portador, gol/defesa, inversão de
campo, expulsos, reconstrução com substituições e imutabilidade do save. Um teste
de asset verifica 16 células RGBA não vazias, transparentes e com pivô consistente.
O cenário de gol do teste foi corrigido para percorrer também o segundo tempo,
pois a semente usada não marca no primeiro tempo.

Novo teste de navegador: replay de finalização, câmera, relógio e placar
preservados, mobile sem overflow, retorno à transmissão e encerramento da rodada.
A suíte completa de 22 percursos passou. Depois dos ajustes finais de separação
visual, pausa da câmera e legendas, os quatro percursos de partidas/replay foram
executados novamente. Capturas: broadcast-replay.png e broadcast-mobile.png.

Build: JavaScript 444,56 kB (136,57 kB gzip), CSS 63,77 kB (14,13 kB gzip).
A simulação esportiva e o formato dos saves permanecem compatíveis. O replay
é reconstituição de eventos, não gravação de trajetórias físicas. BROADCAST.md
registra os limites. Este incremento não foi publicado na Vercel.

## Tela inicial, nome e saves — v0.6 · 26/10/2026

Quatro testes de domínio novos cobrem slots independentes, nome validado,
compatibilidade com save antigo, backup/restauração, falha de quota antes da
remoção, corrupção isolada e preservação da partida ativa.

Três percursos novos de navegador cobrem criação de duas carreiras, troca de
slots/reload, migração com nome sem perder rodadas, liberação cancelada e
confirmada, restauração, importação inválida e retomada de partida importada.
Os 18 percursos anteriores passaram com fixture de sessão já ativa; a abertura
é testada sem essa fixture. Uma asserção nova diferia apenas em maiúsculas;
foi corrigida para correspondência sem distinção de caixa e os três percursos
de abertura foram executados novamente com sucesso.

Capturas inspecionadas: start-desktop.png, start-mobile.png, start-create.png e
start-saves.png em artifacts/web. Sem overflow global no celular. Menu lateral
mais compacto e campo isométrico inteiro enquadrado na abertura.

O build TypeScript/Vite passou. Preview local HTTP 200. Regras de armazenamento,
recuperação e limites em SAVES_UI.md. Não houve deploy deste incremento.

## Gestão esportiva — 26/10/2026

Oito testes de domínio adicionados: compra e salário, integração na partida,
rejeição de duplicação/janela fechada, venda com histórico, mínimo de elenco e
goleiros, promessa pendente, quitação de despesas, evolução limitada por potencial,
importação de saves antigos/adulterados e prêmio único de temporada.

Novo percurso de navegador: cancelar e confirmar compra → CT com contratado →
conversa → foco de desenvolvimento → venda → reload → persistência, desktop e
mobile sem overflow. Capturas: manager-desktop.png, manager-mobile.png e
manager-talent.png em artifacts/web. Revisão visual corrigiu o contraste da aba
ativa e adicionou rolagem ao menu desktop para manter acesso às opções de save.

Build final: JavaScript 422,34 kB (129,75 kB gzip), CSS 53,85 kB (12,06 kB gzip).
Regras e limites em MANAGER_DESIGN.md. O mercado usa agentes livres fixos e
compradores externos simulados; contratos com duração e negociação entre os
clubes da liga não foram implementados. Não houve deploy deste incremento.

## Carreira e polimento — 25/10/2026

Build TypeScript/Vite sem erros: JavaScript 405,40 kB (124,33 kB gzip), CSS
49,86 kB (11,28 kB gzip). Preview local reiniciado e HTTP 200 confirmado.

Sete testes de domínio adicionados: limites/repetição de conversas, promessas
cumpridas e quebradas, reparação, feedback único mesmo após expirar memórias,
recompensas únicas, registros de participantes/gols, histórico de temporadas,
migração de partida ativa para schema 4, validação de campos e escalação elegível.

Dois percursos de navegador adicionados: conversa → promessa → aviso antes da
partida → treino → entrega → recompensa → súmula → reload; CT → ficha → busca
no elenco → escalação automática → opções → mobile → preferências após reload.
O primeiro ciclo encontrou Opções oculto no desktop; a especificidade CSS foi
corrigida e a suíte completa foi executada novamente com sucesso.

Capturas inspecionadas em artifacts/web: career-hub.png, career-mobile.png e
player-relationship.png. Mobile sem overflow global; ficha longa usa rolagem.
As 15 verificações anteriores continuam aprovadas, incluindo o relógio de
30 segundos por tempo, pausa, substituição persistente e migração de saves.

Regras e limites atuais em CAREER_RELEASE_V04.md. Os registros abaixo descrevem
também incrementos históricos; o schema atual é 4.

## Partidas e ambientes — 23/10/2026

Motor por minuto, dois tempos de 30 segundos em 1×, velocidades até 8×,
pausa, salto até intervalo/final, cinco trocas no intervalo, cartões, expulsões,
suspensões por uma rodada e save schema 3. A importação reexecuta a partida para
validar seu estado. Migração de schemas 1/2 preserva resultados anteriores.

Capturas inspecionadas: match-live.png, match-halftime.png, match-mobile.png,
apartment-refined.png e office-refined.png em artifacts/web. CT mantém os 18–24
atletas e recebeu área técnica e acabamento da circulação. Transmissão usa os
atlas padronizados com cores dos clubes aplicadas em runtime.

Testes novos cobrem tempo, pausa, aceleração, substituição e reload; no domínio,
salto equivalente ao acompanhamento, cartões/efetivo, suspensão, migração e
rejeição de estado adulterado. Os fluxos antigos agora encerram cada partida
pelos controles de salto, preservando a passagem pelo intervalo.

Limites em MATCH_DAY.md: animação representativa, sem física completa de bola,
sem acréscimos/lesões, desenho tático simplificado e disciplina persistente apenas
do próprio elenco. Outros confrontos ainda usam motor agregado.

## Cobertura

1. RPG completo por cliques: adiar caderno, estudar, ir à diretoria pela porta,
   adiar convite, aceitar, entrar no CT, observar Davi e entregar relatório.
   Confere nível/XP, diário, retorno da gestão, troca de goleiro, rodada e reload.
   Registra erros de página e exige ausência de erros de runtime nesse percurso.
2. 22 rodadas encerram a liga; próxima temporada avança o ano e reinício é cancelável.
3. Clique diretamente no Canvas move o personagem e abre interação com a caixa.
4. Save inválido não substitui estado; exportação baixa JSON e importação restaura
   o arquivo depois de confirmação.
5. Navegação e troca por cliques em viewport de celular; opções de save acessíveis
   também quando a barra lateral desktop não aparece.
6. Os três ambientes carregam os atlas PNG do build sem erros de rede ou runtime.
   Exigem data-character-state=ready para os novos sprites de personagens.
   Capturas de apartamento, diretoria e CT inspecionadas após a substituição da arte.
7. Falha simulada de um PNG informa o jogador e preserva a interação no fallback.
8. Biblioteca de futebol: sete categorias com 16 assets cada; detalhe e download
   de camisas recortadas do Aurora e do Vila Neon; renderização das sete folhas,
   perspectiva frontal dos novos kits e largura mobile.
9. Escolha do Vila Neon entre 12 clubes; quatro cenários com 16 peças cada;
   contratação na várzea, treino, torcida, CT, estádio, ingresso e kit visitante;
   recrutado na escalação; seis resultados por rodada; reload mantém clube e CT;
   recuperação, guia e áreas novas sem overflow global no celular.

Testes puros também verificam 132 confrontos únicos, pontuação, estatísticas,
reprodutibilidade, onze titulares sem duplicação, requisitos do relatório,
recompensas únicas, rotas acessíveis, ausência de corte de cantos e teleporte,
round-trip de save, rejeição de importação inválida e proteção de recuperação
quando o armazenamento está bloqueado ou sem espaço.
Incluem 216 IDs de atletas distintos, isolamento de elenco por clube, limite de
ações e contratações, melhorias sem saldo insuficiente, receitas só em casa,
bilheteria por preço/apoio, caixa não negativo, migração de schema 1 para 2,
preservação da temporada antiga e continuidade para a liga de 12 clubes.
Os testes de assets verificam 48 recortes não vazios, pivôs/limites, alpha,
pisos em losango 64×32 e equivalência dos 12 pisos na grade exportada de terrain.
Os testes da coleção de futebol acrescentam 112 recortes, sete folhas, identidade
de 12 clubes (incluindo 24 camisas), vínculos com o catálogo, preservação dos
quatro IDs da liga e quatro terrenos de várzea 64×32.
Os testes de personagens verificam 48 recortes RGBA, pivô fixo, pés alinhados,
bordas livres, poses diferentes e seleção de direção/estado de animação.
O CT acrescenta 16 poses testadas, trajetória de passe dentro do campo, gol
alinhado e posição do goleiro. Testes de navegador verificam animação, movimento
reduzido, mobile e acesso a Davi/saída. A migração preserva posições antigas válidas
ou realoca para a entrada, sem perder a carreira.

## Artefatos reais

- artifacts/web/desktop.png
- artifacts/web/mobile.png
- artifacts/web/apartment-pixel-art.png
- artifacts/web/office-pixel-art.png
- artifacts/web/training-pixel-art.png
- artifacts/TOUCHLINE-tilesets-v1.zip
- artifacts/web/football-identity.png e football-stadiums.png
- artifacts/web/football-facilities.png, football-crowd.png e football-varzea.png
- artifacts/TOUCHLINE-football-atlases-v1.zip
- artifacts/web/football-identity-coast.png e football-identity-city.png
- artifacts/web/football-team-styles-mobile.png
- artifacts/TOUCHLINE-team-styles-v1.zip
- artifacts/TOUCHLINE-character-atlases-v1.zip
- artifacts/web/playable-stadium.png, playable-ct.png e playable-fans.png
- artifacts/web/playable-varzea.png e playable-mobile.png
- artifacts/web/playable-kits.png e how-to-play-mobile.png
- artifacts/web/training-upgraded.png e training-upgraded-mobile.png
- dist/index.html e assets empacotados

O bundle JavaScript final tem aproximadamente 376 kB (116 kB gzip), sem rede de
assets externa obrigatória. Os atlas RGBA são publicados no próprio build, em
dist/tilesets, dist/football e dist/characters. Personagens, cenários e
props usam os PNGs originais gerados e empacotados para o projeto.
As artes de futebol são estáticas, integradas em quatro áreas de decisões
isométricas com treino, recuperação, torcida, recrutamento e administração.
Essas áreas não têm caminhada ou física. As camisas vestem a escalação e os
ícones da interface; no CT os atores mantêm uniforme de treino e na transmissão
usam os mesmos atlas com paleta do clube aplicada em runtime. Arquiteturas e
paletas de torcida são compartilhadas entre clubes. A partida tem transmissão
representativa; a torcida dos cenários de gestão continua estática.

## CT completo e atlas v2

Validada a presença de 18 e 24 atletas reais, incluindo os três goleiros possíveis
após recrutamento, a seleção de nomes e a grade/download dos quatro atlas ativos.
Testes amostram afastamento entre sprites por 60 segundos e conferem escala,
pivôs, bordas e espelhamentos. Câmera e migração de layouts anteriores também
são verificadas. Capturas: training-all-24.png, training-roster-24.png e
character-atlas-standard-v2.png em artifacts/web.

## Limites

Não houve deploy na conta Vercel do usuário. Não foram testados Safari, Firefox,
dispositivo móvel físico, touch real, performance em máquina modesta ou contas
online. O teste mobile usa emulação de viewport e clique de mouse.
A versão é single-player com save local por origem/navegador, sem sincronização
entre abas ou dispositivos. Import/export permite migração manual.
O protótipo Godot permanece preservado, mas suas verificações anteriores estão
em GODOT_VALIDATION.md e não são validações do runtime web.

## v0.8 — agenda e continuidade (27/10/2026)

63 testes de domínio/assets e 24 percursos de navegador aprovados; build sem erros. Nova cobertura: briefing sem mutação, prioridade de promessa, resgate único e persistente dos marcos, renovação anual, preparação pela agenda e retomada após reload no celular. Capturas session-desktop.png e session-mobile.png em artifacts/web. Sem dependências novas.
