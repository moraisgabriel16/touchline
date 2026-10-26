extends Control

const Session = preload("res://scripts/football/manager_session.gd")
const Pitch = preload("res://scripts/ui/tactics_pitch.gd")
const EnvironmentView = preload("res://scripts/ui/environment_view.gd")
var session := Session.new()
var page := "Ambientes"
var content: VBoxContainer
var round_label: Label
var advance: Button
var navigation: Dictionary = {}
var selected_player := ""
var outgoing := ""
var status: Label
var dialog: AcceptDialog
var reset_dialog: ConfirmationDialog
var roster_tree: Tree
var environment: Control

func box_style(color: String, border: String = "") -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(color)
	style.content_margin_left = 12
	style.content_margin_right = 12
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	if not border.is_empty():
		style.set_border_width_all(1)
		style.border_color = Color(border)
	return style

func text(parent: Node, value: String, font_size: int = 15, color: String = "243b32") -> Label:
	var label := Label.new()
	label.text = value
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", Color(color))
	parent.add_child(label)
	return label

func button(parent: Node, caption: String, action: Callable) -> Button:
	var result := Button.new()
	result.text = caption
	result.custom_minimum_size.y = 37
	result.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	result.focus_mode = Control.FOCUS_NONE
	result.pressed.connect(action)
	parent.add_child(result)
	return result

func button_style(color: String) -> StyleBoxFlat:
	var style := box_style(color)
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	return style

func column(parent: Node) -> VBoxContainer:
	var result := VBoxContainer.new()
	result.add_theme_constant_override("separation", 12)
	parent.add_child(result)
	return result

func panel(parent: Node) -> VBoxContainer:
	var outer := PanelContainer.new()
	outer.add_theme_stylebox_override("panel", box_style("ffffff", "ccd4c9"))
	outer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(outer)
	return column(outer)

func _ready() -> void:
	var ui_theme := Theme.new()
	ui_theme.default_font_size = 14
	ui_theme.set_color("font_color", "Button", Color("ffffff"))
	ui_theme.set_color("font_hover_color", "Button", Color("ffffff"))
	ui_theme.set_stylebox("normal", "Button", button_style("315e47"))
	ui_theme.set_stylebox("hover", "Button", button_style("447c59"))
	ui_theme.set_stylebox("pressed", "Button", button_style("b48532"))
	ui_theme.set_stylebox("disabled", "Button", button_style("87948a"))
	ui_theme.set_color("font_color", "Tree", Color("243b32"))
	ui_theme.set_stylebox("panel", "Tree", box_style("ffffff", "ccd4c9"))
	ui_theme.set_stylebox("selected", "Tree", box_style("d9e9d8"))
	ui_theme.set_stylebox("selected_focus", "Tree", box_style("d9e9d8"))
	ui_theme.set_color("font_selected_color", "Tree", Color("163c2a"))
	ui_theme.set_constant("v_separation", "Tree", 8)
	theme = ui_theme
	var background := ColorRect.new()
	background.color = Color("e9ede4")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_" + side, 18)
	add_child(margin)
	var root := column(margin)
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 22)
	root.add_child(header)
	var brand := column(header)
	text(brand, "TOUCHLINE", 28, "1c4b34")
	text(brand, "FUTEBOL • GESTÃO • VIDA", 10, "65745f")
	var club := column(header)
	club.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	text(club, "AURORA ATLÉTICO", 24)
	text(club, "Santa Aurora / SP   •   Liga Regional   •   Temporada 2027", 13, "65745f")
	var next := column(header)
	round_label = text(next, "", 13)
	advance = button(next, "JOGAR PRÓXIMA RODADA  ›", play_round)
	var body := HBoxContainer.new()
	body.add_theme_constant_override("separation", 18)
	body.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(body)
	var side := column(body)
	side.custom_minimum_size.x = 186
	text(side, "PAINEL DO TREINADOR", 11, "65745f")
	for name: String in ["Central do clube", "Ambientes", "Elenco", "Escalação", "Campeonato", "Partidas"]:
		var nav := button(side, name, func(): show_page(name))
		nav.alignment = HORIZONTAL_ALIGNMENT_LEFT
		navigation[name] = nav
	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	side.add_child(spacer)
	var note := text(side, "PROTÓTIPO JOGÁVEL\n4 clubes • 6 rodadas\n\nSessão sem salvamento", 12, "65745f")
	note.custom_minimum_size.y = 85
	button(side, "Reiniciar temporada", func(): reset_dialog.popup_centered())
	content = column(body)
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	status = text(root, "Tudo pelo mouse. Monte seu time e dispute a liga regional.", 12, "65745f")
	dialog = AcceptDialog.new()
	dialog.title = "Rodada concluída"
	dialog.ok_button_text = "Continuar"
	add_child(dialog)
	reset_dialog = ConfirmationDialog.new()
	reset_dialog.title = "Reiniciar temporada?"
	reset_dialog.dialog_text = "Os resultados, a escalação e a progressão do personagem desta sessão serão descartados."
	reset_dialog.ok_button_text = "Reiniciar"
	reset_dialog.cancel_button_text = "Voltar"
	reset_dialog.confirmed.connect(func():
		session = Session.new()
		outgoing = ""
		selected_player = ""
		show_page("Ambientes"))
	add_child(reset_dialog)
	show_page(page)

func show_page(name: String) -> void:
	page = name
	environment = null
	for child in content.get_children():
		content.remove_child(child)
		child.queue_free()
	for key: String in navigation:
		navigation[key].add_theme_stylebox_override("normal", box_style("b48532" if key == page else "315e47"))
	round_label.text = "RODADA %d DE 6" % mini(session.round_index + 1, 6) if session.round_index < 6 else "TEMPORADA ENCERRADA"
	advance.disabled = session.round_index >= 6
	text(content, page.to_upper(), 22)
	match page:
		"Central do clube": home_page()
		"Elenco": roster_page()
		"Escalação": tactics_page()
		"Campeonato": standings_page()
		"Partidas": matches_page()
		"Ambientes": environment_page()

func environment_page() -> void:
	environment = EnvironmentView.new()
	environment.state = session.hero
	environment.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	environment.size_flags_vertical = Control.SIZE_EXPAND_FILL
	environment.management_requested.connect(func(): show_page("Elenco"))
	environment.status_changed.connect(func(message: String): status.text = message)
	content.add_child(environment)
	status.text = "Clique para andar e interagir. Gestão e progressão compartilham a mesma sessão."

func home_page() -> void:
	var summary := HBoxContainer.new()
	summary.add_theme_constant_override("separation", 12)
	content.add_child(summary)
	var strength_panel := panel(summary)
	text(strength_panel, "FORÇA DOS TITULARES", 11, "65745f")
	text(strength_panel, "%02d / 100" % roundi(session.strength(0)), 28, "1c4b34")
	var tactical := panel(summary)
	text(tactical, "SUA EQUIPE", 11, "65745f")
	text(tactical, session.formation + "  •  " + session.mentality, 23)
	var upcoming := panel(content)
	text(upcoming, "PRÓXIMO COMPROMISSO", 11, "65745f")
	var pair: Array = session.next_match()
	if pair.is_empty():
		var champion: String = session.clubs[session.standings()[0].club].name
		text(upcoming, champion + " é o campeão regional!", 24, "1c4b34")
		text(upcoming, "Confira a classificação final ou reinicie para experimentar outra escalação.")
	else:
		text(upcoming, "%s   ×   %s" % [session.clubs[pair[0]].name, session.clubs[pair[1]].name], 25, "1c4b34")
		text(upcoming, "Liga Regional 2027   •   Rodada %d   •   %s" % [session.round_index + 1, "Em casa" if pair[0] == 0 else "Fora de casa"], 13, "65745f")
		var actions := HBoxContainer.new()
		actions.add_theme_constant_override("separation", 12)
		upcoming.add_child(actions)
		button(actions, "Preparar escalação", func(): show_page("Escalação"))
		button(actions, "Entrar nos ambientes", func(): show_page("Ambientes"))
	text(content, "CLASSIFICAÇÃO", 14)
	add_standings(content, 220)

func make_table(parent: Node, headers: Array, widths: Array, height: float = 320) -> Tree:
	var tree := Tree.new()
	tree.columns = headers.size()
	tree.hide_root = true
	tree.column_titles_visible = true
	tree.select_mode = Tree.SELECT_ROW
	tree.custom_minimum_size.y = height
	tree.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	tree.size_flags_vertical = Control.SIZE_EXPAND_FILL
	for i in range(headers.size()):
		tree.set_column_title(i, headers[i])
		tree.set_column_expand(i, i == 1)
		tree.set_column_custom_minimum_width(i, widths[i])
	parent.add_child(tree)
	tree.create_item()
	return tree

func add_standings(parent: Node, height: float = 320) -> void:
	var table := make_table(parent, ["#", "Clube", "P", "J", "V", "E", "D", "GP", "GC", "SG"], [35, 210, 40, 40, 40, 40, 40, 40, 40, 40], height)
	var rank := 1
	for row: Dictionary in session.standings():
		var item := table.create_item(table.get_root())
		var values := [str(rank), session.clubs[row.club].name, str(row.points), str(row.played), str(row.wins), str(row.draws), str(row.losses), str(row.gf), str(row.ga), str(row.gd)]
		for i in range(values.size()):
			item.set_text(i, values[i])
			if row.club == 0:
				item.set_custom_bg_color(i, Color("e3eddc"))
			item.set_selectable(i, false)
		rank += 1

func roster_page() -> void:
	text(content, "18 atletas  •  Clique em um jogador para ver os detalhes.", 13, "65745f")
	roster_tree = make_table(content, ["Pos.", "Jogador", "Idade", "Força", "Condição", "Situação"], [65, 230, 65, 65, 90, 100], 350)
	for player: Dictionary in session.players:
		var item := roster_tree.create_item(roster_tree.get_root())
		item.set_metadata(0, player.id)
		var values := [player.position, player.name, str(player.age), str(player.skill), "%d%%" % player.condition, "Titular" if player.id in session.lineup else "Reserva"]
		for i in range(values.size()):
			item.set_text(i, values[i])
			if player.id in session.lineup:
				item.set_custom_bg_color(i, Color("edf3e8"))
	roster_tree.item_selected.connect(func():
		selected_player = roster_tree.get_selected().get_metadata(0)
		var p: Dictionary = session.player_by_id(selected_player)
		dialog.title = p.name
		dialog.dialog_text = "%s  •  %d anos\nForça: %d / 100\nCondição: %d%%\n\nPara mudar o time, abra Escalação e clique no titular e no reserva." % [p.position, p.age, p.skill, p.condition]
		dialog.popup_centered(Vector2i(490, 220)))

func tactics_page() -> void:
	var options := HBoxContainer.new()
	options.add_theme_constant_override("separation", 18)
	content.add_child(options)
	text(options, "Formação:")
	var formation := OptionButton.new()
	for value: String in ["4-4-2", "4-3-3", "3-5-2"]:
		formation.add_item(value)
	formation.select(["4-4-2", "4-3-3", "3-5-2"].find(session.formation))
	options.add_child(formation)
	formation.item_selected.connect(func(index: int):
		session.formation = formation.get_item_text(index)
		show_page(page))
	text(options, "Mentalidade:")
	var mentality := OptionButton.new()
	for value: String in ["Defensiva", "Equilibrada", "Ofensiva"]:
		mentality.add_item(value)
	mentality.select(["Defensiva", "Equilibrada", "Ofensiva"].find(session.mentality))
	options.add_child(mentality)
	mentality.item_selected.connect(func(index: int): session.mentality = mentality.get_item_text(index))
	var split := HBoxContainer.new()
	split.add_theme_constant_override("separation", 14)
	split.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(split)
	var pitch := Pitch.new()
	pitch.custom_minimum_size = Vector2(460, 430)
	pitch.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	split.add_child(pitch)
	var positions := [Vector2(.5,.87),Vector2(.16,.66),Vector2(.38,.7),Vector2(.62,.7),Vector2(.84,.66),Vector2(.16,.42),Vector2(.38,.47),Vector2(.62,.47),Vector2(.84,.42),Vector2(.34,.2),Vector2(.66,.2)]
	if session.formation == "4-3-3":
		positions = [Vector2(.5,.87),Vector2(.16,.68),Vector2(.38,.71),Vector2(.62,.71),Vector2(.84,.68),Vector2(.24,.47),Vector2(.5,.5),Vector2(.76,.47),Vector2(.18,.22),Vector2(.5,.19),Vector2(.82,.22)]
	elif session.formation == "3-5-2":
		positions = [Vector2(.5,.87),Vector2(.25,.7),Vector2(.5,.72),Vector2(.75,.7),Vector2(.14,.47),Vector2(.36,.51),Vector2(.5,.36),Vector2(.64,.51),Vector2(.86,.47),Vector2(.34,.2),Vector2(.66,.2)]
	for i in range(11):
		var p: Dictionary = session.player_by_id(session.lineup[i])
		var token := button(pitch, "%s\n%s · %d" % [p.position, p.name.get_slice(" ",0), p.skill], func():
			outgoing = p.id
			status.text = "Trocar %s: clique em um reserva à direita." % p.name
			show_page(page))
		token.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
		token.anchor_left = positions[i].x
		token.anchor_top = positions[i].y
		token.anchor_right = positions[i].x
		token.anchor_bottom = positions[i].y
		token.offset_left = -47
		token.offset_right = 47
		token.offset_top = -23
		token.offset_bottom = 23
		token.add_theme_font_size_override("font_size", 12)
		token.add_theme_stylebox_override("normal", box_style("b48532" if outgoing == p.id else "214f3a", "a9c29d"))
	var bench := column(split)
	bench.add_theme_constant_override("separation", 7)
	bench.custom_minimum_size.x = 310
	text(bench, "BANCO DE RESERVAS", 14)
	text(bench, "1. Clique no titular no campo.\n2. Clique no reserva para trocar.", 13, "65745f")
	for p: Dictionary in session.players:
		if p.id not in session.lineup:
			var reserve := button(bench, "%s   %s   [%d]" % [p.position, p.name, p.skill], func():
				if session.replace_player(outgoing, p.id):
					status.text = "%s entrou no time titular." % p.name
					outgoing = ""
					show_page(page))
			reserve.disabled = outgoing.is_empty()
	text(bench, "Força e mentalidade afetam os resultados.\nA formação organiza o desenho do time.\nTrocas de posição são livres neste protótipo.", 11, "65745f")

func standings_page() -> void:
	text(content, "LIGA REGIONAL 2027  •  Turno e returno  •  3 pontos por vitória", 13, "65745f")
	add_standings(content)
	text(content, "Desempate: pontos, vitórias, saldo de gols e gols marcados.", 12, "65745f")

func matches_page() -> void:
	text(content, "Calendário completo  •  Resultados de todos os clubes", 13, "65745f")
	var table := make_table(content, ["Rod.", "Mandante", "Placar", "Visitante"], [55, 260, 90, 250], 400)
	for r in range(6):
		for index in range(2):
			var pair: Array = session.fixtures[r][index]
			var score := "×"
			if r < session.round_index:
				var result: Dictionary = session.results[r * 2 + index]
				score = "%d – %d" % [result.hg, result.ag]
			var item := table.create_item(table.get_root())
			var values := [str(r + 1), session.clubs[pair[0]].name, score, session.clubs[pair[1]].name]
			for i in range(4):
				item.set_text(i, values[i])
				item.set_selectable(i, false)

func play_round() -> void:
	var played: Array = session.play_round()
	if played.is_empty():
		return
	var report := ""
	for match_result: Dictionary in played:
		report += "%s  %d × %d  %s\n\n" % [session.clubs[match_result.home].name, match_result.hg, match_result.ag, session.clubs[match_result.away].name]
	dialog.title = "Rodada %d — Resultados" % session.round_index
	dialog.dialog_text = report + "Classificação atualizada."
	show_page(page)
	status.text = "Rodada %d concluída. Veja os resultados em Partidas." % session.round_index
	dialog.popup_centered(Vector2i(560, 230))
