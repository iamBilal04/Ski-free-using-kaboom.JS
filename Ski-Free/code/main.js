import kaboom from "kaboom"

// initialize context
kaboom({
  background: [255, 255, 255]
});

const skiers = [
  "skier-forward",
  "skier-jumping",
  "skier-kinda-left",
  "skier-kinda-right",
  "skier-left",
  "skier-ouch",
  "skier-right"
]

const obstacles = [
  "tree",
  "burnt-tree",
  "dog",
  "large-tree",
  "ramp"
]

const monsters = [
  "monster-move-1",
  "monster-move-2",
  "monster-move-3",
  "monster-move-4",
  "monster-move-5",
  "monster-move-6",
  "monster-move-7",
  "monster-move-8"
]

//render all skier images
for (const skier of skiers) {
  loadSprite(skier, `./sprites/${skier}.png`)
}

//render all obstacles
for (const obstacle of obstacles) {
  loadSprite(obstacle, `./sprites/${obstacle}.png`)
}

//render all monster images
for (const monster of monsters) {
  loadSprite(monster, `./sprites/${monster}.png`)
}

scene("ski", () => {
  let score = 0;
  let OBSTACLE_SPEED_X = 0;
  let OBSTACLE_SPEED_Y = -90;
  let PAUSED = true;
  let AIRBORNE = false;

  const player = add([
    sprite("skier-right"),
    area(),
    pos(width() / 2, height() / 2),
    anchor("center"),
    "player",
    {
      state: "going-right"
    }
  ])

  let scoreLabel = add([
    text(`Score: ${score}`, {
      transform: {
        color: rgb(2, 245, 6)
      }
    }),
    pos(24, 24),
    fixed(),
    "score"
  ])

  onKeyPress("left", () => {
    switch (player.state) {
      case "going-forward":
        player.state = "going-kinda-left";
        player.use(sprite("skier-kinda-left"));
        score++;
        OBSTACLE_SPEED_X = 90;
        OBSTACLE_SPEED_Y = -90;
        PAUSED = false;
        break

      default:
        player.state = "going-left"
        player.use(sprite("skier-left"))
        OBSTACLE_SPEED_X = 0;
        OBSTACLE_SPEED_Y = 0;
        PAUSED = true;
        break
    }
  })

  onKeyPress("right", () => {
    switch (player.state) {
      case "going-forward":
        player.state = "going-kinda-right";
        player.use(sprite("skier-kinda-right"));
        score++;
        OBSTACLE_SPEED_X = -90;
        OBSTACLE_SPEED_Y = -90;
        PAUSED = false;
        break;

      default:
        player.state = "going-right";
        player.use(sprite("skier-right"));
        OBSTACLE_SPEED_X = 0;
        OBSTACLE_SPEED_Y = 0;
        PAUSED = true;
        break;
    }
  })

  onKeyPress("down", () => {
    player.state = "going-forward";
    player.use(sprite("skier-forward"));
    score++;
    OBSTACLE_SPEED_X = 0;
    OBSTACLE_SPEED_Y = -90;
    PAUSED = false;
  })

  // Spawn obstacles
  function spawnObstacle() {
    const name = choose(obstacles);

    add([
      sprite(name),
      area(),
      pos(rand(width()), height()),
      anchor("bot"),
      name == "ramp" ? "ramp" : "danger",
      "obstacle"
    ]);
  }

  loop(0.5, () => {
    if (PAUSED !== true) {
      spawnObstacle();
    }
  })


  onUpdate("obstacle", (o) => {
    scoreLabel.text = `Score: ${score}`;
    if (PAUSED !== true) {
      o.move(OBSTACLE_SPEED_X, OBSTACLE_SPEED_Y);
      if (o.pos.y < 0) {
        destroy(o);
      }
    }
  })

  //For handling game over condition
  player.onCollide("danger", () => {
    if (AIRBORNE == false) {
      gameOver();
    }
  })

  player.onCollide("ramp", () => {
    if (player.state == "going-forward") {
      player.use(sprite("skier-jumping"));
      OBSTACLE_SPEED_Y = -500;
      score += 10;
      AIRBORNE = true;
      wait(1.5, () => {
        OBSTACLE_SPEED_Y = -90;
        AIRBORNE = false;
        player.use(sprite("skier-forward"))
      })
    } else {
      if (!AIRBORNE) {
        gameOver();
      }
    }
  })

  function gameOver() {
    shake(30);
    player.use(sprite("skier-ouch"));
    player.state = "flat";
    OBSTACLE_SPEED_X = 0;
    OBSTACLE_SPEED_Y = 0;
    wait(1, () => {
      go("ski");
    })
  }

})



go("ski")