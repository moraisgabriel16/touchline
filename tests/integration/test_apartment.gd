extends SceneTree

const Main = preload("res://scenes/bootstrap/legacy_exploration.tscn")
const Iso = preload("res://scripts/core/iso_math.gd")
var failures := 0

func check(condition: bool, description: String) -> void:
	if not condition:
		failures += 1
		push_error(description)

func frames(count: int) -> void:
	for i in range(count):
		await physics_frame

func key(action: String) -> void:
	var event := InputEventAction.new()
	event.action = action
	event.pressed = true
	Input.parse_input_event(event)
	await process_frame
	event = InputEventAction.new()
	event.action = action
	event.pressed = false
	Input.parse_input_event(event)
	await process_frame

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var game := Main.instantiate()
	root.add_child(game)
	await frames(3)
	check(game.world.interactables.size() == 1, "Caixa deve estar registrada")
	check(game.focused == null, "Interação distante não deve estar disponível")
	await key("interact")
	check(game.modal.is_empty(), "E distante não deve abrir a caixa")
	var start: Vector2 = game.player.position
	Input.action_press("move_east")
	await frames(12)
	Input.action_release("move_east")
	check(game.player.position.distance_to(start) > 5, "Input deve mover o personagem")
	check(game.player.camera.global_position == game.player.camera.global_position.round(), "Câmera deve permanecer em pixels inteiros")
	check(game.player.camera.global_position == game.player.global_position.round() + Vector2(0, -26), "Câmera deve acompanhar o personagem")
	# Approach the desk along its X axis. Stop before entering its footprint.
	game.player.position = Iso.project(Vector2(0.7, -2.5))
	await frames(2)
	var collision: KinematicCollision2D = game.player.move_and_collide(Iso.project(Vector2(3, 0)))
	check(collision != null, "Movimento em direção à mesa deve produzir colisão")
	if collision != null:
		check(collision.get_collider().name == "desk", "Mesa deve ser o obstáculo atingido")
	check(Iso.unproject(game.player.position).x < 1.6, "Mesa deve bloquear o personagem")
	# A long movement cannot leave the apartment through the front boundary.
	game.player.position = Iso.project(Vector2(0, 2))
	Input.action_press("move_south")
	await frames(120)
	Input.action_release("move_south")
	check(Iso.unproject(game.player.position).y < 4.05, "Limite do mapa deve bloquear saída")
	game.player.position = Iso.project(Vector2(2.3, 0.6))
	await frames(3)
	check(game.focused != null, "Caixa próxima deve receber foco")
	await key("interact")
	check(game.modal == "box" and game.hud.overlay.visible, "E deve abrir conteúdo contextual")
	start = game.player.position
	Input.action_press("move_west")
	await frames(10)
	Input.action_release("move_west")
	check(game.player.position.is_equal_approx(start), "Movimento deve parar durante leitura")
	await key("pause_game")
	check(game.modal.is_empty() and not game.player.blocked, "ESC deve fechar leitura e liberar movimento")
	await key("pause_game")
	check(game.modal == "pause" and game.player.blocked, "ESC deve pausar")
	await key("pause_game")
	check(game.modal.is_empty(), "ESC deve retomar")
	game.queue_free()
	await process_frame
	print("APARTMENT: %s" % ("PASS" if failures == 0 else "FAIL"))
	quit(failures)
