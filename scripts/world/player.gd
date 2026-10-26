extends CharacterBody2D

const Iso = preload("res://scripts/core/iso_math.gd")
const SPEED := 90.0
var blocked := false
var walk_time := 0.0
var facing := Vector2(1, 1)
var camera: Camera2D

func _ready() -> void:
	var collider := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 5.0
	collider.shape = shape
	add_child(collider)
	camera = Camera2D.new()
	camera.position_smoothing_enabled = false
	camera.process_callback = Camera2D.CAMERA2D_PROCESS_PHYSICS
	camera.top_level = true
	camera.position = global_position.round() + Vector2(0, -26)
	add_child(camera)

func _physics_process(delta: float) -> void:
	var direction := Input.get_vector("move_west", "move_east", "move_north", "move_south")
	velocity = Vector2.ZERO if blocked else Iso.movement(direction, SPEED)
	if velocity.length_squared() > 0:
		facing = velocity.normalized()
		walk_time += delta * 12
	else:
		walk_time = 0
	move_and_slide()
	camera.global_position = global_position.round() + Vector2(0, -26)
	queue_redraw()

func _draw() -> void:
	draw_rect(Rect2(-9, -2, 18, 5), Color(0.08, 0.12, 0.15, 0.3))
	var step := roundf(sin(walk_time) * 2)
	draw_rect(Rect2(-6, -11, 5, 11 + step), Color("273b4c"))
	draw_rect(Rect2(1, -11, 5, 11 - step), Color("273b4c"))
	draw_rect(Rect2(-7, -1 + step, 6, 3), Color("172834"))
	draw_rect(Rect2(1, -1 - step, 7, 3), Color("172834"))
	draw_rect(Rect2(-8, -27, 16, 17), Color("d6b16b"))
	draw_rect(Rect2(-8, -26, 4, 14), Color("b58e58"))
	draw_rect(Rect2(-11, -23 + step, 4, 13), Color("bb8766"))
	draw_rect(Rect2(8, -23 - step, 4, 13), Color("d6a17b"))
	draw_rect(Rect2(-6, -38, 13, 13), Color("d6a17b"))
	draw_rect(Rect2(-7, -40, 14, 6), Color("3b3331"))
	draw_rect(Rect2(-7, -36, 3, 7), Color("3b3331"))
	var eye_x := 4 if facing.x >= 0 else -4
	draw_rect(Rect2(eye_x, -32, 2, 2), Color("302d2c"))
