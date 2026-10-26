# TOUCHLINE — atlas de personagens v1

Documento histórico. O padrão ativo usa quatro atlas v2, 64 quadros e células
64×64: veja `SPRITE_STANDARD.md`. Os arquivos anteriores continuam preservados.

Três folhas originais de pixel art geradas com a ferramenta image_gen integrada,
usando a captura do CT enviada pelo usuário como referência de escala e perspectiva.
As artes substituem os personagens geométricos dos três ambientes existentes.

| Personagem | Visual | Arquivo publicado |
| --- | --- | --- |
| Protagonista | Camisa mostarda, jeans marinho e cabelo castanho | public/characters/hero-v1.png |
| Helena Duarte | Blusa verde-petróleo, calça escura e cabelo preso | public/characters/helena-v1.png |
| Davi | Camisa de treino dourada, calção marinho e meiões claros | public/characters/davi-v1.png |

## Organização

São **48 quadros**: 16 por personagem. Cada folha de runtime é PNG RGBA 192×224,
com quatro colunas e quatro linhas de células fixas de 48×56.

Linhas, sempre relativas à tela:

1. `se`: baixo e direita; rosto visível.
2. `sw`: baixo e esquerda; rosto visível.
3. `ne`: cima e direita; costas visíveis.
4. `nw`: cima e esquerda; costas visíveis.

Colunas: `idle` (repouso), `walk_a`, `walk_b` (duas poses de caminhada) e `talk`
(gesto de conversa). Exemplo de ID: `hero.ne.walk_a`.

O manifest `public/characters/manifest-v1.json` registra recortes x/y/w/h e
pivôs [24,50], medidos no espaço local da célula. A base dos pés permanece
na mesma linha. O desenho visível tem até 42 pixels de altura, compatível com
o Canvas 640×360 e o chão de losangos 64×32.

## Integração

- O protagonista olha na direção do deslocamento e alterna as duas poses de
  caminhada a aproximadamente seis quadros por segundo. Ao parar, retorna ao idle.
- Ao chegar a um alvo, ele se vira para o objeto ou a pessoa.
- Helena e Davi permanecem em seus lugares; viram-se para o protagonista quando
  ele se aproxima e usam o gesto de conversa durante diálogos próximos.
- Profundidade continua ordenada pela posição dos pés; sprites usam nearest
  e coordenadas inteiras. A sombra em losango continua desenhada no Canvas.
- Os sprites geométricos anteriores funcionam como fallback em caso de falha
  de carregamento; a interface informa o problema.

Não são animações completas de oito direções: há quatro direções isométricas,
duas poses de caminhada e uma pose estática de conversa. Os NPCs não têm rotas
autônomas. O Davi usa o uniforme de treino fixo do prólogo; não há troca dinâmica
de roupa por clube, corrida, chute, defesa ou animação de partida nesta coleção.

## Originais e reprodução

Originais selecionados, captura de referência e prompts exatos ficam em
`assets/characters/source/`. Os arquivos de runtime ficam em `public/characters/`.
O manifest também é copiado para `web/src/scene/characters-v1.json`.

```sh
npm ci
npm run assets:characters
npm test
npm run test:e2e
```

O empacotador identifica os 16 grupos pelo alpha, usa uma única escala por
personagem, recorta e reduz por nearest, preserva RGBA e alinha os pés no mesmo
pivô. Os originais não são alterados. Reproduzir esse empacotamento não chama
serviço externo; a geração artística em si não é determinística.

Os testes validam os 48 IDs, células, pivôs, bordas transparentes, base dos pés,
poses de caminhada distintas, seleção de direção e retorno ao repouso.
Os testes de navegador verificam carregamento e interações nos três ambientes.

Pacote para download: `artifacts/TOUCHLINE-character-atlases-v1.zip`.
