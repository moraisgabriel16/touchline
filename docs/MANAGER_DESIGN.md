# TOUCHLINE — design de gestão esportiva v0.5

Implementado em 26/10/2026. Referência: [descrição oficial do Brasfoot](https://brasfoot.com/o-brasfoot-2022-2023.html), consultada nesta data. A fonte descreve gestão, compra/venda, táticas, ingressos, campeonatos, ranking e temporadas rápidas. As decisões abaixo são nossa interpretação de design; não reproduzem código, arte, interface ou dados do Brasfoot.

## A vontade de jogar mais uma rodada

O jogador deve terminar cada rodada com uma consequência compreensível e uma
nova decisão: faltou um zagueiro, o jovem está perto de evoluir, uma vitória
aproximou o título, a folha precisa caber no caixa. O ciclo é **diagnosticar →
investir → escalar → acompanhar → interpretar → ajustar**.

| Motivador | Implementação no TOUCHLINE | Consequência observável |
| --- | --- | --- |
| Montar um time próprio | Mercado por posição, comparação com o elenco, taxa e salário | Reforço entra no CT, nas conversas e nas partidas |
| Encontrar uma aposta | Foco de desenvolvimento com progresso visível | Força permanente melhora a equipe e o valor de venda |
| Fazer escolhas difíceis | Venda de reservas, custo recorrente, previsão de caixa | Espaço e dinheiro em troca da saída definitiva |
| Pensar na próxima partida | Adversário, mando, média titular e atalhos | Preparação e escalação ligadas ao próximo desafio |
| Construir legado | Premiação por posição e títulos na carreira | Recompensa financeira e memória entre temporadas |
| Criar vínculo | Conversas, compromissos e confiança | Confiança consolidada melhora o aproveitamento do treino individual |

A diferença do TOUCHLINE é conhecer o atleta fora da tabela. Ele aparece no CT,
pode ser ouvido, guarda memórias e responde aos compromissos. Comprar alguém
cria uma relação; vendê-lo encerra sua presença no ambiente e preserva o histórico.

## Regras implementadas

### Mercado

- Dezoito agentes livres fictícios, nove ofertas por lista antes de remover os já contratados. A lista gira três posições a cada três rodadas e uma na virada do ano.
- Janelas: rodadas 1–4 e 12–14. Não há negociação durante a partida ou após o fim da temporada.
- Taxa depende de força e idade. Confirmar desconta o valor exibido; é preciso guardar no caixa também três salários do reforço. Essa reserva é um critério de entrada, não dinheiro bloqueado.
- Compra adiciona reserva, apto a conversar, treinar, ser foco de desenvolvimento e entrar na escalação.
- Vendas simulam propostas imediatas de clubes externos à liga, a 55% do valor de referência, arredondado para baixo em centenas. Melhorar força aumenta o valor.
- Saídas exigem atleta fora dos titulares, mínimo de 16 no elenco e dois goleiros. Elenco máximo de 24 e até três goleiros, compartilhado com a várzea.
- Promessa ativa impede venda. Davi só pode sair depois de entregar o relatório do prólogo.
- Um atleta vendido não pode ser recomprado. A posse histórica impede duplicação e preserva estatísticas/memórias. Não há leilão nem negociação de contrapropostas neste incremento.

### Finanças

- Atletas originais e da várzea: R$ 200 por rodada. Agentes livres: força original × R$ 6; salário permanece fixo mesmo após evolução.
- Operação: R$ 900 por rodada. O elenco inicial mantém o custo total anterior de R$ 4.500.
- Receita: cota de R$ 2.500, mais bilheteria em casa. A previsão usa ingresso e apoio atuais; ações realizadas depois mudam a projeção.
- Se faltar caixa, a diferença vira despesa pendente, sem juros, cobrada na próxima rodada. Contratações de mercado e várzea ficam bloqueadas enquanto houver pendências. Não há demissão, falência ou confisco automático.
- Prêmio ao encerrar a última rodada: campeão R$ 30.000, vice R$ 15.000, 3º–4º R$ 8.000, demais R$ 3.000. Não é retroativo a temporadas já encerradas antes desta versão. Começar a próxima temporada não repete o crédito.

### Desenvolvimento

- Um atleta em foco, alterável entre partidas, sem apagar progresso dos focos anteriores.
- No encerramento: 35 pontos se participou, inclusive como substituto; 15 se houve treino da equipe, mais 5 por nível do CT. Confiança ≥65 soma 5 pontos quando houve treino.
- A cada 100 pontos, +1 de força. Potencial: força original +6 até 23 anos ou +3 nos demais, limitado a 95. Idades ainda não avançam automaticamente.
- Reservas recebem pontos de treino; suspensos não recebem participação. O simples movimento visual do CT não gera pontos.
- A força desenvolvida é usada em escalação, comparação, motor de partidas e preço de venda. Evolução ocorre após a partida, preservando a reprodução do jogo salvo em andamento.

### Continuidade

O schema 4 aceita o bloco opcional `management`, validado antes de carregar.
Saves anteriores sem esse bloco preservam o estado e começam sem transações,
evolução ou despesas pendentes inventadas. A primeira nova rodada passa a
registrar eventuais despesas não pagas. O elenco, mercado e desenvolvimento
persistem entre temporadas; apenas as janelas reabrem.

## Próximos incrementos, em ordem

1. **Contratos e propostas:** duração, renovação, contraproposta e promessa de tempo de jogo. Aceite: valor e consequência claros antes de confirmar; salários e vencimentos persistentes.
2. **Ecossistema de transferências:** posse exclusiva entre os clubes, IA com orçamento, novas gerações, saída/recompra consistente. Aceite: nenhum atleta duplicado em dois elencos.
3. **Tática com funções:** adequação de posições, características de jogadores e relatório pós-jogo explicando o efeito. Aceite: estratégias possuem vantagens e custos mensuráveis, sem uma opção universalmente superior.
4. **Pirâmide de competições:** acesso, descenso e copa com calendário consistente. Aceite: transição de temporada preserva histórico, finanças, elenco e regras de elegibilidade.
5. **Arcos pessoais:** insatisfação por minutos, liderança e promessas ligadas às negociações. Aceite: consequências antecipadas na conversa, sem punições ocultas.

## Verificação e limites

Testes de domínio cobrem taxas, salários, dívidas, janela, posse, venda, limites,
participação, progresso, potencial, premiação única e importação. O teste de
navegador percorre cancelar/confirmar compra, encontrar reforço no CT, conversar,
definir foco, vender, recarregar e conferir desktop/mobile.

A lista de agentes é finita e fixa nesta versão; não representa um mercado entre
os 12 clubes. Não há contratos com prazo, lesões, envelhecimento ou transferências
automáticas da IA. A galeria de títulos usa o histórico já existente, limitado às
últimas 20 temporadas encerradas, mais a temporada atual quando concluída.
