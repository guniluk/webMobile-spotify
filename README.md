# 🎵 Spotify Music Catalog Manager - 개발자 매뉴얼

본 프로젝트는 **Spotify 클론 코딩 풀스택 웹 애플리케이션**으로, 백엔드는 Express 및 MongoDB, 프론트엔드는 React 및 Vite를 사용하여 개발되었습니다. 
이 가이드는 초보자 개발자도 프로젝트의 구조와 스택을 쉽게 이해하고, 로컬 환경 구축부터 실제 서비스 배포 및 향후 실시간 기능 확장 계획까지 원활히 따라갈 수 있도록 단계별로 가이드합니다.

---

<div id="table-of-contents"></div>

## 📌 목차
1. [프로젝트 소개](#1-프로젝트-소개)
2. [주요 기술 스택 (Tech Stack)](#2-주요-기술-스택-tech-stack)
3. [전체 프로젝트 폴더 구조](#3-전체-프로젝트-폴더-구조)
4. [로컬 개발 환경 설정 가이드](#4-로컬-개발-환경-설정-가이드)
5. [어드민 대시보드 사용 가이드](#5-어드민-대시보드-사용-가이드)
6. [프로덕션 빌드 및 배포(Deployment) 절차](#6-프로덕션-빌드-및-배포deployment-절차)
7. [향후 개발 계획 (실시간 기능 및 채팅)](#7-향후-개발-계획-실시간-기능-및-채팅)

---

## 1. 프로젝트 소개

본 프로젝트는 음악 재생, 앨범 감상 및 관리자 전용 대시보드를 통한 음악/앨범 관리 카탈로그 기능을 제공하는 Spotify 클론 코딩 웹입니다.
* **핵심 가치**: 사용자 인증 및 가입 정보를 연동하고 어드민 계정으로 로그인 시 강력한 대시보드 뷰와 다이얼로그 폼을 통하여 실시간으로 곡 및 음반 컬렉션을 확장/삭제하여 라이브러리를 통제할 수 있습니다.

[⬆️ 목차로 돌아가기](#table-of-contents)

---

## 2. 주요 기술 스택 (Tech Stack)

본 프로젝트에 채택된 기술과 라이브러리는 현대적이고 확장성이 뛰어난 스택들로 구성되어 있습니다.

### 💻 프론트엔드 (Frontend)

| 분류 | 기술 / 라이브러리 명 | 주요 용도 및 채택 이유 |
| :--- | :--- | :--- |
| **Core** | `React 19` (TypeScript) | 컴포넌트 기반 UI 개발 및 강력한 정적 타입 체킹 지원 |
| **Build Tool** | `Vite 8` | 초고속 HMR(Hot Module Replacement) 및 번들링 최적화 |
| **Styling** | `Tailwind CSS v4` | 유틸리티 퍼스트 클래스를 통한 신속하고 일관성 있는 스타일 구현 |
| **State** | `Zustand 5` | Redux 대비 보일러플레이트가 극히 적은 직관적인 전역 상태 관리 |
| **Auth** | `@clerk/react` | 구글, 깃허브 등 소셜 로그인 및 세션 관리 자동화 |
| **HTTP Client**| `Axios` | 인터셉터를 활용한 Clerk JWT 인증 헤더 실시간 주입 및 비동기 처리 |
| **Icons** | `Lucide React` | 스포티파이 느낌의 세련되고 풍부한 UI용 아이콘 패키지 제공 |
| **UI Kits** | `Radix UI` / `Shadcn` | 대시보드 스크롤 바 및 UI 요소들의 접근성/재사용성 보장 |

### ⚙️ 백엔드 (Backend)

| 분류 | 기술 / 라이브러리 명 | 주요 용도 및 채택 이유 |
| :--- | :--- | :--- |
| **Runtime** | `Node.js` (ES Modules) | V8 엔진 기반의 빠른 자바스크립트 백엔드 실행 환경 구축 |
| **Framework** | `Express.js` | 가볍고 유연한 라우팅 및 미들웨어 중심의 REST API 구축 |
| **Database** | `MongoDB` + `Mongoose` | NoSQL 도큐먼트 기반의 유연한 음악/앨범 스키마 모델링 및 ODM 연동 |
| **Auth SDK** | `@clerk/express` | Express 미들웨어 레벨에서 Clerk 인증 토큰 검증 및 `req.auth` 바인딩 |
| **Media Host** | `Cloudinary Node.js SDK` | 앨범 아트 커버 이미지 및 대용량 음원 파일(MP3/WAV) 안전 호스팅 |
| **File Parser**| `Express-fileupload` | 클라이언트의 멀티파트 업로드 파일을 서버 임시 메모리로 스트림 처리 |
| **Dev Tool** | `Nodemon` | 코드 수정 즉시 백엔드 서버를 핫리로드하여 개발 생산성 증가 |

[⬆️ 목차로 돌아가기](#table-of-contents)

---

## 3. 전체 프로젝트 폴더 구조

프로젝트 루트는 백엔드(`backend/`)와 프론트엔드(`frontend/`)가 각각 독립된 패키지로 분리되어 있습니다.

```text
webMobile-spotify/ (Project Root)
 ├─ backend/
 │   ├─ src/
 │   │   ├─ controllers/     # API 비동기 처리 컨트롤러 로직 (admin, song, album 등)
 │   │   ├─ lib/             # 공통 모듈 및 커넥션 파일 (connectDB, cloudinary 설정)
 │   │   ├─ middleware/      # 인증 및 어드민 체크 라우터 미들웨어 (auth.middleware)
 │   │   ├─ models/          # MongoDB Mongoose 스키마 정의 (User, Song, Album 등)
 │   │   ├─ routes/          # Express API 라우팅 엔드포인트 정의
 │   │   └─ server.js        # 백엔드 서버 엔트리 포인트
 │   ├─ .env                 # 백엔드 환경 변수 설정 파일
 │   └─ package.json         # 백엔드 의존성 및 패키지 설정
 │
 ├─ frontend/
 │   ├─ public/              # 이미지, SVG 등 정적 리소스 파일
 │   ├─ src/
 │   │   ├─ app/             # 메인 앱 라우팅 및 렌더러
 │   │   ├─ components/      # 전역 공통 UI 및 탑바 등 컴포넌트
 │   │   ├─ layout/          # 좌측 사이드바 및 레이아웃 정의
 │   │   ├─ lib/             # Axios 설정 등 외부 API 통신 모듈
 │   │   ├─ pages/           # 주요 페이지 컴포넌트
 │   │   │   ├─ admin/       # 관리자 페이지 하위 테이블 및 모달 컴포넌트
 │   │   │   └─ AdminPage.tsx# 관리자 메인 페이지 컴포넌트
 │   │   ├─ providers/       # Clerk 세션/토큰 최상위 중앙 인증 처리 공급자 (AuthProvider)
 │   │   ├─ store/           # Zustand 전역 상태 저장소 (useMusicStore, useAuthStore 등)
 │   │   ├─ main.tsx         # 프론트엔드 진입점
 │   │   └─ index.css        # 스타일시트 정의 (Tailwind 전역 유틸리티 등)
 │   ├─ .env.local           # 프론트엔드 로컬 환경 변수 설정 파일
 │   └─ package.json         # 프론트엔드 의존성 및 패키지 설정
 └─ README.md                # 현재 매뉴얼 파일
```

[⬆️ 목차로 돌아가기](#table-of-contents)

---

## 4. 로컬 개발 환경 설정 가이드

처음 프로젝트를 시작하는 초보자 분들은 아래 단계에 맞춰 설정 및 빌드를 진행해 주세요.

### 단계 4-1: 필수 구성 요소 및 API 키 발급 받기
이 프로젝트는 아래의 외부 서비스 연결을 필수로 필요로 합니다. 사전에 무료 계정을 만들고 API 키를 메모해 두세요.
1. **MongoDB**: MongoDB Atlas 무료 데이터베이스 클러스터를 생성하고 커넥션 스트링 URI(`MONGO_URI`)를 복사합니다.
2. **Clerk**: 사용자 인증 및 관리자 이메일 계정 검증을 위해 Clerk 애플리케이션을 생성하고 `PUBLISHABLE_KEY`와 `SECRET_KEY`를 준비합니다.
3. **Cloudinary**: 앨범 아트 이미지와 오디오 음원 파일을 호스팅하기 위해 Cloudinary 무료 계정을 생성하고 `Cloud Name`, `API Key`, `API Secret` 키를 준비합니다.

### 단계 4-2: 백엔드 환경 설정 (`backend/.env`)
`backend/` 폴더 아래에 `.env` 파일을 생성하고 아래의 키값과 URI를 입력해 줍니다.
```env
PORT=3000
MONGO_URI=mongodb+srv://<유저이름>:<비밀번호>@<클러스터주소>/spotify?retryWrites=true&w=majority
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_EMAIL=<어드민페이지를_열_구글이나_clerk_로그인_이메일_주소>
NODE_ENV=development
```

### 단계 4-3: 프론트엔드 환경 설정 (`frontend/.env.local`)
`frontend/` 폴더 아래에 `.env.local` 파일을 생성하여 Clerk 키를 입력해 줍니다.
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 단계 4-4: 의존성 설치 및 로컬 서버 구동
터미널을 열고 다음 명령어들을 실행합니다.

```bash
# 1. 백엔드 실행 (터미널 창 1)
cd backend
npm install
npm run dev    # nodemon을 활용하여 변경사항 감지 및 핫리로드 실행

# 2. 프론트엔드 실행 (터미널 창 2)
cd frontend
npm install
npm run dev    # Vite 로컬 호스트 구동 (http://localhost:5173 또는 설정된 포트)
```

[⬆️ 목차로 돌아가기](#table-of-contents)

---

## 5. 어드민 대시보드 사용 가이드

본 프로젝트의 어드민 대시보드 기능은 최상위 프로바이더(`AuthProvider`)에서 선제적인 세션 제어 방식으로 구동됩니다.

1. **관리자 로그인**: `backend/.env`에 기입한 `ADMIN_EMAIL` 이메일과 일치하는 Clerk 계정으로 로그인해야만 어드민 권한이 승인됩니다.
2. **대시보드 진입**: 로그인에 성공하면 왼쪽 네비게이션바 하단과 상단 헤더 우측에 `Admin Dashboard` 바로가기가 표시됩니다.
3. **통계 카드 확인**:
   * **Total Songs**: 라이브러리에 등록된 총 노래 개수
   * **Total Albums**: 라이브러리에 등록된 총 앨범 개수
   * **Total Artists**: 고유 아티스트 수
   * **Total Users**: 가입한 총 유저 수
4. **곡/앨범 추가 (모달 다이얼로그)**:
   * `+ Add Song` 버튼 클릭 시, 제목/아티스트/재생시간 및 소속 앨범을 입력하고, 기기의 로컬 이미지/음원 파일을 드롭존 형식으로 업로드할 수 있습니다.
   * `+ Add Album` 버튼 클릭 시, 앨범 제목/아티스트/출시연도/앨범아트 이미지를 등록하여 즉각 통계 및 목록을 실시간으로 갱신시킬 수 있습니다.
5. **목록 스크롤 및 지우기**:
   * 각 목록들은 테이블 형식 내에 스크롤 공간을 유지하여 목록의 범위를 유지합니다.
   * 휴지통 모양의 삭제 아이콘을 누르면 Mongoose DB 릴레이션에 매핑된 이미지 및 데이터가 정상 삭제되고 통계가 새롭게 계산됩니다.

[⬆️ 목차로 돌아가기](#table-of-contents)

---

## 6. 프로덕션 빌드 및 배포(Deployment) 절차

로컬 빌드 검증을 모두 마쳤다면, 실제 프로덕션 서버에 프론트엔드와 백엔드를 배포할 수 있습니다.

### 백엔드 배포 절차 (Node.js)
1. **서버 호스팅 플랫폼 준비**: Render.com, Heroku, AWS Elastic Beanstalk 등 Node.js 런타임을 지원하는 클라우드 환경을 개설합니다.
2. **코드 푸시**: GitHub 등의 Git 저장소에 백엔드 소스를 푸시합니다.
3. **환경 변수 주입**: 호스팅 서버의 설정 대시보드(Environment Variables)에서 `backend/.env`에 입력했던 모든 값들(PORT, MONGO_URI, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLOUDINARY 인증 값, ADMIN_EMAIL 등)을 입력하고 `NODE_ENV=production`으로 설정합니다.
4. **빌드 및 시작 명령어**:
   * Build Command: `npm install`
   * Start Command: `node src/server.js`

### 프론트엔드 배포 절차 (정적 파일 CDN)
1. **정적 빌드 파일 생성**: 
   * 프론트엔드 폴더 내에서 `npm run build`를 실행하여 컴파일된 초경량 SPA 결과물(`dist/` 폴더)을 생성합니다.
2. **배포 플랫폼 등록**: Vercel, Netlify, AWS S3 + CloudFront 등 정적 사이트 호스팅 플랫폼에 연결합니다.
3. **Vite 환경변수 등록**: 대시보드의 Environment 설정에서 `VITE_CLERK_PUBLISHABLE_KEY`를 로컬 값과 동일하게 등록합니다.
4. **Vite API baseURL 설정 변경**:
   * 로컬 주소인 `http://localhost:3000/api` 대신, 배포가 완료된 **실제 백엔드 서버 호스트 도메인** 주소(예: `https://your-spotify-backend.onrender.com/api`)로 `frontend/src/lib/axios.ts`의 `baseURL`을 설정하여 연동되도록 코드를 수정한 뒤 빌드해야 합니다.
5. **빌드 세팅 지정**:
   * Build Command: `npm run build`
   * Output Directory: `dist`
   * Single Page App 라우팅 폴백 설정(Redirects) 활성화 (`/*`를 `/index.html`로 프록시).

[⬆️ 목차로 돌아가기](#table-of-contents)

---

## 7. 향후 개발 계획 (실시간 기능 및 채팅)

향후 본 앱은 더욱 인터랙티브하고 풍부한 경험을 제공하기 위해 다음과 같은 소켓 통신 모듈을 추가할 계획입니다.

### 실시간 상태 연동 및 챗(Chat) 기능 확장 계획
* **Socket.io 실시간 싱크 서버 설계**:
  * 백엔드 `server.js` 파일 내에 `socket.io` 패키지를 추가 마운트하여 실시간 연결 관리자를 가동할 예정입니다.
  * 모든 접속 유저의 현재 감상 중인 음악 목록, 재생/일시정지 상태 및 온라인 여부(Online/Offline Status)가 실시간으로 다른 유저들의 우측 사이드바 및 활동 창에 송신(Broadcasting)됩니다.
* **실시간 음악 공유 플레이**:
  * 방장 유저의 음악 플레이 재생 싱크에 맞춰 친구 유저들이 소켓으로 실시간 음악을 동일한 타이밍에 같이 재생하는 공동 청취 플레이 기능을 설계 중에 있습니다.
* **실시간 1:1 메시지 및 채팅**:
  * 현재 대기 중인 `Messages` 탭 내의 채팅창에 소켓을 결합시켜, 메시지를 보냄과 동시에 수신자의 화면에 알림음 및 메시지가 즉각 업데이트되는 실시간 채팅 통신을 완성할 계획입니다.

[⬆️ 목차로 돌아가기](#table-of-contents)
