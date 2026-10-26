extends RefCounted
## A grid cell is one 64x32 diamond. Cardinal routes cannot cut prop corners.

var grid := AStarGrid2D.new()
const ROOM_SIZE := Vector2i(9, 7)

func configure(props: Array, npcs: Array) -> void:
	grid.region = Rect2i(Vector2i.ZERO, ROOM_SIZE)
	grid.cell_size = Vector2.ONE
	grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_NEVER
	grid.default_compute_heuristic = AStarGrid2D.HEURISTIC_MANHATTAN
	grid.default_estimate_heuristic = AStarGrid2D.HEURISTIC_MANHATTAN
	grid.update()
	for prop: Dictionary in props:
		var center := Vector2(prop.cell[0], prop.cell[1])
		var extent := Vector2(prop.size[0], prop.size[1]) / 2.0 + Vector2(0.15, 0.15)
		for x in range(ROOM_SIZE.x):
			for y in range(ROOM_SIZE.y):
				var offset := (Vector2(x, y) - center).abs()
				if offset.x <= extent.x and offset.y <= extent.y:
					grid.set_point_solid(Vector2i(x, y))
	for npc: Dictionary in npcs:
		grid.set_point_solid(Vector2i(npc.cell[0], npc.cell[1]))

func walkable(cell: Vector2i) -> bool:
	return grid.is_in_boundsv(cell) and not grid.is_point_solid(cell)

func route(from: Vector2i, to: Vector2i) -> Array[Vector2i]:
	if not walkable(from) or not walkable(to):
		return []
	return grid.get_id_path(from, to)

func approach(from: Vector2i, target: Vector2i) -> Array[Vector2i]:
	var best: Array[Vector2i] = []
	for offset: Vector2i in [Vector2i.LEFT, Vector2i.RIGHT, Vector2i.UP, Vector2i.DOWN]:
		var candidate := route(from, target + offset)
		if not candidate.is_empty() and (best.is_empty() or candidate.size() < best.size()):
			best = candidate
	return best
