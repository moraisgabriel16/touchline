# TOUCHLINE: RAÍZES DO FUTEBOL
## Game Design Document e especificação de implementação — v1.0
Idioma do jogo: pt-BR. Ano ficcional inicial: 2027. Plataforma inicial: Windows/Linux desktop. Engine: Godot 4.x estável, GDScript, pixel art 2D isométrica.

> Objetivo: RPG de vida e carreira no universo do futebol brasileiro, com simulação esportiva profunda, mundo persistente e exploração isométrica. O jogador controla uma pessoa, não um clube. Este documento é a fonte de verdade para o Codex. Construir em incrementos executáveis; não simular funcionalidades inexistentes.

# 1. VISÃO E PILARES
- Jogador cria personagem, começa com poucos recursos e escolhe caminhos profissionais não exclusivos: analista, olheiro, auxiliar, treinador, agente, diretor, presidente, investidor/proprietário.
- A carreira pertence ao personagem: desemprego, demissão, viagens e troca de clube não reiniciam progressão.
- Brasil fictício e reconhecível, com municípios e clubes originais; não utilizar marcas, escudos ou atletas reais sem licença.
- Mundo evolui independentemente do jogador: calendário, jogos, finanças, mercado, relacionamentos, lesões, notícias.
- Exploração é opcional quando a ação também pode ser feita por menu/celular. A exploração concede contexto e oportunidades, não vantagens arbitrárias.
- Falhas e derrotas abrem caminhos; não criar softlocks.
- Modo single-player offline na versão inicial. Dados e RNG determinísticos com seed persistida.

# 2. LORE / UNIVERSO
## Prólogo: A Caixa de Antônio
Ano 2027. O protagonista chega à fictícia Santa Aurora, interior paulista, com R$1.250, um aluguel vencendo em sete dias e uma caixa de recordações do tio Antônio, antigo funcionário do Aurora Atlético Clube. A caixa contém uma foto de 1998, um caderno de observações de base, uma carta e um ingresso de final regional. Um contato oferece entrevista para analista de desempenho. Aceitar, recusar ou falhar na entrevista são caminhos válidos. A caixa inaugura mistério opcional sobre uma antiga promessa de reconstruir a base; nunca transformar isso em conspiração obrigatória ou única linha de progresso.
## Facções
- Diretoria tradicional do Aurora: quer estabilidade e preservação de influência.
- Associação de torcedores: defende identidade, base e estádio.
- Grupo Horizonte: investidores que oferecem capital em troca de influência.
- Rede de empresários: busca contratos, exposição e ganhos.
- Imprensa local: interpreta decisões e influencia reputação.
As facções têm interesses mensuráveis e podem mudar alianças por eventos.
## Personagens iniciais
- Antônio Ribeiro (ausente; legado via cartas, fotos e relatos).
- Helena Duarte, diretora esportiva do Aurora: pragmática, cobra resultados, valoriza compromisso.
- Marcos Oliveira, treinador do Aurora: exigente, tático, pode ser mentor ou rival.
- Joana Martins, jornalista esportiva: busca boas histórias, ética variável por decisões.
- Davi Nascimento, atleta da base: talentoso, precisa de desenvolvimento e proteção contra pressão.
- Clara Azevedo, vizinha e amiga potencial: vida social fora do futebol, trabalha na cidade.
- César Vidal, agente: conhece o mercado, oportunista, relações podem ser úteis ou problemáticas.
Cada NPC principal tem agenda, profissão, objetivos, confiança, respeito, afinidade, memória episódica e disponibilidade contextual.
## Arcos narrativos
A. Primeiro emprego; B. Crise do Aurora; C. Promessa da base; D. Disputa por investimentos; E. Mercado e ética; F. Vida pessoal e mudanças de cidade. Todos modulares, com estados: não iniciado, ativo, resolvido, falhou, abandonado. Eventos com condições, escolhas e consequências, não cutscenes rígidas.

# 3. GEOGRAFIA E CENÁRIOS
## Cidade inicial: Santa Aurora (SP, fictícia)
Distritos: Vila das Palmeiras (residencial), Centro Velho (comércio e serviços), Bairro do Estádio (Aurora e torcedores), Parque Industrial (trabalho e renda), Estrada da Serra (várzea e campos), Terminal Rodoviário (viagens).
Locais jogáveis do MVP: apartamento do protagonista, rua residencial, praça/café, escritório da diretoria, CT com campo de treino e vestiário, estádio em modo partida. Locais posteriores: agência bancária, loja, clínica, academia, hotel, restaurante, aeroporto, estádio visitante, sede rival, centro de imprensa, apartamento melhor, casa, campo de várzea, instalações de base.
## Clubes iniciais originais
- Aurora Atlético Clube — Santa Aurora — tradicional, endividado, torcida fiel; cores azul-marinho e âmbar.
- União Ferroviária — Santa Aurora — clube operário, rival local; vinho e creme.
- Esporte Clube Horizonte — Vale Claro — clube jovem, financiado; verde e branco.
- Atlético Ribeirense — Ribeira Alta — forte na base; vermelho e preto.
MVP: liga regional fictícia de 4 equipes em turno e returno, seis jogos por clube, classificação por pontos, vitórias, saldo e gols; depois ampliar para calendários inspirados em estaduais, nacionais, copas e torneios continentais com nomenclatura original.
## Expansão Brasil
Clusters futuros: interior paulista, litoral sudeste, sul, nordeste, centro-oeste, norte; cidades com clima, arquitetura, economia, deslocamento e futebol distintos. Mundo simulado via dados mesmo quando não renderizado. Viagens usam mapa e duração/custo; não criar open world contínuo.

# 4. DIREÇÃO DE ARTE / PIXEL ART
- Perspectiva isométrica 2:1 (diamante); tile-base 64x32 px para chão; elevação em passos de 16 px. Sprite humano inicial ~24x40 px, variando por proporção. Render base 640x360 com escala inteira e letterbox; pixel snapping; filtros nearest; sem anti-alias nos sprites.
- Paleta: tons quentes de manhã, verdes desaturados em campos, concreto e tijolo urbanos, iluminação azulada à noite; clima brasileiro sem estereótipos caricatos.
- Contornos seletivos, sombras pintadas, 2–3 níveis de luz por material, silhuetas legíveis, UI com fontes pixel legíveis em português.
- Layers: solo, decals, paredes traseiras, props traseiros, entidades, props dianteiros, telhados ocultáveis, efeitos climáticos, iluminação e HUD.
- Oclusão: telhados e paredes frontais desaparecem com fade quando jogador entra; Y-sort por pés, ordenação estável; navegação e colisão desacopladas do desenho.
- Tilesets separados: residencial, comercial, clube, estádio, natureza, mobiliário, interiores. Atlas e convenção de pivôs padronizados.
- Personagens: 8 direções preferencialmente; MVP 4 direções diagonais espelhadas apenas quando não prejudicar uniformes/texto. Animações idle 4 frames, andar 8, correr 8, sentar 6, levantar 6, interagir 4, falar 4, comemorar 8, frustrar 6, telefonar 6, apontar 4, escrever 6, dormir transição.
- Props animados: ventilador, relógio, bandeira, luz do estádio, telas, árvores ao vento, ônibus, portas, catracas, placar.
- Clima: sol, nublado, chuva e noite; intensidade e efeitos cosméticos ligados a calendário, com influência limitada e explícita na simulação esportiva.
- Áudio: ambiente de bairro, ônibus, pássaros, torcidas originais, rádio, chuva, apitos, portas, passos por material; música original em loops suaves, com crossfade por local.
- Assets provisórios devem ser marcados como placeholders; jamais declarar arte final sem produção. Usar sprites e marcas originais.

# 5. NAVEGAÇÃO / CÂMERA / TRANSIÇÕES
- Input: WASD/setas para mover, clique no chão para pathfinding opcional, E para interagir, Esc pausa, Tab celular, M mapa, J agenda, I inventário, espaço acelera diálogo. Remapeamento de teclas.
- Colisões por polygons/tile navigation; click-to-move usa AStarGrid2D ou NavigationAgent2D conforme testes. NPCs têm áreas de interação e prioridades de foco.
- Câmera isométrica segue personagem com suavização moderada e limites de mapa; zoom 1x/2x inteiro; impedir tremor subpixel.
- Portas: aproximação → fade curto 0,15s → som → carregamento assíncrono → reposicionamento no marcador de entrada → fade 0,25s; input travado apenas na transição.
- Exterior/interior: roof fade e troca de ambiente; cortes com tela preta somente entre cenas distintas.
- Viagem entre bairros: animação de mapa com rota tracejada, ônibus/táxi em movimento por 1–3s, relógio avança por duração real do trajeto no mundo simulado; opção pular.
- Viagem entre cidades: mapa regional, linha animada, paisagem em parallax, som de ônibus/trem/avião conforme meio, cartão de chegada e clima local; eventos opcionais durante trajeto.
- Passagem de dia: escurecer cena, relógio acelera, janela com data, notícias do dia e obrigações; skip respeita eventos urgentes configurados.
- Dia de jogo: chegada ao estádio, corredor, vestiário, túnel, corte para interface de simulação de partida; após jogo, entrevistas e retorno.
- Cutscenes curtas, puláveis, com duração-alvo 2–6s, sem flash excessivo; preferir dissoluções e pans de cenário. Acessibilidade: reduzir movimento e animações.

# 6. INTERFACE / UX
HUD mínimo: data/hora, dinheiro, energia, notificação contextual, indicador de interação; painel de acesso rápido com mapa, carreira, social, agenda, celular. Nada de HUD permanente superlotado.
Celular diegético: mensagens, notícias, e-mail fictício, vagas, banco, agenda, contatos, relatórios; interface responsiva e navegável por teclado/mouse.
Gestão de futebol: telas densas, com filtros, ordenação, busca, comparação, escalação por arrastar e soltar e por teclado, painéis de finanças, contratos, calendário e scouting.
Diálogos: retrato pixel art, nome, texto progressivo pulável, 2–4 respostas, consequências ocultas ou sinalizadas conforme contexto, histórico consultável; não expor números sociais exatos por padrão (modo depuração pode).
Notificações: três níveis (informativo, importante, urgente); evitar interrupções excessivas; histórico e silenciamento.
Acessibilidade: escalonamento de UI, contraste, legendas, remapeamento, velocidade de texto, modo sem animações intensas, não depender só de cores.
Localização: todos os textos em arquivos externos com chaves, pt-BR inicial, estrutura pronta para outros idiomas.

# 7. TEMPO E ROTINA
- Relógio simulado discreto: exploração pode usar razão configurável (ex.: 1 min real = 5 min no jogo), mas ações consomem duração definida; pausa em menus gerenciais por padrão.
- Eventos agendados com prioridade, janela, local, participantes, condição e fallback; evitar conflitos de agenda silenciosos.
- Rotina automática: refeições e necessidades básicas abstraídas; não criar barras punitivas de fome/sede. Energia, bem-estar e estresse mudam por trabalho, sono, lazer e eventos.
- Dormir avança para hora escolhida, processa eventos do mundo em ordem cronológica e exibe resumo.
- Deslocamentos, consultas, cursos, entrevistas, treino e jogos têm custos de tempo; compromisso perdido tem consequências proporcionais.
- Aceleração até próximo evento relevante; eventos críticos interrompem fast-forward; tarefas delegadas continuam.

# 8. CARREIRA LIVRE
Origens: analista autodidata, ex-atleta amador, olheiro, estudante, empreendedor; mudam atributos e relações iniciais, não bloqueiam cargos.
Atributos: tática, análise, liderança, negociação, scouting, gestão, comunicação, disciplina. Níveis 0–100 com curva de XP e soft cap; reputação separada por clube, cidade, região e profissão.
Papéis: analista, olheiro, auxiliar, treinador, empresário/agente, diretor, presidente, proprietário/investidor. Cada cargo tem permissões, metas, salários, contratos, rotinas, decisões e acesso a dados.
Progressão: experiência + formação/licenças + networking + vagas + entrevistas; não exigir árvore linear. Multicargo permitido quando não houver conflito de interesse ou calendário; conflitos são explicitados e sujeitos a regras do mundo.
Demissão, desemprego, licença, afastamento, aposentadoria e mudança de cidade devem funcionar. Jogador não pode assumir poderes de cargo que não ocupa.

# 9. SIMULAÇÃO DE FUTEBOL
Entidades: clube, equipe, atleta, funcionário, contrato, competição, temporada, rodada, partida, evento de partida, tática, treino, lesão, suspensão, transferência, empréstimo, academia.
Atleta: idade, posição principal/secundárias, pé dominante, atributos técnicos/físicos/mentais, potencial oculto, condição, fadiga, moral, forma, personalidade, contrato, salário, valor estimado, histórico. MVP usar atributos 0–100.
Táticas: formação, mentalidade, pressão, ritmo, largura, linha defensiva, marcação, substituições; decisões têm trade-offs; evitar tática dominante universal.
Motor de partida: seed + atributos + táticas + mando + condição + moral + aleatoriedade controlada; simular posse/território/chances/eventos em passos discretos; gols derivados de chances e finalização/defesa, não números arbitrários. Resultado reprodutível por seed e entradas. Gerar log minuto a minuto e estatísticas consistentes com eventos.
Liga MVP: 4 clubes, ida/volta, 6 jogos por clube, 12 jogos totais, vitória 3, empate 1, derrota 0; desempate pontos, vitórias, saldo, gols pró, confronto direto opcional. Tabela atualizada após rodada; jogos de NPC simulados sem carregar cena.
Contratos e transferências: valor, salário, duração, cláusulas simplificadas, interesse do atleta, orçamento, negociação, resposta e prazo; impedir dinheiro negativo não autorizado e transferências duplicadas.
Treino: planos semanais, intensidade, risco de fadiga, desenvolvimento gradual, potencial e idade; lesões e suspensões raras mas verificáveis.
Economia do clube: receitas de bilheteria, patrocínio fictício, premiações e vendas; despesas de salários, manutenção, viagens e compras; caixa, dívida e limites.
AI clubes: escalação e táticas baseadas em elenco e treinador, orçamento e transferências por necessidade, trocas de comissão e projetos de longo prazo.

# 10. SISTEMA SOCIAL / NPCs
NPC: ID persistente, papel, personalidade (vetor de traços), necessidades, agenda, objetivos, relações direcionais, memórias, conhecimento e disponibilidade.
Relacionamentos: confiança, respeito profissional, afinidade pessoal, rivalidade; valores 0–100, com limites e decaimento moderado. Conhecimento não é onisciente: informação tem fonte, validade e confidencialidade.
Memórias estruturadas: evento_id, ator, alvo, timestamp, valência, importância, tags, expiração opcional. Ex.: promessa de tempo de jogo, cumprimento, quebra, notícia.
Diálogo orientado a dados: nós com pré-condições, respostas, checks, efeitos validados e próximos nós. Sem IA generativa necessária para MVP.
Agenda NPC: casa, trabalho, deslocamento, lazer, sono; simulação detalhada só para NPCs próximos/relevantes, agregada para outros. Ausência de NPC deve ter explicação e alternativa (ligação, agendamento).
Reputação social e profissional são separadas. Não transformar vínculos pessoais em simples moeda de carreira; relações devem ter agência e limites.

# 11. VIDA PESSOAL / ECONOMIA
Apartamento inicial alugado; despesas periódicas, salário, transporte, cursos, lazer e patrimônio. Moradias e veículos alteram custos, deslocamento e conforto, não dão vantagem esportiva desproporcional.
Inventário leve: documentos, lembranças, roupas, celular, objetos narrativos; sem sistema de loot massivo.
Amizades, vizinhos, colegas e contatos; convites, encontros, conflitos e manutenção de vínculos. Vida pessoal opcional, com consequências equilibradas.
Eventos financeiros com ledger transacional: cada movimentação tem ID, origem, destino, valor, data, motivo. Evitar inconsistência entre saldos.

# 12. MISSÕES / EVENTOS / NOTÍCIAS
Missões são objetivos emergentes ou narrativos, com múltiplas soluções e estados claros. Missões não devem forçar papel específico após o prólogo.
Eventos por regras: lesão, crise financeira, vaga de emprego, oportunidade de scouting, coletiva, aniversário, notícia, mudança de treinador, conflito de agenda, convite social.
Notícias são geradas a partir de eventos reais do estado de jogo; não inventar resultados incompatíveis. Diário da carreira e linha do tempo de conquistas/fracassos.

# 13. ARQUITETURA GODOT
Autoloads sugeridos: GameState, WorldClock, EventBus, SceneRouter, SaveManager, AudioManager, UIManager. Separar simulação pura de Nodes de cena. Núcleo preferencialmente GDScript puro testável.
Domínios: world, football, career, social, economy, narrative, presentation. EventBus emite eventos tipados/contratos documentados; operações de dinheiro e transferências com validação atômica.
Dados autorais em JSON versionado (clubes, NPCs, diálogos, locais, eventos, competições); save em SQLite via extensão Godot mantida e compatível OU JSON transacional no MVP caso plugin externo complique execução. Não assumir que SQLite vem nativamente com Godot.
Salvar seed RNG, data/hora, entidades, missões, memórias, economia, partida, localização, histórico; migrações por save_schema_version, backups, gravação atômica e testes de round-trip.
Organização:
res://scenes/{bootstrap,world,interiors,football,ui,characters}/
res://scripts/{core,world,career,football,social,economy,narrative,ui}/
res://data/{clubs,players,npcs,dialogues,events,locations,competitions,localization}/
res://assets/{tilesets,sprites,portraits,animations,audio,fonts}/
res://tests/{unit,integration,smoke}/
res://docs/

# 14. ANIMAÇÕES E TRANSIÇÕES — ESPECIFICAÇÕES
A) Porta: trigger interagir → personagem vira para porta (0.1s) → animação de abrir (0.25s) → fade 0.15s → async load → spawn no marcador → fade 0.25s → fechar porta opcional. Total alvo <1.5s sem I/O longo.
B) Bairro: zoom-out leve para mapa (0.3s) → traçado de rota (0.6s) → ícone veículo desloca (1.2s) → cartão bairro (0.5s) → fade-in cena (0.3s). Pode pular.
C) Cidade: mapa do Brasil/região com rota, paisagem parallax, relógio avança, resumo de viagem, cartão cidade. 2–4s pulável.
D) Dia/noite: mudança gradual de modulação de luz, lâmpadas acendem, NPCs mudam agenda; ao dormir, vinheta + fade + cartão de data + notícias.
E) Partida: exterior do estádio → corredor/vestiário → túnel com torcida em crescendo → interface tática/partida; ao final placar, reações e coletiva.
F) Entrevista/contrato: foco em mesa, retrato NPC, documento desliza, som de caneta, resultado e consequências; jamais bloquear diálogo por animação.
G) Chuva: nuvens escurecem, chuva em camadas, reflexos pontuais, som crossfade, poças; efeito reduzível.
H) Notificação: toast discreto slide-in 0.2s, desaparece 3–5s, histórico acessível; urgentes pausam somente em momentos apropriados.
I) Demissão/mudança: esvaziar mesa, recolher objetos, transição de exterior do clube, atualização de currículo; cena opcional e pulável.
J) Evolução do patrimônio: móveis e decoração trocados por estados de cena, sem refazer mapas inteiros.
Usar AnimationPlayer/Tween, máquinas de estado e sinais de término; suporte a skip que aplica estado final sem perder eventos.

# 15. PRIMEIRA EXPERIÊNCIA JOGÁVEL (20–30 MIN)
1. Criar personagem (nome, pronome opcional, aparência, origem, dificuldade).
2. Acordar no apartamento às 07:30; tutorial de movimento e câmera.
3. Examinar caixa de Antônio; lore opcional e diário.
4. Receber mensagem de Helena: entrevista 10:00 no CT; agenda registra evento.
5. Explorar rua e acessar mapa; viajar ao CT com custo/tempo.
6. Entrevista ramificada: sucesso, oportunidade condicional ou rejeição; todos abrem caminho.
7. Tarefa inicial de análise: comparar dois atletas e observar treino; enviar recomendação.
8. Partida simulada: mostrar escalação, eventos, resultado, estatísticas e impactos.
9. Voltar para casa ou avançar dia; salário/recompensa, despesas, notícia e novo compromisso.
10. Salvar, sair, carregar e continuar exatamente no mesmo estado.
Condição de vitória do vertical slice: completar fluxo sem comandos de debug, sem crash, sem inconsistências de calendário/finanças e com ao menos duas ramificações observáveis.

# 16. MVP, EXPANSÕES E CRITÉRIOS
M0 fundação: projeto abre, input, câmera, resolução pixel perfect, testes básicos.
M1 exploração: apartamento, rua, CT, transições, colisão, NPCs e interação.
M2 tempo e vida: relógio, agenda, energia, dinheiro, celular, save/load.
M3 carreira/social: entrevistas, profissão analista, reputação, diálogos, memórias.
M4 futebol: quatro clubes, 80 atletas, liga de 12 partidas, motor e tabela.
M5 vertical slice: prólogo 20–30 min, áudio/arte placeholders coerentes, duas ramificações, testes.
M6 beta regional: treinador, olheiro, mercado, viagens entre três cidades, estádio, temporada estendida.
M7 carreira completa: empresário, diretor, presidente, proprietário, múltiplas ligas e vida pessoal ampliada.
Nunca afirmar que M6/M7 estão implementados no MVP.

# 17. TESTES / BALANCEAMENTO
Unitários: classificação, calendário, RNG determinístico, contratos, dinheiro, progressão, memória, agendamento, transições de missões.
Integração: simular 10 temporadas headless sem duplicar jogos; demissão e novo emprego; viagem durante rodada; save/load em qualquer cena segura; dois NPCs disputando mesmo compromisso.
Smoke: iniciar jogo, andar, interagir, viajar, entrevistar, assistir partida, dormir, salvar, carregar.
Telemetria local opcional: duração de telas, decisões, softlocks e distribuição de resultados; sem coleta remota por padrão.
Performance alvo MVP desktop: 60 FPS em cenas com até ~30 NPCs renderizados; simular mundo fora da cena em lotes, com budget por frame. Testar em máquina modesta.

# 18. REGRAS DE IMPLEMENTAÇÃO PARA CODEX
1. Leia este GDD antes de codar. Crie docs/IMPLEMENTATION_PLAN.md com fases, dependências, riscos e critérios.
2. Implemente APENAS o primeiro marco por iteração; mantenha projeto executável após cada alteração.
3. Não gerar arquivos binários falsos, nem declarar assets inexistentes. Use placeholder pixel art geométrico original gerado por código quando necessário.
4. Crie README com versão Godot, como abrir, controles e status real das funcionalidades.
5. Ao concluir cada marco, execute testes disponíveis, informe comandos/resultados, arquivos criados e pendências.
6. Dados de conteúdo em arquivos externos; IDs estáveis; evitar acoplamento entre cenas e motor.
7. Priorizar uma experiência agradável e legível em 640x360; UI pode escalar separadamente.
8. Não usar times, escudos, ligas, atletas, músicas ou marcas reais sem direitos.
9. Nunca apagar sistemas funcionando para contornar bugs sem explicar e testar regressão.
10. Pedir decisão apenas para bloqueios reais; caso contrário, adotar defaults documentados.

# 19. BACKLOG DE ASSETS INICIAIS
Tiles: asfalto, calçada, grama, terra, piso de madeira, azulejo, concreto, meio-fio, sombra, marcação de campo, arquibancada.
Props: cama, mesa, notebook, celular, armário, cadeira, geladeira, sofá, placa de rua, poste, ponto de ônibus, catraca, banco de reservas, quadro tático, bola, cones, traves, bandeiras.
Personagens: protagonista customizável (corpo, cabelo, roupa), Helena, Marcos, Joana, Clara, Davi, César, 3 figurantes. Retratos para NPCs principais.
Animações prioritárias: idle, andar, interação, porta, falar, sentar, escrever, comemoração, fade de cena, ônibus no mapa, placar.
UI: ícones originais para mapa, celular, agenda, carreira, finanças, relações, notificações, salvar; 9-slice painéis e tooltip.
Áudio: passos em 3 superfícies, porta, notificações, clique UI, pássaros, tráfego, treino, torcida, apito, chuva e 2 loops de música originais.

# 20. DECISÕES EM ABERTO, SEM BLOQUEAR MVP
Arte final terceirizada ou criada internamente; trilha original; gênero e profundidade de relacionamentos afetivos; licenças reais; multiplayer (não previsto); console/mobile; regras completas de divisões; IA generativa opcional; monetização (recomendação: compra única, sem microtransações). Documentar escolhas quando forem tomadas.
