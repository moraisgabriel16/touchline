# Transmissão de partidas — v0.7 + controles de replay

## Como usar

Jogar próxima rodada abre a transmissão. O ritmo continua sendo 30 segundos
por tempo em 1×; velocidades 2×, 4× e 8× também aceleram a representação.
Pausar congela o relógio e a animação. Câmera: geral mostra o campo; Câmera:
acompanhar aplica aproximação leve e deslocamento suave na direção da bola.

Depois da primeira finalização, **Rever último lance** pausa o jogo e reproduz
uma reconstituição da última finalização. A sequência tem seis segundos em 1×. O placar e os números
ao lado continuam sendo os atuais. O minuto do lance é identificado na imagem
e no texto. O replay termina parado; pode ser repetido. O seletor Lance para rever permite escolher qualquer finalização já registrada, e Lance anterior/Próximo lance percorrem a lista. Cada finalização também tem acesso pelo painel Lance a lance. **Voltar à transmissão**
fecha o replay, mantendo a pausa; **Retomar partida** volta a avançar. No intervalo,
Começar segundo tempo fecha o replay e retoma. Pular mantém os mesmos eventos.

## Comportamento visual

- Bola passa do passador ao atleta do lance, que domina e conduz.
- Finalizações usam o autor registrado pelo motor. Sem chute naquele minuto,
  a bola circula entre dois atletas da equipe com a posse.
- Defesas/cortes terminam antes da linha do gol; gols terminam na rede.
- Personagens usam caminhada, pose de ação no chute, inclinação na defesa e
  salto/braços levantados na comemoração. Efeitos de impacto e brilho vêm de um atlas.
- Portador e finalizador recebem identificação. O árbitro sinaliza amarelo/vermelho.
- Expulsos não aparecem entre os atletas ativos; substitutos ocupam as vagas.
- Linhas acompanham a bola e um ajuste visual reduz sobreposição entre sprites.
- Movimento reduzido mantém a câmera geral e apresenta estados estáticos.

## Assets

`public/football/match-effects-v1.png`: atlas RGBA original de 64×64, com 16
células de 16×16 e pivô (8,8). Quatro quadros de bola, quatro de impacto,
quatro de seleção e quatro de brilho. Manifesto em
`web/src/football/match-effects-v1.json`. Regeneração determinística:
`npm run assets:match`, usando `tools/generate-match-effects.mjs` e pngjs.

Os atletas continuam usando o atlas de personagens v2, recolorido com os kits
dos clubes. A pose de ação existente passou a ser usada nos chutes. Inclinação
e comemoração são transformações/desenhos de Canvas; não houve mistura com
novos personagens gerados em outro estilo. Falha no atlas de efeitos usa bola
simples de fallback, e falha nos personagens mantém figuras básicas.

## Arquitetura e compatibilidade

`game/broadcast.ts` produz quadros visuais a partir de `LiveMatch`, sem escrever
no estado da partida. `lastShotReplay` reexecuta o motor determinístico até o
minuto do chute, aplicando as substituições do intervalo antes do segundo tempo.
Isso evita mostrar um jogador que só entraria depois do lance.

Nenhuma regra de gols, cartão, RNG, salário, evolução ou validação de saves foi
alterada. A coreografia não decide o resultado. Os passes e posições intermediárias
são uma representação, não trajetórias físicas registradas pelo motor.

## Limites

Em 1× cada minuto de jogo passa em aproximadamente 0,67 segundo, por isso a
transmissão é resumida; o replay é o modo indicado para ler a jogada com calma.
Não há replay de eventos sem finalização, física de colisão com a bola, animações
exclusivas de escanteio/lateral, som ou IA tática individual. A etiqueta defesa/corte
respeita o evento genérico do motor, sem inventar uma defesa creditada a um goleiro.
Os movimentos de defesa e comemoração reutilizam poses, não são novos atlas
anatômicos completos. O replay é reconstruído, não uma gravação de vídeo.

## Verificação

Testes: identidade do finalizador, bola junto ao portador, destino de gol/defesa,
inversão do campo, expulsos ausentes, substituição no replay, imutabilidade do
save e 16 células transparentes válidas do atlas. No navegador: replay no intervalo,
relógio e placar preservados, câmera, viewport mobile, retorno e encerramento da rodada.


## Controles de replay e visualização

- Pausar/reproduzir controla somente o replay; a partida continua pausada.
- A barra Posição do replay permite inspecionar qualquer ponto da sequência e
  pausa a reprodução ao ser movida. O tempo exibido é o da sequência visual.
- Ritmos 0,5×, 1× e 2×: a sequência completa leva respectivamente 12, 6 e 3 segundos.
- Esc pausa também o replay. Aba oculta não avança sua reprodução.
- O painel identifica jogador, clube, resultado do lance e placar naquele minuto.
  O placar principal continua mostrando o resultado atual da partida.
- Ampliar transmissão oculta estatísticas e elementos secundários, sem solicitar
  permissão de tela cheia. Mostrar painel completo restaura a interface.
- Movimento reduzido abre o replay parado no desfecho; a barra permite examinar
  quadros. Reprodução pode ser acionada explicitamente pelo jogador.

A seleção de lances é validada contra as finalizações da partida atual. Um minuto
inexistente ou fracionário não gera replay. Reconstituições do primeiro tempo
não incluem as trocas posteriores do intervalo. O histórico não é regravado.
