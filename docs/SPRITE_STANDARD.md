# TOUCHLINE — padrão de personagens v2

Coleção ativa: protagonista, Helena, atleta de linha/Davi e goleiro. São quatro
PNG RGBA 256×256, 64 quadros, células 64×64 e pivô [32,58]. A base visível dos pés
fica em y=57. As quatro poses neutras têm aproximadamente 40 px de altura.
A direção de arte usa cabeça de aproximadamente 1/4 da altura.

Linhas: SE, SW, NE, NW. Colunas: repouso, passada A, passada B e ação do papel.
Uma escala por papel evita variar o corpo entre poses. A âncora horizontal segue
o centro óptico da cabeça/core, sem ser desviada pelo braço ou chute.
O empacotador falha em recortes fora da célula e usa nearest com alpha preservado.

As passadas B geradas com direção incorreta foram rejeitadas. A versão publicada
usa uma variante espelhada da passada A aprovada da direção oposta (SE↔SW e
NE↔NW), com origem registrada em `sourceSlot` e `mirror`. Originais preservados.
Protagonista/Helena gesticulam, atleta passa/chuta e goleiro recebe com as luvas.
Durante conversa, Davi fica em repouso, sem executar o chute.

Os jogadores compartilham um modelo visual e uniforme de treino, com nomes e
números próprios. Fisionomias, tons de pele, penteados e kits individuais ainda
não são personalizados. Os ciclos têm duas passadas e uma ação por direção.

No jogo, **Atlas de personagens** permite inspecionar grade, eixo, pés e pivôs,
e baixar folhas PNG e manifest JSON. As mesmas folhas são usadas nos ambientes.

Originais e prompts: `assets/characters/source/*-v2.png` e `prompts-v2.json`.
Runtime: `public/characters/*-v2.png`, `manifest-v2.json` e
`web/src/scene/characters-v2.json`. Geração: image_gen integrado.

```sh
npm run assets:characters
npm test
npm run test:e2e
```

`assets:characters` reproduz o empacotamento v2 sem chamar a API; o comando
`assets:characters:legacy` preserva a reprodução dos arquivos históricos.
Testes verificam 64 IDs, bordas livres, escala, altura, pivôs e origem dos
espelhamentos; a direção também foi revisada visualmente. Captura de inspeção:
`artifacts/web/character-atlas-standard-v2.png`.
Pacote: `artifacts/TOUCHLINE-standard-characters-v2.zip`.
