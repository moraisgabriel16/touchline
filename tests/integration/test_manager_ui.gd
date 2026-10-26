extends SceneTree

var failures := 0

func check(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		push_error(message)

func click(control: Control) -> void:
	var position := control.get_global_rect().get_center()
	if control.get_window() != root:
		position += Vector2(control.get_window().position)
	var motion := InputEventMouseMotion.new()
	motion.position = position
	root.push_input(motion, true)
	await process_frame
	for pressed: bool in [true, false]:
		var event := InputEventMouseButton.new()
		event.position = position
		event.button_index = MOUSE_BUTTON_LEFT
		event.pressed = pressed
		root.push_input(event, true)
		await process_frame
	await process_frame

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	root.size = Vector2i(1280, 720)
	var game = load("res://scenes/bootstrap/main.tscn").instantiate()
	root.add_child(game)
	await process_frame
	await process_frame
	await click(game.navigation["Escalação"])
	check(game.page == "Escalação", "Navegação deve responder ao mouse")
	var outgoing: String = game.session.lineup[0]
	for control: Button in game.content.find_children("*", "Button", true, false):
		if "Rafael" in control.text:
			await click(control)
			break
	check(game.outgoing == outgoing, "Clique no campo deve selecionar titular")
	for control: Button in game.content.find_children("*", "Button", true, false):
		if "Vinícius" in control.text:
			await click(control)
			break
	check("g02" in game.session.lineup and outgoing not in game.session.lineup, "Clique no reserva deve trocar titular")
	for page: String in ["Elenco", "Campeonato", "Partidas", "Central do clube"]:
		await click(game.navigation[page])
		check(game.page == page, "Página deve abrir por clique: " + page)
	for round_number in range(6):
		await click(game.advance)
		check(game.session.round_index == round_number + 1, "Avançar rodada por clique")
		check(game.dialog.visible, "Mostrar resultado da rodada")
		await create_timer(0.3).timeout
		await click(game.dialog.get_ok_button())
		check(not game.dialog.visible, "Fechar resultado pelo botão Continuar")
	check(game.advance.disabled and game.session.results.size() == 12, "Temporada deve encerrar sem rodada extra")
	var reset_button: Button
	for control: Button in game.find_children("*", "Button", true, false):
		if control.text == "Reiniciar temporada":
			reset_button = control
			break
	check(reset_button != null, "Reiniciar acessível por botão")
	if reset_button != null:
		await click(reset_button)
		check(game.reset_dialog.visible, "Reiniciar exige confirmação por clique")
		await click(game.reset_dialog.get_cancel_button())
		check(game.session.results.size() == 12, "Cancelar deve preservar temporada")
		await click(reset_button)
		await click(game.reset_dialog.get_ok_button())
		check(game.session.results.is_empty() and game.session.round_index == 0, "Confirmar deve reiniciar")
		check(not game.advance.disabled and game.session.lineup[0] == "g01", "Novo jogo deve restaurar escalação e avanço")
	game.queue_free()
	await process_frame
	print("MANAGER MOUSE UI: ", "PASS" if failures == 0 else "FAIL")
	quit(failures)
