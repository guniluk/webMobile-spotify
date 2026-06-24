# 🔌 Socket.io 실시간 통신 및 Clerk 연동 최종 가이드

본 문서는 백엔드(Node.js/Express), 웹 프론트엔드(React/Tailwind), 모바일 앱(Expo/React Native) 환경에서 Clerk 인증과 Socket.io를 결합하여 실시간 양방향 통신 시스템을 구축하는 전체 단계를 초보자도 쉽게 따라 할 수 있도록 설명합니다.

---

## 📌 실시간 통신 및 인증 아키텍처

```text
 [웹 프론트엔드 / 모바일 앱]               [Clerk 서버]               [백엔드 (Node/Express)]
        │                                  │                                  │
        ├───────── 1. 로그인 요청 ────────>│                                  │
        │<── 2. JWT 세션 토큰 발급 ────────┤                                  │
        │                                  │                                  │
        │                                  │<── 3. 유저 생성 Webhook 알림 ───┤ (유저 DB 동기화)
        │                                  │                                  │
        ├────────────────────── 4. 소켓 연결 요청 (Socket.io) ───────────────>│ (JWT 토큰 혹은 Clerk ID 전달)
        │                                                                     │ ──> JWT 검증 후 연결 허가
        │<───────────────────── 5. 소켓 연결 완료 (Connected) ────────────────┤ [userSocketMap]에 세션 매핑
```

---

## 🛠️ 1단계. Clerk 홈페이지 설정 (인증 및 웹훅 준비)

Socket.io를 통해 실시간 데이터를 안전하게 주고받기 전에, 사용자가 안전하게 로그인되어 있는지 확인하기 위해 Clerk 설정을 먼저 진행해야 합니다.

### 1) Clerk 애플리케이션 생성 및 API 키 획득
1. [Clerk Dashboard](https://dashboard.clerk.com/)에 로그인합니다.
2. **Add Application**을 눌러 새 애플리케이션을 생성합니다. (Social Login 종류 및 기본 이메일 설정 등 진행)
3. 생성 완료 후 대시보드의 **API Keys** 메뉴로 이동합니다.
4. 다음 두 가지 키를 복사하여 준비해둡니다:
   - **Publishable Key** (프론트엔드 및 모바일 앱용): `pk_test_...`
   - **Secret Key** (백엔드 API용): `sk_test_...`

### 2) 웹훅(Webhooks) 설정 (Clerk 유저 -> 백엔드 DB 동기화)
Clerk에서 가입한 유저 정보가 백엔드 데이터베이스(MongoDB 등)에 실시간으로 동기화되어 있어야 실시간 소켓 통신 시 상대방의 프로필 정보를 정상적으로 매핑할 수 있습니다.
1. Clerk Dashboard 좌측 메뉴에서 **Webhooks**로 이동한 뒤 **Add Endpoint**를 클릭합니다.
2. **Endpoint URL**에 백엔드의 웹훅 수신 주소를 입력합니다. (예: `https://your-domain.com/api/webhooks/clerk` 또는 로컬 테스트 시 `ngrok`을 통한 임시 터널 주소 사용)
3. **Message Filtering**에서 아래 3가지 이벤트를 선택합니다:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. **Create**를 클릭하여 엔드포인트를 생성합니다.
5. 생성된 화면의 우측 하단에서 **Signing Secret** (`whsec_...`)을 복사합니다. 이 값은 백엔드에서 Clerk 웹훅 요청의 유효성을 검증할 때 사용합니다.

---

## 💻 2단계. 백엔드(Backend - Express) 설정 및 코딩

Express 서버에 Socket.io 서버 객체를 바인딩하고, 접속한 클라이언트 세션(Clerk ID 기반)을 메모리 맵핑하여 실시간 통신을 처리합니다.

### 1) 의존성 설치
백엔드 폴더(`backend/`)에서 Socket.io 패키지를 설치합니다.
```bash
cd backend
npm install socket.io
```

### 2) 환경 변수 설정 (`.env`)
백엔드 루트 디렉토리의 `.env` 파일에 Clerk 정보를 추가합니다.
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### 3) 소켓 인프라 모듈 구현 (`backend/src/lib/socket.js`)
사용자의 Clerk ID와 소켓 세션 ID를 매핑하는 소켓 서버 설정 코드입니다.
```javascript
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Socket.io 서버 초기화 및 CORS 허용
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // 프론트엔드 웹 포트 허용
    methods: ["GET", "POST"]
  }
});

// 로그인한 사용자 ID(clerkId)와 고유 소켓 ID를 매핑하는 객체
const userSocketMap = {}; 

// 상대방의 clerkId로 소켓 ID를 찾는 헬퍼 함수
export const getReceiverSocketId = (clerkId) => {
  return userSocketMap[clerkId];
};

io.on("connection", (socket) => {
  // 클라이언트 소켓 연결 시 쿼리 파라미터로 clerkId를 전달받음
  const clerkId = socket.handshake.query.clerkId;
  
  if (clerkId) {
    userSocketMap[clerkId] = socket.id;
    console.log(`[Socket.io] 유저 접속: ${clerkId} (소켓 ID: ${socket.id})`);
  }

  // 연결된 모든 유저에게 현재 온라인 상태인 Clerk ID 목록 전송
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // 유저의 실시간 활동 상태(예: 음악 듣는 중) 업데이트 수신
  socket.on("update_activity", ({ status, activity }) => {
    io.emit("activity_updated", {
      clerkId,
      status,
      activity
    });
  });

  // 연결이 끊어졌을 때의 처리
  socket.on("disconnect", () => {
    if (clerkId) {
      delete userSocketMap[clerkId];
      console.log(`[Socket.io] 유저 접속 종료: ${clerkId}`);
    }
    // 접속 해제 후 온라인 유저 목록 갱신 및 전송
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
```

### 4) 엔트리포인트 통합 (`backend/src/server.js`)
기존 `app.listen`을 사용하던 코드를 `socket.js`에서 생성한 HTTP `server.listen`으로 교체합니다.
```javascript
import { app, server } from "./lib/socket.js";
import connectDB from "./lib/connectDB.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;

// 웹훅 및 일반 API 라우트 등록 (예시)
// app.use("/api/webhooks/clerk", clerkWebhookRouter);
// app.use("/api/users", userRouter);

// ⚠️ 기존 app.listen(PORT) 대신 server.listen(PORT)를 반드시 사용해야 소켓이 정상 작동합니다.
server.listen(PORT, () => {
  console.log(`[Server] 포트 ${PORT}에서 실행 중`);
  connectDB();
});
```

---

## 🌐 3단계. 웹 프론트엔드(Frontend - React) 설정 및 코딩

React 클라이언트에서 Clerk 로그인 상태를 감지하여 소켓 연결을 수립하고, Zustand 스토어를 통해 실시간 이벤트를 전역에서 관리합니다.

### 1) 의존성 설치
프론트엔드 디렉토리(`frontend/`)에서 소켓 클라이언트와 Clerk React SDK를 설치합니다.
```bash
cd frontend
npm install socket.io-client @clerk/clerk-react
```

### 2) Zustand 실시간 상태 스토어 작성 (`frontend/src/store/useChatStore.js`)
```javascript
import { create } from "zustand";
import { io } from "socket.io-client";

export const useChatStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  messages: [],

  // 소켓 연결 함수
  connectSocket: (clerkId) => {
    const currentSocket = get().socket;
    if (currentSocket && currentSocket.connected) return; // 이미 연결되어 있으면 중복 연결 차단

    // 백엔드 소켓 주소로 연결 요청 (쿼리에 Clerk ID 동봉)
    const socket = io("http://localhost:3000", {
      query: { clerkId },
      reconnection: true
    });

    set({ socket });

    // 실시간 온라인 유저 목록 업데이트 수신
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // 실시간 새 메시지 수신 리스너 등록
    socket.on("newMessage", (message) => {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });
  },

  // 소켓 연결 해제 함수
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      socket.disconnect();
      set({ socket: null });
    }
  }
}));
```

### 3) React 라이프사이클 동기화 훅 구현 (`frontend/src/hooks/useSocketSync.js`)
Clerk의 로그인 여부에 따라 자동으로 소켓을 연결하고 끊어주는 커스텀 훅을 만듭니다.
```javascript
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useChatStore } from "../store/useChatStore";

export const useSocketSync = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { connectSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    if (isSignedIn && user?.id) {
      connectSocket(user.id); // 로그인하면 자동으로 소켓 연결
    } else {
      disconnectSocket(); // 로그아웃하면 연결 해제
    }

    return () => {
      disconnectSocket(); // 컴포넌트 언마운트 시 안전하게 해제
    };
  }, [isSignedIn, user, connectSocket, disconnectSocket]);
};
```

### 4) 최상위 컴포넌트 적용 (`frontend/src/App.jsx`)
```jsx
import React from "react";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { useSocketSync } from "./hooks/useSocketSync";
import ChatRoom from "./components/ChatRoom";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppContent() {
  // 💡 소켓 연결 상태를 Clerk Auth 상태와 동기화
  useSocketSync();

  return (
    <div className="app-container">
      <SignedIn>
        <ChatRoom />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AppContent />
    </ClerkProvider>
  );
}
```

---

## 📱 4단계. 모바일 앱(Mobile - Expo/React Native) 설정 및 코딩

Expo 모바일 프로젝트 환경은 웹 브라우저와 네트워크 통신 및 저장소 구조가 다르기 때문에, 세션 암호화 캐싱(SecureStore) 및 웹소켓 직접 통신 설정을 주의해서 처리해야 합니다.

### 1) 의존성 설치
모바일 디렉토리(`mobile/`)에서 필요한 라이브러리를 설치합니다.
```bash
cd mobile
npx expo install socket.io-client @clerk/clerk-expo expo-secure-store
```

### 2) Clerk Token Cache 구현 (`mobile/src/utils/tokenCache.js`)
모바일 기기에 로그인 세션 토큰을 안전하게 암호화하여 유지할 수 있도록 `expo-secure-store`를 활용한 캐싱 유틸을 생성합니다.
```javascript
import * as SecureStore from "expo-secure-store";

export const tokenCache = {
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.error("SecureStore getToken error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  }
};
```

### 3) Zustand 모바일 스토어 작성 (`mobile/src/store/useMobileChatStore.js`)
```javascript
import { create } from "zustand";
import { io } from "socket.io-client";
import { Platform } from "react-native";

export const useMobileChatStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  messages: [],

  connectSocket: (clerkId) => {
    const currentSocket = get().socket;
    if (currentSocket && currentSocket.connected) return;

    // 💡 모바일 개발 환경별 백엔드 로컬 IP 설정 분기 처리
    const BACKEND_URL = Platform.select({
      ios: "http://localhost:3000",
      android: "http://10.0.2.2:3000", // Android 에뮬레이터용 로컬 백엔드 루프백 IP
      default: "http://192.168.0.x:3000" // ⚠️ 실제 모바일 기기(실기기) 테스트 시 본인 PC의 로컬 IP 입력
    });

    const socket = io(BACKEND_URL, {
      query: { clerkId },
      transports: ["websocket"], // 💡 중요: React Native에서는 롱폴링 에러 방지 및 연결 안정성을 위해 websocket 직접 지정 권장
      reconnection: true
    });

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("newMessage", (message) => {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      socket.disconnect();
      set({ socket: null });
    }
  }
}));
```

### 4) 모바일 라이프사이클 훅 (`mobile/src/hooks/useMobileSocketSync.js`)
```javascript
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useMobileChatStore } from "../store/useMobileChatStore";

export const useMobileSocketSync = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { connectSocket, disconnectSocket } = useMobileChatStore();

  useEffect(() => {
    if (isSignedIn && user?.id) {
      connectSocket(user.id);
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isSignedIn, user, connectSocket, disconnectSocket]);
};
```

### 5) Expo Entry Point 설정 (`mobile/src/app/_layout.jsx` 또는 `App.jsx`)
```jsx
import React from "react";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { tokenCache } from "../utils/tokenCache";
import { useMobileSocketSync } from "../hooks/useMobileSocketSync";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function RootLayoutContent() {
  // 모바일 앱 로그인 상태에 맞춰 소켓 연결 동기화 구동
  useMobileSocketSync();

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkLoaded>
        <RootLayoutContent />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
```

---

## ⚡ 5단계. 1:1 채팅 메시지 실시간 전송 흐름 (전체 흐름 요약)

구현이 완료되면 실시간 채팅 메시지는 아래의 흐름을 통해 발송되고 실시간으로 수신됩니다.

1. **클라이언트(웹/앱)에서 메시지 발송 API 요청** (HTTPS POST):
   ```javascript
   // backend/src/controllers/message.controller.js
   export const sendMessage = async (req, res) => {
     try {
       const { text, image } = req.body;
       const { id: receiverId } = req.params;
       const senderId = req.auth.userId; // Clerk Auth 미들웨어를 거친 요청자 ID

       const newMessage = new Message({ senderId, receiverId, text, image });
       await newMessage.save();

       // 💡 상대방이 현재 소켓에 연결되어 온라인인지 파악
       const receiverSocketId = getReceiverSocketId(receiverId);
       if (receiverSocketId) {
         // 상대방 소켓 세션에 다이렉트로 새 메시지 실시간 발송
         io.to(receiverSocketId).emit("newMessage", newMessage);
       }

       res.status(201).json(newMessage);
     } catch (error) {
       res.status(500).json({ error: "Internal Server Error" });
     }
   };
   ```

---

## 💡 6단계. 트러블슈팅 및 핵심 꿀팁

### 1) 중복 리스너 버그 (`socket.off` 처리 필수)
React 컴포넌트나 Zustand 스토어가 새로 리렌더링될 때 `socket.on`이 중복 호출되면 동일한 리스너가 여러 개 누적 등록되어 데이터가 여러 번 중복하여 수신되는 버그가 발생합니다.
- **예방 요령**:
  ```javascript
  // 새로운 이벤트를 리스닝하기 직전에 반드시 기존 리스너를 off 해주세요.
  socket.off("newMessage");
  socket.on("newMessage", (msg) => { ... });
  ```

### 2) 모바일(Android/iOS) 실기기 접속 불가 현상
Expo를 실제 스마트폰 기기(Expo Go 앱)에 띄우고 테스트할 때 `localhost` 주소는 모바일 기기 본인을 가리키므로 컴퓨터 백엔드 서버에 접속이 되지 않습니다.
- **예방 요령**:
  - 개발 PC와 테스트 스마트폰이 **동일한 Wi-Fi 네트워크**에 연결되어 있는지 확인합니다.
  - PC의 로컬 IP(예: `192.168.0.123`)를 파악한 뒤, 모바일 소켓 연결 주소로 설정해야 합니다: `const socket = io("http://192.168.0.123:3000")`.

### 3) JWT 만료로 인한 소켓 차단
보안 강화를 위해 단순 `clerkId` 쿼리가 아닌 Clerk JWT Session Token을 소켓 연결 핸드셰이크 헤더에 싣는 방식을 실무에 사용합니다.
- 토큰이 만료되었거나 끊겼을 때 클라이언트에서 토큰을 재발급(Refreshed) 받아 연결을 갱신하도록 구성하는 것이 좋습니다.
