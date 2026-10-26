# Validação — TOUCHLINE Web

Ambiente: Windows, Node 24.18.0, npm 11.16.0, React 19.3.1,
TypeScript 7.0.2, Vite 8.3.5, Playwright 1.64.1 com Microsoft Edge headless.
Versões exatas das dependências em package-lock.json.

## Resultados finais

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Domínio, armazenamento e tilesets | npm test | 44 testes aprovados |
| TypeScript e produção | npm run build | Sem erros; dist gerado |
| Navegador sobre produção | npm run test:e2e | 17 testes aprovados |
| HTTP do preview local | GET http://127.0.0.1:5173/ | 200 |
| Layout desktop | Playwright, 1440×1000 | Captura inspecionada |
| Layout mobile | Playwright, 390×844 | Captura inspecionada, sem overflow global |

O teste de navegador usa o build de produção e um servidor próprio na porta
5274, com reuseExistingServer=false para não acessar outros projetos locais.
O script test:e2e inclui o build antes de iniciar o Playwright.

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
