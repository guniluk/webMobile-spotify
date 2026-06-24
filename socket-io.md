# 🔌 Socket.io 실시간 통신(Real-Time Comm) 구축 및 연동 가이드

본 문서는 프로젝트에서 **Socket.io** 기술을 사용하여 백엔드와 프론트엔드 간의 실시간 양방향 통신 채널을 개설하고, 실시간 유저 활동 및 채팅 동시성을 구현하는 전 과정을 누구나 쉽게 따라 할 수 있도록 설명합니다.

---

## 📌 Socket.io 기본 동작 흐름

```text
  [프론트엔드 React]                                [백엔드 Node/Express]
          │                                                │
          ├────────── 1. 연결 요청 (Connect) ──────────────>│ (clerkId 쿼리 첨부)
          │                                                │
          │<────────── 2. 연결 승인 (Connected) ───────────┤ [userSocketMap]에 등록
          │                                                │
          ├──── 3. 실시간 활동 전송 (update_activity) ────>│
          │                                                │──> 다른 모든 온라인 유저에게
          │                                                │    활동 브로드캐스트
          │                                                │
          │<─── 4. 새 메시지 수신 (newMessage) ────────────┤ 1:1 소켓 타겟 발송 (emit)
```

---

## 1단계. 백엔드(Backend) 설정 및 구현

Express 서버에 Socket.io 서버 객체를 결합하고 접속 중인 클라이언트 세션을 관리합니다.

### 1) 의존성 설치
백엔드 폴더(`backend/`) 경로에서 Socket.io 패키지를 설치합니다.
```bash
cd backend
npm install socket.io
```

### 2) 소켓 인프라 모듈 구축 (`socket.js`)
백엔드에서 접속자 맵을 관리하고, 소켓 서버를 초기화하는 독립 모듈을 작성합니다.
파일 경로: `backend/src/lib/socket.js`
```javascript
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app); // Express와 공동 사용할 HTTP 서버 생성

// CORS 허용 설정을 포함한 Socket.io 서버 인스턴스 초기화
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // 프론트엔드 개발 서버 주소
    methods: ["GET", "POST", "DELETE"]
  }
});

// 로그인한 사용자 ID(clerkId)와 고유 소켓 ID를 매핑하는 인메모리 객체
const userSocketMap = {}; 

// 상대방의 clerkId로 소켓 ID를 찾는 헬퍼 함수
export const getReceiverSocketId = (clerkId) => {
  return userSocketMap[clerkId];
};

io.on("connection", (socket) => {
  // 1. 클라이언트가 연결할 때 쿼리 스트링으로 실어 보낸 clerkId를 획득합니다.
  const clerkId = socket.handshake.query.clerkId;
  
  if (clerkId) {
    userSocketMap[clerkId] = socket.id; // 사용자 ID에 소켓 세션 매핑
    console.log(`[Socket] 유저 접속 완료: ${clerkId} (소켓 ID: ${socket.id})`);
  }

  // 2. 현재 온라인 상태인 모든 유저 목록(clerkId 리스트)을 접속자 전원에게 전송합니다.
  io.emit("getOnlineUsers", {
    onlineIds: Object.keys(userSocketMap),
    activities: {} // 실시간 재생 정보 보관용 (선택)
  });

  // 3. 사용자의 실시간 재생 상태 갱신 이벤트를 수신합니다.
  socket.on("update_activity", ({ status, activity }) => {
    // 수신한 데이터를 가공하여 접속한 모든 사람에게 브로드캐스트합니다.
    io.emit("activity_updated", {
      clerkId,
      status,
      activity
    });
  });

  // 4. 소켓 연결이 끊어졌을 때의 처리 (브라우저 종료, 네트워크 유실 등)
  socket.on("disconnect", () => {
    if (clerkId) {
      delete userSocketMap[clerkId]; // 메모리 맵에서 삭제
      console.log(`[Socket] 유저 접속 종료: ${clerkId}`);
    }
    // 갱신된 온라인 유저 정보를 다시 배포합니다.
    io.emit("getOnlineUsers", {
      onlineIds: Object.keys(userSocketMap),
      activities: {}
    });
  });
});

export { app, io, server };
```

### 3) 엔트리포인트 통합 (`server.js`)
작성한 HTTP `server` 객체를 불러와 Express 포트 리스너 대신 실행합니다.
파일 경로: `backend/src/server.js`
```javascript
import { app, server } from "./lib/socket.js";
import connectDB from "./lib/connectDB.js";

const PORT = process.env.PORT || 3000;

// 기존 app.listen 대신 socket.js에서 묶은 server.listen을 사용해야 소켓이 구동됩니다.
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // 데이터베이스 연결
});
```

---

## 2단계. 프론트엔드(Frontend) 설정 및 구현

클라이언트 사이드에서 소켓 연결을 열고, 상태 저장소(Zustand)와 결합하여 실시간 렌더링에 사용합니다.

### 1) 의존성 설치
프론트엔드 폴더(`frontend/`) 경로에서 소켓 클라이언트 패키지를 설치합니다.
```bash
cd frontend
npm install socket.io-client
```

### 2) Zustand 스토어 내 소켓 핸들링 설정 (`useChatStore.ts`)
클라이언트 소켓의 수명(연결/끊기) 및 데이터 리스닝은 전역 상태 저장소인 Zustand 안에서 관리하는 것이 안전합니다.
파일 경로: `frontend/src/store/useChatStore.ts`
```typescript
import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface ChatStore {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: (clerkId: string) => void;
  disconnectSocket: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  onlineUsers: [],

  // 소켓 서버 연결 수립 함수
  connectSocket: (clerkId: string) => {
    const currentSocket = get().socket;
    
    // 이미 소켓이 연결되어 있다면 중복 생성을 원천 차단합니다.
    if (currentSocket && currentSocket.connected) return;

    // 소켓 서버 주소로 쿼리 정보(clerkId)를 포함하여 연결 시도
    const socket = io("http://localhost:3000", {
      query: { clerkId },
      reconnection: true, // 자동 재연결 활성화
      reconnectionDelay: 1000 // 재연결 지연 시간 (1초)
    });

    set({ socket });

    // 실시간 이벤트 리스너 바인딩
    socket.on("getOnlineUsers", (data: { onlineIds: string[] }) => {
      set({ onlineUsers: data.onlineIds });
    });

    // 💡 메모리 누수를 피하기 위해 동일 이벤트 리스너는 바인딩 전 off 해주는 습관이 중요합니다.
    socket.off("messagesCleared");
    socket.on("messagesCleared", (data: { clearedWith: string }) => {
      // 메시지 일괄 삭제 실시간 동시성 연동 예시
      const selectedUser = useChatStore.getState().selectedUser;
      if (selectedUser && selectedUser._id === data.clearedWith) {
        useChatStore.setState({ messages: [] });
      }
    });
  },

  // 소켓 서버 연결 해제 함수
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesCleared");
      socket.disconnect();
      set({ socket: null });
    }
  }
}));
```

### 3) 생명주기 동기화 훅 제작 (`useSocketSync.ts`)
React 컴포넌트 마운트 시점에 유저의 로그인 여부를 감시하여 소켓을 올바르게 시작/해제해 줍니다.
파일 경로: `frontend/src/hooks/useSocketSync.ts`
```typescript
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useChatStore } from "@/store/useChatStore";

export const useSocketSync = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { connectSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    if (isSignedIn && user?.id) {
      connectSocket(user.id); // 로그인 시 소켓 연결
    }

    return () => {
      // 로그아웃 시 혹은 훅이 완전히 언마운트될 때 안전하게 닫기
      if (!isSignedIn) {
        disconnectSocket();
      }
    };
  }, [isSignedIn, user, connectSocket, disconnectSocket]);
};
```
이 훅을 프론트엔드의 `App.tsx` 최상단에서 호출해 주기만 하면 전역 소켓 라이프사이클 관리가 완벽히 자동화됩니다.

---

## 3단계. 실전 응용 개발 기법

Socket.io를 실전에 응용하는 3대 핵심 패턴입니다.

### 패턴 A: 실시간 브로드캐스트 (전체 전송)
한 유저의 동작(예: 노래 재생 시작)을 접속 중인 전원에게 알리는 방식입니다.
1. **클라이언트 송신**:
   ```typescript
   socket.emit("update_activity", { status: "Listening", activity: "Dynamite - BTS" });
   ```
2. **서버 중계**:
   ```javascript
   // 나를 포함한 전원 또는 나를 제외한 전체 유저에게 브로드캐스트
   socket.broadcast.emit("activity_updated", { clerkId, status, activity });
   ```
3. **상대방 클라이언트 수신**:
   ```typescript
   socket.on("activity_updated", (data) => {
     // UI 상에 해당 유저의 음악 재생 표시 렌더링
   });
   ```

### 패턴 B: 1:1 타겟 메시징 (특정 대상 전송)
채팅 메시지처럼 지정된 1명의 유저에게만 비밀리 전송하는 방식입니다.
1. **서버 타겟 조회 및 발송**:
   ```javascript
   const receiverSocketId = getReceiverSocketId(receiverClerkId); // 상대방 소켓 ID 획득
   if (receiverSocketId) {
     io.to(receiverSocketId).emit("newMessage", messageData); // 지정 대상에게만 전송
   }
   ```
2. **클라이언트 수신**:
   ```typescript
   socket.on("newMessage", (message) => {
     // 내가 띄워놓은 채팅방의 보낸이와 일치하면 화면에 메시지 추가, 다르면 알림 배지 활성화
   });
   ```

---

## 4단계. 꼭 알아두어야 할 핵심 꿀팁 및 주의사항

1. **중복 리스너 버그 (`socket.off`)**:
   - `socket.on("event", ...)`을 사용해 리스너를 붙일 때, React 컴포넌트의 잦은 리렌더링이나 스토어 초기화 시 중복하여 등록되기 쉽습니다. 이는 이벤트 수신 시 함수가 5~10번씩 다중 호출되어 성능 저하와 데이터 꼬임 버그를 유발합니다.
   - **해결책**: 이벤트 리스너를 결합하기 직전에 `socket.off("event")`를 매번 실행하여 기존의 오래된 리스너를 완전히 청소한 뒤 깨끗하게 구독을 갱신하십시오.
2. **CORS 에러 대처**:
   - 백엔드의 Socket.io `Server` 초기화 설정 파일에 반드시 프론트엔드가 접속하는 출처(포트 번호 포함)를 정확하게 허용해 주어야 소켓 핸드셰이크 차단을 막을 수 있습니다.
3. **비동기 상태 클로저 이슈**:
   - 소켓 콜백 함수 내부에서는 이전의 오래된 React state 값이 잡히는 클로저 캡처링 문제가 생길 수 있습니다.
   - **해결책**: Zustand의 경우 리스너 콜백 내부에서 상태를 가공할 때 `useChatStore.getState()`를 명시적으로 호출해 메모리의 최신 상태 주소값을 직접 참조하십시오.
