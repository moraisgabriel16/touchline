# TOUCHLINE — oito novos estilos de times

Coleção original de pixel art gerada pela ferramenta image_gen integrada.
São **32 sprites estáticos** em dois atlas: para cada clube, brasão, camisa de
casa, camisa visitante e bandeira. Com a coleção anterior, são 12 identidades
e 112 elementos de futebol. Os 12 clubes podem ser escolhidos para gestão, com
18 atletas por equipe e liga de 22 rodadas. Arquiteturas e paletas de torcida
são compartilhadas. Veja `COMO_JOGAR.md` para as mecânicas integradas.

| Clube fictício | Paleta | Emblema e uniforme |
| --- | --- | --- |
| Maré de Coral FC | Turquesa, coral e marfim | Onda e concha; casa com faixa diagonal, visitante marfim |
| Serra do Cobre AC | Verde-pinho, cobre e creme | Montanhas e pinheiro; casa com listras finas, visitante cobre |
| Sol de Pedra EC | Amarelo-ouro e carvão | Sol sobre rocha; faixa horizontal em casa, vertical no visitante |
| Flor do Cerrado SC | Roxo, dourado e creme | Flor em losango; casa roxa, visitante com faixa diagonal dupla |
| Raiz do Barro EC | Laranja, marrom e areia | Raízes e bola; casa listrada, visitante com chevron |
| Farol da Enseada AC | Azul-cobalto, branco e prata | Farol; casa com faixa diagonal, visitante com faixas horizontais |
| Bússola do Vale FC | Índigo e lima | Rosa dos ventos e bola; casa com laterais lima, visitante lima |
| Atlético Vila Neon | Carvão, rosa e prata | Ponte e estrela; casa com faixa vertical, visitante rosa com faixa horizontal |

## Arquivos e uso

- `public/football/identity-coast-v1.png`: os quatro primeiros estilos.
- `public/football/identity-city-v1.png`: os quatro últimos estilos.
- `public/football/manifest-v1.json`: recortes e pivôs de todas as sete folhas.
- `data/football/asset-catalog-v1.json`: nomes, paletas e IDs estáveis.
- `assets/football/source/`: originais selecionados e prompts exatos em
  `prompts-team-styles-v1.json`.

Cada folha de runtime mede 768×640 RGBA, organizada em quatro linhas e quatro
colunas de células 192×160. A ordem por linha é brasão, casa, visitante e bandeira.
Use os recortes do manifest, pois cada sprite ocupa somente parte da célula.
São vistas frontais para interface. Os atores atuais ainda não vestem esses kits.

No jogo, abra **Atlas de futebol → Litoral e serra / Bairros e caminhos**.
Clique em qualquer peça para ampliar e baixar o PNG individual com transparência.
Os botões de atlas baixam as folhas completas; o link inferior baixa o manifest.

Reprodução técnica a partir dos originais preservados:

```sh
npm ci
npm run assets:football
npm test
npm run test:e2e
```

O empacotador recorta e redimensiona por nearest, preservando o alpha. A geração
artística não é determinística; o comando reproduz o empacotamento dos PNGs
selecionados sem chamar serviço externo. Paletas são referências de direção de
arte; as sombras geradas podem usar tons adicionais.

Pacote complementar: `artifacts/TOUCHLINE-team-styles-v1.zip`, com as duas folhas
de runtime, originais selecionados, prompts, catálogo, manifest e este guia.
O manifest incluído referencia também as cinco folhas da coleção anterior.

Próximo incremento sugerido: criar arquiteturas e torcidas exclusivas para cada
clube e transformar as áreas de decisões em mapas com caminhada e colisões.
