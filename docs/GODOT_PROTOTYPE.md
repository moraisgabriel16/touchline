# TOUCHLINE — gestão de futebol com vida de RPG

A direção atual combina **gestão inspirada no estilo Brasfoot e ambientes
isométricos com elementos de RPG**, sempre por cliques. Elenco, escalação e liga
convivem com personagem, conversas, diário e progressão pessoal. O GDD continua
como referência de universo e arquitetura; as decisões de escopo mais recentes
estão em `docs/IMPLEMENTATION_PLAN.md`.

## Jogar

Dê dois cliques em **Jogar.cmd**. Nesta máquina o Godot portátil está em
`.tools/godot/`. O lançador também aceita `godot` no PATH.

Para outra máquina, baixe a edição padrão do
[Godot 4.5.1 estável](https://godotengine.org/download/archive/4.5.1-stable/),
importe `project.godot` e clique no botão Executar do editor.
Não requer .NET, plugins ou bibliotecas externas.

```sh
godot --path .
```

Janela de referência: 1280×720, renderizador Compatibility. Todos os comandos de
jogo são acessíveis com o botão esquerdo do mouse. O personagem anda clicando
no chão; não é necessário teclado nem arrastar jogadores.

## Como jogar

O jogo abre em **Ambientes**, no apartamento. Clique no chão para andar e na
**Caixa de Antônio** para se aproximar e conversar com a história. As opções do
diálogo usam botões. Você pode estudar o caderno agora ou deixar para depois.

Clique na porta **Sair para o clube** para ir à diretoria. Converse com Helena,
aceite observar Davi, entre no CT pela porta, observe o atleta e volte para
entregar seu relatório. O fluxo rende XP, melhora atributos e registra uma memória
de confiança com Helena. Repetir interações não duplica recompensas. Tudo é
opcional: gestão e acesso direto aos locais continuam disponíveis no menu.

Os botões **Apartamento / Diretoria / CT** oferecem acesso direto aos mesmos
ambientes, sem caminhar até as portas. Não há simulação de duração/custo de viagem
neste incremento. **Abrir diário** consulta os registros da sessão.

1. Clique em **Elenco** para consultar os 18 atletas do Aurora. Clique em uma linha
   para ver os detalhes e em **Continuar** para fechar.
2. Clique em **Escalação**. Para substituir, clique no titular dentro do campo e
   depois em um reserva. Os menus de formação e mentalidade também usam cliques.
3. Clique em **Jogar próxima rodada** e depois em **Continuar** no resultado.
4. Consulte **Campeonato** e **Partidas**. A liga termina após seis rodadas.
5. **Reiniciar temporada** pede confirmação antes de descartar a sessão.

## O que funciona

- Três ambientes isométricos originais: apartamento, diretoria e campo do CT.
- Movimento por clique com AStar, respeitando móveis, NPCs e limites do mapa.
- Portas que conduzem a outro local após aproximação; acesso direto opcional.
- Caixa de Antônio, conversas com Helena, observação de Davi e mesa que abre elenco.
- Tarefa opcional com aceite/adiamento, diário, 100 XP no fluxo completo, análise,
  comunicação e memória de confiança. Estado mantido entre telas na mesma sessão.
- Central do Aurora, elenco, escalação, classificação e calendário navegáveis.
- 18 atletas autorais do Aurora, 11 titulares e sete reservas, com troca por cliques.
- Formações 4-4-2, 4-3-3 e 3-5-2 para organizar a representação do time.
- Mentalidade defensiva/equilibrada/ofensiva e força média dos titulares afetam
  um simulador simplificado de ataques. A formação ainda não afeta o resultado.
- Quatro clubes fictícios, seis rodadas, 12 partidas, turno e returno.
- Resultados determinísticos com seed 2027; tabela calculada pelos jogos,
  ordenada por pontos, vitórias, saldo e gols marcados. Igualdade total usa ID
  estável como critério técnico provisório.
- Encerramento da temporada, campeão e reinício com confirmação por clique.

## Limitações

**Não há salvamento. Fechar ou reiniciar descarta a sessão.**
O clube controlado é fixo: Aurora Atlético. Os rivais usam força agregada;
seus elencos ainda não são modelados. Não há mercado, salários, contratos,
finanças, lesões, fadiga, treino, temporadas seguintes ou partida minuto a minuto.
O CT contém uma observação narrativa; ainda não há sistema de treino de atributos
dos atletas. NPCs são estáticos; diálogos e arte são provisórios, sem retratos,
áudio, relógio, agenda, criação de personagem ou transições com fade. Os atributos
de RPG ainda não dão bônus ao simulador de partidas.
Condição inicial de 100% é estática. Trocas de posição são livres, inclusive
no gol. A simulação é provisória e não representa ainda o motor profundo do GDD.
Alguns textos de UI estão no script; externalização completa fica no backlog.

A exploração antiga por teclado está preservada em
`scenes/bootstrap/legacy_exploration.tscn` para referência e regressão. A versão
ativa usa exclusivamente cliques para explorar. Não há build exportada nem teste
em Linux.

## Verificar

```powershell
powershell -ExecutionPolicy Bypass -File tools/test.ps1
# Executável instalado em outro lugar:
powershell -ExecutionPolicy Bypass -File tools/test.ps1 -Godot 'C:\Godot\Godot.exe'
```

Com Godot no PATH:

```sh
godot --headless --path . --editor --quit
godot --headless --path . --script tests/unit/test_manager.gd
godot --headless --path . --script tests/unit/test_rpg.gd
godot --headless --path . --script tests/integration/test_manager_ui.gd
godot --headless --path . --script tests/integration/test_environments.gd
godot --headless --path . --quit-after 120
godot --path . --script tests/smoke/capture.gd
```

O teste de interface injeta cliques de mouse nos controles reais: navegação,
troca titular/reserva, resultado/fechar e seis rodadas. O unitário verifica
calendário, determinismo e consistência de gols/pontos/classificação. O runner
inclui os testes da exploração antiga como regressão.
O teste de ambientes percorre o fluxo de RPG por cliques, incluindo adiamento,
portas, progressão, retorno à gestão e preservação de posição/XP. A navegação é
testada contra obstáculos e corte de cantos. Capturas em `artifacts/manager.png`,
`tactics.png`, `roster.png`, `environments.png`, `office.png`, `training.png` e
`rpg_dialogue.png`.

## Arquivos principais

- `scripts/ui/manager_ui.gd`: telas e ações por clique.
- `scripts/ui/tactics_pitch.gd`: desenho original do campo.
- `scripts/football/manager_session.gd`: escalação, simulação e tabela.
- `data/competitions/regional_demo.json`: clubes e atletas autorais.
- `scripts/ui/environment_view.gd`: exploração integrada e diálogos por clique.
- `scripts/world/exploration_room.gd`: ambientes, portas e deslocamento.
- `scripts/world/room_navigation.gd`: rotas de AStar independentes da UI.
- `scripts/career/rpg_state.gd`: progressão e memória da sessão.
- `data/locations/environments.json`: ambientes e objetos autorais.
- `data/narrative/first_steps.json`: diálogos, escolhas e efeitos de RPG.
- `docs/IMPLEMENTATION_PLAN.md`: direção atual e próximos incrementos.
- `docs/VALIDATION.md`: verificações e limites.
