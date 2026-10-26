# TOUCHLINE — tilesets pixel art v1

Três conjuntos autorais gerados com a ferramenta **image_gen integrada**, sem
CLI/API ou chave externa, para o universo fictício de Santa Aurora. Perspectiva
isométrica 2:1, iluminação superior esquerda, cores terrosas, verde desaturado,
azul-marinho e âmbar. As imagens são assets do jogo, não screenshots de referência.

## Arquivos prontos para usar

| Arquivo | Dimensões | Conteúdo |
| --- | --- | --- |
| `public/tilesets/residential-v1.png` | 640×512 RGBA | 16 elementos de apartamento |
| `public/tilesets/club-v1.png` | 640×512 RGBA | 16 elementos de escritório/clube |
| `public/tilesets/training-v1.png` | 640×512 RGBA | 16 elementos de campo e equipamentos |
| `public/tilesets/manifest-v1.json` | JSON | 48 recortes nomeados e pivôs |
| `public/tilesets/terrain-v1.png` | 256×96 RGBA | Os 12 pisos dos conjuntos acima em grade 64×32 |
| `public/tilesets/terrain-v1.json` | JSON | Recortes da grade de pisos |

O arquivo terrain é uma conveniência: contém os mesmos 12 pisos, não elementos
extras na contagem de 48. Não há fundo preto nas imagens; as áreas vazias têm alpha.

## Conteúdo de cada conjunto

- **Residencial:** dois pisos de madeira, cerâmica, tapete, paredes esquerda/direita,
  janela, painel de porta, cama, mesa com notebook, armário, caixa de Antônio,
  planta, cadeira, geladeira e sofá.
- **Clube:** dois concretos, cerâmica, tapete azul-marinho, paredes esquerda/direita,
  janela, painel de porta, mesa de reunião, arquivo, portal, planta, cadeira,
  quadro tático, estante e bebedouro.
- **CT:** duas gramas, terra, concreto, cercas esquerda/direita, portão, painel de
  porta, banco, caixa de material, trave com rede, entrada de vestiário, grupo de
  cones, bola, bolsas e bandeira.

Parte da biblioteca está reservada para mobiliar locais futuros. Os três ambientes
atuais usam pisos, paredes, janelas e objetos compatíveis com suas definições; o
CT também usa trave, cones e bola. Personagens têm uma coleção separada de
atlas PNG, documentada em `CHARACTER_ATLASES.md`; os sprites geométricos são fallback.

## Usar os recortes

Os atlas de runtime têm quatro colunas e quatro linhas com células de 160×128.
Cada sprite ocupa uma região menor dentro da célula: use **x, y, w, h** do manifest,
não recorte os 160×128 inteiros para desenhar. `sheet` identifica o PNG; `pivot`
é o ponto local que deve coincidir com a posição no mundo. Exemplo:

```text
frame = manifest.frames['residential.bed']
source rectangle = (frame.x, frame.y, frame.w, frame.h)
destination = (worldX - frame.pivot[0], worldY - frame.pivot[1])
```

Para pisos, o recorte é sempre 64×32 e o pivô é [32,16], no centro do losango.
Eles têm encaixe geométrico exato 2:1. Para paredes, o pivô marca o início da
aresta; para objetos, marca a base de apoio para ordenação por profundidade.

No webapp, `web/src/scene/tilesets.ts` carrega os PNGs uma vez, e `render.ts` usa
`drawImage` com suavização desativada. As rotas, colisões lógicas e saves não mudam
por causa da arte. Falha de carregamento informa o problema e mantém os desenhos
geométricos como fallback, permitindo continuar a interação.

## Originais e reprodução

As três imagens originais foram preservadas em:

```text
assets/tilesets/source/residential-v1.png
assets/tilesets/source/club-v1.png
assets/tilesets/source/training-v1.png
assets/tilesets/source/prompts-v1.json
```

Os originais retornados pela ferramenta têm 1254×1254 e uma disposição aproximada
de 4×4. Não presuma que cada célula original tenha exatamente 256 pixels: o passo
técnico de empacotamento detecta os elementos pelo alpha, conserva partes isoladas
relevantes do mesmo objeto e registra os recortes reais no manifest.

```sh
npm ci
npm run assets:pack
```

O empacotador usa pngjs apenas no desenvolvimento. Ele recorta, redimensiona por
nearest neighbor para a escala nativa, alinha as arestas dos módulos de parede à
inclinação 2:1 e limita os pisos ao losango 64×32. Conserva os valores RGBA das
amostras e não achata o fundo. O webapp não depende de pngjs em runtime.

Os prompts exatos estão em `prompts-v1.json`, incluindo ordem de cada elemento,
paleta, regras de perspectiva e exclusões. A geração criativa não é determinística;
o empacotamento dos originais preservados é reproduzível.

## Verificação e limites

- `npm test`: 48 recortes não vazios, limites do atlas, pivôs, alpha e pisos 64×32.
- `npm run test:e2e`: carregamento real dos PNGs no build, três cenas e regressão
  dos fluxos de movimento, diálogo, escalação, liga e persistência.
- Capturas reais: `artifacts/web/apartment-pixel-art.png`, `office-pixel-art.png`
  e `training-pixel-art.png`.

Esta é a primeira versão da direção de arte, sujeita a revisão artística. Não há
autotiling completo, telhados, animações de props ou spritesheets finais de pessoas.
As imagens foram geradas e preparadas para o projeto; não representam marcas reais.
