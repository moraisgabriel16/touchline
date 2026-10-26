extends RefCounted

static func install() -> void:
	var bindings := {
		"move_north": [KEY_W, KEY_UP], "move_south": [KEY_S, KEY_DOWN],
		"move_west": [KEY_A, KEY_LEFT], "move_east": [KEY_D, KEY_RIGHT],
		"interact": [KEY_E], "pause_game": [KEY_ESCAPE],
	}
	for action: String in bindings:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
		for key: int in bindings[action]:
			var event := InputEventKey.new()
			event.physical_keycode = key
			if not InputMap.action_has_event(action, event):
				InputMap.action_add_event(action, event)
