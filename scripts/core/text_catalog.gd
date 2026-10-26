extends RefCounted

var entries: Dictionary = {}

func _init() -> void:
	var source := FileAccess.get_file_as_string("res://data/localization/pt_BR.json")
	var parsed: Variant = JSON.parse_string(source)
	assert(parsed is Dictionary, "Catálogo pt-BR inválido")
	entries = parsed

func get_text(key: String) -> String:
	return str(entries.get(key, key))
