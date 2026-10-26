extends SceneTree

const Iso = preload("res://scripts/core/iso_math.gd")
var failures := 0

func check(condition: bool, description: String) -> void:
	if not condition:
		failures += 1
		push_error(description)

func _initialize() -> void:
	check(Iso.project(Vector2(1, 0)) == Vector2(32, 16), "Tile X deve projetar 32/16")
	check(Iso.project(Vector2(0, 1)) == Vector2(-32, 16), "Tile Y deve projetar -32/16")
	for point: Vector2 in [Vector2.ZERO, Vector2(-3.2, 7.5), Vector2(100, -20)]:
		check(Iso.unproject(Iso.project(point)).is_equal_approx(point), "Projeção deve preservar coordenadas")
	for direction: Vector2 in [Vector2(1, 0), Vector2(1, 1), Vector2(-1, 1), Vector2(0, -1)]:
		check(is_equal_approx(Iso.movement(direction, 90).length(), 90.0), "Velocidade não pode aumentar nas diagonais")
	check(Iso.movement(Vector2.ZERO, 90) == Vector2.ZERO, "Input nulo deve parar")
	print("ISO: %s" % ("PASS" if failures == 0 else "FAIL"))
	quit(failures)
