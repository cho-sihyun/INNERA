const canvas = document.getElementById("squareCanvas");
const ctx = canvas.getContext("2d");
const tileW = 90;
const tileH = 42;
const originX = canvas.width / 2;
const originY = 110;

const map = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 3, 0, 1, 0, 1, 0, 3, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 1, 0, 0, 4, 0, 0, 1, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 3, 0, 1, 0, 1, 0, 3, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];

const objects = [
  { type: "sign", x: 5, y: 4 },
  { type: "mailbox", x: 8, y: 2 },
  { type: "lamppost", x: 7, y: 8 },
  { type: "lamppost", x: 3, y: 8 },
];

const characters = [
  { id: 1, color: "#f3b48f", x: 3, y: 7, label: "A" },
  { id: 2, color: "#9ec6ff", x: 7, y: 6, label: "B" },
  { id: 3, color: "#bd87f9", x: 5, y: 9, label: "C" },
];

let selectedCharacter = characters[0];

function isoToScreen(x, y) {
  return {
    x: originX + (x - y) * (tileW / 2),
    y: originY + (x + y) * (tileH / 2),
  };
}

function drawFloor(x, y) {
  const screen = isoToScreen(x, y);
  const centerX = screen.x;
  const centerY = screen.y;

  const gradient = ctx.createLinearGradient(centerX, centerY - 20, centerX, centerY + 20);
  gradient.addColorStop(0, "#5f6b83");
  gradient.addColorStop(1, "#4a5266");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - tileH / 2);
  ctx.lineTo(centerX + tileW / 2, centerY);
  ctx.lineTo(centerX, centerY + tileH / 2);
  ctx.lineTo(centerX - tileW / 2, centerY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBuilding(x, y) {
  const screen = isoToScreen(x, y);
  const baseX = screen.x;
  const baseY = screen.y;
  const height = 48;

  ctx.fillStyle = "#55607a";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY - tileH / 2);
  ctx.lineTo(baseX + tileW / 2, baseY);
  ctx.lineTo(baseX + tileW / 2, baseY - height);
  ctx.lineTo(baseX, baseY - height - tileH / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3f4a5f";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY - height - tileH / 2);
  ctx.lineTo(baseX + tileW / 2, baseY - height);
  ctx.lineTo(baseX, baseY - tileH / 2);
  ctx.lineTo(baseX - tileW / 2, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawBench(x, y) {
  const screen = isoToScreen(x, y);
  const topX = screen.x - 24;
  const topY = screen.y - 10;

  ctx.fillStyle = "#6e7f99";
  ctx.fillRect(topX, topY, 48, 10);
  ctx.fillStyle = "#4f606f";
  ctx.fillRect(topX + 6, topY + 10, 8, 16);
  ctx.fillRect(topX + 34, topY + 10, 8, 16);
}

function drawTree(x, y) {
  const screen = isoToScreen(x, y);
  const trunkX = screen.x - 6;
  const trunkY = screen.y - 18;

  ctx.fillStyle = "#624b2d";
  ctx.fillRect(trunkX, trunkY, 12, 22);

  const leafX = screen.x;
  const leafY = screen.y - 38;
  ctx.fillStyle = "#2f6a2d";
  ctx.beginPath();
  ctx.ellipse(leafX, leafY, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3e8f49";
  ctx.beginPath();
  ctx.ellipse(leafX - 10, leafY - 6, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(leafX + 12, leafY - 8, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMonument(x, y) {
  const screen = isoToScreen(x, y);
  const baseCenterX = screen.x;
  const baseCenterY = screen.y - 6;

  ctx.fillStyle = "#d3b87c";
  ctx.beginPath();
  ctx.ellipse(baseCenterX, baseCenterY + 18, 46, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b38b52";
  ctx.fillRect(baseCenterX - 32, baseCenterY - 4, 64, 24);

  ctx.fillStyle = "#f6dc9b";
  ctx.beginPath();
  ctx.moveTo(baseCenterX - 20, baseCenterY - 4);
  ctx.lineTo(baseCenterX + 20, baseCenterY - 4);
  ctx.lineTo(baseCenterX + 12, baseCenterY - 70);
  ctx.lineTo(baseCenterX - 12, baseCenterY - 70);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f8efc9";
  ctx.beginPath();
  ctx.arc(baseCenterX, baseCenterY - 70, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawLamp(x, y) {
  const screen = isoToScreen(x, y);
  const poleHeight = 60;
  const x0 = screen.x - 4;
  const y0 = screen.y - 10;

  ctx.fillStyle = "#607188";
  ctx.fillRect(x0, y0 - poleHeight, 8, poleHeight);
  ctx.beginPath();
  ctx.arc(screen.x, y0 - poleHeight - 8, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#f7d568";
  ctx.fill();
  ctx.fillStyle = "rgba(247, 213, 104, 0.22)";
  ctx.beginPath();
  ctx.arc(screen.x, y0 - poleHeight - 8, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawMailBox(x, y) {
  const screen = isoToScreen(x, y);
  ctx.fillStyle = "#435d91";
  ctx.fillRect(screen.x - 14, screen.y - 38, 28, 34);
  ctx.fillStyle = "#dfe7f8";
  ctx.fillRect(screen.x - 12, screen.y - 28, 24, 10);
}

function drawSign(x, y) {
  const screen = isoToScreen(x, y);
  ctx.fillStyle = "#43321d";
  ctx.fillRect(screen.x - 18, screen.y - 10, 36, 10);
  ctx.fillRect(screen.x - 4, screen.y - 20, 8, 30);
  ctx.fillStyle = "#efd7a0";
  ctx.fillRect(screen.x - 30, screen.y - 40, 60, 28);
  ctx.fillStyle = "#1d2434";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SQUARE", screen.x, screen.y - 22);
}

function drawCharacters() {
  const sorted = [...characters].sort((a, b) => (a.x + a.y) - (b.x + b.y));
  sorted.forEach((char) => {
    const pos = isoToScreen(char.x, char.y);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 24, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 8, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(char.label, pos.x, pos.y - 8 + 4);

    if (selectedCharacter.id === char.id) {
      ctx.strokeStyle = "#fced9f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 8, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      drawFloor(x, y);
      if (map[y][x] === 2) drawBuilding(x, y);
      if (map[y][x] === 1) drawBench(x, y);
      if (map[y][x] === 3) drawTree(x, y);
      if (map[y][x] === 4) drawMonument(x, y);
    }
  }

  objects.forEach((object) => {
    if (object.type === "lamp") drawLamp(object.x, object.y);
    if (object.type === "mailbox") drawMailBox(object.x, object.y);
    if (object.type === "sign") drawSign(object.x, object.y);
  });

  drawCharacters();
}

function isWalkable(x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false;
  const tile = map[y][x];
  return tile === 0 || tile === 4;
}

function moveSelected(dx, dy) {
  const targetX = selectedCharacter.x + dx;
  const targetY = selectedCharacter.y + dy;
  if (!isWalkable(targetX, targetY)) return;

  const collision = characters.some((char) => char.id !== selectedCharacter.id && char.x === targetX && char.y === targetY);
  if (collision) return;

  selectedCharacter.x = targetX;
  selectedCharacter.y = targetY;
  drawMap();
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  let moved = false;

  if (key === "arrowup" || key === "w") {
    moveSelected(0, -1);
    moved = true;
  }
  if (key === "arrowdown" || key === "s") {
    moveSelected(0, 1);
    moved = true;
  }
  if (key === "arrowleft" || key === "a") {
    moveSelected(-1, 0);
    moved = true;
  }
  if (key === "arrowright" || key === "d") {
    moveSelected(1, 0);
    moved = true;
  }

  if (moved) {
    event.preventDefault();
  }
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  let nearest = null;
  let nearestDistance = Infinity;

  characters.forEach((char) => {
    const pos = isoToScreen(char.x, char.y);
    const dist = Math.hypot(pos.x - clickX, pos.y - clickY);
    if (dist < nearestDistance && dist < 36) {
      nearest = char;
      nearestDistance = dist;
    }
  });

  if (nearest) {
    selectedCharacter = nearest;
    drawMap();
  }
});

drawMap();
