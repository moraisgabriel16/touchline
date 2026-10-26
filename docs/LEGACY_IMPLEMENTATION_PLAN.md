# HISTÓRICO — direção isométrica substituída

# Plano de implementação — TOUCHLINE

Fonte de verdade: `TOUCHLINE_GDD.md`. Entregar incrementos executáveis; cada issue
inclui implementação e verificação. M0 e apenas M1-01 estão no incremento atual.
M2–M5 são backlog, não funcionalidades prontas.

| Issue | Entrega | Depende de | Critérios de aceite | Estado |
| --- | --- | --- | --- | --- |
| M0-01 | Projeto Godot, bootstrap, estrutura | — | Importar e iniciar sem erros; Compatibility; sem plugins | Feito |
| M0-02 | Viewport/input/projeção | M0-01 | 640×360, escala inteira; WASD/setas; projeção 64×32 testada; velocidade uniforme | Feito |
| M0-03 | Personagem/câmera | M0-02 | Andar no plano isométrico; câmera em pixels inteiros, sem suavização; teste de input | Feito; avaliação contínua de fluidez pendente |
| M0-04 | Verificação e instruções | M0-03 | README reproduzível; unitário, integração e smoke executáveis | Feito |
| M1-01 | Apartamento e caixa | M0-03 | Props originais, colisões, limites; E contextual por proximidade; texto externo; leitura fecha | Feito |
| M1-02 | Portas e SceneRouter | M1-01 | Fade 0,15/0,25s; marcador de entrada; input bloqueado só durante transição; falha de carga recuperável | Pendente |
| M1-03 | Rua residencial | M1-02 | Ida/volta ao apartamento sem atravessar paredes ou perder controle; limites de câmera por mapa | Pendente |
| M1-04 | CT e acesso | M1-03 | Campo/vestiário/escritório placeholders; chegada em marcador correto | Pendente |
| M1-05 | NPCs e foco | M1-04 | NPC estático interage; prioridade estável; sem interação através de paredes | Pendente |
| M1-06 | Refinar apresentação | M1-05 | Oclusão, caminhada em quatro direções; revisão pixel art/câmera em movimento; smoke de todas as cenas | Pendente |
| M2-01 | Estado inicial e RNG | M1-01 | Seed persistível; estado inicial conforme prólogo; lógica separada de Nodes | Pendente |
| M2-02 | WorldClock/EventBus | M2-01 | Eventos ordenados, pausa gerencial e fast-forward interrompível testados | Pendente |
| M2-03 | Ledger/dinheiro/energia | M2-02 | Transações com IDs, validação atômica, saldos e custos consistentes; sem fome/sede | Pendente |
| M2-04 | Agenda e sono | M2-03 | Conflitos explícitos; dormir processa compromissos em ordem e emite resumo | Pendente |
| M2-05 | Celular e deslocamento | M2-04, M1-04 | Mensagens/agenda acessíveis; viagem tem duração/custo coerentes; menu é alternativa à exploração | Pendente |
| M2-06 | Save/load JSON transacional | M2-05 | Gravação temporária/backup, schema e migração; round-trip em cenas seguras; erro não destrói save | Pendente |
| M3-01 | Modelo de carreira | M2-03 | Atributos e reputações separados; cargos limitam permissões; desemprego válido | Pendente |
| M3-02 | Diálogo por dados | M3-01 | Nós/condições/efeitos validados; escolhas por teclado; texto pulável | Pendente |
| M3-03 | Entrevista de Helena | M3-02, M2-04 | Sucesso/condicional/rejeição abrem caminhos; nenhum softlock | Pendente |
| M3-04 | Social e memória | M3-03 | Relações direcionais; memórias com origem; ausência tem alternativa; NPC sem onisciência | Pendente |
| M3-05 | Tarefa de analista | M3-04 | Comparar atletas, observar treino e enviar recomendação com efeito verificável | Pendente |
| M4-01 | Dados futebol/RNG | M2-01 | Quatro clubes originais, 80 atletas, IDs e atributos validados | Pendente |
| M4-02 | Calendário/tabela | M4-01 | 12 jogos, 6 por clube, ida/volta; desempates e pontos testados | Pendente |
| M4-03 | Motor de partida | M4-01 | Seed+entradas reproduzem log; gols derivam de chances; estatísticas correspondem a eventos | Pendente |
| M4-04 | Rodadas e AI básica | M4-02, M4-03, M2-02 | NPCs jogam sem cena; sem jogos duplicados; escalação e tática válidas | Pendente |
| M4-05 | Interface da partida | M4-04, M3-05 | Eventos, resultado e estatísticas navegáveis; retorno ao mundo consistente | Pendente |
| M4-06 | Economia/contratos simples | M4-04, M2-03 | Salários/caixa conciliados; contratos válidos; dez temporadas sem duplicações | Pendente |
| M5-01 | Criação e prólogo | M3-05, M4-05, M2-06 | Nome/aparência/origem; sequência do GDD integrada sem comandos debug | Pendente |
| M5-02 | Ramificações e diário | M5-01 | Pelo menos dois caminhos observáveis; falhas permitem continuar | Pendente |
| M5-03 | Áudio e acabamento | M5-02 | Assets originais/provisórios identificados; transições puláveis; legibilidade 640×360 | Pendente |
| M5-04 | Teste vertical slice | M5-03, M4-06 | Fluxo 20–30 min, salvar/sair/carregar exato; sem inconsistências; orçamento de frame avaliado | Pendente |

## Decisões do incremento

- Godot 4.5.1 padrão, GDScript, Compatibility; versão de referência fixa.
- Sem bibliotecas externas, autoloads vazios ou SQLite. Save JSON entra em M2.
- Câmera direta, atualizada na física e arredondada: priorizar estabilidade visual.
- WASD segue eixos do mundo projetados, com normalização na tela para velocidade uniforme.
- Arte geométrica original, desenhada por código. Fonte padrão provisória.
- Localização e móveis em JSON; estruturas futuras mantidas em pastas reservadas.
- Pausa bloqueia o único ator ativo; em M2 substituir por política central de pausa
  do mundo, preservando controles da interface.

## Riscos e mitigação

- Pixel snapping/câmera: testes headless não comprovam fluidez. Conferir em movimento,
  várias escalas e monitores antes de fechar a revisão visual de M1.
- Y-sort e geometria alta: pivôs/colisões precisam de inspeção visual conforme mapas
  ganhem paredes, telhados e NPCs; não acoplar navegação ao desenho.
- Escopo de simulação: não antecipar M3/M4 antes de relógio e persistência testados.
- Saves: schema versionado e backups antes de integrar carreira e mundo persistente.
- Agenda e branches: testar compromisso perdido e rejeição para evitar softlocks.
- Determinismo: RNG local por domínio/partida, nunca baseado em relógio real.
- Conteúdo/licenças: todos os clubes e assets autorais; produção final ainda pendente.
