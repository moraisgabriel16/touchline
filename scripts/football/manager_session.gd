extends RefCounted
## Small deterministic regional competition. No persistence or full match engine yet.

const RPGState = preload("res://scripts/career/rpg_state.gd")
var hero := RPGState.new()
var clubs: Array = []
var players: Array = []
var lineup: Array = []
var fixtures: Array = []
var results: Array = []
var round_index := 0
var formation := "4-4-2"
var mentality := "Equilibrada"
var seed_value := 2027

func _init() -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/competitions/regional_demo.json"))
	clubs = data.clubs.duplicate(true)
	players = data.players.duplicate(true)
	for i in range(11):
		lineup.append(players[i].id)
	fixtures = [ [[0,1],[2,3]], [[0,2],[3,1]], [[3,0],[1,2]], [[1,0],[3,2]], [[2,0],[1,3]], [[0,3],[2,1]] ]

func player_by_id(id: String) -> Dictionary:
	for player: Dictionary in players:
		if player.id == id:
			return player
	return {}

func replace_player(outgoing: String, incoming: String) -> bool:
	var index := lineup.find(outgoing)
	if index < 0 or incoming in lineup or player_by_id(incoming).is_empty():
		return false
	lineup[index] = incoming
	return true

func strength(club: int) -> float:
	if club != 0:
		return float(clubs[club].strength)
	var total := 0.0
	for id: String in lineup:
		total += float(player_by_id(id).skill)
	return total / float(lineup.size())

func play_round() -> Array:
	if round_index >= fixtures.size():
		return []
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_value + round_index * 997
	var played: Array = []
	for pair: Array in fixtures[round_index]:
		var home := int(pair[0])
		var away := int(pair[1])
		var hg := 0
		var ag := 0
		# Nine abstract attacks each. This is a deliberately simplified prototype.
		var risk := 0.05 if mentality == "Ofensiva" else (-0.04 if mentality == "Defensiva" else 0.0)
		for attack in range(9):
			var hp := clampf(0.16 + (strength(home) - strength(away)) / 220.0 + 0.025, 0.05, 0.4)
			var ap := clampf(0.16 + (strength(away) - strength(home)) / 220.0, 0.05, 0.4)
			if home == 0 or away == 0:
				hp = clampf(hp + risk, 0.02, 0.5)
				ap = clampf(ap + risk, 0.02, 0.5)
			if rng.randf() < hp:
				hg += 1
			if rng.randf() < ap:
				ag += 1
		var result := {"round": round_index + 1, "home": home, "away": away, "hg": hg, "ag": ag}
		played.append(result)
		results.append(result)
	round_index += 1
	return played

func standings() -> Array:
	var table: Array = []
	for i in range(clubs.size()):
		table.append({"club": i, "points": 0, "played": 0, "wins": 0, "draws": 0, "losses": 0, "gf": 0, "ga": 0, "gd": 0})
	for result: Dictionary in results:
		var h: Dictionary = table[result.home]
		var a: Dictionary = table[result.away]
		h.played += 1
		a.played += 1
		h.gf += result.hg
		h.ga += result.ag
		a.gf += result.ag
		a.ga += result.hg
		if result.hg == result.ag:
			h.points += 1
			a.points += 1
			h.draws += 1
			a.draws += 1
		else:
			var winner: Dictionary = h if result.hg > result.ag else a
			var loser: Dictionary = a if result.hg > result.ag else h
			winner.points += 3
			winner.wins += 1
			loser.losses += 1
	for row: Dictionary in table:
		row.gd = row.gf - row.ga
	table.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		for field: String in ["points", "wins", "gd", "gf"]:
			if a[field] != b[field]:
				return a[field] > b[field]
		return a.club < b.club)
	return table

func next_match() -> Array:
	if round_index >= fixtures.size():
		return []
	for pair: Array in fixtures[round_index]:
		if 0 in pair:
			return pair
	return []
