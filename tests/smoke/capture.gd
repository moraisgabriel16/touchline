extends SceneTree

func _initialize() -> void:
	call_deferred("capture")

func capture() -> void:
	root.size = Vector2i(1280, 720)
	var game = load("res://scenes/bootstrap/main.tscn").instantiate()
	root.add_child(game)
	DirAccess.make_dir_recursive_absolute("res://artifacts")
	for page: String in ["Central do clube", "Escalação", "Elenco", "Ambientes"]:
		game.show_page(page)
		for i in range(4):
			await process_frame
		await RenderingServer.frame_post_draw
		var filename: String = {"Central do clube":"manager", "Escalação":"tactics", "Elenco":"roster", "Ambientes":"environments"}[page]
		root.get_texture().get_image().save_png("res://artifacts/%s.png" % filename)
		if page == "Ambientes":
			game.environment.show_dialogue("notebook")
			for i in range(8):
				await process_frame
			await RenderingServer.frame_post_draw
			root.get_texture().get_image().save_png("res://artifacts/rpg_dialogue.png")
			game.environment.close_dialogue()
			for location: String in ["office", "training"]:
				game.environment.room.load_room(location)
				for i in range(4):
					await process_frame
				await RenderingServer.frame_post_draw
				root.get_texture().get_image().save_png("res://artifacts/%s.png" % location)
	game.queue_free()
	await process_frame
	quit()
