const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const WORLD_SIZE = 4000;
const GRID_SIZE = 50;
const FOOD_COUNT = 600;
const BOT_COUNT = 20;
const MIN_SIZE = 35;
const MAX_SPEED = 2.5;
const POWER_UP_COUNT = 3;

let gameRunning = false;
let soundEnabled = true;
let player = null;
let bots = [];
let food = [];
let powerUps = [];
let camera = { x: 0, y: 0 };
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let joystickActive = false;
let joystickX = 0;
let joystickY = 0;

const botNames = [
  "Alpha",
  "Beta",
  "Nova",
  "Rex",
  "Luna",
  "Titan",
  "Spark",
  "Echo",
  "Blaze",
  "Storm",
  "Shadow",
  "Frost",
  "Viper",
  "Phoenix",
  "Omega",
  "Zeus",
  "Atlas",
  "Orion",
  "Nebula",
  "Comet",
];

class Entity {
  constructor(x, y, size, color, name = "") {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.name = name;
    this.vx = 0;
    this.vy = 0;
  }

  get mass() {
    return this.size * this.size;
  }

  get radius() {
    return this.size;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 3;
    ctx.stroke();

    if (this.name) {
      ctx.fillStyle = "#000";
      ctx.font = `bold ${Math.max(12, this.size / 3)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.name, this.x - camera.x, this.y - camera.y);
    }
  }

  canEat(other) {
    return this.mass > other.mass * 1.2;
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  collidesWith(other) {
    return this.distanceTo(other) < this.radius + other.radius;
  }

  eat(other) {
    const addedMass = other.mass * 0.8;
    this.size = Math.sqrt(this.mass + addedMass);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    this.x = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.y));

    this.vx *= 0.95;
    this.vy *= 0.95;
  }
}

class Player extends Entity {
  move(targetX, targetY) {
    const dx = targetX - (this.x - camera.x);
    const dy = targetY - (this.y - camera.y);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      const speed = MAX_SPEED * (MIN_SIZE / this.size);
      this.vx = (dx / dist) * speed;
      this.vy = (dy / dist) * speed;
    }
  }
}

class Bot extends Entity {
  constructor(x, y, size, color, name) {
    super(x, y, size, color, name);
    this.targetX = x;
    this.targetY = y;
    this.changeTargetTimer = 0;
  }

  findNearestFood() {
    let nearest = null;
    let minDist = Infinity;

    for (const f of food) {
      const dist = this.distanceTo(f);
      if (dist < minDist && dist < 300) {
        minDist = dist;
        nearest = f;
      }
    }

    return nearest;
  }

  ai() {
    this.changeTargetTimer--;

    let nearestThreat = null;
    let minThreatDist = Infinity;

    for (const bot of bots) {
      if (bot !== this && bot.canEat(this)) {
        const dist = this.distanceTo(bot);
        if (dist < 200 && dist < minThreatDist) {
          minThreatDist = dist;
          nearestThreat = bot;
        }
      }
    }

    if (player && player.canEat(this) && this.distanceTo(player) < 200) {
      nearestThreat = player;
    }

    if (nearestThreat) {
      const dx = this.x - nearestThreat.x;
      const dy = this.y - nearestThreat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.targetX = this.x + (dx / dist) * 500;
      this.targetY = this.y + (dy / dist) * 500;
    } else {
      let target = null;

      for (const bot of bots) {
        if (bot !== this && this.canEat(bot) && this.distanceTo(bot) < 250) {
          target = bot;
          break;
        }
      }

      if (player && this.canEat(player) && this.distanceTo(player) < 250) {
        target = player;
      }

      if (!target) {
        target = this.findNearestFood();
      }

      if (target) {
        this.targetX = target.x;
        this.targetY = target.y;
      } else if (this.changeTargetTimer <= 0) {
        this.targetX = Math.random() * WORLD_SIZE;
        this.targetY = Math.random() * WORLD_SIZE;
        this.changeTargetTimer = 120;
      }
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      const speed = MAX_SPEED * (MIN_SIZE / this.size);
      this.vx = (dx / dist) * speed * 0.8;
      this.vy = (dy / dist) * speed * 0.8;
    }
  }

  update() {
    this.ai();
    super.update();
  }
}

function randomColor() {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52B788",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function initGame(playerName) {
  player = new Player(
    WORLD_SIZE / 2,
    WORLD_SIZE / 2,
    MIN_SIZE,
    "#FF1744",
    playerName
  );

  bots = [];
  for (let i = 0; i < BOT_COUNT; i++) {
    const startSize = i < 4 ? MIN_SIZE * 3 : MIN_SIZE;
    bots.push(
      new Bot(
        Math.random() * WORLD_SIZE,
        Math.random() * WORLD_SIZE,
        startSize,
        randomColor(),
        botNames[i]
      )
    );
  }

  food = [];
  for (let i = 0; i < FOOD_COUNT; i++) {
    food.push(
      new Entity(
        Math.random() * WORLD_SIZE,
        Math.random() * WORLD_SIZE,
        5,
        randomColor()
      )
    );
  }

  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  gameRunning = true;
}

function drawGrid() {
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;

  const startX = Math.floor(camera.x / GRID_SIZE) * GRID_SIZE;
  const startY = Math.floor(camera.y / GRID_SIZE) * GRID_SIZE;

  for (let x = startX; x < camera.x + canvas.width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x - camera.x, 0);
    ctx.lineTo(x - camera.x, canvas.height);
    ctx.stroke();
  }

  for (let y = startY; y < camera.y + canvas.height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y - camera.y);
    ctx.lineTo(canvas.width, y - camera.y);
    ctx.stroke();
  }
}

function updateLeaderboard() {
  const entities = [player, ...bots].sort((a, b) => b.mass - a.mass);
  const top4 = entities.slice(0, 4);

  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = "";

  top4.forEach((entity, i) => {
    const entry = document.createElement("div");
    entry.className = "leaderboard-entry";
    entry.innerHTML = `
                    <span class="leaderboard-rank">${i + 1}.</span>
                    <div class="leaderboard-color" style="background: ${
                      entity.color
                    }"></div>
                    <span>${entity.name} (${Math.floor(entity.mass)})</span>
                `;
    leaderboardList.appendChild(entry);
  });
}

function checkCollisions() {
  for (let i = food.length - 1; i >= 0; i--) {
    if (player.collidesWith(food[i])) {
      player.eat(food[i]);
      food.splice(i, 1);

      food.push(
        new Entity(
          Math.random() * WORLD_SIZE,
          Math.random() * WORLD_SIZE,
          5,
          randomColor()
        )
      );
    }
  }

  for (const bot of bots) {
    for (let i = food.length - 1; i >= 0; i--) {
      if (bot.collidesWith(food[i])) {
        bot.eat(food[i]);
        food.splice(i, 1);

        food.push(
          new Entity(
            Math.random() * WORLD_SIZE,
            Math.random() * WORLD_SIZE,
            5,
            randomColor()
          )
        );
        break;
      }
    }
  }

  for (let i = bots.length - 1; i >= 0; i--) {
    if (player.collidesWith(bots[i]) && player.canEat(bots[i])) {
      player.eat(bots[i]);
      const oldBot = bots[i];
      bots.splice(i, 1);

      bots.push(
        new Bot(
          Math.random() * WORLD_SIZE,
          Math.random() * WORLD_SIZE,
          MIN_SIZE,
          randomColor(),
          oldBot.name
        )
      );
    } else if (player.collidesWith(bots[i]) && bots[i].canEat(player)) {
      gameOver();
      return;
    }
  }

  for (let i = 0; i < bots.length; i++) {
    for (let j = i + 1; j < bots.length; j++) {
      if (bots[i].collidesWith(bots[j])) {
        if (bots[i].canEat(bots[j])) {
          bots[i].eat(bots[j]);
          const oldBot = bots[j];
          bots.splice(j, 1);

          bots.push(
            new Bot(
              Math.random() * WORLD_SIZE,
              Math.random() * WORLD_SIZE,
              MIN_SIZE,
              randomColor(),
              oldBot.name
            )
          );
          j--;
        } else if (bots[j].canEat(bots[i])) {
          bots[j].eat(bots[i]);
          const oldBot = bots[i];
          bots.splice(i, 1);

          bots.push(
            new Bot(
              Math.random() * WORLD_SIZE,
              Math.random() * WORLD_SIZE,
              MIN_SIZE,
              randomColor(),
              oldBot.name
            )
          );
          i--;
          break;
        }
      }
    }
  }
}

function gameOver() {
  gameRunning = false;
  document.getElementById("finalScore").textContent = Math.floor(player.mass);
  document.getElementById("gameOverScreen").style.display = "flex";
}

function gameLoop() {
  if (!gameRunning) return;

  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  if (!joystickActive) {
    player.move(mouseX, mouseY);
  } else {
    player.move(
      canvas.width / 2 + joystickX * 100,
      canvas.height / 2 + joystickY * 100
    );
  }

  player.update();
  bots.forEach((bot) => bot.update());

  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = Math.max(0, Math.min(WORLD_SIZE - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(WORLD_SIZE - canvas.height, camera.y));

  checkCollisions();

  food.forEach((f) => f.draw());
  bots.forEach((bot) => bot.draw());
  player.draw();

  document.getElementById("currentScore").textContent = Math.floor(player.mass);
  updateLeaderboard();

  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystickKnob");

joystick.addEventListener("touchstart", (e) => {
  e.preventDefault();
  joystickActive = true;
});

joystick.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!joystickActive) return;

  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const touch = e.touches[0];

  let dx = touch.clientX - centerX;
  let dy = touch.clientY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = 45;

  if (dist > maxDist) {
    dx = (dx / dist) * maxDist;
    dy = (dy / dist) * maxDist;
  }

  joystickX = dx / maxDist;
  joystickY = dy / maxDist;

  joystickKnob.style.left = `calc(50% + ${dx}px)`;
  joystickKnob.style.top = `calc(50% + ${dy}px)`;
});

joystick.addEventListener("touchend", (e) => {
  e.preventDefault();
  joystickActive = false;
  joystickX = 0;
  joystickY = 0;
  joystickKnob.style.left = "50%";
  joystickKnob.style.top = "50%";
});

document.getElementById("startButton").addEventListener("click", () => {
  const name = document.getElementById("playerName").value.trim() || "Oyuncu";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("leaderboard").style.display = "block";
  document.getElementById("score").style.display = "block";
  document.getElementById("soundToggle").style.display = "block";
  initGame(name);
  gameLoop();
});

document.getElementById("restartButton").addEventListener("click", () => {
  document.getElementById("gameOverScreen").style.display = "none";
  const name = player.name;
  initGame(name);
  gameLoop();
});

document.getElementById("helpButton").addEventListener("click", () => {
  alert(
    "🎮 NASIL OYNANIR?\n\n" +
      "🖱️ PC: Fare ile hareket et\n" +
      "📱 Mobil: Sol alttaki joystick ile hareket et\n\n" +
      "🎯 Amaç: Küçük yemler ve kendinden küçük oyuncuları ye!\n" +
      "⚠️ Dikkat: Senden büyük oyunculardan kaçın!\n" +
      "📊 Büyüdükçe yavaşlarsın ama daha güçlü olursun!"
  );
});

document.getElementById("soundToggle").addEventListener("click", (e) => {
  soundEnabled = !soundEnabled;
  e.target.textContent = soundEnabled ? "🔊 Ses: Açık" : "🔇 Ses: Kapalı";
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.getElementById("playerName").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("startButton").click();
  }
});
