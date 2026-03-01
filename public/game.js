const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas size
const W = 920;
const H = 700;
canvas.width = W;
canvas.height = H;

// Scale canvas to fit window
function resize() {
  const scaleX = window.innerWidth / W;
  const scaleY = window.innerHeight / H;
  const scale = Math.min(scaleX, scaleY);
  canvas.style.width = (W * scale) + 'px';
  canvas.style.height = (H * scale) + 'px';
}
resize();
window.addEventListener('resize', resize);

// Colors
const C = {
  floor: '#C8A87A',
  wall: '#B09060',
  wallTop: '#8B6914',
  border: '#5a3e1b',
  desk: '#8B7355',
  deskTop: '#A0845C',
  deskShadow: '#6B5335',
  monitor: '#111',
  monitorScreen: '#001a00',
  monitorCode1: '#00ff41',
  monitorCode2: '#00cc33',
  monitorBase: '#333',
  shelf: '#7a5230',
  shelfEdge: '#5a3810',
  book1: '#E74C3C', book2: '#F39C12', book3: '#27AE60',
  book4: '#9B59B6', book5: '#3498DB', book6: '#E67E22',
  sofa: '#2E7D32',
  sofaLight: '#388E3C',
  sofaCushion: '#F9A825',
  windowFrame: '#F5A623',
  windowGlass: '#87CEEB',
  windowCloud: '#fff',
  plant: '#228B22',
  plantPot: '#CC6633',
  whiteboard: '#F5F5F5',
  whiteboardFrame: '#DDD',
  projector: '#F5F5F5',
};

// Room layout
const ROOM = { x: 260, y: 60, w: 660, h: 720 };

// Furniture definitions (pixel art style)
const furniture = {
  drawWindow(x, y) {
    // Frame
    ctx.fillStyle = C.windowFrame;
    ctx.fillRect(x, y, 80, 70);
    // Glass
    ctx.fillStyle = C.windowGlass;
    ctx.fillRect(x+4, y+4, 72, 62);
    // Panes
    ctx.fillStyle = C.windowFrame;
    ctx.fillRect(x+38, y+4, 4, 62);
    ctx.fillRect(x+4, y+34, 72, 4);
    // Clouds
    ctx.fillStyle = C.windowCloud;
    ctx.fillRect(x+8, y+12, 18, 8);
    ctx.fillRect(x+6, y+16, 22, 6);
    ctx.fillRect(x+50, y+14, 14, 6);
    ctx.fillRect(x+48, y+18, 18, 5);
    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x+56, y+8, 10, 10);
    ctx.fillRect(x+58, y+6, 6, 14);
    ctx.fillRect(x+54, y+10, 14, 6);
  },

  drawDesk(x, y, w = 130) {
    const h = 18;
    const legH = 30;
    // Shadow
    ctx.fillStyle = C.deskShadow;
    ctx.fillRect(x+3, y+h+legH, w, 6);
    // Legs
    ctx.fillStyle = C.deskShadow;
    ctx.fillRect(x+8, y+h, 12, legH);
    ctx.fillRect(x+w-20, y+h, 12, legH);
    // Top surface
    ctx.fillStyle = C.deskTop;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = C.desk;
    ctx.fillRect(x, y+4, w, h-4);
    // Edge highlight
    ctx.fillStyle = '#C0A070';
    ctx.fillRect(x, y, w, 3);
  },

  drawMonitor(x, y) {
    // Stand
    ctx.fillStyle = C.monitorBase;
    ctx.fillRect(x+18, y+52, 14, 12);
    ctx.fillRect(x+10, y+62, 30, 6);
    // Screen border
    ctx.fillStyle = '#222';
    ctx.fillRect(x, y, 50, 46);
    // Screen
    ctx.fillStyle = C.monitorScreen;
    ctx.fillRect(x+3, y+3, 44, 38);
    // Code lines
    ctx.fillStyle = C.monitorCode1;
    ctx.fillRect(x+6, y+8, 24, 3);
    ctx.fillRect(x+6, y+14, 18, 3);
    ctx.fillRect(x+10, y+20, 20, 3);
    ctx.fillRect(x+6, y+26, 14, 3);
    ctx.fillRect(x+10, y+32, 22, 3);
    ctx.fillStyle = C.monitorCode2;
    ctx.fillRect(x+32, y+8, 8, 3);
    ctx.fillRect(x+26, y+14, 12, 3);
  },

  drawSmallMonitor(x, y) {
    ctx.fillStyle = '#222';
    ctx.fillRect(x, y, 40, 34);
    ctx.fillStyle = C.monitorScreen;
    ctx.fillRect(x+2, y+2, 36, 28);
    ctx.fillStyle = C.monitorCode1;
    ctx.fillRect(x+4, y+6, 18, 2);
    ctx.fillRect(x+4, y+11, 14, 2);
    ctx.fillRect(x+8, y+16, 16, 2);
    ctx.fillRect(x+4, y+21, 10, 2);
    // Stand
    ctx.fillStyle = C.monitorBase;
    ctx.fillRect(x+14, y+34, 12, 8);
    ctx.fillRect(x+8, y+40, 24, 5);
  },

  drawBookshelf(x, y) {
    const w = 55, h = 110;
    // Back
    ctx.fillStyle = C.shelfEdge;
    ctx.fillRect(x, y, w, h);
    // Shelves
    ctx.fillStyle = C.shelf;
    ctx.fillRect(x+2, y+2, w-4, h-4);
    // Shelf dividers
    ctx.fillStyle = C.shelfEdge;
    ctx.fillRect(x+2, y+37, w-4, 4);
    ctx.fillRect(x+2, y+72, w-4, 4);
    // Books row 1
    const books1 = [C.book1, C.book2, C.book3];
    books1.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x+4+i*16, y+6, 13, 28);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x+4+i*16, y+6, 2, 28);
    });
    // Books row 2
    const books2 = [C.book4, C.book5, C.book3];
    books2.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x+4+i*16, y+43, 13, 26);
    });
    // Books row 3
    const books3 = [C.book6, C.book1, C.book2];
    books3.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x+4+i*16, y+78, 13, 26);
    });
  },

  drawSofa(x, y) {
    const w = 200, h = 60;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x+4, y+h+4, w, 10);
    // Base
    ctx.fillStyle = C.sofa;
    ctx.fillRect(x, y+20, w, h-10);
    // Back
    ctx.fillStyle = C.sofaLight;
    ctx.fillRect(x, y, w, 24);
    // Armrests
    ctx.fillStyle = C.sofa;
    ctx.fillRect(x, y, 18, h);
    ctx.fillRect(x+w-18, y, 18, h);
    // Cushions
    ctx.fillStyle = C.sofaCushion;
    ctx.fillRect(x+22, y+28, 70, 26);
    ctx.fillRect(x+w-92, y+28, 70, 26);
    // Cushion highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x+22, y+28, 70, 8);
    ctx.fillRect(x+w-92, y+28, 70, 8);
  },

  drawTable(x, y) {
    ctx.fillStyle = C.deskShadow;
    ctx.fillRect(x+3, y+14, 194, 5);
    ctx.fillStyle = C.deskTop;
    ctx.fillRect(x, y, 200, 14);
    ctx.fillStyle = C.desk;
    ctx.fillRect(x, y+4, 200, 10);
  },

  drawPlant(x, y) {
    // Pot
    ctx.fillStyle = C.plantPot;
    ctx.fillRect(x+6, y+18, 16, 14);
    ctx.fillRect(x+4, y+16, 20, 4);
    // Plant
    ctx.fillStyle = C.plant;
    ctx.fillRect(x+10, y+6, 8, 12);
    ctx.fillRect(x+6, y+8, 8, 8);
    ctx.fillRect(x+14, y+8, 8, 8);
    ctx.fillRect(x+8, y+2, 12, 8);
  },

  drawWhiteboard(x, y) {
    // Frame
    ctx.fillStyle = '#DDD';
    ctx.fillRect(x, y, 170, 90);
    // Surface
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(x+4, y+4, 162, 76);
    // Content - bar chart
    ctx.fillStyle = '#333';
    ctx.fillRect(x+16, y+16, 80, 2);
    ctx.fillRect(x+16, y+24, 60, 2);
    ctx.fillRect(x+16, y+32, 90, 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x+16, y+40, 50, 2);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x+16, y+48, 70, 2);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(x+16, y+56, 40, 2);
    // Color squares bottom right
    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x+120, y+62, 10, 10);
    ctx.fillStyle = '#3498db'; ctx.fillRect(x+133, y+62, 10, 10);
    ctx.fillStyle = '#2ecc71'; ctx.fillRect(x+146, y+62, 10, 10);
  }
};

// Characters (pixel art, 8 styles)
const CHAR_COLORS = [
  { body: '#c0392b', hair: '#2c1810', skin: '#FDBCB4' },
  { body: '#2980b9', hair: '#1a1a2e', skin: '#FDBCB4' },
  { body: '#27ae60', hair: '#4a2c0a', skin: '#D4956A' },
  { body: '#8e44ad', hair: '#1a1a1a', skin: '#FDBCB4' },
  { body: '#e67e22', hair: '#2c1810', skin: '#D4956A' },
  { body: '#e74c3c', hair: '#F4D03F', skin: '#FDBCB4' },
  { body: '#1abc9c', hair: '#1a1a1a', skin: '#FDBCB4' },
  { body: '#f39c12', hair: '#2c1810', skin: '#D4956A' },
];

function drawCharacter(x, y, charIdx, name, focusing, isMe) {
  const c = CHAR_COLORS[charIdx % CHAR_COLORS.length];
  const px = Math.floor(x);
  const py = Math.floor(y);
  const S = 2; // pixel scale

  // Selection box for local player
  if (isMe) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 16, py - 28, 32, 36);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(px - 10, py + 6, 20, 6);

  // Body (shirt)
  ctx.fillStyle = c.body;
  ctx.fillRect(px - 8*S/2, py - 8*S, 8*S, 8*S);

  // Head
  ctx.fillStyle = c.skin;
  ctx.fillRect(px - 5*S/2 - 1, py - 14*S, 6*S, 6*S);

  // Hair
  ctx.fillStyle = c.hair;
  ctx.fillRect(px - 5*S/2 - 1, py - 14*S, 6*S, 2*S);
  ctx.fillRect(px - 5*S/2 - 1, py - 14*S, S, 4*S);

  // Eyes
  ctx.fillStyle = '#333';
  ctx.fillRect(px - 3, py - 14*S + 4, 2, 2);
  ctx.fillRect(px + 1, py - 14*S + 4, 2, 2);

  // Legs
  ctx.fillStyle = '#555';
  ctx.fillRect(px - 6, py - 0, 5, 8);
  ctx.fillRect(px + 1, py - 0, 5, 8);

  // Focus label
  if (focusing) {
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('集中中', px, py + 24);
  }

  // Name label
  ctx.fillStyle = isMe ? '#FFD700' : '#fff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  const star = isMe ? '★' : '';
  ctx.fillText(name + star, px, py - 32);
}

// Draw room
function drawRoom() {
  // Floor
  ctx.fillStyle = C.floor;
  ctx.fillRect(ROOM.x, ROOM.y + 120, ROOM.w, ROOM.h - 120);

  // Wall (upper portion)
  ctx.fillStyle = '#D4AA70';
  ctx.fillRect(ROOM.x, ROOM.y, ROOM.w, 130);

  // Wall/floor divider
  ctx.fillStyle = C.wallTop;
  ctx.fillRect(ROOM.x, ROOM.y + 118, ROOM.w, 6);

  // Room border
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);

  // Windows
  furniture.drawWindow(ROOM.x + 50, ROOM.y + 20);
  furniture.drawWindow(ROOM.x + ROOM.w - 130, ROOM.y + 20);

  // Whiteboard (center wall)
  furniture.drawWhiteboard(ROOM.x + ROOM.w/2 - 85, ROOM.y + 15);

  // Plants (4 corners of upper area)
  furniture.drawPlant(ROOM.x + 20, ROOM.y + 150);
  furniture.drawPlant(ROOM.x + 290, ROOM.y + 150);
  furniture.drawPlant(ROOM.x + 540, ROOM.y + 150);
  furniture.drawPlant(ROOM.x + ROOM.w - 50, ROOM.y + 150);

  // Left desk area
  furniture.drawDesk(ROOM.x + 80, ROOM.y + 220, 150);
  furniture.drawMonitor(ROOM.x + 110, ROOM.y + 160);

  // Right desk area
  furniture.drawDesk(ROOM.x + 400, ROOM.y + 220, 150);
  furniture.drawMonitor(ROOM.x + 430, ROOM.y + 160);

  // Far right small desk
  furniture.drawDesk(ROOM.x + 560, ROOM.y + 220, 90);
  furniture.drawSmallMonitor(ROOM.x + 575, ROOM.y + 172);

  // Bookshelf (bottom left)
  furniture.drawBookshelf(ROOM.x + 10, ROOM.y + 460);

  // Sofa area (bottom center)
  furniture.drawTable(ROOM.x + 280, ROOM.y + 490);
  furniture.drawSofa(ROOM.x + 265, ROOM.y + 520);
}

// Game state
let myId = null;
let players = {};
let myPlayer = { x: 450, y: 320, focusing: false, character: 0 };
let keys = {};
let focusing = false;
let ws = null;

// Input
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  keys[e.code] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    toggleFocus();
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  keys[e.code] = false;
});

document.getElementById('focusBtn').addEventListener('click', toggleFocus);

function toggleFocus() {
  focusing = !focusing;
  const btn = document.getElementById('focusBtn');
  const overlay = document.getElementById('focusOverlay');
  if (focusing) {
    btn.textContent = '集中解除';
    btn.classList.add('active');
    overlay.classList.add('show');
  } else {
    btn.textContent = '集中モード';
    btn.classList.remove('active');
    overlay.classList.remove('show');
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'focus', focusing }));
  }
  if (myId && players[myId]) {
    players[myId].focusing = focusing;
  }
}

// Movement bounds (inside room)
const BOUNDS = {
  left: ROOM.x + 20,
  right: ROOM.x + ROOM.w - 20,
  top: ROOM.y + 140,
  bottom: ROOM.y + ROOM.h - 20,
};

const SPEED = 2.5;

function update() {
  let dx = 0, dy = 0;
  if (keys['ArrowLeft'] || keys['KeyA'] || keys['a']) dx -= SPEED;
  if (keys['ArrowRight'] || keys['KeyD'] || keys['d']) dx += SPEED;
  if (keys['ArrowUp'] || keys['KeyW'] || keys['w']) dy -= SPEED;
  if (keys['ArrowDown'] || keys['KeyS'] || keys['s']) dy += SPEED;

  if (dx !== 0 || dy !== 0) {
    const newX = Math.max(BOUNDS.left, Math.min(BOUNDS.right, myPlayer.x + dx));
    const newY = Math.max(BOUNDS.top, Math.min(BOUNDS.bottom, myPlayer.y + dy));
    myPlayer.x = newX;
    myPlayer.y = newY;
    if (myId) {
      players[myId] = { ...players[myId], x: newX, y: newY };
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'move', x: newX, y: newY }));
    }
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, W, H);

  drawRoom();

  // Sort players by Y for depth
  const sorted = Object.values(players).sort((a, b) => a.y - b.y);
  sorted.forEach(p => {
    const isMe = p.id === myId;
    drawCharacter(p.x, p.y, p.character || 0, p.id ? p.id.slice(0, 4) : '??', p.focusing, isMe);
  });

  // Offline mode - draw local player
  if (!myId) {
    drawCharacter(myPlayer.x, myPlayer.y, myPlayer.character, 'YOU', focusing, true);
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

function updatePlayerCount() {
  const count = Object.keys(players).length;
  const id = myId ? myId.slice(0, 6) : '...';
  document.getElementById('playerCount').innerHTML =
    `${count}人<br><span style="font-size:11px;color:#aaa">ID: ${id}</span>`;
}

// WebSocket connection
function connect() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${proto}//${location.host}`);

  ws.onopen = () => {
    console.log('Connected to server');
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'init') {
      myId = msg.id;
      players = msg.players;
      myPlayer.x = players[myId]?.x ?? 450;
      myPlayer.y = players[myId]?.y ?? 320;
      updatePlayerCount();
    } else if (msg.type === 'playerJoin') {
      players[msg.player.id] = msg.player;
      updatePlayerCount();
    } else if (msg.type === 'playerMove') {
      if (players[msg.id] && msg.id !== myId) {
        players[msg.id].x = msg.x;
        players[msg.id].y = msg.y;
      }
    } else if (msg.type === 'playerFocus') {
      if (players[msg.id]) {
        players[msg.id].focusing = msg.focusing;
      }
    } else if (msg.type === 'playerCharacter') {
      if (players[msg.id]) {
        players[msg.id].character = msg.character;
      }
    } else if (msg.type === 'playerLeave') {
      delete players[msg.id];
      updatePlayerCount();
    }
  };

  ws.onclose = () => {
    console.log('Disconnected. Reconnecting in 3s...');
    myId = null;
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    ws.close();
  };
}

// Start
connect();
gameLoop();
