extends Control

func _draw() -> void:
	var r := Rect2(12, 12, size.x - 24, size.y - 24)
	draw_rect(r, Color("327345"))
	for i in range(8):
		if i % 2 == 0:
			draw_rect(Rect2(r.position + Vector2(0, r.size.y * i / 8), Vector2(r.size.x, r.size.y / 8)), Color("377c4b"))
	var white := Color("bad0b8")
	draw_rect(r.grow(-12), white, false, 2)
	draw_line(Vector2(24, size.y / 2), Vector2(size.x - 24, size.y / 2), white, 2)
	draw_arc(size / 2, 42, 0, TAU, 48, white, 2)
	draw_circle(size / 2, 3, white)
	draw_rect(Rect2(size.x / 2 - 90, 24, 180, 65), white, false, 2)
	draw_rect(Rect2(size.x / 2 - 90, size.y - 89, 180, 65), white, false, 2)
	draw_rect(Rect2(size.x / 2 - 39, 24, 78, 28), white, false, 2)
	draw_rect(Rect2(size.x / 2 - 39, size.y - 52, 78, 28), white, false, 2)
