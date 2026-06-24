import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // React 개발 서버나 모바일 클라이언트 접속 허용
    methods: ["GET", "POST"],
  },
});

// clerkId -> socketId 매핑
const userSocketMap = {};
// clerkId -> activity 정보 (status: "Listening"|"Idle", activity: "Song - Artist"|null)
const userActivities = {};

export function getReceiverSocketId(clerkId) {
  return userSocketMap[clerkId];
}

io.on("connection", (socket) => {
  const clerkId = socket.handshake.query.clerkId;
  console.log(`User connected: ${clerkId}, socketId: ${socket.id}`);

  if (clerkId) {
    userSocketMap[clerkId] = socket.id;
    // 초기 활동 상태 설정
    if (!userActivities[clerkId]) {
      userActivities[clerkId] = { status: "Idle", activity: null };
    }
  }

  // 연결된 모든 클라이언트에게 실시간 온라인 목록 및 활동 브로드캐스트
  io.emit("getOnlineUsers", {
    onlineIds: Object.keys(userSocketMap),
    activities: userActivities,
  });

  // 사용자의 활동(재생 곡 정보)이 변경되었을 때
  socket.on("update_activity", (data) => {
    // data: { status: "Listening" | "Idle", activity: string | null }
    if (clerkId) {
      userActivities[clerkId] = data;
      io.emit("getOnlineUsers", {
        onlineIds: Object.keys(userSocketMap),
        activities: userActivities,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${clerkId}, socketId: ${socket.id}`);
    if (clerkId) {
      delete userSocketMap[clerkId];
      delete userActivities[clerkId];
    }
    io.emit("getOnlineUsers", {
      onlineIds: Object.keys(userSocketMap),
      activities: userActivities,
    });
  });
});

export { app, io, server };
