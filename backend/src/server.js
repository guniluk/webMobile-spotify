import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import { connectDB } from "./lib/connectDB.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import { app, server } from "./lib/socket.js";

// required environment variable check
if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
  console.warn(
    "Warning: CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY is missing from environment variables.",
  );
}

const port = process.env.PORT || 3000;
const __dirname = path.resolve();
// middleware
app.use(
  cors({
    origin: "*", // 프론트엔드 호스트가 다양할 수 있으므로 cors 허용
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware()); //this will add auth to the request object => req.auth(.userId)
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limit: {
      fileSize: 10 * 1024 * 1024, // 10 mb
    },
  }),
);

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

// error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// connect db and start server
server.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
