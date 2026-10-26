extends Node2D

var shirt := Color("d6b16b")
var hair := Color("3b3331")
var walk_time := 0.0
var facing := 1

func _draw() -> void:
	draw_ellipse_shadow()
	var step := roundf(sin(walk_time) * 2)
	draw_rect(Rect2(-6, -11, 5, 11 + step), Color("273b4c"))
	draw_rect(Rect2(1, -11, 5, 11 - step), Color("273b4c"))
	draw_rect(Rect2(-7, -1 + step, 6, 3), Color("172834"))
	draw_rect(Rect2(1, -1 - step, 7, 3), Color("172834"))
	draw_rect(Rect2(-8, -27, 16, 17), shirt)
	draw_rect(Rect2(-8, -26, 4, 14), shirt.darkened(0.2))
	draw_rect(Rect2(-3, -27, 6, 3), Color("eee0bd"))
	draw_rect(Rect2(-11, -23 + step, 4, 13), Color("bb8766"))
	draw_rect(Rect2(8, -23 - step, 4, 13), Color("d6a17b"))
	draw_rect(Rect2(-6, -38, 13, 13), Color("d6a17b"))
	draw_rect(Rect2(-7, -40, 14, 6), hair)
	draw_rect(Rect2(-7, -36, 3, 7), hair)
	draw_rect(Rect2(4 if facing >= 0 else -4, -32, 2, 2), Color("302d2c"))

func draw_ellipse_shadow() -> void:
	draw_colored_polygon(PackedVector2Array([Vector2(-11,0),Vector2(0,-4),Vector2(11,0),Vector2(0,5)]), Color(0.06,0.1,0.08,0.25))
