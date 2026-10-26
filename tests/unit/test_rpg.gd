extends SceneTree

const RPG = preload("res://scripts/career/rpg_state.gd")
const Navigation = preload("res://scripts/world/room_navigation.gd")
var failures := 0

func check(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		push_error(message)

func _initialize() -> void:
	var state := RPG.new()
	check(not state.apply("deliver_report"), "Relatório exige observação e aceite")
	check(not state.apply("invalid"), "Ações desconhecidas não alteram progressão")
	check(not state.apply("close") and state.xp == 0, "Adiar diálogo deve preservar estado")
	check(state.apply("read_notebook") and state.xp == 20, "Caderno concede XP uma vez")
	check(not state.apply("read_notebook") and state.xp == 20, "Impedir recompensa duplicada")
	check(state.apply("observe_davi"), "Observação antecipada é permitida")
	check(not state.apply("deliver_report"), "Ainda exige aceitar pedido")
	check(state.apply("accept_task"), "Tarefa pode ser aceita depois da observação")
	check(state.dialogue("helena").choices[0].action == "deliver_report", "Diálogo deve refletir observação anterior")
	check(state.apply("deliver_report") and state.xp == 100, "Fluxo completo soma 100 XP")
	check(state.analysis == 3 and state.communication == 2 and state.helena_trust == 1, "Atributos e vínculo devem mudar")
	check(not state.apply("deliver_report") and state.xp == 100, "Relatório não pode ser entregue duas vezes")
	var rooms: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/locations/environments.json"))
	for id: String in rooms:
		var room: Dictionary = rooms[id]
		var nav := Navigation.new()
		nav.configure(room.props, room.npcs)
		var spawn := Vector2i(room.spawn[0],room.spawn[1])
		check(nav.walkable(spawn), "Spawn livre: " + id)
		check(nav.route(spawn,Vector2i(-1,0)).is_empty(), "Não sair dos limites: " + id)
		for prop: Dictionary in room.props + room.npcs:
			if not prop.has("label"):
				continue
			var cell := Vector2i(prop.cell[0],prop.cell[1])
			check(not nav.walkable(cell), "Objeto/NPC bloqueia navegação: " + prop.id)
			var path := nav.approach(spawn,cell)
			check(not path.is_empty(), "Todos os alvos devem ser acessíveis: " + prop.id)
			for index in range(path.size()):
				check(nav.walkable(path[index]), "Rota não atravessa obstáculos")
				if index > 0:
					var delta: Vector2i = path[index]-path[index-1]
					check(absi(delta.x)+absi(delta.y)==1, "Rota não corta cantos")
	print("RPG AND NAVIGATION: ", "PASS" if failures == 0 else "FAIL")
	quit(failures)
