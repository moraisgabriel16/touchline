class_name IsoMath
extends RefCounted
## Logical tile coordinates -> 64 x 32 diamond, independent of scene nodes.

static func project(point: Vector2) -> Vector2:
	return Vector2((point.x - point.y) * 32.0, (point.x + point.y) * 16.0)

static func unproject(point: Vector2) -> Vector2:
	return Vector2(point.x / 64.0 + point.y / 32.0, point.y / 32.0 - point.x / 64.0)

static func movement(input: Vector2, speed: float) -> Vector2:
	# WASD traverses the four world axes; normalize after projection.
	return project(input).normalized() * speed
