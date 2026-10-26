extends CanvasLayer

const Catalog = preload("res://scripts/core/text_catalog.gd")
var texts := Catalog.new()
var prompt: Label
var overlay: ColorRect
var modal_title: Label
var modal_body: Label
var modal_footer: Label

func label_at(key: String, pos: Vector2, size: int, color: Color = Color("e8e3cc")) -> Label:
	var label := Label.new()
	label.text = texts.get_text(key)
	label.position = pos
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	label.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	add_child(label)
	return label

func _ready() -> void:
	var top := ColorRect.new()
	top.color = Color("142b36")
	top.size = Vector2(640, 51)
	add_child(top)
	label_at("brand", Vector2(18, 7), 21, Color("e3b86c"))
	label_at("subtitle", Vector2(19, 32), 8)
	label_at("location", Vector2(275, 14), 10)
	label_at("time", Vector2(508, 32), 9, Color("b9c5b8"))
	label_at("chapter", Vector2(18, 66), 9, Color("e3b86c"))
	label_at("home", Vector2(18, 79), 15)
	label_at("objective", Vector2(18, 101), 9, Color("b9c5b8"))
	var bottom := ColorRect.new()
	bottom.color = Color("142b36")
	bottom.position = Vector2(0, 324)
	bottom.size = Vector2(640, 36)
	add_child(bottom)
	label_at("hint", Vector2(18, 330), 10)
	label_at("prototype", Vector2(18, 346), 8, Color("91a598"))
	prompt = label_at("inspect_hint", Vector2(0, 303), 11, Color("f1d290"))
	prompt.size.x = 640
	prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	overlay = ColorRect.new()
	overlay.color = Color(0.025, 0.06, 0.09, 0.88)
	overlay.size = Vector2(640, 360)
	overlay.visible = false
	add_child(overlay)
	var panel := ColorRect.new()
	panel.color = Color("203944")
	panel.position = Vector2(80, 72)
	panel.size = Vector2(480, 240)
	overlay.add_child(panel)
	var accent := ColorRect.new()
	accent.color = Color("dfb36b")
	accent.position = Vector2(80, 72)
	accent.size = Vector2(3, 240)
	overlay.add_child(accent)
	modal_title = modal_label(Vector2(103, 90), Vector2(430, 27), 18)
	modal_title.add_theme_color_override("font_color", Color("edc57e"))
	modal_body = modal_label(Vector2(103, 128), Vector2(430, 150), 12)
	modal_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	modal_footer = modal_label(Vector2(103, 288), Vector2(430, 20), 10)

func modal_label(pos: Vector2, bounds: Vector2, size: int) -> Label:
	var label := Label.new()
	label.position = pos
	label.size = bounds
	label.add_theme_font_size_override("font_size", size)
	overlay.add_child(label)
	return label

func set_available(available: bool) -> void:
	prompt.text = texts.get_text("box_prompt" if available else "inspect_hint")

func show_modal(title_key: String, body_key: String, footer_key: String) -> void:
	modal_title.text = texts.get_text(title_key)
	modal_body.text = texts.get_text(body_key)
	modal_footer.text = texts.get_text(footer_key)
	overlay.show()

func close_modal() -> void:
	overlay.hide()
