# Validação — gestão + ambientes isométricos + RPG por cliques

Godot 4.5.1.stable.official.f62fdbde1, Windows, Compatibility/OpenGL,
AMD Radeon Vega 8. Referência de UI: 1280×720.

- Importação/editor headless: sem erros.
- `tests/unit/test_manager.gd`: MANAGER LOGIC: PASS. Confere IDs de troca,
  determinismo, 12 confrontos únicos, todos jogam uma vez por rodada, pontuação,
  seis jogos por clube e fechamento global de gols/vitórias/derrotas.
- `tests/integration/test_manager_ui.gd`: MANAGER MOUSE UI: PASS. Injeta eventos
  de mouse nos controles reais, abre páginas, troca goleiro por reserva, joga
  seis rodadas e fecha resultados clicando em Continuar. Testa também cancelar e
  confirmar o reinício da temporada. Nenhum teclado usado.
- `tests/smoke/capture.gd`: renderização real em OpenGL, capturas de central,
  escalação, elenco, apartamento, diretoria, CT e diálogo em artifacts.
  Não é mockup.
- `tests/unit/test_rpg.gd`: RPG AND NAVIGATION: PASS. Verifica requisitos do
  relatório, adiamento, observação antes do aceite, XP/atributos, recompensas
  únicas e acesso a todos os alvos sem atravessar props/NPCs ou cortar cantos.
- `tests/integration/test_environments.gd`: ENVIRONMENTS MOUSE RPG: PASS. Percorre
  apartamento → diretoria → CT → diretoria por cliques nas portas, adia e depois
  aceita diálogos, estuda o caderno, observa Davi e entrega relatório. Confere
  movimento por clique, ausência de teleporte ao mudar ordens, preservação de
  posição/XP ao voltar da gestão, rodada compartilhada e fechamento do diário.

O runner `tools/test.ps1` importa o projeto, executa testes atuais e de regressão
da exploração preservada, e inicia a cena principal por 120 frames em headless.

Execução completa final: código de saída 0. MANAGER LOGIC, MANAGER MOUSE UI,
RPG AND NAVIGATION, ENVIRONMENTS MOUSE RPG, ISO e APARTMENT retornaram PASS;
bootstrap headless sem erros. Capturas inspecionadas para conferir os três locais
e legibilidade das escolhas do diálogo.

Limites: sem exportação standalone, teste em Linux, benchmark ou validação em
múltiplos monitores. Não há save/load nem elencos individuais dos adversários.
Resultados se referem ao simulador simplificado deste incremento.
RPG mantém estado apenas durante a sessão, sem agenda/relógio ou bônus nas
partidas. NPCs e arte são provisórios; mudanças de local ainda não têm fade.
