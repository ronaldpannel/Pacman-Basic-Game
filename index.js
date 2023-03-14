/**@type{HTMLCanvasElement} */

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  const gameOverBoard = document.getElementById("gameOverWrapper");
  const gameWinBoard = document.getElementById("gameWinWrapper");
  const scoreText = document.getElementById("score");
  const scoreValue = document.getElementById("scoreValue");
  const winScoreValue = document.getElementById("scoreValue1");
  const startBtn = document.getElementById("startBtn");
  const wakaSound = document.getElementById("wakaSound");
  const gameWinSound = document.getElementById("gameWinSound");
  const gameLoseSound = document.getElementById("gameLoseSound");
  canvas.width = 300;
  canvas.height = 310;
  let speed = 2;
  let map = [];
  let score = 0;
  let speedModifier = 0.5;
  let animationID;

  class Boundary {
    static width = 20;
    static height = 20;
    constructor({ pos }) {
      this.pos = pos;
      this.width = 20;
      this.height = 20;
    }
    draw() {
      ctx.fillStyle = "blue";
      ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }
  }

  class PacMan {
    constructor({ pos, vel }) {
      this.pos = pos;
      this.vel = vel;
      this.radius = 9;
    }
    update() {
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  class Pellet {
    constructor({ pos }) {
      this.pos = pos;
      this.radius = 2;
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = "orange";
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }
  class Ghost {
    constructor({ pos, vel, color = "red" }) {
      this.pos = pos;
      this.vel = vel;
      this.color = color;
      this.radius = 10;
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      this.directionsX = [speed, -speed, 0];
      this.directionsY = [speed, -speed, 0];
    }
    update() {
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
    }
  }
  let randomVel;
  function randomGhostVel() {
    if (Math.random() < 0.5) {
      return (randomVel = 1 * speed);
    } else {
      return (randomVel = -1 * speed);
    }
  }
  randomGhostVel();

  const pellets = [];
  const boundaryArray = [];
  const ghosts = [
    new Ghost({
      pos: {
        x: Boundary.width * 3 + Boundary.width / 2,
        y: Boundary.height * 13 + Boundary.height / 2,
      },
      vel: {
        x: speed,
        y: 0,
      },
    }),
    new Ghost({
      pos: {
        x: Boundary.width * 11 + Boundary.width / 2,
        y: Boundary.height * 3 + Boundary.height / 2,
      },
      vel: {
        x: speed,
        y: 0,
      },
    }),
    new Ghost({
      pos: {
        x: Boundary.width * 12 + Boundary.width / 2,
        y: Boundary.height * 3 + Boundary.height / 2,
      },
      vel: {
        x: -speed,
        y: 0,
      },
    }),
  ];

  const player = new PacMan({
    pos: {
      x: Boundary.width + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    vel: {
      x: 0,
      y: 0,
    },
  });
  const keys = {
    up: {
      pressed: false,
    },
    down: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
    right: {
      pressed: false,
    },
  };

  let lastKey = "";
  map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, , 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  map.forEach((row, i) => {
    row.forEach((num, j) => {
      if (num == 1) {
        boundaryArray.push(
          new Boundary({
            pos: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
          })
        );
      }
      if (num == 0) {
        pellets.push(
          new Pellet({
            pos: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
          })
        );
      }
    });
  });
  function circleCollisionWithBoundary({ circle, rectangle }) {
    return (
      circle.pos.y - circle.radius + circle.vel.y <=
        rectangle.pos.y + rectangle.height &&
      circle.pos.x + circle.radius + circle.vel.x >= rectangle.pos.x &&
      circle.pos.y + circle.radius + circle.vel.y >= rectangle.pos.y &&
      circle.pos.x - circle.radius + circle.vel.x <=
        rectangle.pos.x + rectangle.width
    );
  }
  function gameOverCondition() {
    ghosts.forEach((ghost) => {
      let dx = ghost.pos.x - player.pos.x;
      let dy = ghost.pos.y - player.pos.y;
      let distance = Math.hypot(dy, dx);
      if (distance <= player.radius + ghost.radius) {
        scoreValue.innerText = score;
        gameLoseSound.play();
        gameOverBoard.classList.add("gameOverActive");
        startBtn.classList.add("startBtnActive");

        cancelAnimationFrame(animationID);
      }
    });
  }

  function winCondition() {
    if (pellets.length <= 1) {
      winScoreValue.innerText = score;
      gameWinSound.play();
      gameWinBoard.classList.add("gameOverActive");
      startBtn.classList.add("startBtnActive");
      cancelAnimationFrame(animationID);
    }
  }

  function animate() {
    animationID = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //player Movement
    if (keys.up.pressed && lastKey === "ArrowUp") {
      for (let i = 0; i < boundaryArray.length; i++) {
        const boundary = boundaryArray[i];
        if (
          circleCollisionWithBoundary({
            circle: {
              ...player,
              ve: {
                x: 0,
                y: -speed,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.vel.y = 0;
          break;
        } else {
          player.vel.y = -speed;
        }
      }
    } else if (keys.down.pressed && lastKey === "ArrowDown") {
      for (let i = 0; i < boundaryArray.length; i++) {
        const boundary = boundaryArray[i];
        if (
          circleCollisionWithBoundary({
            circle: {
              ...player,
              ve: {
                x: 0,
                y: speed,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.vel.y = 0;
          break;
        } else {
          player.vel.y = speed;
        }
      }
    } else if (keys.left.pressed && lastKey === "ArrowLeft") {
      for (let i = 0; i < boundaryArray.length; i++) {
        const boundary = boundaryArray[i];
        if (
          circleCollisionWithBoundary({
            circle: {
              ...player,
              ve: {
                x: -speed,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.vel.x = 0;
          break;
        } else {
          player.vel.x = -speed;
        }
      }
    } else if (keys.right.pressed && lastKey === "ArrowRight") {
      for (let i = 0; i < boundaryArray.length; i++) {
        const boundary = boundaryArray[i];
        if (
          circleCollisionWithBoundary({
            circle: {
              ...player,
              ve: {
                x: speed,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.vel.x = 0;
          break;
        } else {
          player.vel.x = speed;
        }
      }
    }
    for (let i = pellets.length - 1; 0 < i; i--) {
      const pellet = pellets[i];
      pellet.draw();
      if (
        Math.hypot(pellet.pos.x - player.pos.x, pellet.pos.y - player.pos.y) <
        pellet.radius + player.radius
      ) {
        wakaSound.play()
        score += 5;
        pellets.splice(i, 1);
        scoreText.innerHTML = score;
      }
    }
    boundaryArray.forEach((boundary) => {
      boundary.draw();
      if (
        circleCollisionWithBoundary({
          circle: player,
          rectangle: boundary,
        })
      ) {
        player.vel.x = 0;
        player.vel.y = 0;
      }
    });
    player.update();
    player.draw();

    //side exist
    if (player.pos.x >= canvas.width) {
      player.pos.x = 0;
    } else if (player.pos.x <= 0) {
      player.pos.x = canvas.width;
    }
    gameOverCondition();
    winCondition();

    // move ghost
    for (let i = 0; i < boundaryArray.length; i++) {
      let boundary = boundaryArray[i];
      for (let j = 0; j < ghosts.length; j++) {
        let ghost = ghosts[j];
        if (
          ghost.pos.x + ghost.radius + ghost.vel.x >=
          canvas.width - boundary.width
        ) {
          ghost.pos.x = canvas.width - boundary.width - ghost.radius;
          ghost.vel.x = 0;
          ghost.vel.y = speed * speedModifier;
        }

        if (
          ghost.pos.y + ghost.radius + ghost.vel.y >=
          canvas.height - boundary.height
        ) {
          ghost.pos.y = canvas.height - boundary.height - ghost.radius * 2;
          ghost.vel.y = 0;
          ghost.vel.x = -speed * speedModifier;
        }

        if (ghost.pos.x - ghost.radius <= 0 + boundary.width) {
          ghost.pos.x = 0 + boundary.width + ghost.radius;
          ghost.vel.x = 0;
          ghost.vel.y = -speed * speedModifier;
        }

        if (
          ghost.pos.y + ghost.radius + ghost.vel.y <=
          0 + boundary.height + ghost.radius * 2
        ) {
          ghost.vel.y = 0;
          ghost.vel.x = speed * speedModifier;
        }
      }
    }
    ghosts.forEach((ghost) => {
      ghost.draw();
      ghost.update();
    });
  }
  animate();

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      keys.up.pressed = true;
      lastKey = "ArrowUp";
    } else if (e.key === "ArrowDown") {
      keys.down.pressed = true;
      lastKey = "ArrowDown";
    } else if (e.key === "ArrowLeft") {
      keys.left.pressed = true;
      lastKey = "ArrowLeft";
    } else if (e.key === "ArrowRight") {
      keys.right.pressed = true;
      lastKey = "ArrowRight";
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") {
      keys.up.pressed = false;
    } else if (e.key === "ArrowDown") {
      keys.down.pressed = false;
    } else if (e.key === "ArrowLeft") {
      keys.left.pressed = false;
    } else if (e.key === "ArrowRight") {
      keys.right.pressed = false;
    }
  });
  startBtn.addEventListener("pointerdown", (e) => {
    window.location.reload();
  });

  //load function end
});
