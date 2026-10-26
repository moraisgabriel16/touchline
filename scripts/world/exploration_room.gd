extends Node2D

signal interaction_arrived(id: String)
signal room_changed(id: String)
signal status_changed(message: String)

const Iso = preload("res://scripts/core/iso_math.gd")
const Navigation = preload("res://scripts/world/room_navigation.gd")
const Prop = preload("res://scripts/world/iso_prop.gd")
const Person = preload("res://scripts/world/person_visual.gd")
const ORIGIN := Vector2(280, 53)
const SPEED := 125.0
var state: RefCounted
var rooms: Dictionary
var definition: Dictionary
var navigation := Navigation.new()
var entities: Node2D
var avatar: Node2D
var targets: Dictionary = {}
var path: Array[Vector2i] = []
var pending := ""
var current_cell := Vector2i.ZERO
var walk_position := Vector2.ZERO
var destination_marker := Vector2.ZERO
var marker_visible := false
var blocked := false

func _ready() -> void:
	rooms = JSON.parse_string(FileAccess.get_file_as_string("res://data/locations/environments.json"))
	load_room(state.location)

func cell_position(cell: Vector2i) -> Vector2:
	return ORIGIN + Iso.project(Vector2(cell) + Vector2(0.5, 0.5))

func load_room(id: String) -> void:
	if not rooms.has(id):
		return
	path.clear()
	pending = ""
	marker_visible = false
	targets.clear()
	if entities != null:
		remove_child(entities)
		entities.queue_free()
	state.location = id
	definition = rooms[id]
	navigation.configure(definition.props, definition.npcs)
	entities = Node2D.new()
	entities.y_sort_enabled = true
	add_child(entities)
	for prop: Dictionary in definition.props:
		var node := Prop.new()
		var data: Dictionary = prop.duplicate(true)
		data.tile = [prop.cell[0] + 0.5, prop.cell[1] + 0.5]
		node.configure(data)
		node.position += ORIGIN
		entities.add_child(node)
		if prop.has("label"):
			add_target(prop, node)
	for npc: Dictionary in definition.npcs:
		var node := Person.new()
		node.shirt = Color(npc.shirt)
		node.hair = Color(npc.hair)
		node.position = cell_position(Vector2i(npc.cell[0], npc.cell[1]))
		entities.add_child(node)
		add_target(npc, node)
	avatar = Person.new()
	var saved: Array = state.positions.get(id, definition.spawn)
	current_cell = Vector2i(saved[0], saved[1])
	walk_position = cell_position(current_cell)
	avatar.position = walk_position
	entities.add_child(avatar)
	queue_redraw()
	room_changed.emit(id)

func add_target(data: Dictionary, node: Node2D) -> void:
	targets[data.id] = {"data": data, "node": node}
	var label := Label.new()
	label.text = "› " + str(data.label)
	label.add_theme_font_size_override("font_size", 9)
	label.add_theme_color_override("font_color", Color("ffebbc"))
	label.add_theme_color_override("font_shadow_color", Color("172e31"))
	label.add_theme_constant_override("shadow_offset_x", 1)
	label.add_theme_constant_override("shadow_offset_y", 1)
	label.position = node.position + Vector2(-38, -float(data.get("height", 40)) - 21)
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	label.z_index = 10
	entities.add_child(label)
	targets[data.id].label_node = label

func request_target(id: String) -> bool:
	if blocked or not targets.has(id):
		return false
	var data: Dictionary = targets[id].data
	# Finish the current edge before rerouting so repeated clicks never teleport.
	var start := current_cell if path.is_empty() else path[0]
	var candidate: Array[Vector2i] = navigation.approach(start, Vector2i(data.cell[0], data.cell[1]))
	if candidate.is_empty():
		status_changed.emit("Não há passagem até esse ponto.")
		return false
	pending = id
	path = candidate
	marker_visible = false
	status_changed.emit("Indo até: " + str(data.label))
	return true

func handle_click(point: Vector2) -> void:
	if blocked:
		return
	var hit := ""
	var front_y := -INF
	for id: String in targets:
		var entry: Dictionary = targets[id]
		var node: Node2D = entry.node
		var h := float(entry.data.get("height", 40))
		var hit_shape := Rect2(node.position + Vector2(-15, -h - 4), Vector2(30, h + 10)).has_point(point)
		if node.has_method("corners"):
			var hull_points := PackedVector2Array()
			for corner: Vector2 in node.corners():
				hull_points.append(corner)
				hull_points.append(corner - Vector2(0,h))
			hit_shape = Geometry2D.is_point_in_polygon(point-node.position,Geometry2D.convex_hull(hull_points))
		var label: Label = entry.label_node
		hit_shape = hit_shape or label.get_rect().has_point(point)
		if hit_shape and node.position.y > front_y:
			hit = id
			front_y = node.position.y
	if not hit.is_empty():
		request_target(hit)
		return
	var tile := Iso.unproject(point - ORIGIN).floor()
	var start := current_cell if path.is_empty() else path[0]
	var candidate := navigation.route(start, Vector2i(tile))
	if candidate.is_empty():
		status_changed.emit("Clique no chão livre ou em um ponto destacado.")
		return
	pending = ""
	path = candidate
	destination_marker = cell_position(Vector2i(tile))
	marker_visible = true
	queue_redraw()

func _physics_process(delta: float) -> void:
	if blocked or path.is_empty():
		return
	var goal := cell_position(path[0])
	var direction := goal - walk_position
	walk_position = walk_position.move_toward(goal, SPEED * delta)
	avatar.position = walk_position.round()
	avatar.walk_time += delta * 12
	avatar.facing = 1 if direction.x >= 0 else -1
	avatar.queue_redraw()
	if walk_position.distance_to(goal) < 0.1:
		current_cell = path.pop_front()
		state.positions[state.location] = [current_cell.x, current_cell.y]
		if path.is_empty():
			avatar.walk_time = 0
			avatar.queue_redraw()
			marker_visible = false
			queue_redraw()
			if not pending.is_empty():
				var data: Dictionary = targets[pending].data
				pending = ""
				if data.has("destination"):
					load_room(data.destination)
				else:
					interaction_arrived.emit(data.interaction)

func _draw() -> void:
	if definition.is_empty():
		return
	draw_rect(Rect2(0,0,640,360), Color("162c32"))
	var left := ORIGIN + Iso.project(Vector2(0,7))
	var right := ORIGIN + Iso.project(Vector2(9,0))
	var wall := Color(definition.wall)
	if state.location != "training":
		draw_colored_polygon(PackedVector2Array([left,ORIGIN,ORIGIN-Vector2(0,45),left-Vector2(0,45)]),wall.darkened(0.2))
		draw_colored_polygon(PackedVector2Array([ORIGIN,right,right-Vector2(0,45),ORIGIN-Vector2(0,45)]),wall)
	var floor_color := Color(definition.floor)
	for x in range(9):
		for y in range(7):
			var p := ORIGIN + Iso.project(Vector2(x,y))
			var diamond := PackedVector2Array([p,p+Vector2(32,16),p+Vector2(0,32),p+Vector2(-32,16)])
			draw_colored_polygon(diamond, floor_color if (x+y)%2 == 0 else floor_color.darkened(0.06))
			draw_polyline(PackedVector2Array([diamond[3],diamond[0],diamond[1]]),floor_color.darkened(0.14),1)
	if state.location == "training":
		var field := PackedVector2Array([ORIGIN+Iso.project(Vector2(2,1)),ORIGIN+Iso.project(Vector2(8,1)),ORIGIN+Iso.project(Vector2(8,6)),ORIGIN+Iso.project(Vector2(2,6)),ORIGIN+Iso.project(Vector2(2,1))])
		draw_polyline(field,Color("c2cf9d"),2)
		draw_line(ORIGIN+Iso.project(Vector2(5,1)),ORIGIN+Iso.project(Vector2(5,6)),Color("c2cf9d"),1)
		for y in range(2,5):
			var p := ORIGIN+Iso.project(Vector2(6.5,y))
			draw_colored_polygon(PackedVector2Array([p+Vector2(-4,0),p+Vector2(0,-9),p+Vector2(4,0)]),Color("dda05d"))
	else:
		var rug := PackedVector2Array([ORIGIN+Iso.project(Vector2(3,4)),ORIGIN+Iso.project(Vector2(6,4)),ORIGIN+Iso.project(Vector2(6,6)),ORIGIN+Iso.project(Vector2(3,6))])
		draw_colored_polygon(rug,Color("4d7273"))
		draw_polyline(PackedVector2Array([rug[0],rug[1],rug[2],rug[3],rug[0]]),Color("b6b39a"),1)
		# Window in the left wall.
		var w := ORIGIN+Iso.project(Vector2(0,2.5))-Vector2(0,28)
		draw_colored_polygon(PackedVector2Array([w+Vector2(-21,0),w+Vector2(17,-19),w+Vector2(17,1),w+Vector2(-21,20)]),Color("c1d5bd"))
		draw_line(w+Vector2(-2,10),w+Vector2(-2,-10),Color("ecdfb7"),2)
	if marker_visible:
		draw_polyline(PackedVector2Array([destination_marker+Vector2(-9,0),destination_marker+Vector2(0,-5),destination_marker+Vector2(9,0),destination_marker+Vector2(0,5),destination_marker+Vector2(-9,0)]),Color("ffcf71"),1)
