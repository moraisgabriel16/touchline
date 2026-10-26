extends SceneTree

var failures := 0
var game

func check(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		push_error(message)

func click(control: Control, local_point: Vector2 = Vector2(-1,-1)) -> void:
	var position := control.get_global_rect().get_center() if local_point.x < 0 else control.global_position + local_point
	if control.get_window() != root:
		position += Vector2(control.get_window().position)
	var motion := InputEventMouseMotion.new()
	motion.position = position
	root.push_input(motion,true)
	await process_frame
	for pressed: bool in [true,false]:
		var event := InputEventMouseButton.new()
		event.position = position
		event.button_index = MOUSE_BUTTON_LEFT
		event.pressed = pressed
		root.push_input(event,true)
		await process_frame
	await process_frame

func arrive() -> void:
	for i in range(240):
		await physics_frame
		if game.environment.room.path.is_empty():
			await process_frame
			return
	check(false,"Movimento deve terminar dentro do orçamento de frames")

func target(id: String) -> void:
	var view = game.environment
	if not view.room.targets.has(id):
		check(false,"Alvo não disponível: " + id)
		return
	var node: Node2D = view.room.targets[id].node
	await click(view.surface, view.world_to_surface(node.position-Vector2(0,8)))
	await arrive()

func choose(index: int) -> void:
	# Container layout settles after the popup is shown and wrapped text is sized.
	for frame in range(5):
		await process_frame
	check(game.environment.dialogue_window.visible,"Diálogo deve abrir ao chegar")
	if game.environment.dialogue_window.visible:
		await click(game.environment.dialogue_choices[index])
		check(not game.environment.dialogue_window.visible,"Escolha deve fechar diálogo")

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	Engine.time_scale = 12.0
	root.size = Vector2i(1280,720)
	game = load("res://scenes/bootstrap/main.tscn").instantiate()
	root.add_child(game)
	await process_frame
	await process_frame
	await click(game.navigation["Ambientes"])
	check(game.environment != null,"Ambientes acessíveis no menu")
	var room = game.environment.room
	await click(game.environment.surface,game.environment.world_to_surface(room.cell_position(Vector2i(3,5))))
	await arrive()
	check(room.current_cell == Vector2i(3,5),"Clique no chão deve mover avatar")
	# Changing orders mid-edge must not snap the avatar back to a cell center.
	room.handle_click(room.cell_position(Vector2i(7,6)))
	room._physics_process(0.1)
	room._physics_process(0.1)
	var before: Vector2 = room.avatar.position
	room.request_target("box")
	check(room.avatar.position == before,"Nova ordem não deve teleportar avatar")
	await arrive()
	await choose(1)
	check(game.session.hero.xp == 0,"Guardar caderno para depois não concede XP")
	await target("box")
	await choose(0)
	check(game.session.hero.xp == 20,"Estudar caderno concede XP")
	await target("exit")
	check(game.session.hero.location == "office","Porta deve levar à diretoria")
	await target("helena")
	await choose(1)
	check(not game.session.hero.flags.has("accepted"),"Adiar tarefa é uma escolha válida")
	await target("helena")
	await choose(0)
	check(game.session.hero.flags.has("accepted"),"Aceite registra objetivo")
	await target("ct_door")
	check(game.session.hero.location == "training","Porta deve levar ao CT")
	await target("davi")
	await choose(0)
	check(game.session.hero.xp == 50,"Observar treino deve atualizar progressão")
	await target("office_door")
	await target("helena")
	await choose(0)
	check(game.session.hero.xp == 100 and game.session.hero.flags.has("report"),"Entregar relatório completa objetivo")
	await click(game.navigation["Elenco"])
	check(game.page == "Elenco" and game.session.hero.xp == 100,"Gestão preserva estado do personagem")
	await click(game.advance)
	await click(game.dialog.get_ok_button())
	await click(game.navigation["Ambientes"])
	check(game.session.round_index == 1 and game.session.hero.xp == 100,"Futebol e RPG compartilham sessão sem reiniciar")
	check(game.environment.room.current_cell == Vector2i(game.session.hero.positions.office[0],game.session.hero.positions.office[1]),"Retorno preserva posição segura")
	await target("helena")
	await choose(0)
	check(game.session.hero.xp == 100,"Revisitar NPC não duplica recompensa")
	game.environment.show_journal()
	await process_frame
	await choose(0)
	check(not game.environment.dialogue_window.visible,"Diário fecha por clique")
	game.queue_free()
	await process_frame
	Engine.time_scale = 1.0
	print("ENVIRONMENTS MOUSE RPG: ","PASS" if failures == 0 else "FAIL")
	quit(failures)
