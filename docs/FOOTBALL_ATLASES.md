# TOUCHLINE — coleção de futebol v1

Sete atlas em pixel art, **112 elementos estáticos**, gerados com a ferramenta
image_gen integrada e preparados para a versão web. Nenhuma marca real é usada.
Os 48 elementos dos ambientes anteriores permanecem preservados separadamente.

## Arquivos

| Atlas em public/football | Elementos | Conteúdo |
| --- | --- | --- |
| identity-v1.png | 16 | Quatro brasões, oito camisas casa/visitante e quatro bandeiras |
| identity-coast-v1.png | 16 | Quatro identidades adicionais: litoral, serra, pedra e cerrado |
| identity-city-v1.png | 16 | Quatro identidades adicionais: barro, farol, bússola e ponte |
| stadiums-v1.png | 16 | Quatro miniaturas de estádio e 12 módulos/equipamentos |
| facilities-v1.png | 16 | Quatro sedes, quatro interiores e oito equipamentos/instalações |
| crowd-v1.png | 16 | Quatro grupos de torcida por clube |
| varzea-v1.png | 16 | Quatro terrenos, campo de bairro e 11 estruturas/objetos |

Cada atlas tem **768×640 RGBA**, com quatro colunas e quatro linhas de células
192×160. Use os recortes efetivos x/y/w/h de `manifest-v1.json`: os sprites não
ocupam a célula inteira. Pivôs estão registrados como coordenadas locais.

## Identidade dos clubes

| Clube fictício | Brasão | Casa | Visitante |
| --- | --- | --- | --- |
| Aurora Atlético | Escudo, sol nascente e bola | Azul-marinho com faixa e detalhes âmbar | Creme com ombros marinhos e gola âmbar |
| União Ferroviária | Losango, roda ferroviária e trilhos | Listras verticais vinho e creme | Creme com faixa diagonal vinho |
| EC Horizonte | Círculo, horizonte e sol | Verde com detalhes brancos | Branco com faixa verde |
| Atlético Ribeirense | Escudo, ondas de rio e bola | Faixas horizontais vermelhas e pretas | Cinza-claro com detalhes vermelhos e pretos |

Mais oito identidades estão descritas em `TEAM_STYLES.md`. Os 12 conjuntos de
identidade são consultáveis na biblioteca e os 12 clubes são selecionáveis na
Central. Estádio, sede e torcida usam as quatro variantes visuais compartilhadas.

Brasões e camisas têm vista frontal para interface. A arte de estádio, instalações,
torcida e várzea usa vista isométrica. As camisas são ícones de design do uniforme,
não sprites animados que vestem os personagens atuais. Emblemas pequenos das
fachadas são detalhes simplificados da primeira versão; a identidade canônica
usada pela interface está no atlas identity.

## Conteúdo de cenário

**Estádios:** miniatura de cada clube; arquibancadas descobertas e cobertas nas
duas orientações; trave/rede; placar manual sem números; túnel; torre de luz;
portão; catraca; bilheteria e alambrado.

**Clubes:** quatro fachadas; recepção, academia, fisioterapia e vestiário como
módulos de interior; quadro tático; banco coberto; armários; chuteiras; ônibus;
barraca de produtos; bandeira e vitrine de troféus.

**Torcida:** grupos em pé, sentados, bateria e bandeiras, para cada paleta de clube.
São poses estáticas; não são quadros de uma animação. A folha foi revisada para
dar margem aos grupos e preservar os pés e bandeiras.

**Várzea:** grama irregular, terra, cascalho e grama marcada; miniatura de campo;
cerca; trave desgastada e gol de madeira; banco; pneus; lixeira; água; carrinho
de lanche; placar; vestiário simples e caixa de bolas. Os quatro pisos têm encaixe
em losango 64×32, com cantos transparentes.

## Uso no webapp

- Menu **Atlas de futebol**: consulta das sete categorias, detalhe ampliado,
  download de um sprite PNG recortado e download de cada atlas e do manifest.
- Brasão do clube escolhido no cabeçalho; brasões dos 12 clubes na tabela da liga.
- Camisas dos 12 clubes na seleção, na Central, no calendário e na escalação.
- Todas as peças de cenário no Mundo do futebol, com ações de preparação,
  bilheteria, melhorias e recrutamento.

Estádios, sedes, torcida e várzea têm áreas de gestão isométricas por clique,
com as mecânicas descritas em `COMO_JOGAR.md`. São maquetes de decisões; não há
caminhada ou colisões nessas novas áreas. Capacidade, bilheteria, caixa e apoio
são simulados. Torcedores não são animados e o ônibus não é dirigível.

## Fontes e reprodução

Originais selecionados e prompts exatos:

```text
assets/football/source/identity-v1.png
assets/football/source/stadiums-v1.png
assets/football/source/facilities-v1.png
assets/football/source/crowd-v1.png
assets/football/source/varzea-v1.png
assets/football/source/prompts-v1.json
assets/football/source/identity-coast-v1.png
assets/football/source/identity-city-v1.png
assets/football/source/prompts-team-styles-v1.json
```

Catálogo com IDs, nomes e vínculos dos clubes:
`data/football/asset-catalog-v1.json`.

```sh
npm ci
npm run assets:football
```

O empacotamento técnico usa pngjs em desenvolvimento: identifica componentes
pelo alpha, agrupa partes do mesmo item, recorta e redimensiona por nearest,
mantendo proporção e transparência. Só os pisos são ajustados ao losango 64×32.
Não há geração de imagem via API nesse comando, nem dependência de pngjs no jogo.

O mesmo manifest é emitido em public/football e web/src/art. Identificadores como
`aurora.crest`, `aurora.home`, `aurora.away`, `aurora.stadium` e `varzea.pitch`
permitem consultar os sprites sem depender da posição visual da folha.

Pivôs de base são iniciais; os elementos ainda não possuem footprints de colisão,
portas ou pontos de entrada autorados. Isso faz parte da futura montagem de cena.

## Verificação

`npm test` verifica 112 IDs únicos, dimensões, alpha, recortes não vazios, pivôs,
arquivos por clube e losangos de várzea. `npm run test:e2e` percorre todas as
categorias, baixa uma camisa recortada e verifica a biblioteca em largura mobile,
além dos fluxos de RPG, gestão e salvamento já existentes.

Capturas reais das sete categorias: `artifacts/web/football-*.png`.
Pacote original de 80 assets: `artifacts/TOUCHLINE-football-atlases-v1.zip`.
Complemento de 32 assets: `artifacts/TOUCHLINE-team-styles-v1.zip`.
