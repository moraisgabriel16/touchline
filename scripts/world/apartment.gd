extends Node2D

const Iso = preload("res://scripts/core/iso_math.gd")
const Prop = preload("res://scripts/world/iso_prop.gd")
var content: Dictionary
var entities: Node2D
var interactables: Array[StaticBody2D] = []

func _ready() -> void:
	content = JSON.parse_string(FileAccess.get_file_as_string("res://data/locations/apartment.json"))
	entities = Node2D.new()
	entities.name = "Entities"
	entities.y_sort_enabled = true
	add_child(entities)
	for item: Dictionary in content.props:
		var prop := Prop.new()
		prop.name = item.id
		prop.configure(item)
		entities.add_child(prop)
		if not prop.interaction_id.is_empty():
			interactables.append(prop)
	var bounds: Array = content.bounds
	var a := Vector2(bounds[0], bounds[1])
	var b := Vector2(bounds[2], bounds[3])
	add_boundary(a, Vector2(b.x, a.y))
	add_boundary(Vector2(b.x, a.y), b)
	add_boundary(b, Vector2(a.x, b.y))
	add_boundary(Vector2(a.x, b.y), a)

func add_boundary(a: Vector2, b: Vector2) -> void:
	var body := StaticBody2D.new()
	var collider := CollisionShape2D.new()
	var segment := SegmentShape2D.new()
	segment.a = Iso.project(a)
	segment.b = Iso.project(b)
	collider.shape = segment
	body.add_child(collider)
	add_child(body)

func _draw() -> void:
	# Back walls, then wood diamonds. Foreground walls omitted for readability.
	var left := Iso.project(Vector2(-5, 4))
	var back := Iso.project(Vector2(-5, -4))
	var right := Iso.project(Vector2(5, -4))
	draw_colored_polygon(PackedVector2Array([left, back, back - Vector2(0, 75), left - Vector2(0, 75)]), Color("6d8179"))
	draw_colored_polygon(PackedVector2Array([back, right, right - Vector2(0, 75), back - Vector2(0, 75)]), Color("91a094"))
	for x in range(-5, 5):
		for y in range(-4, 4):
			var p := Iso.project(Vector2(x, y))
			var poly := PackedVector2Array([p, p + Vector2(32, 16), p + Vector2(0, 32), p + Vector2(-32, 16)])
			var color := Color("997650") if (x + y) % 2 == 0 else Color("a68259")
			draw_colored_polygon(poly, color)
			draw_polyline(PackedVector2Array([poly[3], poly[0], poly[1]]), Color("866849"), 1)
	# Window and morning light on the back wall.
	var w := Iso.project(Vector2(-5, -1.3)) - Vector2(0, 43)
	var window := PackedVector2Array([w + Vector2(-25, -12), w + Vector2(24, -36), w + Vector2(24, -7), w + Vector2(-25, 17)])
	draw_colored_polygon(window, Color("c7d7bd"))
	draw_polyline(PackedVector2Array([window[0], window[1], window[2], window[3], window[0]]), Color("eadcba"), 3)
	draw_line(window[0].lerp(window[1], 0.5), window[3].lerp(window[2], 0.5), Color("eadcba"), 3)
	var rug := PackedVector2Array([Iso.project(Vector2(-1, 0)), Iso.project(Vector2(1.5, 0)), Iso.project(Vector2(1.5, 2)), Iso.project(Vector2(-1, 2))])
	draw_colored_polygon(rug, Color("536e72"))
	draw_polyline(PackedVector2Array([rug[0], rug[1], rug[2], rug[3], rug[0]]), Color("b8b09a"), 2)
