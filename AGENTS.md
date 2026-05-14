# INNERA - 방꾸미기 프로젝트

## 프로젝트 개요
2.5D 아이소메트릭 픽셀아트 스타일의 방 꾸미기 웹 앱.
순수 HTML/CSS/JS 단일 파일(`index.html`)로 구성되어 GitHub Pages에서 호스팅.

라이브 URL: https://cho-sihyun.github.io/INNERA/

## 파일 구조
- `index.html` — 전체 앱 (CSS, JS, base64 이미지 모두 인라인)
- `style.css` — 독립 CSS (참고용, 실제 적용은 index.html 내부)
- `script.js` — 독립 JS (참고용, 실제 적용은 index.html 내부)
- `furniture.png` — 원본 가구 이미지 (와인테이블, 벤치, 컴퓨터책상)
- `furn_wineTable.png` / `furn_bench.png` / `furn_computerDesk.png` — 누끼 딴 개별 가구
- `.devcontainer/` — GitHub Codespaces 설정

## index.html 내부 구조
모든 코드가 하나의 파일에 인라인되어 있음 (CSP 우회 목적).

### 주요 JS 변수/함수
```
TW=80, TH=40, COLS=8, ROWS=6  // 아이소메트릭 그리드
OX=400, OY=195                  // 그리드 원점
WALLH=175                       // 벽 높이

isoXY(col, row)     // 그리드 좌표 → 화면 픽셀 좌표
xyToIso(sx, sy)     // 화면 픽셀 → 그리드 좌표 (드래그 시 사용)
clientToCanvas(cx, cy)  // 브라우저 클라이언트 좌표 → 캔버스 좌표

SP = {}             // 스프라이트 저장 객체
mkSprite(fn, w, h)  // 픽셀아트 캔버스 스프라이트 생성 (4x 스케일)
p(c, color, x, y, w, h)  // 픽셀아트 헬퍼

FLIST = { key: "한국어 이름", ... }  // 가구 목록 (11개 픽셀아트 + 3개 실사이미지)

placed = []         // 배치된 가구 배열 [{id, key, col, row}]
drag = {}           // 드래그 상태

drawRoom()          // 바닥/벽/몰딩 렌더링
drawItems()         // placed[] 기반 가구 렌더링
render()            // drawRoom + drawItems 통합 호출

addPanelItem(key)   // 패널에 가구 아이템 1개 추가 (비동기 이미지 로드 후 호출됨)
buildPanel()        // 모든 동기 스프라이트 패널 등록
```

### 가구 목록 (FLIST keys)
픽셀아트 (동기): bed, desk, bookshelf, sofa, plant, rug, lamp, mirror, table, window, poster
실사이미지 (비동기): wineTable, bench, computerDesk

### 실사이미지 로딩 패턴
```javascript
(function() {
  var im = new Image();
  im.onload = function() {
    var c = document.createElement("canvas");
    c.width = im.width; c.height = im.height;
    c.getContext("2d").drawImage(im, 0, 0);
    SP["wineTable"] = c;
    addPanelItem("wineTable");  // onload 안에서 패널 추가 (비동기 타이밍 이슈 해결)
  };
  im.src = "data:image/png;base64,...";
})();
```

### 드래그 시스템
HTML5 Drag API 대신 순수 mousedown/mousemove/mouseup 사용.
- 패널에서 드래그: `drag.type = "panel"`, `drag.key = key`
- 방 안 배치된 가구 드래그: `drag.type = "placed"`, `drag.id = id`
- `render()` 호출 시 드래그 중이면 마우스 위치에 고스트 이미지 표시

### 저장/불러오기
`localStorage`에 `placed` 배열을 JSON으로 저장 (`innera_room` 키).

## 개발 시 주의사항
- `index.html`은 1MB 이상 (base64 이미지 포함). 전체 파일 읽기 대신 `grep`으로 필요 부분만 탐색할 것.
- 새 가구 이미지 추가 시: FLIST에 key 등록 → Image 비동기 로딩 블록 추가 → onload에서 addPanelItem 호출
- 픽셀아트 가구 추가 시: `mkSprite()` 함수로 SP에 동기 등록 → buildPanel()이 자동 포함
- GitHub push 후 Pages 반영까지 1~2분 소요

## 현재 베타 상태 / 개선 희망 사항
- 가구 퀄리티 향상 (픽셀아트 디테일)
- 실사 가구 이미지 추가
- 방 배경/테마 변경 기능
- 가구 삭제 UI 개선 (현재: 클릭 선택 후 Delete 키)
