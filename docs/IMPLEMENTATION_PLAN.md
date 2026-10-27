# Plano atual — webapp para Vercel

Pedido atual: integrar as artes, clubes, mecânicas e um guia de como jogar.
Preservar a direção já aceita: gestão estilo Brasfoot, ambientes isométricos,
elementos de RPG e controles por clique. A versão ativa passa de Godot para
React/TypeScript e Canvas 2D, com build estático Vite para Vercel.

| Issue | Entrega | Dependências | Aceite | Estado |
| --- | --- | --- | --- | --- |
| W0-01 | Projeto web e build | — | npm ci/build, TypeScript estrito, dist sem dependência de Godot | Feito |
| W0-02 | Gestão por clique | W0-01 | Elenco, escalação, 12 partidas, tabela calculada, resultados determinísticos | Feito |
| W0-03 | Exploração Canvas | W0-01 | Apartamento/diretoria/CT, portas, rotas sem cortar cantos, ordenação por pés | Feito |
| W0-04 | RPG integrado | W0-03 | Caderno, Helena, Davi e relatório; adiar escolhas; XP/atributos/memória únicos | Feito |
| W0-05 | Persistência local | W0-02, W0-04 | Reload preserva estado; export/import validados; inválido não substitui partida | Feito |
| W0-06 | Mobile e acessibilidade | W0-05 | Botões/touch, navegação deslizável, modais e nenhuma ação exige teclado | Feito |
| W0-07 | Vercel e verificação | W0-06 | vercel.json, guia de deploy, testes puros e Playwright no build de produção | Feito |
| A0-01 | Tilesets originais pixel art | W0-07 | 3 atlas RGBA, 48 elementos, pisos 64×32 e prompts preservados | Feito |
| A0-02 | Integrar PNGs nas cenas | A0-01 | Pisos, paredes e props dos três ambientes; nearest; erro explícito e fallback | Feito |
| A0-03 | Empacotamento e regressão | A0-02 | Recortes/pivôs reproduzíveis, alpha validado, capturas e fluxos existentes passando | Feito |
| F0-01 | Coleção de futebol | A0-03 | 5 atlas, 80 itens: identidade, estádios, instalações, torcida e várzea | Feito |
| F0-02 | Biblioteca e identidade na UI | F0-01 | Consulta/PNG por clique; brasões na tabela; camisas casa/visitante na central | Feito |
| F0-03 | Mais estilos de times | F0-02 | Oito identidades originais, 32 sprites adicionais, duas abas e PNGs exportáveis; liga preservada | Feito |
| C0-01 | Atlas dos personagens | A0-03 | Protagonista, Helena e Davi; 48 quadros RGBA, quatro direções, pivôs e prompts | Feito |
| C0-02 | Integrar personagens | C0-01 | Caminhada do protagonista, direção, conversa e fallback nos três ambientes | Feito |
| C1-01 | Refinar CT | C0-02 | Gol projetado, campo organizado, 16 poses de treino, reservas sentados, exercícios animados e migração do layout | Feito |
| F1-01 | Estádio e várzea jogáveis | F0-02 | Montar cenas em escala, footprints, entradas, portas e interações reais | Pendente |
| F1-02 | Torcida animada e kits nos atores | F0-02 | Sprite sheets por direção/estado; escala consistente e animações testadas | Pendente |
| W1-01 | Refinar apresentação | W0-07 | Hover, portas com fade, NPCs animados e retratos originais; revisão mobile | Pendente |
| W1-02 | Separar páginas de gestão | W0-07 | Componentes menores com estado fora da UI; regressão dos fluxos atuais | Pendente |
| W1-03 | Carreira e agenda | W0-05 | Personagem mantém carreira ao mudar de clube; relógio e compromissos consistentes | Pendente |
| W2-01 | Escolher clube | W0-05 | 12 elencos de 18 atletas e IDs estáveis; seleção com confirmação | Feito |
| F2-01 | Integrar coleção ao ciclo de gestão | F0-03, W2-01 | Quatro áreas de decisões, 112 artes em uso, treino/condição/torcida/várzea, limite de ações e caixa | Feito |
| F2-02 | Liga e continuidade | F2-01 | 22 rodadas, 132 jogos, próxima temporada e migração de saves antigos | Feito |
| F2-03 | Como jogar | F2-02 | Guia dentro do app e em Markdown, consequências e limites claros | Feito |
| W2-02 | Motor esportivo | W2-01 | Eventos, tática posicional, log e estatísticas consistentes por seed | Parcial: eventos/cartões/trocas; tática posicional pendente |
| W3-01 | Economia/mercado | W2-02 | Ledger, contratos e propostas validados; impedir transferências duplicadas | Pendente |
| W4-01 | Contas e save em nuvem | W0-05 | Definir backend/identidade com o usuário; isolamento de partidas e migração local | Pendente |
| W5-01 | Vertical slice | W1-03, W2-02, W3-01 | 20–30 minutos, duas ramificações, salvar/carregar, avaliação de desempenho | Pendente |
| C2-01 | Padronizar personagens | C1-01 | Quatro atlas v2, 64 quadros, célula/pivô/escala comuns, origem de variantes e inspeção na UI | Feito |
| C2-02 | Elenco completo no CT | C2-01 | 18–24 atletas reais, reservas/goleiros em exercícios, câmera ampla, seleção por nome e migração v3 | Feito |

## Partida acompanhável e ambientes

| Issue | Entrega | Dependências | Aceite | Estado |
| --- | --- | --- | --- | --- |
| P0-01 | Partida por eventos | W2-01 | Dois tempos, gols coerentes com log, cartões e expulsões alteram efetivo | Feito |
| P0-02 | Transmissão e intervalo | P0-01 | 30s por tempo em 1×, pausa, até 8×, pular por período, cinco trocas sem retorno | Feito |
| P0-03 | Disciplina e persistência | P0-02, W0-05 | Suspensão de uma rodada, schema 3, retomada e validação por replay | Feito |
| P0-04 | Refinamento dos três ambientes | C2-02 | Decoração original, iluminação e área técnica sem mudar rotas | Feito |
| P1-01 | Profundidade esportiva | P0-03 | Tática posicional, acréscimos, lesões e disciplina persistente dos rivais | Pendente |

## Pacote de carreira e polimento v0.4 — 25/10/2026

| Issue | Entrega | Dependências | Aceite | Estado |
| --- | --- | --- | --- | --- |
| C4-01 | Hub de carreira | P0-03 | Objetivos, resgate único, agenda, forma e confiança contextual | Feito |
| C4-02 | Registros esportivos | P0-03 | Participações reais, gols, súmulas e arquivo entre temporadas | Feito |
| C4-03 | Conversas no CT/elenco | S0-04 | Todos os atletas acessíveis, busca, promessa e aviso de prazo | Feito |
| C4-04 | Conforto e apresentação | C4-03 | Contraste, movimento reduzido, notificações, formação visual e escalação automática | Feito |
| C4-05 | Migração e regressão | C4-04 | Schemas 1–3 para 4, preservação de partida ativa e testes de carreira | Feito |

## Decisões

### Sistema social — primeiro ciclo implementado

Design proposto em [PLAYER_INTERACTIONS_DESIGN.md](PLAYER_INTERACTIONS_DESIGN.md).
Primeiro ciclo implementado no pacote v0.4. Conversas privadas por clique,
memórias, limite por rodada e devolutiva vinculada ao treino. Arcos exclusivos
mais longos, moral e influência coletiva continuam futuros.

| Issue | Entrega | Dependências | Aceite | Estado |
| --- | --- | --- | --- | --- |
| S0-01 | Domínio social e save | W0-05 | Quatro eixos, IDs persistentes, migração preserva prólogo e XP | Feito |
| S0-02 | Conversas individuais | S0-01, C2-02 | Todos os atletas acessíveis por CT/elenco; adiar e fechar sem custo | Feito |
| S0-03 | Memórias e ritmo | S0-02 | Três conversas/rodada, privacidade e efeitos únicos por evento | Feito |
| S0-04 | Devolutiva de Davi | S0-03 | Promessa mensurável, cumprimento/quebra e cobrança contextual | Feito |
| S0-05 | Perfis de titular e reserva | S0-04 | Prioridades distintas, sem resposta universal nem fatos esportivos inventados | Parcial: prioridades e perfis; arcos exclusivos pendentes |
| S1-01 | Promessas de escalação | S0-05, W1-03, histórico de titulares | Autoridade explícita e verificação sem alterar partidas passadas | Pendente |
| S1-02 | Vestiário e moral | S1-01, moral individual | Informação por fonte e impacto esportivo limitado | Pendente |

### Decisões da versão atual

- Build estático Vite na raiz, Node 24.x, React/TypeScript, sem backend obrigatório.
- Dados autorais JSON são compartilhados com o protótipo anterior, empacotados no
  build. Não buscar arquivos em caminhos de desenvolvimento após publicar.
- Saves web schema 4, com migração da liga antiga de quatro clubes; atributos são derivados de ações únicas, evitando valores
  redundantes. Save incompatível é preservado antes de gravação automática.
- Uma aba por partida; sem sincronização em nuvem neste incremento. Vercel não é
  usada como disco de saves: localStorage e arquivos exportados atendem ao MVP.
- Rotas por busca em largura numa grade de 9×7, sem diagonais nem cortes de cantos.
  Ordens novas preservam a aresta atual para evitar teleporte durante o movimento.
- A UI responsiva usa Canvas nativo 640×360 e amostragem nearest. Fontes do sistema
  e tilesets PNG originais publicados junto do app; nenhum asset/font remoto
  obrigatório. Sprites geométricos continuam como fallback e personagens provisórios.
- Não há deploy automático nesta execução: o usuário informou que vai hospedar.

## Histórico

O protótipo Godot segue preservado, incluindo as cenas e testes. Referências:
`GODOT_HYBRID_PLAN.md`, `LEGACY_IMPLEMENTATION_PLAN.md` e `GODOT_PROTOTYPE.md`.
O GDD mantém sua função de visão/universo; decisões de plataforma e input seguem
os pedidos mais recentes. Não tratar os sistemas futuros do GDD como prontos.

## Gestão esportiva v0.5 — 26/10/2026

| Issue | Dependência | Aceite | Estado |
| --- | --- | --- | --- |
| G5-01 Mercado de agentes livres | Elenco, caixa | Comprar/vender por clique; sem duplicação; CT e partida usam posse atual | Feito |
| G5-02 Folha e planejamento | G5-01 | Custo recorrente e despesas pendentes visíveis e persistentes | Feito |
| G5-03 Desenvolvimento individual | Treino, partida, relações | Participação e treino geram progresso limitado por potencial | Feito |
| G5-04 Legado esportivo | Liga, carreira | Prêmio único ao fim da temporada e títulos visíveis | Feito |
| G5-05 Testes e guia | G5-01–04 | Fluxo integrado, validação de save e regras documentadas | Feito |

Regras e prioridades seguintes em MANAGER_DESIGN.md. Contratos com vencimento e
mercado entre os clubes da liga continuam pendentes.


## Entrada e persistência v0.6 — 26/10/2026

- UI6-01 · Tela inicial responsiva, continuar/nova carreira e arte do CT: feito.
- UI6-02 · Nome validado e escolha de clube antes de iniciar: feito.
- UI6-03 · Três slots, migração do save antigo, autosave e salvar agora: feito.
- UI6-04 · Import/export, confirmação para liberar e cópia restaurável: feito.
- UI6-05 · Perfil e navegação compactos, testes de continuidade: feito.

Critérios e operação documentados em SAVES_UI.md. Conta online e sincronização
entre dispositivos continuam fora deste incremento.


## Transmissão v0.7

- B7-01: Coreografia a partir dos eventos, bola vinculada a portador/finalizador — feito.
- B7-02: Poses de chute, defesa, celebração e atlas original de efeitos — feito.
- B7-03: Replay de seis segundos com reconstrução de escalação e relógio pausado — feito.
- B7-04: Câmera geral/acompanhamento e controles legíveis em viewport mobile — feito.
- B7-05: Testes de imutabilidade, continuidade, assets e replay — feito.

Física da bola, animações próprias de reposições e replay de qualquer lance são
incrementos futuros. Os próximos focos pedidos pelo usuário seguem sendo
interações dos ambientes e UX mobile geral.


### Polimento do replay

- Galeria de finalizações já registradas e acesso pelo lance a lance: feito.
- Barra de tempo, pausar/reproduzir/repetir e ritmos independentes: feito.
- Contexto do lance, placar histórico e placar atual distintos: feito.
- Modo ampliado com campo fixado durante rolagem mobile: feito.
- Testes de reconstrução histórica e controles sem mutar a partida: feito.

## v0.8 — agenda e continuidade

- [x] Agenda derivada do save: próximo adversário, mando, classificação e suspensos.
- [x] Preparação direta com custos/efeitos e limites existentes.
- [x] Priorização de compromissos e acesso a desenvolvimento/escalação.
- [x] Metas de cinco vitórias, vinte pontos e temporada completa; resgate único por ano.
- [x] Pós-jogo contextual e guia atualizado.
- [ ] Próximo: eventos de vestiário com escolhas e consequências persistentes (não implementado).

Design e limites: `SESSION_LOOP.md`.
