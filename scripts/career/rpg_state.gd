extends RefCounted
## Session-owned progression, independent of the exploration scene lifecycle.

var location := "apartment"
var positions: Dictionary = {}
var flags: Dictionary = {}
var xp := 0
var analysis := 1
var communication := 1
var helena_trust := 0
var journal: Array[String] = []
var content: Dictionary

func _init() -> void:
	content = JSON.parse_string(FileAccess.get_file_as_string("res://data/narrative/first_steps.json"))
	journal.append(content.start_note)

func objective() -> String:
	if flags.has("report"):
		return content.objectives.done
	if flags.has("accepted") and flags.has("observed"):
		return content.objectives.report
	if flags.has("accepted"):
		return content.objectives.observe
	if flags.has("notebook"):
		return content.objectives.meet
	return content.objectives.start

func dialogue(id: String) -> Dictionary:
	var key := id
	if id == "helena":
		if flags.has("report"):
			key = "helena_done"
		elif flags.has("accepted") and flags.has("observed"):
			key = "helena_report"
		elif flags.has("accepted"):
			key = "helena_wait"
	elif id == "notebook" and flags.has("notebook"):
		key = "notebook_done"
	elif id == "davi" and flags.has("observed"):
		key = "davi_done"
	return content.dialogues.get(key, {}).duplicate(true)

func apply(action: String) -> bool:
	if action == "close" or action == "management":
		return false
	if not content.effects.has(action):
		return false
	var effect: Dictionary = content.effects[action]
	if flags.has(effect.flag):
		return false
	if action == "deliver_report" and not (flags.has("accepted") and flags.has("observed")):
		return false
	flags[effect.flag] = true
	xp += int(effect.get("xp", 0))
	analysis += int(effect.get("analysis", 0))
	communication += int(effect.get("communication", 0))
	helena_trust += int(effect.get("trust", 0))
	journal.append(effect.note)
	return true
