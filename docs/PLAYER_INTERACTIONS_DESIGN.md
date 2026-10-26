# Interações com atletas e relacionamentos — proposta de game design

Estado: proposta original de 23/10/2026; primeiro ciclo implementado em 25/10/2026.
Consulte CAREER_RELEASE_V04.md para o comportamento entregue. As seções abaixo
continuam como visão de design: deslocamento até a lateral, moral, autoridade por
cargo e arcos exclusivos completos ainda são futuros.

Base: seções 1, 6, 8, 9 e 10 do TOUCHLINE_GDD.md. Adaptação às decisões
atuais: webapp, controles por clique, gestão e ambientes isométricos, temporada
por rodadas. As regras e os valores abaixo são hipóteses iniciais de balanceamento.
Não alteram o funcionamento da versão jogável atual.

## 1. Experiência desejada

O atleta lembra como foi tratado e compara palavras com decisões. Conversar
ajuda a compreender necessidades, negociar expectativas e lidar com conflitos.
Não existe uma resposta universal que conquiste todo o elenco.

Ciclo: observar → entender → conversar → assumir ou recusar um compromisso →
agir na gestão → receber uma reação → acompanhar a relação.

Exemplo: um reserva pede uma oportunidade. É possível explicar a concorrência,
combinar uma avaliação ou, com autoridade para escalar, prometer uma titularidade.
Ser honesto pode preservar o respeito sem deixar o atleta contente. Uma promessa
agradável hoje pode gerar um conflito maior na semana seguinte.

Explorar o CT acrescenta presença e contexto. A ficha do elenco oferece as mesmas
ações, custos e resultados: andar até o atleta não concede bônus social extra.

## 2. Fluxo de interação no CT

1. Clique num atleta ou no seu nome na lista: seleção com nome, posição,
   exercício atual, disponibilidade e botão **Conversar**. Selecionar não gasta ação.
2. Durante o exercício aparece **Chamar na próxima pausa**. Uma única solicitação
   fica pendente; trocar de alvo ou cancelar não aplica efeitos sociais.
3. O atleta conclui o ciclo visual, vai para um ponto seguro na lateral e o
   protagonista se aproxima. A preparação continua sem avançar a rodada.
4. Abre-se um painel: nome, contexto, fala e duas a quatro respostas. Botões
   específicos, como **Comentar treino**, substituem um botão genérico de elogio.
5. Antes de confirmar uma conversa relevante, a interface informa custo,
   compromisso e eventual prazo. Fechar antes da confirmação não gasta a ação.
6. Ao concluir, mostra-se uma reação curta e uma anotação no histórico; o atleta
   retoma sua estação. Não mostrar números exatos de relacionamento.

A chamada deve resolver em até um ciclo curto, com opção **Ir direto à conversa**.
No acesso pelo elenco, o painel abre diretamente quando o atleta está disponível.
Se estiver indisponível, a mesma interface explica o motivo e permite agendar;
não cobrar a ação até a conversa acontecer. Sair do CT cancela somente a chamada
visual, sem inventar um encontro ocorrido. Uma solicitação usa o ID estável do
atleta, nunca o índice ou a posição animada do sprite.

Na primeira entrega, a conversa usa o modal que já pausa a cena. Animação de
deslocamento para a lateral pode vir depois; não é requisito para validar o sistema.
Movimento reduzido e acesso pelo elenco dispensam essa animação.

## 3. O que compõe a relação

Relações direcionais do atleta para o protagonista, persistentes, de 0 a 100.
Não calcular uma média única de amizade.

| Dimensão | Pergunta do atleta | Como muda |
| --- | --- | --- |
| Confiança | Você faz o que diz? | Honestidade, confidencialidade, promessas cumpridas ou quebradas |
| Respeito profissional | Seu trabalho e suas decisões fazem sentido? | Feedback fundamentado, coerência, justiça, competência observável |
| Afinidade pessoal | Eu me sinto à vontade com você? | Escuta, interesses descobertos, convivência e limites respeitados |
| Rivalidade | Existe uma disputa ou atrito entre nós? | Exposição pública, conflitos recorrentes, disputas de autoridade |

Confiança e respeito começam em 50; afinidade em 30 e rivalidade em 0 para
contatos novos sem histórico autoral. Cinquenta significa neutralidade, não
confiança conquistada. Histórias autorais podem definir outros valores.

Rivalidade não significa ódio nem elimina respeito. Afinidade não garante aceitação
de uma decisão profissional. Moral é um estado passageiro separado: frustração
por ficar no banco não apaga meses de confiança.

A UI descreve cada eixo por faixas, com texto contextual: **Confiança: em construção**,
**Respeito: consolidado**, **Afinidade: reservado**, **Atrito: recente**. Cada eixo terá
rótulos próprios; nunca usar verde/vermelho como única informação. Pensamentos
ocultos aparecem como sinais ou são descobertos na conversa, não como certeza.

## 4. Identidade e necessidades individuais

Cada atleta recebe duas tendências de personalidade e uma prioridade atual:
desenvolvimento, espaço na equipe, estabilidade, desafio esportivo ou reconhecimento.
Traços descrevem comportamento, sem diagnosticar ou transformar alguém em vilão.
Exemplos: reservado/comunicativo, paciente/urgente, competitivo/cooperativo.

Personalidade modula tom, tolerância e iniciativa; não decide sozinha a resposta.
Usar idade, posição ou condição de reserva como contexto, nunca como personalidade
automática. Um jovem pode ser seguro e um veterano pode precisar de apoio.

No primeiro incremento, prioridades e traços autorais para três atletas; para os
demais, perfis simples e estáveis derivados da seed e do ID, materializados no save.
Todos podem conversar. Somente os três focais recebem arcos exclusivos inicialmente.
O jogador descobre prioridades pelo comportamento e pelas falas.

| Perfil de teste | Situação | Dilema |
| --- | --- | --- |
| Davi Nascimento | Desenvolvimento sob pressão | Incentivar sem prometer ascensão imediata |
| Goleiro titular | Exige critérios consistentes | Cobrar desempenho sem transformar derrota em culpa individual |
| Reserva | Quer uma oportunidade concreta | Negociar expectativa sem prometer espaço a todos |

## 5. Catálogo de conversas

| Ação | Condição | Resultado possível |
| --- | --- | --- |
| Cumprimentar | Contato disponível | Fala breve e contextual; gratuita, sem pontos ou XP |
| Perguntar como está | Conversa relevante disponível | Descobre uma preocupação; o atleta pode preferir não falar |
| Comentar treino | Observação real registrada | Feedback específico; respeito por leitura útil, incômodo com conclusão infundada |
| Dar apoio | Frustração conhecida | Alivia tensão passageira; não resolve falta de oportunidades |
| Explicar decisão | Decisão registrada e conhecida | Esclarece critérios; discordância pode continuar |
| Combinar acompanhamento | Objetivo verificável e permissão | Cria compromisso com prazo e cobrança futura |
| Reparar conflito | Memória de conflito aberta | Reconhece responsabilidade e negocia reparação; desculpa não zera o dano |
| Conversar com o grupo | Etapa posterior | Define expectativas coletivas; não multiplica ganhos individuais |

Crítica e elogio dependem de evidência. O motor atual não registra erros, gols ou
notas individuais: não gerar falas como "você perdeu três gols" a partir do placar.
Na primeira entrega, usar observações autorais verificáveis, como o treino de Davi,
e fatos disponíveis, como a presença na escalação confirmada de uma partida.
Animações ambientes de treino não são avaliação esportiva nem prova de evolução.

Recusar falar, discordar ou pedir privacidade são respostas válidas do NPC.
Não criar um teste de comunicação que force um atleta a aceitar qualquer proposta.

## 6. Autoridade do protagonista

No prólogo, atuar como analista: observar, ouvir, dar feedback no próprio escopo
e encaminhar uma preocupação. Não prometer salário, contrato ou titularidade.
Helena e comissão podem aceitar ou negar um encaminhamento.

As telas atuais permitem gestão simplificada, mas ainda não modelam cargos.
Não deduzir autoridade narrativa da existência do botão de escalação. Para liberar
promessas de titularidade, a etapa de carreira deve registrar explicitamente a
delegação/cargo e suas permissões. Enquanto isso, usar compromissos de análise
e acompanhamento que o protagonista realmente pode cumprir.

## 7. Limites e ritmo por rodada

- Três conversas relevantes opcionais por rodada, separadas das três ações de
  preparação atuais. Conversas de 30–60 segundos como alvo, não tempo obrigatório.
- No máximo uma conversa opcional relevante com o mesmo atleta por rodada.
- Repetir o mesmo assunto sem novo fato não gera ganhos nem novo XP; uma
  preocupação ainda aberta pode continuar em outra rodada quando houver novidade.
- Cumprimentos, consulta de histórico e seleção são gratuitos.
- Resposta a uma cobrança de promessa já assumida não consome o orçamento opcional.
  Cada cobrança só pode ser resolvida uma vez.
- Agendar, cancelar uma seleção ou adiar uma conversa não piora a relação.
  Ignorar deliberadamente um compromisso com prazo pode ter consequência explícita.
- Não punir quem não visita todos os atletas: relações não caem a cada rodada
  sem conversa. O jogador pode usar a preparação automática e lidar só com alertas.

Para evitar obrigação de conferir 24 pessoas, mostrar até dois assuntos novos em
destaque por rodada, priorizando prazos e conflitos. Os demais continuam acessíveis.
O resumo informa compromissos vencendo antes de **Jogar rodada**, sem exigir cumprir
todos nem bloquear a partida. Avançar confirma a passagem de prazo informada.

## 8. Compromissos verificáveis

Uma promessa contém: autor, beneficiário, texto, condição mensurável, prazo,
permissão exigida, evento de origem e estado. Estados: ativa, cumprida, quebrada,
renegociada ou encerrada por impossibilidade reconhecida.

Primeiro compromisso: **Entregar a devolutiva da observação até a próxima partida**.
O atleta aceita o combinado; entregar uma devolutiva válida dispara cumprimento.
Não basta abrir e fechar sua ficha. Antes de iniciar a partida, o sistema resolve
as devolutivas que venceriam nesse marco e registra uma única consequência.

Futuro, com autoridade e histórico de escalações: **Começar pelo menos uma das
próximas duas partidas**. Congelar a escalação no início de cada partida; mudar
a escalação depois não altera o passado. Não prometer minutos enquanto o motor
não registrar minutos. Não prometer evolução de atributo garantida.

Renegociar exige aceitação, não estende automaticamente o prazo e conserva o
histórico. Uma impossibilidade externa comprovada pode encerrar sem punição de
má-fé, mas o atleta ainda pode ficar frustrado. Não inventar lesões ou suspensões
antes de esses sistemas existirem. Falta de vontade não é impossibilidade externa.

## 9. Consequências e balanceamento inicial

| Evento | Hipótese inicial | Limite |
| --- | --- | --- |
| Escuta com informação nova | Afinidade +1 a +2 | Uma vez por assunto/evento |
| Feedback coerente com observação | Respeito +2 | Uma vez por observação |
| Compromisso cumprido | Confiança +4 | Uma vez por compromisso |
| Compromisso quebrado | Confiança −8; possível atrito +3 | Intensidade ligada à importância |
| Desculpa aceita | Abre reparação; sem reposição automática de pontos | Exige ação posterior |
| Repetição de elogio sem fato novo | Sem alteração | Não gera XP |

Limitar ganhos positivos de conversas opcionais a +4 por eixo/atleta/rodada;
compromissos e eventos importantes são contabilizados separadamente por IDs únicos.
Todos os eixos ficam entre 0 e 100. Danos importantes persistem; atritos menores
podem perder intensidade após resolução e algumas rodadas sem novo conflito.
Memórias centrais não desaparecem porque o valor numérico mudou.

Primeira entrega: consequências sociais, novas falas e compromissos, sem alterar
força ou atributos esportivos. Depois de existir moral individual, avaliar um
efeito de moral limitado a ±1 na força agregada da equipe, aplicado uma vez,
sem bônus adicional por confiança, afinidade e respeito. Testar antes de adotar.
Uma boa relação não vence partidas nem substitui treino ou qualidade técnica.

XP apenas por marcos inéditos, como concluir a primeira devolutiva; não por cada
clique ou repetição de conversa. Sem presentes compráveis para acumular amizade.

## 10. Memória, privacidade e vestiário

Cada memória registra ID do evento, participantes, temporada/rodada, importância,
valência, tags, visibilidade, fonte, assunto e compromisso associado quando houver.
Atletas só reagem ao que viveram, presenciaram ou receberam de uma fonte registrada.
Uma conversa privada não informa automaticamente o capitão, a imprensa ou o elenco.

Não há circulação de rumores na primeira entrega. Depois, propagação exige um
evento explícito com origem, destinatários e validade. Decisões públicas podem
afetar percepção de justiça; isso não replica um ganho de amizade no grupo inteiro.

Histórico na ficha: **Você ouviu sua preocupação**, **Devolutiva combinada para esta
rodada**, **Compromisso cumprido**. Separar fatos de impressões: **Parece frustrado**
é diferente de **Disse estar frustrado por ficar no banco**.

Guardar até 30 memórias recentes por relação; preservar fora desse limite os
compromissos ativos e marcos duradouros. Arquivar eventos resolvidos em resumo,
mantendo recibos de aplicação idempotente enquanto puderem ser referenciados.
Não eliminar a proteção contra efeitos duplicados ao limpar histórico visual.

## 11. Exemplo completo: Davi

1. O jogador observa o treino autoral já existente: Davi abre espaços, mas demora
   a decidir quando recebe de costas sob pressão.
2. Na primeira pausa, pergunta como ele percebe a situação. Davi manifesta receio
   de errar. Essa fala vira conhecimento confirmado, sem diagnóstico automático.
3. Escolhas: **Descrever a jogada e ouvir sua leitura**, **Propor uma devolutiva
   até a próxima partida**, **Encerrar e retomar depois**. Nenhuma promete titularidade.
4. O primeiro caminho pode aumentar respeito; o segundo abre um compromisso e
   indica o prazo antes da confirmação; o terceiro não aplica penalidade.
5. Entregar a devolutiva cumpre a promessa e muda a fala futura. Jogar sem entregar
   registra a quebra e permite ouvir uma cobrança na rodada seguinte.
6. Reconhecer a falha abre reparação. A confiança volta com um novo compromisso
   cumprido, não com sucessivas desculpas na mesma conversa.

O relatório para Helena e a devolutiva para Davi são ações distintas. Não premiar
novamente o relatório antigo nem fingir que falar com a diretora já cumpriu uma
promessa feita ao atleta. Nos outros clubes, Davi continua convidado do prólogo;
seu arco não deve substituir a identidade de um atleta do elenco local.

## 12. Modelo e integração futura

Domínio social separado do Canvas e dos componentes React:

- Perfil: ID persistente do atleta, tendências, prioridade e fatos descobertos.
- Relação: sujeito/objeto, quatro eixos, assuntos disponíveis e memórias.
- Conversa: ID de conteúdo, precondições, respostas, permissões, custos e efeitos.
- Compromisso: ID, condição, prazo, estado e eventos de resolução.
- Agenda social: temporada/rodada, ações consumidas e chamadas pendentes de UI.
- Evento: ID estável, contexto capturado, efeitos aplicados e participantes informados.

Textos autorais em JSON pt-BR; avaliar escolhas por funções puras. Conteúdo
condicional por dados e fatos, sem depender de IA generativa ou backend.
Reações determinísticas: salvar a escolha e o contexto aplicado; recarregar não
sorteia uma reação nova. Aplicar custo, memória e consequências numa transação.
Verificar novamente alvo, prazo e permissão antes da confirmação.

Planejar uma nova versão de schema social após o schema 3 das partidas, com
migração dos saves existentes e backup. Preservar as ações do
prólogo, XP e confiança legada de Helena; criar sua memória histórica uma única
vez, sem reexecutar recompensas. Novos eixos usam valores iniciais explícitos.
O ID social acompanha a pessoa; uma futura transferência não pode recriá-lo a
partir do clube. Relações e promessas sobrevivem à troca de temporada; só o
orçamento de conversas se renova. Prazos usam temporada e rodada, sem colisão
entre a rodada 1 de anos diferentes.

## 13. Entregas pequenas e critérios de aceite

| Issue | Entrega | Dependências | Aceite |
| --- | --- | --- | --- |
| S0-01 | Domínio social e migração | Persistência atual | Quatro eixos, IDs estáveis, defaults e export/import sem perda do prólogo |
| S0-02 | Ficha e conversa por clique | S0-01, CT atual | Qualquer atleta acessível pelo CT e elenco; contexto, fechar/adiar e mobile |
| S0-03 | Assuntos, memória e orçamento | S0-02 | Três conversas por rodada, sem repetição de ganho; conhecimento privado |
| S0-04 | Arco de Davi e devolutiva | S0-03 | Escolhas distintas, prazo, cumprimento/quebra e cobrança sem custo extra |
| S0-05 | Dois outros perfis focais | S0-04 | Reserva e titular com prioridades distintas e respostas sem melhor opção universal |
| S1-01 | Autoridade e promessa de escalação | S0-05, carreira/permissões, histórico de titulares | Somente cargo autorizado; verificação nas próximas partidas sem retroatividade |
| S1-02 | Vestiário e moral | S1-01, moral individual | Justiça coletiva, divulgação explícita e influência esportiva limitada/testada |

Testes da implementação: limites 0/100; efeito aplicado uma vez; custo só na
confirmação; cancelamento sem efeito; alvo correto entre 24 atletas; repetição
sem ganho; mudança de temporada preserva vínculos; prazo na última rodada;
migração e round-trip; compromisso cumprido/quebrado/renegociado; fonte privada;
recarregar não muda reação; acesso CT/elenco equivalente; ausência de permissão;
leitura e fechamento no mobile e com movimento reduzido.

Teste de experiência: iniciar contato sem tutorial verbal; distinguir confiança
de moral; entender o prazo antes de aceitar; perceber por que houve reação negativa;
avançar várias rodadas sem obrigação de conversar com todo o elenco.

Próximo incremento recomendado: S0-01 a S0-04 como primeiro ciclo social jogável,
em mudanças pequenas. Validar a conversa com Davi antes de produzir dezenas de
arcos, retratos ou conflitos coletivos. O primeiro ciclo S0-01 a S0-04 foi entregue no pacote v0.4; demais itens seguem o plano atual.
