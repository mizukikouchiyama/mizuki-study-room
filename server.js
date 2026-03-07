/**
 * study-room-mvp / server.js
 * Node.js + Socket.io によるリアルタイム学習空間サーバー
 */

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');

const app    = express();
const server = http.createServer(app);

// ---------------------------------------------------------------
// Socket.io の初期化
// CORS全許可: 開発環境での別ポート・別ホストからの接続を保証
// ---------------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// JSON ボディパーサー（Bot API 用）
app.use(express.json());

// 静的ファイル配信 (public/ ディレクトリ)
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------
// プレイヤー状態の管理
// Map<socketId, { x, y, name, status }>
// ---------------------------------------------------------------
const players = new Map();

// ---------------------------------------------------------------
// Bot NPC 管理
// Discord Bot がステータスを送信すると、部屋にNPCとして表示
// ---------------------------------------------------------------
const BOT_ID = '__topik_bot__';
const BOT_PLAYER = {
  x: 480,       // 後列中央の机の位置
  y: 380,       // 机の前に座っている位置
  name: 'TOPIK Bot',
  status: 'normal',
  isBot: true,
  botStatus: 'idle',      // idle | working | done
  botMessage: '',
};
let botActive = false;
let botTimeout = null;
const BOT_TIMEOUT_MS = 5 * 60 * 1000; // 5分で自動退出

function activateBot() {
  if (!botActive) {
    botActive = true;
    // 全クライアントにBotの参加を通知
    io.emit('player_joined', { id: BOT_ID, ...BOT_PLAYER });
    console.log('[Bot NPC] Joined the room');
  }
  // タイムアウトをリセット
  if (botTimeout) clearTimeout(botTimeout);
  botTimeout = setTimeout(() => {
    deactivateBot();
  }, BOT_TIMEOUT_MS);
}

function deactivateBot() {
  if (botActive) {
    botActive = false;
    BOT_PLAYER.botStatus = 'idle';
    BOT_PLAYER.botMessage = '';
    BOT_PLAYER.status = 'normal';
    io.emit('player_left', { id: BOT_ID });
    console.log('[Bot NPC] Left the room (timeout)');
  }
  if (botTimeout) { clearTimeout(botTimeout); botTimeout = null; }
}

// ---------------------------------------------------------------
// Bot Status API エンドポイント
// POST /api/bot-status { status: "idle"|"working"|"done", message: "..." }
// ---------------------------------------------------------------
app.post('/api/bot-status', (req, res) => {
  const { status, message } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  console.log(`[Bot API] status=${status}, message=${message || ''}`);

  BOT_PLAYER.botStatus = status;
  BOT_PLAYER.botMessage = message || '';
  BOT_PLAYER.status = (status === 'working') ? 'focus' : 'normal';

  // Bot を部屋に参加させる（まだ入ってなければ）
  activateBot();

  // 全クライアントにBotステータスを通知
  io.emit('bot_status', {
    id: BOT_ID,
    status: BOT_PLAYER.status,
    botStatus: status,
    botMessage: BOT_PLAYER.botMessage,
  });

  res.json({ ok: true });
});

// GET /api/bot-status (現在の状態取得)
app.get('/api/bot-status', (req, res) => {
  res.json({
    active: botActive,
    botStatus: BOT_PLAYER.botStatus,
    botMessage: BOT_PLAYER.botMessage,
  });
});

io.on('connection', (socket) => {
  console.log(`[+] Connected   : ${socket.id}`);

  // ---------------------------------------------------------------
  // join: プレイヤー参加
  //  1. Mapに追加
  //  2. 参加プレイヤーに全員の現在データを送信 (init)
  //  3. 他全員に新プレイヤーを通知 (player_joined)
  // ---------------------------------------------------------------
  socket.on('join', (data) => {
    const player = {
      x:      data.x,
      y:      data.y,
      name:   String(data.name).slice(0, 16), // 名前の長さを制限
      status: 'normal'
    };
    players.set(socket.id, player);

    // 現在の全プレイヤーリスト（自分自身を含む）を送信
    const snapshot = [];
    players.forEach((p, id) => snapshot.push({ id, ...p }));
    // Bot NPC がアクティブなら含める
    if (botActive) {
      snapshot.push({ id: BOT_ID, ...BOT_PLAYER });
    }
    socket.emit('init', snapshot);

    // 他の全プレイヤーに新規参加を通知
    socket.broadcast.emit('player_joined', { id: socket.id, ...player });
    console.log(`  >> Joined as "${player.name}" (total: ${players.size})`);
  });

  // ---------------------------------------------------------------
  // move: 座標更新
  //  - サーバー側のデータを更新
  //  - 送信者以外の全クライアントに伝播 (broadcast)
  // ---------------------------------------------------------------
  socket.on('move', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    player.x = data.x;
    player.y = data.y;
    socket.broadcast.emit('player_moved', {
      id: socket.id,
      x:  data.x,
      y:  data.y
    });
  });

  // ---------------------------------------------------------------
  // status_change: 作業状態変更 (normal <-> focus)
  // ---------------------------------------------------------------
  socket.on('status_change', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    player.status = data.status;
    socket.broadcast.emit('player_status', {
      id:     socket.id,
      status: data.status
    });
  });

  // ---------------------------------------------------------------
  // chat_message: 全体チャット
  //  - 送信者名を付加して全員に配信（送信者自身にも返す）
  // ---------------------------------------------------------------
  socket.on('chat_message', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    const msg = {
      id: socket.id,
      name: player.name,
      text: String(data.text || '').slice(0, 200),
      timestamp: Date.now(),
      type: 'global'
    };
    io.emit('chat_message', msg);
  });

  // ---------------------------------------------------------------
  // dm_message: ダイレクトメッセージ（個人チャット）
  //  - 宛先と送信者の2人にのみ配信
  // ---------------------------------------------------------------
  socket.on('dm_message', (data) => {
    const sender = players.get(socket.id);
    if (!sender) return;
    const targetId = data.targetId;
    if (!targetId || !players.has(targetId)) return;
    const msg = {
      id: socket.id,
      name: sender.name,
      text: String(data.text || '').slice(0, 200),
      timestamp: Date.now(),
      type: 'dm',
      targetId: targetId,
      targetName: players.get(targetId).name
    };
    io.to(targetId).emit('dm_message', msg);
    socket.emit('dm_message', msg);
  });

  // ---------------------------------------------------------------
  // disconnect: 切断処理
  //  - Mapから確実に削除
  //  - io.emit (自分を含む全員) で通知することで、
  //    どのクライアントでもゴースト(残像)が残らないようにする
  // ---------------------------------------------------------------
  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('player_left', { id: socket.id });
    console.log(`[-] Disconnected: ${socket.id} (total: ${players.size})`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n✓  Study Room MVP  →  http://localhost:${PORT}\n`);
});
