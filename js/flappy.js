kaboom({
	scale: 0.7,
	background: [ 128, 180, 255 ],
})

loadSprite("bean", "/assets/click.png")
loadSound("score", "/assets/score.mp3")
loadSound("wooosh", "/assets/wooosh.mp3")
loadSound("hit", "/assets/hit.mp3")

scene("game", () => {

	const PIPE_OPEN = 240
	const PIPE_MIN = 60
	const JUMP_FORCE = 800
	const SPEED = 320
	const CEILING = -60

	// define gravity
	gravity(3200)

	// a game object consists of a list of components and tags
	const bean = add([
		// sprite() means it's drawn with a sprite of name "bean" (defined above in 'loadSprite')
		sprite("bean"),
		// give it a position
		pos(width() / 4, 0),
		// give it a collider
		area(),
		// body component enables it to fall and jump in a gravity world
		body(),
	])

	// check for fall death
	bean.onUpdate(() => {
		if (bean.pos.y >= height() || bean.pos.y <= CEILING) {
			// switch to "lose" scene
			go("lose", score)
		}
	})

	// jump
	onKeyPress("space", () => {
		bean.jump(JUMP_FORCE)
		play("wooosh")
	})

	// mobile
	onClick(() => {
		const worldMousePos = toWorld(mousePos())
		addKaboom(worldMousePos)
		bean.jump(JUMP_FORCE)
		play("wooosh")
	})

	function spawnPipe() {

		// calculate pipe positions
		const h1 = rand(PIPE_MIN, height() - PIPE_MIN - PIPE_OPEN)
		const h2 = height() - h1 - PIPE_OPEN

		add([
			pos(width(), 0),
			rect(64, h1),
			color(192, 192, 192),
			outline(4),
			area(),
			move(LEFT, SPEED),
			cleanup(),
			// give it tags to easier define behaviors see below
			"pipe",
		])

		add([
			pos(width(), h1 + PIPE_OPEN),
			rect(64, h2),
			color(192, 192, 192),
			outline(4),
			area(),
			move(LEFT, SPEED),
			cleanup(),
			// give it tags to easier define behaviors see below
			"pipe",
			// raw obj just assigns every field to the game obj
			{ passed: false, },
		])

	}

	// callback when bean onCollide with objects with tag "pipe"
	bean.onCollide("pipe", () => {
		go("lose", score)
		play("hit")
		addKaboom(bean.pos)
	})

	// per frame event for all objects with tag 'pipe'
	onUpdate("pipe", (p) => {
		// check if bean passed the pipe
		if (p.pos.x + p.width <= bean.pos.x && p.passed === false) {
			addScore()
			p.passed = true
		}
	})

	// spawn a pipe every 1 sec
	loop(1, () => {
		spawnPipe()
	})

	let score = 0

	// display score
	const scoreLabel = add([
		text(score),
		origin("center"),
		pos(width() / 2, 80),
		fixed(),
	])

	function addScore() {
		score++
		scoreLabel.text = score
		play("score")
	}

})

scene("lose", (score) => {

	add([
		sprite("bean"),
		pos(width() / 2, height() / 2 - 108),
		scale(3),
		origin("center"),
	])

	// display score
	add([
		text(score),
		pos(width() / 2, height() / 2 + 108),
		scale(3),
		origin("center"),
	])

	// go back to game with space is pressed
	onKeyPress("space", () => go("game"))
	onClick(() => go("game"))

})

go("game")