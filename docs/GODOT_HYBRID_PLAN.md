# Plano atual — gestão + ambientes isométricos + RPG por cliques

## Mudança autorizada pelo usuário

Pedidos: “quero estilo brasfoot, deve ser somente click” e, em seguida,
“nosso diferencial, entrar nos ambientes, quero visão isométrica, com elementos
de RPG no jogo”. A direção passa a combinar o gerenciador de futebol com a vida
do personagem em ambientes isométricos. O controle somente por cliques permanece.
Interface, dados e marcas são originais.
Não pressupõe licença ou uso de conteúdo do Brasfoot.

O plano M0–M5 original está preservado em `LEGACY_IMPLEMENTATION_PLAN.md`.
A exploração anterior por teclado permanece como referência. A exploração ativa
é integrada à gestão e opera com cliques, incluindo movimentação e diálogo.

| Issue | Entrega | Depende de | Aceite | Estado |
| --- | --- | --- | --- | --- |
| G0-01 | Nova central desktop | — | Iniciar em UI de gestão; botões de navegação; sem input de movimento | Feito |
| G0-02 | Elenco do Aurora | G0-01 | 18 atletas de dados externos; detalhe por clique | Feito |
| G0-03 | Escalação | G0-02 | 11 titulares únicos; trocar titular/reserva com dois cliques; três desenhos de formação | Feito |
| G0-04 | Liga demonstrável | G0-03 | Quatro clubes, 12 jogos, seis rodadas, pontos e gols consistentes | Feito |
| G0-05 | Clique e regressão | G0-04 | Navegar, trocar e concluir liga por eventos de mouse; preservar testes antigos | Feito |
| R0-01 | Ambientes isométricos | G0-05 | Apartamento/diretoria/CT, entrada pelo menu; viewport 640×360 dentro da UI | Feito |
| R0-02 | Movimento por clique | R0-01 | AStar sem cortar cantos; respeitar props/NPCs; novo clique não teleporta | Feito |
| R0-03 | Portas e interações | R0-02 | Caminhar antes de interagir; portas mudam local; mesa acessa elenco | Feito |
| R0-04 | Primeiro trecho RPG | R0-03 | Caixa, Helena, Davi e relatório; adiar sem punição; XP/atributos/diário; recompensas únicas | Feito |
| R0-05 | Estado integrado | R0-04 | Voltar à gestão e jogar rodada preserva progresso/posição; teste por mouse | Feito |
| R1-01 | Transições e vida visual | R0-05 | Fade de porta, animação de NPCs, retratos, oclusão e feedback de hover | Pendente |
| R1-02 | Carreira e agenda | G1-01, R0-05 | Papel pertence ao personagem; agenda e escolhas fora do clube; custos de tempo explícitos | Pendente |
| G1-01 | Salvar/carregar | R0-05 | Botões por clique; seed, elenco, tabela, rodada e RPG preservados; backup atômico e schema | Pendente |
| G1-02 | Escolher clube | G1-01 | Tela inicial por clique; quatro elencos completos e validados | Pendente |
| G1-03 | Tática posicional | G1-02 | Posições e formação têm consequências explícitas; goleiro válido obrigatório | Pendente |
| G2-01 | Motor de partida | G1-03 | Chances, eventos e estatísticas reprodutíveis; tela com avançar/pausar por botões | Pendente |
| G2-02 | Fadiga e treino | G2-01 | Condição deixa de ser estática; descanso e treino com efeitos testados | Pendente |
| G3-01 | Economia e contratos | G1-01 | Ledger, salários, receita e validade contratual consistentes | Pendente |
| G3-02 | Mercado | G3-01, G1-02 | Propostas por clique; impedir compra duplicada e gastos inválidos | Pendente |
| G4-01 | Temporadas contínuas | G2-02, G3-02 | Virada de ano, evolução e histórico persistidos sem duplicação | Pendente |
| G5-01 | Acabamento e exportação | G4-01 | Textos externos, UI redimensionada, testes e executável desktop | Pendente |

## Decisões e limites

- Godot 4.5.1 e GDScript permanecem; interface de referência 1280×720.
- Somente mouse necessário: sem teclado ou arrastar para qualquer ação de jogo.
- Gestão continua disponível sem exploração obrigatória. Locais também têm acesso
  direto, sem custo/duração simulados neste incremento; portas são instantâneas.
- RPG é sessão do personagem: XP, atributos, flags de tarefa, memória e posições
  são mantidos no mesmo estado da temporada. Trocar de tela não reinicia nada.
- Texto narrativo e efeitos em JSON. XP ainda não modifica força do time.
- Próximo incremento: persistir a sessão inteira; depois refinar transições e
  desenvolver carreira/agenda. Não declarar o vertical slice completo.
- Simulador atual: nove ataques abstratos de cada lado, força média, mando e
  mentalidade. Não é o motor final; formação apenas muda a organização no campo.
- Seed fixa 2027 permite reprodução, sem temporizador ou sorteio pelo relógio real.
- Save/load e temporadas contínuas vêm antes de ampliar a simulação.
- Não adicionar telas de finanças/mercado sem ações e dados reais implementados.
- UI atual contém textos nos scripts: externalizar em G5 ou antes da localização.

## Riscos

A sessão é volátil até G1-01. Elencos rivais agregados e trocas livres simplificam
a competição; não tratar esta versão como simulação balanceada. Alterar o seed ou
o algoritmo futuramente exige versão do motor no save. Validar telas em 1280×720
e escalar com canvas antes de oferecer outras proporções. Crescimento de UI deve
separar cada página em cena própria, preservando o estado fora dos Nodes.
