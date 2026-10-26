extends StaticBody2D
## All art here is original provisional geometry, rendered at native resolution.

const Iso = preload("res://scripts/core/iso_math.gd")
var definition: Dictionary
var interaction_id: String = ""
var footprint := Vector2.ONE
var height := 16.0
var tint := Color.WHITE

func configure(data: Dictionary) -> void:
	definition = data
	interaction_id = data.get("interaction", "")
	footprint = Vector2(data.size[0], data.size[1])
	height = float(data.height)
	tint = Color(data.color)
	position = Iso.project(Vector2(data.tile[0], data.tile[1]))
	var shape := CollisionPolygon2D.new()
	shape.polygon = corners()
	add_child(shape)

func corners() -> PackedVector2Array:
	return PackedVector2Array([
		Iso.project(Vector2(-footprint.x / 2, -footprint.y / 2)),
		Iso.project(Vector2(footprint.x / 2, -footprint.y / 2)),
		Iso.project(Vector2(footprint.x / 2, footprint.y / 2)),
		Iso.project(Vector2(-footprint.x / 2, footprint.y / 2))])

func _draw() -> void:
	var base := corners()
	var top := PackedVector2Array()
	for point in base:
		top.append(point - Vector2(0, height))
	draw_colored_polygon(PackedVector2Array([base[1], base[2], top[2], top[1]]), tint.darkened(0.3))
	draw_colored_polygon(PackedVector2Array([base[2], base[3], top[3], top[2]]), tint.darkened(0.45))
	draw_colored_polygon(top, tint)
	draw_polyline(PackedVector2Array([top[0], top[1], top[2], top[3], top[0]]), tint.lightened(0.22), 1)
	match str(definition.kind):
		"door":
			draw_rect(Rect2(-10, -height + 3, 20, height - 3), Color("233c3c"))
			draw_rect(Rect2(5, -height / 2, 3, 3), Color("eed190"))
			draw_line(Vector2(-11, -height), Vector2(-11, 3), Color("d5ba8a"), 2)
		"box":
			draw_line(top[0].lerp(top[1], 0.5), top[3].lerp(top[2], 0.5), Color("f2d391"), 3)
			draw_rect(Rect2(-5, -height + 6, 10, 4), Color("6f503c"))
		"bed":
			draw_colored_polygon(PackedVector2Array([top[0], top[1], top[1].lerp(top[2], 0.3), top[0].lerp(top[3], 0.3)]), Color("dfd7b6"))
			for i in range(3):
				draw_line(top[3] + Vector2(6 + i * 5, -3), top[2] + Vector2(-6 + i * 5, -3), Color("88a09a"), 1)
		"desk":
			draw_rect(Rect2(-13, -height - 16, 25, 16), Color("263e4a"))
			draw_rect(Rect2(-11, -height - 14, 21, 11), Color("80b0ad"))
			draw_line(Vector2(-15, -height + 4), Vector2(14, -height + 4), Color("e2ccb0"), 3)
		"plant":
			draw_line(Vector2(0, -height), Vector2(0, -height - 19), Color("687d48"), 3)
			for offset: Vector2 in [Vector2(-8, -22), Vector2(3, -28), Vector2(-5, -34)]:
				draw_rect(Rect2(offset, Vector2(12, 7)), Color("70906a"))
		"cabinet":
			draw_line(Vector2(0, -height + 12), Vector2(0, 5), Color("604e42"), 1)
			draw_rect(Rect2(4, -10, 2, 4), Color("e5bc72"))
