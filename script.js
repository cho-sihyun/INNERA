// ─── 캔버스 설정 ───────────────────────────────────────────────
const canvas = document.getElementById("roomCanvas");
const ctx = canvas.getContext("2d");
const ghost = document.getElementById("ghostCanvas");
const gctx = ghost.getContext("2d");

const ROOM_W = 800;
const ROOM_H = 600;
canvas.width = ROOM_W;
canvas.height = ROOM_H;
ghost.width = ROOM_W;
ghost.height = ROOM_H;

// 아이소메트릭 설정 (2.5D)
const ISO = {
  tileW: 64,
  tileH: 32,
  originX: ROOM_W / 2,
  originY: 120,
  cols: 8,
  rows: 7,
};

function isoToScreen(col, row) {
  return {
    x: ISO.originX + (col - row) * (ISO.tileW / 2),
    y: ISO.originY + (col + row) * (ISO.tileH / 2),
  };
}

function screenToIso(sx, sy) {
  const dx = sx - ISO.originX;
  const dy = sy - ISO.originY;
  const col = Math.round((dx / (ISO.tileW / 2) + dy / (ISO.tileH / 2)) / 2);
  const row = Math.round((dy / (ISO.tileH / 2) - dx / (ISO.tileW / 2)) / 2);
  return { col, row };
}

// ─── 픽셀아트 드로어 ────────────────────────────────────────────
// 작은 오프스크린 캔버스에 픽셀 단위로 그린 뒤 반환
function makePixelSprite(fn, w, h, scale = 3) {
  const oc = document.createElement("canvas");
  oc.width = w;
  oc.height = h;
  fn(oc.getContext("2d"), w, h);
  const out = document.createElement("canvas");
  out.width = w * scale;
  out.height = h * scale;
  const octx = out.getContext("2d");
  octx.imageSmoothingEnabled = false;
  octx.drawImage(oc, 0, 0, w * scale, h * scale);
  return out;
}

// 픽셀 채우기 헬퍼
function px(c, color, x, y, w = 1, h = 1) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

// ─── 스프라이트 정의 ────────────────────────────────────────────
const SPRITES = {};

// 바닥 타일 (아이소메트릭 다이아몬드)
function drawFloorTile(ctx, lit = false) {
  const w = ISO.tileW, h = ISO.tileH;
  const top = lit ? "#f2c4ce" : "#e8adb8";
  const shade = lit ? "#d9899a" : "#c87080";
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w, h / 2);
  ctx.lineTo(w / 2, h);
  ctx.lineTo(0, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = shade;
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

// 벽 (왼쪽)
function drawWallLeft(ctx, x, y, w, h) {
  ctx.fillStyle = "#f5d6e0";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(x, y, w, h);
}

// 벽 (오른쪽)
function drawWallRight(ctx, x, y, w, h) {
  ctx.fillStyle = "#e8c0cc";
  ctx.fillRect(x, y, w, h);
}

// ─── 가구 스프라이트 (픽셀아트) ─────────────────────────────────

// 침대
SPRITES.bed = makePixelSprite((c) => {
  // 프레임
  px(c, "#d4687a", 1, 5, 22, 14);  // 몸통
  px(c, "#bf566a", 1, 17, 22, 2);  // 아래테두리
  px(c, "#e87a8a", 1, 5, 22, 1);   // 위테두리
  // 헤드보드
  px(c, "#c45060", 1, 1, 22, 5);
  px(c, "#d4687a", 2, 2, 20, 3);
  // 이불
  px(c, "#ffb8c8", 2, 6, 20, 10);
  px(c, "#ffa0b4", 2, 14, 20, 2);
  // 베개
  px(c, "#fff0f4", 3, 7, 8, 5);
  px(c, "#ffe0e8", 4, 8, 6, 3);
  px(c, "#fff0f4", 13, 7, 8, 5);
  px(c, "#ffe0e8", 14, 8, 6, 3);
  // 다리
  px(c, "#a03848", 1, 19, 3, 2);
  px(c, "#a03848", 20, 19, 3, 2);
}, 24, 21, 4);

// 책상
SPRITES.desk = makePixelSprite((c) => {
  // 상판
  px(c, "#c8785a", 0, 4, 20, 2);
  px(c, "#e8a080", 0, 3, 20, 1);
  px(c, "#b86848", 0, 6, 20, 1);
  // 다리
  px(c, "#a05030", 1, 7, 3, 10);
  px(c, "#a05030", 16, 7, 3, 10);
  // 서랍
  px(c, "#c8785a", 1, 7, 10, 8);
  px(c, "#b86848", 2, 8, 8, 6);
  px(c, "#d89070", 5, 10, 2, 2);
  // 노트북
  px(c, "#555", 3, 0, 10, 1);
  px(c, "#666", 3, 1, 10, 3);
  px(c, "#888", 4, 2, 8, 1);
  px(c, "#777", 2, 4, 12, 1);
}, 20, 17, 4);

// 책장
SPRITES.bookshelf = makePixelSprite((c) => {
  // 프레임
  px(c, "#b87050", 0, 0, 16, 28);
  px(c, "#c88060", 1, 1, 14, 26);
  // 선반들
  px(c, "#a06040", 1, 7, 14, 1);
  px(c, "#a06040", 1, 14, 14, 1);
  px(c, "#a06040", 1, 21, 14, 1);
  // 책들 (1단)
  px(c, "#e05050", 2, 2, 2, 5);
  px(c, "#50a0e0", 4, 2, 2, 5);
  px(c, "#e0c050", 6, 2, 2, 5);
  px(c, "#80c050", 8, 2, 2, 5);
  px(c, "#c050c0", 10, 2, 2, 5);
  // 책들 (2단)
  px(c, "#50e0a0", 2, 9, 2, 5);
  px(c, "#e08050", 5, 9, 3, 5);
  px(c, "#5080e0", 9, 9, 2, 5);
  px(c, "#e05080", 12, 9, 2, 5);
  // 책들 (3단)
  px(c, "#f0a020", 2, 16, 3, 5);
  px(c, "#a020f0", 6, 16, 2, 5);
  px(c, "#20f0a0", 9, 16, 3, 5);
  // 하단
  px(c, "#a06040", 1, 23, 14, 4);
}, 16, 28, 4);

// 소파
SPRITES.sofa = makePixelSprite((c) => {
  // 등받이
  px(c, "#e08090", 0, 2, 26, 10);
  px(c, "#f0a0a8", 1, 3, 24, 8);
  // 방석
  px(c, "#f0a0a8", 0, 12, 26, 8);
  px(c, "#e08090", 0, 19, 26, 1);
  // 팔걸이
  px(c, "#e08090", 0, 2, 4, 18);
  px(c, "#e08090", 22, 2, 4, 18);
  // 쿠션 라인
  px(c, "#d07080", 13, 12, 1, 8);
  // 다리
  px(c, "#b06070", 1, 20, 3, 3);
  px(c, "#b06070", 22, 20, 3, 3);
  // 등받이 쿠션
  px(c, "#ffc0c8", 2, 4, 10, 6);
  px(c, "#ffc0c8", 14, 4, 10, 6);
}, 26, 23, 4);

// 화분
SPRITES.plant = makePixelSprite((c) => {
  // 화분
  px(c, "#c86040", 3, 12, 10, 8);
  px(c, "#e07050", 4, 13, 8, 6);
  px(c, "#b05030", 2, 18, 12, 2);
  // 흙
  px(c, "#604020", 4, 12, 8, 2);
  // 줄기
  px(c, "#408030", 7, 6, 2, 7);
  // 잎
  px(c, "#60c040", 2, 2, 6, 8);
  px(c, "#50b030", 2, 2, 4, 6);
  px(c, "#70d050", 3, 3, 3, 4);
  px(c, "#60c040", 8, 4, 6, 6);
  px(c, "#50b030", 10, 4, 4, 4);
  px(c, "#40a020", 5, 8, 5, 3);
}, 16, 20, 4);

// 러그 (카펫)
SPRITES.rug = makePixelSprite((c) => {
  // 배경
  px(c, "#f0c0c8", 0, 0, 28, 18);
  // 테두리
  px(c, "#d080a0", 0, 0, 28, 1);
  px(c, "#d080a0", 0, 17, 28, 1);
  px(c, "#d080a0", 0, 0, 1, 18);
  px(c, "#d080a0", 27, 0, 1, 18);
  // 패턴
  px(c, "#e090a8", 2, 2, 24, 14);
  px(c, "#d080a0", 4, 4, 20, 10);
  px(c, "#f0c0c8", 6, 6, 16, 6);
  // 꽃 패턴
  px(c, "#ff80a0", 12, 7, 4, 4);
  px(c, "#ff60c0", 13, 8, 2, 2);
}, 28, 18, 4);

// 조명/스탠드
SPRITES.lamp = makePixelSprite((c) => {
  // 갓
  px(c, "#ffd080", 2, 0, 10, 1);
  px(c, "#ffd080", 1, 1, 12, 1);
  px(c, "#ffc060", 0, 2, 14, 4);
  px(c, "#ffb040", 1, 6, 12, 1);
  // 빛 효과
  px(c, "rgba(255,220,100,0.3)", 0, 1, 14, 8);
  // 폴대
  px(c, "#888", 6, 7, 2, 12);
  // 받침
  px(c, "#666", 3, 19, 8, 2);
  px(c, "#555", 2, 21, 10, 1);
}, 14, 22, 4);

// 거울
SPRITES.mirror = makePixelSprite((c) => {
  // 프레임
  px(c, "#d4a070", 0, 0, 14, 20);
  px(c, "#c09060", 1, 1, 12, 18);
  // 거울 면
  px(c, "#c8e8f0", 2, 2, 10, 14);
  px(c, "#d8f0f8", 3, 3, 8, 4);
  px(c, "#b0d8e8", 2, 14, 10, 2);
  // 하이라이트
  px(c, "#e8f8ff", 3, 3, 3, 3);
  // 받침
  px(c, "#c09060", 4, 18, 6, 2);
  px(c, "#b08050", 3, 20, 8, 1);
}, 14, 21, 4);

// 테이블
SPRITES.table = makePixelSprite((c) => {
  // 상판
  px(c, "#c89060", 0, 3, 20, 3);
  px(c, "#e0a878", 0, 2, 20, 1);
  px(c, "#b07848", 0, 6, 20, 1);
  // 다리
  px(c, "#a06838", 2, 7, 3, 10);
  px(c, "#a06838", 15, 7, 3, 10);
  // 컵
  px(c, "#fff", 7, 0, 3, 3);
  px(c, "#ffe0e0", 8, 1, 1, 2);
  // 접시
  px(c, "#f8e8d0", 11, 1, 4, 2);
  px(c, "#e8c8a0", 12, 1, 2, 1);
}, 20, 17, 4);

// 창문 (벽에 붙이는 오브젝트)
SPRITES.window = makePixelSprite((c) => {
  // 프레임
  px(c, "#e8c8a0", 0, 0, 18, 22);
  px(c, "#d0a870", 1, 1, 16, 20);
  // 유리
  px(c, "#80b8e8", 2, 2, 14, 18);
  // 밤하늘
  px(c, "#1828a0", 2, 2, 14, 18);
  px(c, "#2838b8", 2, 2, 14, 8);
  // 별
  px(c, "#fff", 5, 4, 1, 1);
  px(c, "#fff", 10, 6, 1, 1);
  px(c, "#fff", 7, 3, 1, 1);
  px(c, "#fff", 14, 5, 1, 1);
  // 달
  px(c, "#ffe090", 11, 9, 4, 5);
  px(c, "#1828a0", 12, 9, 3, 3);
  // 창살
  px(c, "#d0a870", 9, 2, 1, 18);
  px(c, "#d0a870", 2, 11, 14, 1);
}, 18, 22, 4);

// ─── 방 배치 데이터 ─────────────────────────────────────────────
const placedItems = []; // { id, spriteKey, col, row, offsetX, offsetY }

// ─── 방 배경 그리기 ─────────────────────────────────────────────
function drawRoom() {
  ctx.clearRect(0, 0, ROOM_W, ROOM_H);

  // 전체 배경
  ctx.fillStyle = "#2a0a1a";
  ctx.fillRect(0, 0, ROOM_W, ROOM_H);

  // 방 바닥 (아이소메트릭 타일)
  for (let row = 0; row < ISO.rows; row++) {
    for (let col = 0; col < ISO.cols; col++) {
      const s = isoToScreen(col, row);
      const tw = ISO.tileW, th = ISO.tileH;
      const lit = (col + row) % 2 === 0;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y - th / 2);
      ctx.lineTo(s.x + tw / 2, s.y);
      ctx.lineTo(s.x, s.y + th / 2);
      ctx.lineTo(s.x - tw / 2, s.y);
      ctx.closePath();
      ctx.fillStyle = lit ? "#e8b0be" : "#d89aaa";
      ctx.fill();
      ctx.strokeStyle = "#c07888";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // 왼쪽 벽
  const topLeft = isoToScreen(0, 0);
  const botLeft = isoToScreen(0, ISO.rows);
  const wallH = 180;

  // 왼쪽 벽면
  ctx.fillStyle = "#f5d6e0";
  ctx.beginPath();
  ctx.moveTo(topLeft.x - ISO.tileW / 2, topLeft.y);
  ctx.lineTo(topLeft.x, topLeft.y - ISO.tileH / 2);
  ctx.lineTo(topLeft.x, topLeft.y - ISO.tileH / 2 - wallH);
  ctx.lineTo(topLeft.x - ISO.tileW / 2, topLeft.y - wallH);
  ctx.lineTo(botLeft.x - ISO.tileW / 2, botLeft.y - wallH);
  ctx.lineTo(botLeft.x - ISO.tileW / 2, botLeft.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#d0a8b8";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 왼쪽 벽 세로줄 장식
  for (let row = 0; row <= ISO.rows; row++) {
    const s = isoToScreen(0, row);
    ctx.beginPath();
    ctx.moveTo(s.x - ISO.tileW / 2, s.y);
    ctx.lineTo(s.x - ISO.tileW / 2, s.y - wallH);
    ctx.strokeStyle = "rgba(180,100,130,0.15)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // 오른쪽 벽면
  const topRight = isoToScreen(ISO.cols, 0);
  ctx.fillStyle = "#e8c0cc";
  ctx.beginPath();
  ctx.moveTo(topLeft.x, topLeft.y - ISO.tileH / 2);
  ctx.lineTo(topRight.x, topRight.y - ISO.tileH / 2);
  ctx.lineTo(topRight.x, topRight.y - ISO.tileH / 2 - wallH);
  ctx.lineTo(topLeft.x, topLeft.y - ISO.tileH / 2 - wallH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c098a8";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 오른쪽 벽 가로 장식줄
  for (let col = 0; col <= ISO.cols; col++) {
    const s = isoToScreen(col, 0);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - ISO.tileH / 2);
    ctx.lineTo(s.x, s.y - ISO.tileH / 2 - wallH);
    ctx.strokeStyle = "rgba(150,80,110,0.12)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // 천장 라인
  ctx.strokeStyle = "#c898a8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(topLeft.x - ISO.tileW / 2, topLeft.y - ISO.tileH / 2 - wallH);
  ctx.lineTo(topLeft.x, topLeft.y - ISO.tileH / 2 - wallH);
  ctx.lineTo(topRight.x, topRight.y - ISO.tileH / 2 - wallH);
  ctx.stroke();

  // 벽 몰딩 (장식선)
  const moldingY = wallH * 0.3;
  ctx.strokeStyle = "#d8a8b8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(topLeft.x - ISO.tileW / 2, topLeft.y - ISO.tileH / 2 - moldingY);
  ctx.lineTo(topLeft.x, topLeft.y - ISO.tileH / 2 - moldingY);
  ctx.lineTo(topRight.x, topRight.y - ISO.tileH / 2 - moldingY);
  ctx.stroke();

  // 왼쪽 벽에도 몰딩
  ctx.beginPath();
  ctx.moveTo(topLeft.x, topLeft.y - ISO.tileH / 2 - moldingY);
  ctx.lineTo(botLeft.x - ISO.tileW / 2 + ISO.tileW, botLeft.y - moldingY);
  ctx.stroke();
}

// ─── 배치된 가구 그리기 ─────────────────────────────────────────
function drawItems() {
  // 아이소 깊이 정렬 (뒤에서 앞으로)
  const sorted = [...placedItems].sort((a, b) => (a.col + a.row) - (b.col + b.row));

  sorted.forEach(item => {
    const sprite = SPRITES[item.spriteKey];
    if (!sprite) return;
    const s = isoToScreen(item.col, item.row);
    const x = s.x - sprite.width / 2 + (item.offsetX || 0);
    const y = s.y - sprite.height + ISO.tileH / 2 + (item.offsetY || 0);
    ctx.drawImage(sprite, x, y);

    // 선택된 아이템 하이라이트
    if (selectedItem && selectedItem.id === item.id) {
      ctx.strokeStyle = "#ff80a0";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x - 2, y - 2, sprite.width + 4, sprite.height + 4);
      ctx.setLineDash([]);
    }
  });
}

function render() {
  drawRoom();
  drawItems();
}

// ─── 가구 패널 생성 ─────────────────────────────────────────────
const FURNITURE_LIST = [
  { key: "bed", name: "침대" },
  { key: "desk", name: "책상" },
  { key: "bookshelf", name: "책장" },
  { key: "sofa", name: "소파" },
  { key: "plant", name: "화분" },
  { key: "rug", name: "러그" },
  { key: "lamp", name: "조명" },
  { key: "mirror", name: "거울" },
  { key: "table", name: "테이블" },
  { key: "window", name: "창문" },
];

const grid = document.getElementById("furnitureGrid");

FURNITURE_LIST.forEach(furn => {
  const item = document.createElement("div");
  item.className = "furniture-item";
  item.draggable = true;

  // 미리보기 캔버스
  const sprite = SPRITES[furn.key];
  const preview = document.createElement("canvas");
  const maxDim = 80;
  const scale = Math.min(maxDim / sprite.width, maxDim / sprite.height);
  preview.width = Math.round(sprite.width * scale);
  preview.height = Math.round(sprite.height * scale);
  const pctx = preview.getContext("2d");
  pctx.imageSmoothingEnabled = false;
  pctx.drawImage(sprite, 0, 0, preview.width, preview.height);

  const label = document.createElement("span");
  label.textContent = furn.name;

  item.appendChild(preview);
  item.appendChild(label);
  grid.appendChild(item);

  // 패널에서 드래그 시작
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("furnitureKey", furn.key);
    e.dataTransfer.effectAllowed = "copy";
    // 투명 드래그 이미지 사용 (직접 ghost 그림)
    const blank = document.createElement("canvas");
    blank.width = 1; blank.height = 1;
    e.dataTransfer.setDragImage(blank, 0, 0);
    dragging = { source: "panel", key: furn.key };
    isDraggingFromPanel = true;
  });

  item.addEventListener("dragend", () => {
    isDraggingFromPanel = false;
    dragging = null;
    gctx.clearRect(0, 0, ROOM_W, ROOM_H);
  });

  // 터치 지원
  item.addEventListener("touchstart", (e) => {
    e.preventDefault();
    dragging = { source: "panel", key: furn.key };
    touchActive = true;
  }, { passive: false });
});

// ─── 인터랙션 상태 ──────────────────────────────────────────────
let dragging = null;
let isDraggingFromPanel = false;
let touchActive = false;
let selectedItem = null;
let dragOffsetX = 0, dragOffsetY = 0;
let mousePos = { x: 0, y: 0 };

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = ROOM_W / rect.width;
  const scaleY = ROOM_H / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top) * scaleY,
  };
}

function getIsoAtPos(cx, cy) {
  const iso = screenToIso(cx, cy);
  return iso;
}

// 캔버스 드래그오버
canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  const pos = getCanvasPos(e);
  mousePos = pos;
  drawGhost(pos.x, pos.y, dragging ? dragging.key : null);
});

canvas.addEventListener("dragleave", () => {
  gctx.clearRect(0, 0, ROOM_W, ROOM_H);
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  const key = e.dataTransfer.getData("furnitureKey") || (dragging && dragging.key);
  if (!key) return;

  const pos = getCanvasPos(e);
  const iso = getIsoAtPos(pos.x, pos.y);

  if (dragging && dragging.source === "panel") {
    // 새 가구 배치
    placedItems.push({
      id: Date.now(),
      spriteKey: key,
      col: iso.col,
      row: iso.row,
      offsetX: 0,
      offsetY: 0,
    });
  } else if (dragging && dragging.source === "placed") {
    // 기존 가구 이동
    const item = placedItems.find(i => i.id === dragging.id);
    if (item) {
      item.col = iso.col;
      item.row = iso.row;
    }
  }

  dragging = null;
  isDraggingFromPanel = false;
  gctx.clearRect(0, 0, ROOM_W, ROOM_H);
  render();
  setStatus(`${FURNITURE_LIST.find(f => f.key === key)?.name || key} 배치 완료!`);
});

// 캔버스 위 가구 드래그 시작
canvas.addEventListener("mousedown", (e) => {
  const pos = getCanvasPos(e);
  const clicked = findItemAt(pos.x, pos.y);
  if (clicked) {
    selectedItem = clicked;
    const sprite = SPRITES[clicked.spriteKey];
    const s = isoToScreen(clicked.col, clicked.row);
    dragOffsetX = pos.x - (s.x - sprite.width / 2 + (clicked.offsetX || 0));
    dragOffsetY = pos.y - (s.y - sprite.height + ISO.tileH / 2 + (clicked.offsetY || 0));
    dragging = { source: "placed", id: clicked.id, key: clicked.spriteKey };
    render();
    e.preventDefault();
  } else {
    selectedItem = null;
    render();
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!dragging || dragging.source !== "placed") return;
  const pos = getCanvasPos(e);
  const iso = getIsoAtPos(pos.x, pos.y);
  const item = placedItems.find(i => i.id === dragging.id);
  if (item) {
    item.col = iso.col;
    item.row = iso.row;
  }
  render();
  drawGhost(pos.x, pos.y, null);
});

canvas.addEventListener("mouseup", () => {
  if (dragging && dragging.source === "placed") {
    dragging = null;
    gctx.clearRect(0, 0, ROOM_W, ROOM_H);
    render();
  }
});

// 터치 이벤트
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const pos = getCanvasPos(e);
  const clicked = findItemAt(pos.x, pos.y);
  if (clicked) {
    selectedItem = clicked;
    dragging = { source: "placed", id: clicked.id, key: clicked.spriteKey };
    render();
  }
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const pos = getCanvasPos(e);

  if (dragging && dragging.source === "placed") {
    const iso = getIsoAtPos(pos.x, pos.y);
    const item = placedItems.find(i => i.id === dragging.id);
    if (item) { item.col = iso.col; item.row = iso.row; }
    render();
  } else if (touchActive && dragging && dragging.source === "panel") {
    drawGhost(pos.x, pos.y, dragging.key);
  }
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  const changedTouch = e.changedTouches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = ROOM_W / rect.width;
  const scaleY = ROOM_H / rect.height;
  const pos = {
    x: (changedTouch.clientX - rect.left) * scaleX,
    y: (changedTouch.clientY - rect.top) * scaleY,
  };

  if (dragging && dragging.source === "panel") {
    const iso = getIsoAtPos(pos.x, pos.y);
    placedItems.push({
      id: Date.now(),
      spriteKey: dragging.key,
      col: iso.col,
      row: iso.row,
      offsetX: 0, offsetY: 0,
    });
    setStatus(`${FURNITURE_LIST.find(f => f.key === dragging.key)?.name} 배치 완료!`);
  }

  dragging = null;
  touchActive = false;
  gctx.clearRect(0, 0, ROOM_W, ROOM_H);
  render();
}, { passive: false });

// 키보드: 선택 아이템 삭제
window.addEventListener("keydown", (e) => {
  if ((e.key === "Delete" || e.key === "Backspace") && selectedItem) {
    const idx = placedItems.findIndex(i => i.id === selectedItem.id);
    if (idx !== -1) {
      const name = FURNITURE_LIST.find(f => f.key === placedItems[idx].spriteKey)?.name || "";
      placedItems.splice(idx, 1);
      selectedItem = null;
      render();
      setStatus(`${name} 제거됨`);
    }
  }
});

// ─── 헬퍼 ──────────────────────────────────────────────────────
function findItemAt(cx, cy) {
  // 뒤에서부터 탐색 (위에 있는 것 우선)
  for (let i = placedItems.length - 1; i >= 0; i--) {
    const item = placedItems[i];
    const sprite = SPRITES[item.spriteKey];
    const s = isoToScreen(item.col, item.row);
    const x = s.x - sprite.width / 2 + (item.offsetX || 0);
    const y = s.y - sprite.height + ISO.tileH / 2 + (item.offsetY || 0);
    if (cx >= x && cx <= x + sprite.width && cy >= y && cy <= y + sprite.height) {
      return item;
    }
  }
  return null;
}

function drawGhost(cx, cy, key) {
  gctx.clearRect(0, 0, ROOM_W, ROOM_H);
  const spriteKey = key || (dragging && dragging.key);
  if (!spriteKey) return;
  const sprite = SPRITES[spriteKey];
  if (!sprite) return;

  const iso = getIsoAtPos(cx, cy);
  const s = isoToScreen(iso.col, iso.row);
  const x = s.x - sprite.width / 2;
  const y = s.y - sprite.height + ISO.tileH / 2;

  gctx.globalAlpha = 0.55;
  gctx.drawImage(sprite, x, y);
  gctx.globalAlpha = 1;

  // 타일 하이라이트
  const tw = ISO.tileW, th = ISO.tileH;
  gctx.beginPath();
  gctx.moveTo(s.x, s.y - th / 2);
  gctx.lineTo(s.x + tw / 2, s.y);
  gctx.lineTo(s.x, s.y + th / 2);
  gctx.lineTo(s.x - tw / 2, s.y);
  gctx.closePath();
  gctx.strokeStyle = "#ff80a0";
  gctx.lineWidth = 2;
  gctx.stroke();
  gctx.fillStyle = "rgba(255,128,160,0.15)";
  gctx.fill();
}

function setStatus(msg) {
  document.getElementById("statusBar").textContent = msg;
}

// ─── UI 버튼 ───────────────────────────────────────────────────
document.getElementById("btnFurniture").addEventListener("click", () => {
  const panel = document.getElementById("furniturePanel");
  panel.classList.toggle("hidden");
});

document.getElementById("closePanel").addEventListener("click", () => {
  document.getElementById("furniturePanel").classList.add("hidden");
});

document.getElementById("btnSave").addEventListener("click", () => {
  const data = JSON.stringify(placedItems);
  localStorage.setItem("innera_room", data);
  setStatus("저장 완료! ✓");
  setTimeout(() => setStatus("방을 꾸며보세요! 가구를 드래그해서 배치하세요."), 2000);
});

// 저장된 배치 불러오기
(function loadSaved() {
  try {
    const saved = localStorage.getItem("innera_room");
    if (saved) {
      const items = JSON.parse(saved);
      items.forEach(i => placedItems.push(i));
      setStatus("이전 배치를 불러왔습니다.");
    }
  } catch (e) { /* 무시 */ }
})();

// ─── 초기 렌더 ──────────────────────────────────────────────────
render();
setStatus("가구 버튼을 눌러 가구 패널을 열고, 가구를 드래그해서 방에 배치하세요! (선택 후 Delete로 삭제)");
