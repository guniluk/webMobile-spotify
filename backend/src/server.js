import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, getAuth, verifyToken } from "@clerk/express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/connectDB.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";

// 필수 환경변수 검사
if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
  console.warn(
    "⚠️ Warning: CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY is missing from environment variables.",
  );
}

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// HTTP 서버와 Socket.io 서버 연결
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket.io Clerk 인증 미들웨어
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    // 토큰이 없더라도 연결은 허용하고, auth는 빈 값으로 설정
    return next();
  }

  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    socket.auth = {
      userId: decoded.sub,
      token,
    };
    next();
  } catch (err) {
    console.error("Socket authentication error:", err.message);
    // 토큰이 유효하지 않아도 연결은 유지하되 auth는 설정하지 않음
    next();
  }
});

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

// 테스트 라우트 (Clerk 검증 포함)
app.get("/", (req, res) => {
  const auth = getAuth(req);
  res.json({
    message: "Spotify Backend is running!",
    clerkId: auth?.userId || null,
  });
});

// Socket.io 테스트
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // 로그인한 유저에게만 알림 보내기
  if (socket.auth?.userId) {
    socket.emit("welcome", `Welcome ${socket.auth.userId}!`);
  }

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 데이터베이스 연결, 서버 시작
httpServer.listen(port, () => {
  connectDB();
  console.log(`✅ Server is running on port ${port}`);
});
