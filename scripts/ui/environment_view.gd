extends VBoxContainer

signal management_requested
signal status_changed(message: String)

const Room = preload("res://scripts/world/exploration_room.gd")
var state: RefCounted
var room: Node2D
var viewport: SubViewport
var surface: TextureRect
var subtitle: Label
var profile: Label
var objective: Label
var contacts: Label
var points: VBoxContainer
var dialogue_window: Window
var dialogue_layout: VBoxContainer
var dialogue_choices: Array[Button] = []

func label_in(parent: Node, value: String, font_size: int = 13) -> Label:
	var label := Label.new()
	label.text = value
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", Color("294537"))
	parent.add_child(label)
	return label

func make_button(parent: Node, value: String, callback: Callable) -> Button:
	var button := Button.new()
	button.text = value
	button.custom_minimum_size.y = 32
	button.focus_mode = Control.FOCUS_NONE
	button.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	button.pressed.connect(callback)
	parent.add_child(button)
	return button

func _ready() -> void:
	add_theme_constant_override("separation", 8)
	var travel := HBoxContainer.new()
	travel.add_theme_constant_override("separation", 8)
	add_child(travel)
	label_in(travel, "ACESSO DIRETO", 11)
	for destination: String in ["apartment", "office", "training"]:
		var caption: String = {"apartment":"Apartamento", "office":"Diretoria", "training":"CT"}[destination]
		make_button(travel, caption, func():
			close_dialogue()
			room.load_room(destination))
	subtitle = label_in(self, "", 13)
	var body := HBoxContainer.new()
	body.add_theme_constant_override("separation", 14)
	body.size_flags_vertical = Control.SIZE_EXPAND_FILL
	add_child(body)
	surface = TextureRect.new()
	surface.name = "RoomSurface"
	surface.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	surface.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	surface.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	surface.custom_minimum_size = Vector2(650, 366)
	surface.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	surface.size_flags_vertical = Control.SIZE_EXPAND_FILL
	surface.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	surface.gui_input.connect(on_room_input)
	body.add_child(surface)
	var sidebar := VBoxContainer.new()
	sidebar.custom_minimum_size.x = 250
	sidebar.add_theme_constant_override("separation", 10)
	body.add_child(sidebar)
	label_in(sidebar, "SEU PERSONAGEM", 12)
	profile = label_in(sidebar, "", 14)
	label_in(sidebar, "PRÓXIMO PASSO", 12)
	objective = label_in(sidebar, "")
	objective.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	objective.custom_minimum_size = Vector2(250, 42)
	contacts = label_in(sidebar, "", 12)
	label_in(sidebar, "NESTE AMBIENTE", 12)
	points = VBoxContainer.new()
	points.add_theme_constant_override("separation", 6)
	sidebar.add_child(points)
	make_button(sidebar, "Abrir diário", show_journal)
	var help := label_in(sidebar, "Clique no chão para andar.\nClique nos objetos ou nas pessoas.\nAs portas levam a outro ambiente.", 11)
	help.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	viewport = SubViewport.new()
	viewport.size = Vector2i(640, 360)
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.handle_input_locally = false
	add_child(viewport)
	surface.texture = viewport.get_texture()
	build_dialogue_window()
	room = Room.new()
	room.state = state
	room.interaction_arrived.connect(show_dialogue)
	room.room_changed.connect(func(_id: String): refresh())
	room.status_changed.connect(func(message: String): status_changed.emit(message))
	viewport.add_child(room)
	refresh()

func refresh() -> void:
	if room == null or room.definition.is_empty():
		return
	subtitle.text = room.definition.name + "  /  " + room.definition.subtitle
	profile.text = "Nível %d  ·  %d XP\nAnálise %d  ·  Comunicação %d" % [1 + state.xp / 100, state.xp, state.analysis, state.communication]
	objective.text = state.objective()
	contacts.text = "Helena: " + ("confiança em construção" if state.helena_trust > 0 else "primeiro contato")
	for child in points.get_children():
		points.remove_child(child)
		child.queue_free()
	for id: String in room.targets:
		var data: Dictionary = room.targets[id].data
		var point := make_button(points, str(data.label), func(): room.request_target(id))
		point.add_theme_font_size_override("font_size", 12)
		point.alignment = HORIZONTAL_ALIGNMENT_LEFT

func world_to_surface(point: Vector2) -> Vector2:
	var factor := minf(surface.size.x / 640.0, surface.size.y / 360.0)
	return (surface.size - Vector2(640,360) * factor) / 2.0 + point * factor

func on_room_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		var factor := minf(surface.size.x / 640.0, surface.size.y / 360.0)
		var offset := (surface.size - Vector2(640,360) * factor) / 2.0
		var point: Vector2 = (event.position - offset) / factor
		if Rect2(0,0,640,360).has_point(point):
			room.handle_click(point)
		accept_event()

func build_dialogue_window() -> void:
	dialogue_window = Window.new()
	dialogue_window.title = "Conversa"
	dialogue_window.size = Vector2i(650, 390)
	dialogue_window.min_size = Vector2i(650, 390)
	dialogue_window.unresizable = true
	dialogue_window.transient = true
	dialogue_window.exclusive = true
	dialogue_window.visible = false
	dialogue_window.close_requested.connect(close_dialogue)
	add_child(dialogue_window)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_" + side, 22)
	dialogue_window.add_child(margin)
	var background := StyleBoxFlat.new()
	background.bg_color = Color("e9ede4")
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", background)
	margin.add_child(panel)
	dialogue_layout = VBoxContainer.new()
	dialogue_layout.add_theme_constant_override("separation", 12)
	panel.add_child(dialogue_layout)

func clear_dialogue() -> void:
	dialogue_choices.clear()
	for child in dialogue_layout.get_children():
		dialogue_layout.remove_child(child)
		child.queue_free()

func show_dialogue(id: String) -> void:
	var data: Dictionary = state.dialogue(id)
	if data.is_empty():
		return
	clear_dialogue()
	room.blocked = true
	dialogue_window.title = data.speaker
	label_in(dialogue_layout, data.speaker, 21)
	var body := label_in(dialogue_layout, data.text, 16)
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.size_flags_vertical = Control.SIZE_EXPAND_FILL
	for choice: Dictionary in data.choices:
		var button := make_button(dialogue_layout, choice.label, func():
			var changed: bool = state.apply(choice.action)
			close_dialogue()
			refresh()
			if changed:
				status_changed.emit(state.journal.back())
			if choice.action == "management":
				management_requested.emit())
		dialogue_choices.append(button)
	dialogue_window.popup_centered(Vector2i(650,390))

func show_journal() -> void:
	clear_dialogue()
	room.blocked = true
	dialogue_window.title = "Diário pessoal"
	label_in(dialogue_layout, "Seu caminho no Aurora", 21)
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	dialogue_layout.add_child(scroll)
	var notes := label_in(scroll, "• " + "\n\n• ".join(state.journal), 15)
	notes.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	notes.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dialogue_choices.append(make_button(dialogue_layout, "Voltar ao ambiente", close_dialogue))
	dialogue_window.popup_centered(Vector2i(650,390))

func close_dialogue() -> void:
	dialogue_window.hide()
	if room != null:
		room.blocked = false
