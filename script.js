// ════════════════════════════════════════════════════════════════
//  INNERA 방꾸미기  –  단일 캔버스 + 순수 마우스 드래그
// ════════════════════════════════════════════════════════════════

// ── 캔버스 초기화 ────────────────────────────────────────────────
const canvas = document.getElementById("roomCanvas");
const ctx    = canvas.getContext("2d");
const W = 800, H = 600;
canvas.width  = W;
canvas.height = H;

// ── 아이소메트릭 상수 ────────────────────────────────────────────
const TW    = 80;   // 타일 가로 (다이아몬드 전체 폭)
const TH    = 40;   // 타일 세로 (다이아몬드 전체 높이)
const COLS  = 8;
const ROWS  = 6;
const WALLH = 175;
const OX    = W / 2;   // 아이소 원점 X  (far corner)
const OY    = 195;     // 아이소 원점 Y

function iso(col, row) {
  return {
    x: OX + (col - row) * TW / 2,
    y: OY + (col + row) * TH / 2,
  };
}

function screenToIso(sx, sy) {
  const dx = sx - OX, dy = sy - OY;
  const col = Math.round((dx / (TW / 2) + dy / (TH / 2)) / 2);
  const row = Math.round((dy / (TH / 2) - dx / (TW / 2)) / 2);
  return {
    col: Math.max(0, Math.min(COLS - 1, col)),
    row: Math.max(0, Math.min(ROWS - 1, row)),
  };
}

// 마우스 clientX/Y → 캔버스 내부 좌표
function toCanvas(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (clientX - r.left) * (W / r.width),
    y: (clientY - r.top)  * (H / r.height),
  };
}

function isOverCanvas(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return clientX >= r.left && clientX <= r.right
      && clientY >= r.top  && clientY <= r.bottom;
}

// ════════════════════════════════════════════════════════════════
//  픽셀아트 스프라이트
// ════════════════════════════════════════════════════════════════
function px(c, color, x, y, w, h) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function makeSprite(fn, w, h, scale) {
  scale = scale || 3;
  const src = document.createElement("canvas");
  src.width = w; src.height = h;
  fn(src.getContext("2d"));
  const out = document.createElement("canvas");
  out.width = w * scale; out.height = h * scale;
  const oc = out.getContext("2d");
  oc.imageSmoothingEnabled = false;
  oc.drawImage(src, 0, 0, w * scale, h * scale);
  return out;
}

// ─── 스프라이트 정의 ─────────────────────────────────────────────
var S = {};

// 침대
S.bed = makeSprite(function(c) {
  // 헤드보드
  px(c,"#c04868",0,0,24,7);
  px(c,"#d05878",1,1,22,5);
  px(c,"#e06888",2,2,20,3);
  // 프레임
  px(c,"#d05878",0,6,24,17);
  // 이불
  px(c,"#ffb0c8",1,7,22,13);
  px(c,"#ff98b4",1,17,22,3);
  // 이불 주름
  px(c,"#e898b0",6,8,1,11);
  px(c,"#e898b0",12,8,1,11);
  px(c,"#e898b0",18,8,1,11);
  // 베개
  px(c,"#fff0f5",2,8,8,6); px(c,"#ffe0ec",3,9,6,4);
  px(c,"#e0b8c8",2,8,8,1); px(c,"#e0b8c8",2,8,1,6);
  px(c,"#fff0f5",14,8,8,6); px(c,"#ffe0ec",15,9,6,4);
  px(c,"#e0b8c8",14,8,8,1); px(c,"#e0b8c8",14,8,1,6);
  // 프레임 하단
  px(c,"#b03858",0,22,24,2);
  // 다리
  px(c,"#901838",1,24,4,3);
  px(c,"#901838",19,24,4,3);
}, 24, 27, 4);

// 책상
S.desk = makeSprite(function(c) {
  // 노트북
  px(c,"#2a3040",2,0,12,1);
  px(c,"#3a4050",2,1,12,5);
  px(c,"#6080c8",3,2,10,3);
  px(c,"#fff",5,3,1,1);
  px(c,"#1a2030",1,6,14,1);
  // 머그컵
  px(c,"#fff",15,2,4,4);
  px(c,"#f0e0e0",16,3,2,2);
  px(c,"#ddd",15,6,4,1);
  px(c,"#ddd",19,3,1,2);
  // 상판
  px(c,"#e0a868",0,7,22,3);
  px(c,"#f0b878",0,6,22,1);
  px(c,"#c08848",0,10,22,1);
  // 서랍장
  px(c,"#c88848",0,11,10,14);
  px(c,"#d89858",1,12,8,12);
  px(c,"#b87838",0,17,10,1);
  px(c,"#e8b068",3,14,4,2);
  px(c,"#e8b068",3,19,4,2);
  // 오른쪽 다리
  px(c,"#c08840",13,11,3,14);
  px(c,"#c08840",19,11,3,14);
}, 22, 25, 4);

// 책장
S.bookshelf = makeSprite(function(c) {
  px(c,"#985838",0,0,16,32);
  px(c,"#b06848",1,1,14,30);
  // 선반
  px(c,"#804828",1,9,14,2);
  px(c,"#804828",1,19,14,2);
  px(c,"#804828",1,28,14,3);
  // 1단 책
  px(c,"#e03838",2,2,2,7); px(c,"#f04040",2,2,1,7);
  px(c,"#3880e0",4,2,2,7); px(c,"#4890f0",4,2,1,7);
  px(c,"#d0b020",6,2,2,7); px(c,"#e0c030",6,2,1,7);
  px(c,"#38b038",8,2,2,7); px(c,"#48c048",8,2,1,7);
  px(c,"#b030b0",10,2,2,7); px(c,"#c040c0",10,2,1,7);
  px(c,"#e06020",12,3,2,6); px(c,"#f07030",12,3,1,6);
  // 2단 책
  px(c,"#20a870",2,11,3,8); px(c,"#30b880",2,11,1,8);
  px(c,"#d05020",5,11,3,8); px(c,"#e06030",5,11,1,8);
  px(c,"#5050d0",9,11,2,8); px(c,"#6060e0",9,11,1,8);
  px(c,"#d02050",12,11,2,8); px(c,"#e03060",12,11,1,8);
  // 3단 소품
  px(c,"#e08818",2,21,3,7);
  px(c,"#7018b0",6,21,2,7);
  px(c,"#18b080",9,21,3,7);
  px(c,"#707070",12,22,2,6);
  px(c,"#909090",13,22,1,3);
}, 16, 32, 4);

// 소파
S.sofa = makeSprite(function(c) {
  // 등받이
  px(c,"#b86080",0,0,30,13);
  px(c,"#c87090",1,1,28,11);
  // 등받이 쿠션
  px(c,"#ffa8c0",2,2,12,9); px(c,"#ffb8cc",3,3,10,7);
  px(c,"#ffa8c0",16,2,12,9); px(c,"#ffb8cc",17,3,10,7);
  px(c,"#d888a8",14,2,2,9);
  // 방석
  px(c,"#c87090",0,13,30,11);
  px(c,"#d888a0",1,14,28,9);
  px(c,"#ffb8cc",1,14,14,9); px(c,"#ffc8d8",2,15,12,7);
  px(c,"#ffb8cc",16,14,14,9); px(c,"#ffc8d8",17,15,12,7);
  px(c,"#c87090",15,14,1,10);
  // 팔걸이
  px(c,"#b86080",0,0,4,24); px(c,"#c87090",1,1,2,22);
  px(c,"#b86080",26,0,4,24); px(c,"#c87090",27,1,2,22);
  // 다리
  px(c,"#907060",2,24,3,3); px(c,"#907060",25,24,3,3);
}, 30, 27, 4);

// 화분
S.plant = makeSprite(function(c) {
  // 잎사귀 (여러 클러스터)
  px(c,"#38a018",3,9,5,4); px(c,"#48b028",4,8,4,3); px(c,"#58c038",5,9,3,2);
  px(c,"#28900a",2,11,6,2);
  px(c,"#38a018",8,7,6,5); px(c,"#48b028",9,6,4,4);
  px(c,"#28900a",7,11,7,2);
  px(c,"#48b028",5,4,5,5); px(c,"#58c038",6,5,3,3);
  px(c,"#38a018",3,7,4,3); px(c,"#38a018",10,9,4,3);
  px(c,"#18780a",5,12,5,2);
  // 줄기
  px(c,"#487828",7,12,2,4);
  // 화분 테두리
  px(c,"#d05030",5,16,8,1);
  // 화분 몸통
  px(c,"#e06040",4,17,10,8);
  px(c,"#f07050",5,17,8,7);
  px(c,"#c05030",4,17,1,8);
  // 화분 바닥
  px(c,"#b04020",3,24,12,2);
  px(c,"#c05030",4,24,10,1);
  // 흙
  px(c,"#503018",5,16,8,2);
}, 18, 26, 4);

// 러그
S.rug = makeSprite(function(c) {
  // 바탕
  px(c,"#f0b0c0",0,0,32,22);
  // 테두리
  px(c,"#c87090",0,0,32,2); px(c,"#c87090",0,20,32,2);
  px(c,"#c87090",0,0,2,22); px(c,"#c87090",30,0,2,22);
  // 중간 테두리
  px(c,"#e090a8",2,2,28,18);
  // 내부
  px(c,"#f8c0d0",5,5,22,12);
  // 꽃 패턴 (중앙)
  px(c,"#ff6090",13,7,6,8);
  px(c,"#ff80a8",14,8,4,6);
  px(c,"#ff4080",15,9,2,4);
  // 꽃 꽃잎
  px(c,"#ff80a8",11,9,3,4); px(c,"#ff80a8",18,9,3,4);
  px(c,"#ff80a8",14,5,4,3); px(c,"#ff80a8",14,14,4,3);
  // 코너 패턴
  px(c,"#e070a0",3,3,4,4); px(c,"#e070a0",25,3,4,4);
  px(c,"#e070a0",3,15,4,4); px(c,"#e070a0",25,15,4,4);
}, 32, 22, 4);

// 조명 스탠드
S.lamp = makeSprite(function(c) {
  // 갓
  px(c,"#ffe090",3,0,10,1);
  px(c,"#ffd070",2,1,12,1);
  px(c,"#ffc050",1,2,14,6);
  px(c,"#ffb030",2,8,12,1);
  px(c,"#ffa020",3,9,10,1);
  // 갓 내부 빛
  px(c,"#fff8e8",4,2,8,6);
  px(c,"#fffcf0",5,3,6,4);
  // 폴대
  px(c,"#b09070",7,10,2,16);
  px(c,"#c8a888",7,10,1,16);
  // 받침
  px(c,"#907050",3,26,10,2);
  px(c,"#a08060",4,25,8,2);
  px(c,"#807050",2,28,12,1);
}, 16, 29, 4);

// 거울
S.mirror = makeSprite(function(c) {
  // 프레임 (금색)
  px(c,"#d4a040",0,0,14,24);
  px(c,"#e8b850",1,1,12,22);
  // 코너 장식
  px(c,"#c09030",0,0,3,3); px(c,"#c09030",11,0,3,3);
  px(c,"#c09030",0,21,3,3); px(c,"#c09030",11,21,3,3);
  // 거울 유리
  px(c,"#b0d0e8",2,2,10,19);
  px(c,"#c8e4f4",3,3,7,6);
  px(c,"#a0c0d8",2,18,10,2);
  // 하이라이트
  px(c,"#e8f4ff",3,3,4,4);
  px(c,"#d0e8f8",6,4,2,5);
  // 받침대
  px(c,"#c09030",4,24,6,3);
  px(c,"#d0a040",5,24,4,2);
  px(c,"#b08020",3,26,8,1);
}, 14, 27, 4);

// 테이블
S.table = makeSprite(function(c) {
  // 상판 위 소품 - 컵
  px(c,"#fff",1,0,5,5);
  px(c,"#f0d8d8",2,1,3,3);
  px(c,"#ddd",1,5,5,1);
  px(c,"#bbb",6,2,1,2);
  // 찻잔 받침
  px(c,"#f8f0e8",0,5,7,1);
  // 접시+디저트
  px(c,"#f0e8d0",9,1,7,2); px(c,"#e0d0b0",10,2,5,1);
  px(c,"#f06080",11,0,3,2);
  px(c,"#f8a0c0",12,0,1,1);
  // 꽃병
  px(c,"#80c0f0",17,0,4,5);
  px(c,"#a0d8ff",18,0,2,4);
  px(c,"#60a0d0",17,5,4,1);
  px(c,"#50c040",18,-2,2,3);
  px(c,"#40b030",19,-3,1,2);
  // 상판
  px(c,"#e0a858",0,6,22,3);
  px(c,"#f0b868",0,5,22,1);
  px(c,"#c09848",0,9,22,1);
  // 다리
  px(c,"#c09040",1,10,4,14);
  px(c,"#d0a050",2,11,2,12);
  px(c,"#c09040",17,10,4,14);
  px(c,"#d0a050",18,11,2,12);
}, 22, 24, 4);

// 창문
S.window = makeSprite(function(c) {
  // 커튼
  px(c,"#e8c8f8",0,0,4,28); px(c,"#d0a8e8",0,0,3,28);
  px(c,"#e8c8f8",18,0,4,28); px(c,"#d0a8e8",19,0,3,28);
  // 프레임
  px(c,"#e0c888",3,0,16,28);
  px(c,"#d0b870",4,1,14,26);
  // 밤하늘
  px(c,"#080830",5,2,12,22);
  px(c,"#101850",5,2,12,8);
  // 별
  px(c,"#fff",7,4,1,1); px(c,"#fff",11,3,1,1);
  px(c,"#fff",14,5,1,1); px(c,"#fff",8,7,1,1);
  px(c,"#ccd",6,10,1,1); px(c,"#ccd",13,9,1,1);
  px(c,"#fff",10,12,1,1); px(c,"#ccd",16,11,1,1);
  // 달
  px(c,"#ffe090",12,3,5,8);
  px(c,"#080830",14,3,4,6);
  // 구름 실루엣
  px(c,"#1a2070",5,18,12,4);
  px(c,"#1a2070",5,16,5,3);
  px(c,"#1a2070",10,15,7,4);
  // 창살
  px(c,"#d0b870",11,2,1,22);
  px(c,"#d0b870",5,13,12,1);
  // 창틀 아랫부분
  px(c,"#e0c888",3,25,16,3);
  px(c,"#f0d898",4,26,14,2);
}, 22, 28, 4);

// 고양이 포스터
S.poster = makeSprite(function(c) {
  // 액자
  px(c,"#e06868",0,0,14,18);
  px(c,"#f07878",1,1,12,16);
  // 배경
  px(c,"#fff5f8",2,2,10,13);
  // 고양이 얼굴
  px(c,"#fffae8",4,4,6,8);
  px(c,"#fff0d0",5,5,4,6);
  // 귀
  px(c,"#fffae8",3,3,3,3); px(c,"#ffccdd",4,4,2,2);
  px(c,"#fffae8",8,3,3,3); px(c,"#ffccdd",8,4,2,2);
  // 눈
  px(c,"#60a030",4,6,2,2); px(c,"#60a030",8,6,2,2);
  px(c,"#111",5,6,1,1); px(c,"#111",9,6,1,1);
  px(c,"#fff",5,6,1,1);
  // 코
  px(c,"#ffaacc",6,8,2,1);
  // 수염
  px(c,"#aaa",2,8,3,1); px(c,"#aaa",9,8,3,1);
  px(c,"#aaa",2,9,3,1); px(c,"#aaa",9,9,3,1);
  // 입
  px(c,"#cc8888",6,9,1,1);
  px(c,"#bb7777",5,10,1,1); px(c,"#bb7777",8,10,1,1);
  // 하단 텍스트 영역
  px(c,"#f090a0",2,14,10,1);
  px(c,"#fff",3,14,8,1);
}, 14, 18, 4);

// ════════════════════════════════════════════════════════════════
//  방 배경 그리기
// ════════════════════════════════════════════════════════════════
function drawRoom() {
  // 배경
  ctx.fillStyle = "#1a0812";
  ctx.fillRect(0, 0, W, H);

  // ── 바닥 타일 ──────────────────────────────────────────────────
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      var s = iso(col, row);
      ctx.beginPath();
      ctx.moveTo(s.x,          s.y - TH/2);
      ctx.lineTo(s.x + TW/2,   s.y);
      ctx.lineTo(s.x,          s.y + TH/2);
      ctx.lineTo(s.x - TW/2,   s.y);
      ctx.closePath();
      ctx.fillStyle = (col + row) % 2 === 0 ? "#e8a8b8" : "#d898a8";
      ctx.fill();
      ctx.strokeStyle = "#b87888";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // ── 왼쪽 벽 ───────────────────────────────────────────────────
  var far    = iso(0, 0);
  var farL   = { x: far.x - TW/2, y: far.y };
  var botL   = iso(0, ROWS);
  var botLx  = botL.x - TW/2;

  ctx.fillStyle = "#f0c0d0";
  ctx.beginPath();
  ctx.moveTo(farL.x,  farL.y);
  ctx.lineTo(far.x,   far.y - TH/2);
  ctx.lineTo(far.x,   far.y - TH/2 - WALLH);
  ctx.lineTo(farL.x,  farL.y - WALLH);
  ctx.lineTo(botLx,   botL.y - WALLH);
  ctx.lineTo(botLx,   botL.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c898b0";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 왼쪽 벽 격자 (벽지 느낌)
  ctx.strokeStyle = "rgba(190,130,160,0.22)";
  ctx.lineWidth = 0.5;
  for (var r = 0; r <= ROWS; r++) {
    var sv = iso(0, r);
    ctx.beginPath();
    ctx.moveTo(sv.x - TW/2, sv.y);
    ctx.lineTo(sv.x - TW/2, sv.y - WALLH);
    ctx.stroke();
  }
  for (var hi = 0; hi <= 4; hi++) {
    var yoff = (WALLH / 4) * hi;
    ctx.beginPath();
    ctx.moveTo(farL.x, farL.y - yoff);
    ctx.lineTo(botLx,  botL.y - yoff);
    ctx.stroke();
  }

  // ── 뒷벽 (오른쪽) ─────────────────────────────────────────────
  var farR = iso(COLS, 0);
  var farTop = { x: far.x, y: far.y - TH/2 };
  var farRTop = { x: farR.x, y: farR.y - TH/2 };

  ctx.fillStyle = "#e8b0c4";
  ctx.beginPath();
  ctx.moveTo(farTop.x,  farTop.y);
  ctx.lineTo(farRTop.x, farRTop.y);
  ctx.lineTo(farRTop.x, farRTop.y - WALLH);
  ctx.lineTo(farTop.x,  farTop.y - WALLH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c090a8";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 뒷벽 격자
  ctx.strokeStyle = "rgba(175,110,148,0.2)";
  ctx.lineWidth = 0.5;
  for (var c2 = 0; c2 <= COLS; c2++) {
    var sc = iso(c2, 0);
    ctx.beginPath();
    ctx.moveTo(sc.x, sc.y - TH/2);
    ctx.lineTo(sc.x, sc.y - TH/2 - WALLH);
    ctx.stroke();
  }
  for (var h2 = 0; h2 <= 4; h2++) {
    var yo = (WALLH / 4) * h2;
    ctx.beginPath();
    ctx.moveTo(farTop.x,  farTop.y - yo);
    ctx.lineTo(farRTop.x, farRTop.y - yo);
    ctx.stroke();
  }

  // ── 천장선 / 몰딩 ─────────────────────────────────────────────
  ctx.strokeStyle = "#c088a0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(farL.x,   farL.y - WALLH);
  ctx.lineTo(farTop.x, farTop.y - WALLH);
  ctx.lineTo(farRTop.x, farRTop.y - WALLH);
  ctx.stroke();

  // 크라운 몰딩
  ctx.strokeStyle = "#d8a0b8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(farL.x,   farL.y - WALLH + 14);
  ctx.lineTo(farTop.x, farTop.y - WALLH + 14);
  ctx.lineTo(farRTop.x, farRTop.y - WALLH + 14);
  ctx.stroke();

  // 걸레받이
  ctx.strokeStyle = "#e8c0d4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(farL.x,  farL.y - 10);
  ctx.lineTo(botLx,   botL.y - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(farTop.x,  farTop.y - 10);
  ctx.lineTo(farRTop.x, farRTop.y - 10);
  ctx.stroke();
}

// ════════════════════════════════════════════════════════════════
//  배치된 가구 & 드래그 상태
// ════════════════════════════════════════════════════════════════
var placed = [];   // { id, key, col, row }
var selId  = null; // 선택된 가구 id

// 드래그 상태
var drag = {
  active:  false,
  type:    null,   // "panel" | "canvas"
  key:     null,
  id:      null,
  origCol: 0, origRow: 0,
  ghostCol: -1, ghostRow: -1,
  onCanvas: false,
};

function spritePos(item) {
  var sp = S[item.key];
  var s  = iso(item.col, item.row);
  return {
    x: Math.round(s.x - sp.width / 2),
    y: Math.round(s.y - sp.height + TH / 2),
    w: sp.width,
    h: sp.height,
  };
}

function drawItems() {
  // 깊이 정렬
  var list = placed.slice().sort(function(a, b) {
    var ac = (drag.active && drag.type === "canvas" && drag.id === a.id && drag.onCanvas)
             ? drag.ghostCol + drag.ghostRow : a.col + a.row;
    var bc = (drag.active && drag.type === "canvas" && drag.id === b.id && drag.onCanvas)
             ? drag.ghostCol + drag.ghostRow : b.col + b.row;
    return ac - bc;
  });

  list.forEach(function(item) {
    var sp = S[item.key];
    if (!sp) return;

    var col = item.col, row = item.row;
    var alpha = 1;

    if (drag.active && drag.type === "canvas" && drag.id === item.id) {
      if (drag.onCanvas) {
        col = drag.ghostCol;
        row = drag.ghostRow;
        alpha = 0.7;
      }
    }

    var s = iso(col, row);
    var ix = Math.round(s.x - sp.width / 2);
    var iy = Math.round(s.y - sp.height + TH / 2);

    ctx.globalAlpha = alpha;
    ctx.drawImage(sp, ix, iy);
    ctx.globalAlpha = 1;

    // 선택 표시 (드래그 중이 아닐 때만)
    if (selId === item.id && !drag.active) {
      ctx.strokeStyle = "#ff80b0";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(ix - 2, iy - 2, sp.width + 4, sp.height + 4);
      ctx.setLineDash([]);
    }
  });
}

function drawTileHighlight(col, row) {
  var s = iso(col, row);
  ctx.beginPath();
  ctx.moveTo(s.x,        s.y - TH/2);
  ctx.lineTo(s.x + TW/2, s.y);
  ctx.lineTo(s.x,        s.y + TH/2);
  ctx.lineTo(s.x - TW/2, s.y);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,100,150,0.28)";
  ctx.fill();
  ctx.strokeStyle = "#ff80b0";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawPanelGhost() {
  if (!drag.active || drag.type !== "panel" || !drag.onCanvas) return;
  var sp = S[drag.key];
  if (!sp) return;
  var s = iso(drag.ghostCol, drag.ghostRow);
  var ix = Math.round(s.x - sp.width / 2);
  var iy = Math.round(s.y - sp.height + TH / 2);
  ctx.globalAlpha = 0.65;
  ctx.drawImage(sp, ix, iy);
  ctx.globalAlpha = 1;
}

function render() {
  drawRoom();
  // 타일 하이라이트 (바닥 위, 가구 아래)
  if (drag.active && drag.onCanvas) {
    drawTileHighlight(drag.ghostCol, drag.ghostRow);
  }
  drawItems();
  drawPanelGhost();
}

// ════════════════════════════════════════════════════════════════
//  마우스 이벤트
// ════════════════════════════════════════════════════════════════
function updateGhost(clientX, clientY) {
  if (!isOverCanvas(clientX, clientY)) {
    drag.onCanvas = false;
    return;
  }
  drag.onCanvas = true;
  var c = toCanvas(clientX, clientY);
  var g = screenToIso(c.x, c.y);
  drag.ghostCol = g.col;
  drag.ghostRow = g.row;
}

// 캔버스 클릭 → 가구 선택 / 드래그 시작
canvas.addEventListener("mousedown", function(e) {
  if (drag.active) return;
  var c = toCanvas(e.clientX, e.clientY);
  // 뒤에서부터 탐색 (위에 있는 가구 우선)
  for (var i = placed.length - 1; i >= 0; i--) {
    var item = placed[i];
    var sp = S[item.key];
    if (!sp) continue;
    var s = iso(item.col, item.row);
    var ix = s.x - sp.width / 2;
    var iy = s.y - sp.height + TH / 2;
    if (c.x >= ix && c.x <= ix + sp.width && c.y >= iy && c.y <= iy + sp.height) {
      selId = item.id;
      drag.active  = true;
      drag.type    = "canvas";
      drag.key     = item.key;
      drag.id      = item.id;
      drag.origCol = item.col;
      drag.origRow = item.row;
      drag.ghostCol = item.col;
      drag.ghostRow = item.row;
      drag.onCanvas = true;
      render();
      e.preventDefault();
      return;
    }
  }
  selId = null;
  render();
});

// 전역 mousemove – 드래그 중 ghost 갱신
document.addEventListener("mousemove", function(e) {
  if (!drag.active) return;
  updateGhost(e.clientX, e.clientY);
  render();
});

// 전역 mouseup – 드롭 처리
document.addEventListener("mouseup", function(e) {
  if (!drag.active) return;
  updateGhost(e.clientX, e.clientY);

  if (drag.onCanvas) {
    if (drag.type === "panel") {
      var newId = Date.now();
      placed.push({ id: newId, key: drag.key, col: drag.ghostCol, row: drag.ghostRow });
      selId = newId;
      setStatus(FLIST.find(function(f){ return f.key === drag.key; }).name + " 배치 완료!");
    } else {
      // canvas drag → 위치 업데이트
      var it = placed.find(function(x){ return x.id === drag.id; });
      if (it) { it.col = drag.ghostCol; it.row = drag.ghostRow; }
    }
  } else {
    // 캔버스 밖에 드롭 → 원위치 복원
    if (drag.type === "canvas") {
      var it2 = placed.find(function(x){ return x.id === drag.id; });
      if (it2) { it2.col = drag.origCol; it2.row = drag.origRow; }
    }
  }

  drag.active = false;
  drag.type   = null;
  drag.key    = null;
  drag.id     = null;
  drag.onCanvas = false;
  render();
});

// Delete / Backspace → 선택 가구 삭제
window.addEventListener("keydown", function(e) {
  if ((e.key === "Delete" || e.key === "Backspace") && selId && !drag.active) {
    var idx = placed.findIndex(function(x){ return x.id === selId; });
    if (idx !== -1) {
      var name = (FLIST.find(function(f){ return f.key === placed[idx].key; }) || {}).name || "가구";
      placed.splice(idx, 1);
      selId = null;
      render();
      setStatus(name + " 제거됨");
    }
  }
});

// ════════════════════════════════════════════════════════════════
//  가구 패널
// ════════════════════════════════════════════════════════════════
var FLIST = [
  { key: "bed",       name: "침대" },
  { key: "desk",      name: "책상" },
  { key: "bookshelf", name: "책장" },
  { key: "sofa",      name: "소파" },
  { key: "plant",     name: "화분" },
  { key: "rug",       name: "러그" },
  { key: "lamp",      name: "조명" },
  { key: "mirror",    name: "거울" },
  { key: "table",     name: "테이블" },
  { key: "window",    name: "창문" },
  { key: "poster",    name: "포스터" },
];

function buildPanel() {
  var grid = document.getElementById("furnitureGrid");
  FLIST.forEach(function(furn) {
    var el = document.createElement("div");
    el.className = "furniture-item";

    var sp = S[furn.key];
    var PMAX = 70;
    var sc = Math.min(PMAX / sp.width, PMAX / sp.height);
    var pw = Math.round(sp.width * sc);
    var ph = Math.round(sp.height * sc);

    var pc = document.createElement("canvas");
    pc.width = pw; pc.height = ph;
    pc.style.imageRendering = "pixelated";
    var pctx = pc.getContext("2d");
    pctx.imageSmoothingEnabled = false;
    pctx.drawImage(sp, 0, 0, pw, ph);

    var span = document.createElement("span");
    span.textContent = furn.name;

    el.appendChild(pc);
    el.appendChild(span);
    grid.appendChild(el);

    // 패널 아이템 mousedown → 드래그 시작
    el.addEventListener("mousedown", function(e) {
      e.preventDefault();
      drag.active   = true;
      drag.type     = "panel";
      drag.key      = furn.key;
      drag.onCanvas = false;
      render();
    });
  });
}

// ════════════════════════════════════════════════════════════════
//  UI 버튼
// ════════════════════════════════════════════════════════════════
function setStatus(msg) {
  document.getElementById("statusBar").textContent = msg;
}

document.getElementById("btnFurniture").addEventListener("click", function() {
  document.getElementById("furniturePanel").classList.toggle("hidden");
});

document.getElementById("closePanel").addEventListener("click", function() {
  document.getElementById("furniturePanel").classList.add("hidden");
});

document.getElementById("btnSave").addEventListener("click", function() {
  try {
    localStorage.setItem("innera_room", JSON.stringify(placed));
    setStatus("저장 완료! ✓");
    setTimeout(function() { setStatus("가구를 드래그해 배치하세요. 선택 후 Delete 키로 삭제"); }, 2000);
  } catch(err) {
    setStatus("저장 실패 (로컬스토리지를 지원하지 않는 환경입니다)");
  }
});

document.getElementById("btnClear").addEventListener("click", function() {
  if (placed.length === 0) return;
  placed.length = 0;
  selId = null;
  render();
  setStatus("초기화 완료");
});

// ════════════════════════════════════════════════════════════════
//  초기화
// ════════════════════════════════════════════════════════════════
// 저장된 배치 불러오기
try {
  var saved = localStorage.getItem("innera_room");
  if (saved) {
    JSON.parse(saved).forEach(function(i) { placed.push(i); });
  }
} catch(e) { /* 무시 */ }

buildPanel();
render();
setStatus("우상단 [가구] 버튼으로 패널 열기 → 가구를 방으로 드래그해 배치 → 배치된 가구 클릭 후 드래그로 이동 | Delete로 삭제");
