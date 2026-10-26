# TOUCHLINE — carreira e polimento v0.4

Pacote implementado em 25/10/2026. Webapp single-player, por cliques, com save local.

## Ciclo jogável

1. Abra **Minha carreira** para consultar objetivos, forma recente, avaliação da diretoria e compromissos.
2. No CT ou no Elenco, clique em um atleta para abrir sua ficha. Ouvir revela sua prioridade e registra uma memória.
3. Prepare a equipe em Gestão. Use a busca no Elenco e **Escalar disponíveis** para montar onze atletas elegíveis na formação escolhida.
4. Jogue a rodada: dois tempos de 30 segundos em velocidade normal, aceleração, pausa, salto e substituições no intervalo.
5. Consulte a súmula e estatísticas, receba objetivos concluídos e prepare a próxima rodada. Ao terminar a liga, avance de temporada e mantenha seu histórico.

## Relacionamentos

Cada atleta do clube tem confiança, respeito, afinidade e rivalidade, apresentados por faixas descritivas. Sua personalidade e prioridade são estáveis. Conversas e compromissos ficam salvos; as doze memórias mais recentes aparecem na ficha.

Há três conversas com efeito por rodada e uma por atleta. Ouvir repetidamente não acumula pontos. Prometer acompanhamento exige ter ouvido o atleta em uma rodada anterior. Para cumprir, realize a ação de treino da gestão e volte à ficha para entregar o acompanhamento **antes de encerrar a próxima partida**. A entrega de um compromisso já assumido não consome outra conversa.

Entrar em uma partida com promessas pendentes mostra um aviso. Encerrar a partida sem cumprir reduz confiança e aumenta rivalidade. Reparar a promessa reconhece a falha, sem apagar a perda de confiança. Novas promessas ao mesmo atleta têm intervalo de quatro rodadas. O feedback específico de Davi exige a observação do prólogo e só concede seu efeito uma vez.

As relações ainda não modificam o motor de futebol. Não existem conversas infinitas para ganhar força nem bônus automáticos por assistir aos exercícios do CT.

## Progressão e registros

- Primeira vitória da temporada: R$ 1.500 e 30 XP; dez pontos: R$ 3.000 e 60 XP.
- Ouvir cinco atletas: 40 XP; cumprir o primeiro compromisso: 40 XP. Estes dois objetivos são únicos por carreira.
- Recompensas exigem clique para receber e não podem ser recebidas duas vezes.
- A avaliação da diretoria considera desempenho e nível do clube; não há demissão implementada.
- Estatísticas individuais contam participações, titularidades e gols efetivos das partidas acompanhadas pelo motor atual.
- São preservadas as últimas 22 súmulas, com até 50 lances relevantes cada, e as últimas 20 temporadas concluídas. Estatísticas individuais são acumuladas na carreira.

## Polimento e conforto

Ficha acessível diretamente pelos atletas do CT ou pela lista. Busca por nome/posição, escalação automática de disponíveis, atalhos entre preparação e carreira, avisos temporários e navegação por foco. Opções de reduzir animações e aumentar contraste persistem no navegador. Movimento reduzido congela a ambientação visual, sem impedir o andamento da simulação. A transmissão representa a formação selecionada; o cálculo tático continua simplificado.

## Saves e reprodução

O schema atual é 4. Saves 1–3 são migrados, inclusive partidas em andamento do schema 3, sem recalcular resultados encerrados. No carregamento local, uma cópia anterior à migração é guardada em `touchline.web.save.v1.before-v4` quando há espaço. Exportar JSON continua sendo a maneira recomendada de manter uma cópia fora do navegador.

Não se inventam estatísticas ou súmulas individuais de partidas anteriores à atualização. Preferências de conforto ficam separadas do save da carreira.

Execute `npm ci`, `npm run dev` e abra o endereço informado pelo Vite. Validação: `npm test`, `npm run build` e `npm run test:e2e`. Consulte VALIDATION.md para resultados e limitações dos testes.

## Limites e próximo incremento

Ainda é uma alpha: sem contratos, mercado entre clubes, salários individuais, lesões, demissão, multiplayer ou sincronização online. Personalidades usam um conjunto pequeno de perfis; arcos pessoais exclusivos além do prólogo são futuros. A animação da partida é representativa, não uma simulação física completa.

Próximo incremento sugerido: contratos e salários ligados ao orçamento, com negociação por clique e consequências claras nos relacionamentos. Expandir os arcos pessoais depois de validar esse ciclo econômico.
