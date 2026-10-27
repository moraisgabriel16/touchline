# Ciclo de sessão — v0.8

Objetivo: dar contexto para uma sessão curta e motivos esportivos para continuar a carreira.

1. Retomar: agenda derivada do save informa campanha, condição e próximo rival.
2. Decidir: até três preparações por rodada, conversas com atletas, desenvolvimento e escalação.
3. Assistir: transmissão, substituições e replays existentes.
4. Entender: resumo do resultado contextualiza classificação e próximo confronto.
5. Progredir: metas esportivas com XP/dinheiro e evolução dos atletas; temporadas ficam no histórico.

Não há relógio real, penalidade por ausência, sequência obrigatória de acessos nem recompensas aleatórias. Tudo avança pelas partidas. A agenda não cria outra fonte de estado: lê as regras de preparação, calendário, disciplina, vínculos e gestão existentes.

Metas adicionadas: cinco vitórias (60 XP/2500), vinte pontos (80 XP/3500), calendário completo (100 XP/2000). Chaves por ano, resgate idempotente, bloqueado durante partida. Validação aceita chaves novas e antigas. A conclusão respeita seis rodadas em saves legados e 22 na liga atual. Resgate antes da virada do ano; metas não concluídas não são transportadas.

Limites: classificação inicial usa os desempates estáveis do jogo, não previsão. Manchetes resumem pontos das últimas três partidas. Não há novos eventos narrativos, contratos, lesões ou adversários com IA tática nesta entrega. Economia das novas metas precisa de avaliação com sessões reais; máximo adicional 8000 por temporada.

Próximo incremento sugerido: eventos de vestiário com duas escolhas e consequências explícitas, ligados à história esportiva e aos vínculos existentes.
