extends Node2D

const InputSetup = preload("res://scripts/core/input_setup.gd")
const Apartment = preload("res://scripts/world/apartment.gd")
const Player = preload("res://scripts/world/player.gd")
const HUD = preload("res://scripts/ui/game_hud.gd")
const Iso = preload("res://scripts/core/iso_math.gd")
const INTERACTION_RANGE := 46.0

var world: Node2D
var player: CharacterBody2D
var hud: CanvasLayer
var focused: StaticBody2D
var modal := ""

func _ready() -> void:
	InputSetup.install()
	world = Apartment.new()
	world.name = "Apartment"
	add_child(world)
	player = Player.new()
	player.name = "Player"
	var spawn: Array = world.content.spawn
	player.position = Iso.project(Vector2(spawn[0], spawn[1]))
	world.entities.add_child(player)
	hud = HUD.new()
	add_child(hud)
	update_focus()

func _physics_process(_delta: float) -> void:
	update_focus()

func update_focus() -> void:
	focused = null
	var best := INTERACTION_RANGE
	for candidate: StaticBody2D in world.interactables:
		var distance := player.global_position.distance_to(candidate.global_position)
		if distance <= best:
			best = distance
			focused = candidate
	hud.set_available(focused != null)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause_game"):
		if modal.is_empty():
			modal = "pause"
			player.blocked = true
			hud.show_modal("paused", "pause_body", "close")
		else:
			close_modal()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("interact"):
		if modal == "box":
			close_modal()
		elif modal.is_empty() and focused != null:
			modal = "box"
			player.blocked = true
			hud.show_modal("box_title", "box_body", "close")
		get_viewport().set_input_as_handled()

func close_modal() -> void:
	modal = ""
	player.blocked = false
	hud.close_modal()
