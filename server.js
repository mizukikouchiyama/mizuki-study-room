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

// 静的ファイル配信 (public/ ディレクトリ)
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------
// プレイヤー状態の管理
// Map<socketId, { x, y, name, status }>
// ---------------------------------------------------------------
const players = new Map();

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
