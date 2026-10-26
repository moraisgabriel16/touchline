extends SceneTree

const Session = preload("res://scripts/football/manager_session.gd")
var failures := 0

func check(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		push_error(message)

func _initialize() -> void:
	var a := Session.new()
	var b := Session.new()
	check(a.lineup.size() == 11 and a.players.size() == 18, "Elenco e titulares iniciais")
	check(not a.replace_player("invalid", "g02"), "Não trocar ID inexistente")
	check(not a.replace_player("g01", "d01"), "Não duplicar titular")
	check(a.replace_player("g01", "g02"), "Troca válida deve funcionar")
	check("g02" in a.lineup and "g01" not in a.lineup, "Troca atualiza escalação")
	a = Session.new()
	var pair_counts := {}
	for round_number in range(6):
		var ar: Array = a.play_round()
		check(ar == b.play_round(), "Seed e entradas iguais devem reproduzir resultado")
		check(ar.size() == 2, "Dois jogos por rodada")
		var participants: Array = []
		for result: Dictionary in ar:
			participants.append(result.home)
			participants.append(result.away)
			var key := "%d-%d" % [result.home, result.away]
			check(not pair_counts.has(key), "Confronto mandante/visitante não pode duplicar")
			pair_counts[key] = true
		participants.sort()
		check(participants == [0,1,2,3], "Cada clube joga uma vez na rodada")
	check(a.results.size() == 12 and a.play_round().is_empty(), "Encerrar depois de 12 jogos")
	var gf := 0
	var ga := 0
	var wins := 0
	var losses := 0
	for row: Dictionary in a.standings():
		check(row.played == 6, "Cada clube completa seis jogos")
		check(row.points == row.wins * 3 + row.draws, "Pontuação consistente")
		check(row.wins + row.draws + row.losses == 6, "Campanha consistente")
		gf += row.gf
		ga += row.ga
		wins += row.wins
		losses += row.losses
	check(gf == ga and wins == losses, "Gols e vitórias devem fechar entre clubes")
	print("MANAGER LOGIC: ", "PASS" if failures == 0 else "FAIL")
	quit(failures)
