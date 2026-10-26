# Dia de jogo — implementação web

Estado: implementado em 23/10/2026. Controles exclusivamente por clique.

## Fluxo

Jogar próxima rodada abre um dialog de transmissão. A partida inicia automaticamente.
São 45 passos por tempo, equivalentes a minutos de jogo: cada passo leva 2/3 de
segundo em 1×, totalizando 30 segundos por tempo em primeiro plano. Pausa,
intervalo e tempo em outra aba não contam. Velocidades: 1×, 2×, 4× e 8×.

Pular no primeiro tempo termina somente esse período e abre o intervalo. Pular
no segundo termina a partida. As mesmas funções geram os mesmos eventos em
acompanhamento, aceleração e salto; nenhum desses controles sorteia um novo placar.

No intervalo, selecione quem sai e quem entra e confirme. Máximo de cinco trocas;
quem saiu não retorna e expulso não pode ser substituído. Troca de goleiro exige
outro goleiro. Um atleta de linha pode sair para entrada de um goleiro, inclusive
após expulsão do goleiro original. O adversário faz até duas trocas de linha.

Ao final, Encerrar partida e atualizar rodada aplica resultado, outros confrontos,
bilheteria, cota, despesas, condição, apoio e renovação das ações uma única vez.
A tabela não muda enquanto a partida estiver em andamento.

## Motor e eventos

Domínio puro em web/src/game/live-match.ts, separado de Canvas e React.
Cada minuto determina disputa de ataque, possibilidade de falta/cartão,
impedimento, finalização, gol/defesa e escanteio. Faltas podem gerar pênalti,
cobrado no mesmo minuto com chance própria. Escanteios são eventos/estatísticas
de pressão, sem rotina separada de cobrança ou assistência neste incremento.

Força considera atletas ativos, treinamento, condição inicial, desgaste do tempo
jogado, mando, apoio e mentalidade. Um substituto começa seu desgaste no segundo
tempo; um expulso deixa de contribuir para a força, cujo denominador continua 11.
A ausência de goleiro também prejudica a defesa. O estado persistido contém os
atletas reais de ambos os elencos, escalação inicial, participantes, expulsos,
cartões, decisões de intervalo, estatísticas e log.

A transmissão projeta campo, linhas, redes, arquibancada, bola e jogadores em
isometria. Usa os mesmos atlas de Davi/goleiro, células e pivôs do restante do
jogo, reduzidos em nearest e com paleta de uniforme aplicada em runtime. Nomes,
IDs, números, substituições e expulsões vêm do estado da partida. Ao iniciar o
segundo tempo, os times trocam de lado.

A animação representa o andamento e os tipos de lance; não é uma reprodução
física completa de cada passe. O desenho segue a formação escolhida para o próprio time e não tem IA tática
individual. Personagens ainda compartilham modelos e fisionomias. Não se anunciam
assistências, notas ou posse percentual que o motor não calcula.

## Disciplina da competição fictícia

- Amarelo permanece acumulado entre rodadas; ao atingir três, suspende por um jogo
  e zera o acumulado.
- Segundo amarelo na mesma partida gera vermelho e retira imediatamente o atleta.
  Os dois amarelos dessa expulsão não somam ao acumulado de três.
- Vermelho direto também suspende por um jogo; não há julgamento disciplinar.
- Suspensão anterior é cumprida na rodada seguinte mesmo se o atleta ficaria no banco.
- Suspenso não pode entrar no intervalo. Ao iniciar, o motor completa a equipe com
  disponíveis e procura um goleiro quando necessário; a escalação de gestão é preservada.
- A tela Elenco informa suspensões e amarelos. A nova temporada zera a disciplina.
- Menos de sete atletas encerra a partida administrativamente, atribuindo vitória
  ao adversário; os gols atribuídos nesse caso não representam finalizações.

Estas são regras simplificadas da liga fictícia, não uma implementação integral
 de regulamento oficial. Disciplina dos rivais vale na partida atual; suspensões
 dos rivais entre rodadas ainda não são persistidas.

## Save e integridade

Schema 4 (carreira v0.4); chave de armazenamento anterior preservada. Schemas 1/2/3 migram sem
perder resultados, caixa ou RPG. Resultados de partidas antigas não são recalculados.
O jogo em andamento usa o autosave; recarregar abre a transmissão no ponto salvo.
Somente o intervalo permite decisões que mudam o motor. Durante a transmissão,
o dialog impede preparar, contratar ou trocar o clube por baixo da partida.

Na importação, reconstruir a partida pela seed, inputs da carreira e decisões
registradas no intervalo. Rejeitar diferenças em placar, log, cartões, participantes
ou fase. JSON com ordem diferente de propriedades continua válido. Custo econômico
só é confirmado no encerramento da rodada. A carreira mantém súmulas com até 50 eventos importantes dos últimos 22 jogos,
além dos placares da temporada e da disciplina acumulada.

## Limites e próximos passos

Sem lesões, acréscimos, prorrogação, disputa de pênaltis, substituições fora do
intervalo, tática posicional ou disciplina persistente de todos os clubes. Rivais
nos outros cinco jogos continuam no motor agregado anterior. Limite técnico atual
de nove gols por equipe preserva o contrato de resultados do save.

Os três ambientes receberam detalhes geométricos originais: luz e decoração no
apartamento, quadro tático/troféus na diretoria, piso lateral/área técnica no CT.
As novas decorações não mudam colisão, posição de objetos ou rotas salvas.
Não foram gerados novos atlas de imagem nesta entrega.

Próximo incremento: tática posicional, cobranças de bola parada, disciplina dos
rivais e histórico esportivo por atleta; depois acréscimos e lesões com decisões
claras de atendimento e substituição.

## Verificação

npm test: motor determinístico, pausa no intervalo, cinco trocas sem retorno,
força de expulsões/substituições, suspensão e reset, save/round-trip e adulteração.

npm run test:e2e: duração em 1× com relógio controlado, pausa, aceleração 4×,
troca, reload no intervalo/segundo tempo, salto por período, confirmação de rodada,
mobile e regressões de exploração/gestão/temporada. Capturas em artifacts/web:
match-live.png, match-halftime.png, match-mobile.png e *-refined.png.
