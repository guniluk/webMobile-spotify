# 🎵 Spotify Music Catalog & Real-Time Collaboration Web & Mobile (Spotify 클론코딩)

본 프로젝트는 **Spotify 클론 코딩 풀스택 웹 및 모바일 애플리케이션**입니다.  
사용자는 인증(Clerk)을 통해 로그인하여 고품질의 음악 스트리밍 및 앨범 감상을 즐길 수 있으며, 관리자(Admin) 계정으로 접근 시 신규 음원 및 음반 컬렉션을 즉각 업로드/삭제할 수 있는 대시보드가 활성화됩니다.

특히, `Socket.io`를 긴밀하게 연동하여 **실시간 친구 활동 모니터링(듣고 있는 노래 실시간 공유)**, **최근 대화 유저 최상단 동적 정렬**, 그리고 **1:1 실시간 채팅(읽지 않은 메시지 구분선 및 양방향 동시성 삭제 보장)** 기능을 완벽히 개발하여 서비스의 완성도를 극대화했습니다.

---

## 📌 목차
1. [🚀 초보자를 위한 3분 퀵스타트 로드맵](#-초보자를-위한-3분-퀵스타트-로드맵)
2. [🔑 3대 외부 서비스(Clerk, MongoDB, Cloudinary) 발급 가이드](#-3대-외부-서비스clerk-mongodb-cloudinary-발급-가이드)
3. [📁 프로젝트 구조 및 폴더 역할](#-프로젝트-구조-및-폴더-역할)
4. [⚙️ 로컬 개발 환경 구축 및 환경 변수 설정](#-로컬-개발-환경-구축-및-환경-변수-설정)
5. [📱 모바일 앱 (Expo) 빌드 및 기기 테스트 가이드](#-모바일-앱-expo-빌드-및-기기-테스트-가이드)
6. [👥 실시간 소켓 기능 & 1:1 채팅 테스트 가이드](#-실시간-소켓-기능--11-채팅-테스트-가이드)
7. [👑 어드민(Admin) 대시보드 권한 및 미디어 업로드 가이드](#-어드민admin-대시보드-권한-및-미디어-업로드-가이드)
8. [💡 기술적 도전 및 리팩토링 사례](#-기술적-도전-및-리팩토링-사례)
9. [🌐 프로덕션 빌드 및 배포(Deployment) 절차](#-프로덕션-빌드-및-배포deployment-절차)

---

## 🚀 초보자를 위한 3분 퀵스타트 로드맵

이 프로젝트를 로컬 컴퓨터에서 처음 실행하는 초보자분들을 위해 전체 단계를 요약해 드립니다.

```text
[1단계: 코드 다운로드] -> [2단계: 외부 API 키 발급] -> [3단계: 환경 변수(.env) 설정]
                                                                     │
[5단계: 모바일 앱 구동] <- [4단계: 백엔드 & 웹 서버 구동 (의존성 설치)] <────┘
```

1. **사전 준비**: 컴퓨터에 **Node.js**(v18 이상 권장)와 **Git**이 설치되어 있어야 합니다.
2. **코드 가져오기**: 터미널을 열고 프로젝트를 다운로드합니다.
   ```bash
   git clone <repository_url>
   cd webMobile-spotify
   ```
3. **API 키 설정**: 아래 가이드를 참고하여 MongoDB, Clerk, Cloudinary의 연결 키를 획득하고 `.env` 파일을 만듭니다.
4. **백엔드/프론트엔드 구동**: 개별 터미널을 열어 명령어를 입력하고 웹 브라우저(`http://localhost:5173`)로 접속합니다.

---

## 🔑 3대 외부 서비스(Clerk, MongoDB, Cloudinary) 발급 가이드

이 프로젝트는 안전한 회원 가입, 클라우드 데이터 보존, 대용량 오디오/이미지 호스팅을 위해 3가지 무료 서비스를 사용합니다. 아래 순서대로 쉽게 가입하여 필요한 키를 복사하세요.

### 1. MongoDB Atlas (데이터베이스)
MongoDB Atlas는 가입한 사용자의 정보, 채팅 내역, 곡/앨범 메타데이터를 저장하는 구름 위의 데이터베이스입니다.
1. [MongoDB Atlas 홈페이지](https://www.mongodb.com/cloud/atlas/register)에 접속해 무료 계정을 생성합니다.
2. 대시보드에서 `Create a cluster` (무료 Shared M0 요금제 선택)를 클릭해 데이터베이스를 생성합니다.
3. **Database Access** 메뉴로 이동하여 새 데이터베이스 사용자(User)를 추가합니다. 
   - 비밀번호는 복잡한 특수문자가 없는 단순 문자열로 지정하는 것을 추천합니다. (연결 주소 파싱 오류 방지)
4. **Network Access** 메뉴로 이동하여 `Add IP Address`를 누르고, `Allow Access From Anywhere (0.0.0.0/0)`를 지정해 저장합니다.
5. **Database > Connect** 버튼을 누른 후 `Drivers`를 선택하여 아래와 같은 형태의 **Connection String URI**를 복사합니다:
   ```text
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
   ```
   *(이 주소의 `<password>` 부분에는 방금 전 Database Access에서 만든 비밀번호를 직접 채워 넣어야 합니다)*

### 2. Clerk (사용자 인증 및 로그인)
Clerk은 별도의 회원가입/비밀번호 해싱 로직 없이 소셜 로그인 창을 손쉽게 만들어주는 고도의 보안 솔루션입니다.
1. [Clerk 가입 및 대시보드](https://clerk.com)로 이동합니다.
2. `Create application`을 클릭합니다.
3. 애플리케이션 이름(예: `Spotify-Clone`)을 지정하고, 로그인 옵션에서 **Email address**와 **Google**을 켭니다.
4. `Create application`을 눌러 생성을 마친 뒤, 대시보드 홈 화면에 있는 **API Keys** 영역에서 두 가지 키를 복사합니다:
   - `Publishable Key` (형식: `pk_test_...`)
   - `Secret Key` (형식: `sk_test_...`)

### 3. Cloudinary (이미지/오디오 클라우드 저장소)
사용자가 올린 앨범 커버 이미지와 오디오 `.mp3` 미디어가 안정적으로 호스팅되는 저장 공간입니다.
1. [Cloudinary 공식 홈페이지](https://cloudinary.com)에서 무료 회원가입을 완료합니다.
2. 대시보드 메인 화면(Dashboard)의 **Product Environment Settings** 영역에서 아래 세 가지 값을 찾아 메모합니다:
   - `Cloud Name` (예: `dxyz1234`)
   - `API Key` (예: `123456789012345`)
   - `API Secret` (예: `sk_...`)

---

## 📁 프로젝트 구조 및 폴더 역할

프로젝트는 웹 프론트엔드, 모바일 앱, Node.js 백엔드가 단일 루트 하위에 모듈식으로 분리된 구조입니다.

```text
webMobile-spotify/ (프로젝트 루트)
 ├─ backend/                  # ⚙️ 백엔드 API (Node.js & Express)
 │   ├─ src/
 │   │   ├─ controllers/     # 실제 API 비즈니스 로직 (회원 관리, 음악 제어, 대화 삭제 등)
 │   │   ├─ lib/             # 공통 모듈 (MongoDB 연결, Cloudinary 설정, Socket.io 제어)
 │   │   ├─ middleware/      # 인증 검증 및 MongoDB 강제 가입 동기화 미들웨어 (protectRoute)
 │   │   ├─ models/          # MongoDB Mongoose 스키마 정의 (User, Message, Song, Album)
 │   │   ├─ routes/          # Express 주소 라우팅 연결
 │   │   └─ server.js        # 백엔드 서버 통합 실행 엔트리포인트 (Port: 3000)
 │   ├─ .env                 # 백엔드용 환경 변수 파일 (사용자가 직접 생성해야 함)
 │   └─ package.json         # 백엔드 패키지 의존성 파일
 │
 ├─ frontend/                 # 💻 웹 프론트엔드 (React & Vite)
 │   ├─ src/
 │   │   ├─ layout/          # LeftSidebar(좌측 메뉴), RightSidebar(온라인 친구), MainLayout(메인 구조)
 │   │   ├─ pages/           # HomePage, AlbumPage, ChatPage, AdminPage 등 각 화면 컴포넌트
 │   │   ├─ store/           # Zustand 상태 스토어 (usePlayerStore, useChatStore, useMusicStore)
 │   │   ├─ hooks/           # 커스텀 훅 (useSocketSync: 소켓 연결 상태 갱신 훅)
 │   │   └─ main.tsx         # React 앱 시작점
 │   ├─ .env.local           # 웹 프론트엔드용 환경 변수 파일 (사용자가 직접 생성해야 함)
 │   └─ package.json         # 웹 프론트엔드 패키지 의존성 파일
 │
 └─ mobile/                   # 📱 모바일 프론트엔드 (Expo)
     ├─ app/                 # Expo Router 파일 기반 네비게이션 구조 ((tabs) 그룹 및 1:1 대화방 등)
     ├─ store/               # 모바일용 Zustand 스토어 (플레이어 및 채팅 관리)
     ├─ lib/                 # PC 로컬 IP 자동 탐색 통신용 axios 인스턴스
     ├─ .env                 # 모바일용 환경 변수 파일 (사용자가 직접 생성해야 함)
     └─ package.json         # 모바일 패키지 의존성 파일
```

* **관련 문서 링크:**
  * [Clerk 상세 연동 흐름 가이드](file:///Users/guniluk/Desktop/CLI/webMobile-spotify/clerk-procedure.md): 인증 키 적용과 API 연동의 세밀한 원리를 수록했습니다.
  * [Socket.io 상세 설계 가이드](file:///Users/guniluk/Desktop/CLI/webMobile-spotify/socket-io.md): 실시간 아키텍처 및 채팅 연동 가이드입니다.

---

## ⚙️ 로컬 개발 환경 구축 및 환경 변수 설정

3대 서비스 가입 및 키 복사가 끝났다면, 각 서비스 폴더에 환경 변수를 저장하고 구동을 시작합니다.

### 1) 환경 변수 파일 생성

#### 📂 [백엔드 환경 변수] `backend/.env` 파일 생성
`backend/` 폴더 내에 `.env` 파일을 만들고 아래 코드를 붙여넣은 뒤, 자신의 정보로 대체하세요.
```env
PORT=3000
MONGO_URI=mongodb+srv://<ID>:<PASSWORD>@<HOST>/spotify?retryWrites=true&w=majority
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_EMAIL=admin@example.com
NODE_ENV=development
```
> [!IMPORTANT]
> `ADMIN_EMAIL` 항목에는 관리자 대시보드 권한을 가질 이메일을 정확히 적어야 합니다. 이 메일 주소로 로그인할 때만 음원 업로드 권한을 얻습니다.

#### 📂 [웹 환경 변수] `frontend/.env.local` 파일 생성
`frontend/` 폴더 내에 `.env.local` 파일을 만듭니다.
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

#### 📂 [모바일 환경 변수] `mobile/.env` 파일 생성
`mobile/` 폴더 내에 `.env` 파일을 만듭니다.
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

### 2) 서버 및 웹 구동 방법

원활한 로컬 테스팅을 위해 **3개의 별도 터미널 창**을 준비하세요.

#### 🖥️ 터미널 1: 백엔드 서버 가동
```bash
cd backend
npm install
npm run dev
```
- 성공 시 터미널 화면에 `Connected to MongoDB` 및 `Server running on port 3000` 로그가 찍힙니다.

#### 🖥️ 터미널 2: 웹 프론트엔드(React) 실행
```bash
cd frontend
npm install
npm run dev
```
- 성공 시 터미널에 `Vite dev server running` 메시지와 함께 로컬 접속 URL(기본 `http://localhost:5173`)이 노출됩니다. 해당 링크를 Ctrl+클릭(또는 Cmd+클릭)하여 브라우저에 접속해 보세요!

#### 🖥️ 터미널 3: 모바일 앱(Expo) 실행
```bash
cd mobile
npm install
npx expo start
```
- 터미널 창에 대형 **QR 코드**와 개발자 콘솔이 실행됩니다. 자세한 구동 및 테스트 방법은 아래 모바일 앱 가이드를 참조하세요.

---

## 📱 모바일 앱 (Expo) 빌드 및 기기 테스트 가이드

이 프로젝트는 **Expo SDK 54**로 구현되어 컴퓨터 에뮬레이터나 본인의 스마트폰에서 바로 테스트가 가능합니다.

### 1. 스마트폰 실기기 테스트 방법 (Expo Go 사용)
1. 스마트폰의 App Store(iOS) 또는 Play Store(Android)에서 **Expo Go** 앱을 다운로드합니다.
2. 💻 **가장 중요한 조건**: 개발을 구동 중인 데스크톱/노트북과 스마트폰이 **반드시 동일한 Wi-Fi(공유기) 네트워크**에 연결되어 있어야 합니다!
3. 스마트폰 카메라를 켜고 터미널 3에 노출된 **QR 코드**를 촬영하거나, Android 기기의 경우 Expo Go 앱의 QR 리더기로 인식하여 동적 번들을 로드합니다.

### 2. 가상 에뮬레이터에서 구동 방법
- **iOS Simulator**: 터미널 3에서 키보드 `i` 키를 누르면 macOS에 설치된 Xcode Simulator가 실행되며 앱을 로드합니다.
- **Android Emulator**: 터미널 3에서 키보드 `a` 키를 누르면 Android Studio의 가상 기기에 연결됩니다.

### 3. 모바일 개발 시 'IP 자동 탐색' 기능 탑재
모바일 앱 기기는 PC의 `localhost`라는 호스트명을 인식하지 못합니다.
본 프로젝트의 `mobile/lib/axios.ts` 파일은 `Constants.expoConfig?.hostUri` 데이터를 통해 **컴퓨터의 실제 로컬 IP 주소**를 실시간으로 자동 추출하여 백엔드로 요청합니다. 
따라서 별도로 로컬 주소(IP)를 번거롭게 하드코딩해서 변경할 필요가 없습니다.

---

## 👥 실시간 소켓 기능 & 1:1 채팅 테스트 가이드

본 프로젝트의 가장 강력한 강점은 **실시간 동기화**입니다. 초보자분들이 로컬에서 이 기능을 완벽히 테스트할 수 있는 시나리오를 안내합니다.

### 1. 두 개의 가상 브라우저 준비하기
1. 일반 브라우저 창에서 **일반 계정 A**로 로그인합니다. (예: 개인 구글 이메일)
2. 브라우저의 **시크릿 창 (Incognito Window)**을 열어 **계정 B**로 가입/로그인합니다. (예: 다른 이메일)
3. 서로 다른 두 브라우저에서 각각 다른 계정으로 로그인되면, 백엔드가 두 유저의 소켓 연결을 자동으로 가로채 **온라인 상태(초록색 활성 링)**로 즉시 우측 사이드바에 표시해 줍니다.

### 2. 실시간 음악 감상 활동(Active Song) 공유 테스트
1. 브라우저 **A**에서 플레이리스트 중 아무 노래나 골라 재생(Play) 버튼을 누릅니다.
2. 브라우저 **B**의 우측 친구 목록 창을 관찰해 보세요! A 유저 프로필 아래에 **A가 현재 듣고 있는 곡 제목과 아티스트 이름**이 표기되고, 음표 움직임 애니메이션이 실시간으로 노출됩니다.
3. 브라우저 A에서 노래를 일시 정지(Pause)하면 B의 화면에서도 정보가 즉각 사라집니다.

### 3. 1:1 실시간 채팅 및 'New Messages' 구분선 확인
1. 브라우저 **B**에서 우측 친구 목록의 **유저 A**를 눌러 대화창으로 진입합니다.
2. 브라우저 **A**에서 우측 친구 목록의 **유저 B**를 선택하지 않고 홈(Home) 화면에 머문 상태로 유지합니다.
3. 브라우저 **B**에서 **A**에게 "안녕! 지금 음악 듣고 있네?" 라고 타이핑하고 전송을 누릅니다.
4. 브라우저 **A**의 화면을 보면, 'Messages' 영역에 **초록색 원형 메시지 알림 뱃지**가 실시간으로 나타납니다.
5. 이제 브라우저 **A**에서 **B**와의 대화방에 입장해 보세요.
   - 방에 들어가는 순간, 이전에 보지 않았던 채팅 메시지 바로 위에 **`New Messages`라는 에메랄드빛 구분선**과 은은한 테두리가 나타납니다.
   - 이 구분선은 **10초의 유예 타이머**가 작동하며, 10초 후에 서서히 투명해지면서 자연스럽게 사라집니다.
6. 대화 도중 실시간으로 톡을 전송하는 동안에는 이미 톡방을 보고 있으므로 구분선이 불필요하게 튀어나오지 않고 정렬됩니다.

### 4. 대화 내용 실시간 양방향 영구 삭제 (Erase Messages)
1. 브라우저 **A**에서 대화방 우측 상단의 **`Erase messages`** 버튼을 누릅니다.
2. 정말 대화 내용을 완전히 삭제할지 묻는 확인 창에서 예를 클릭합니다.
3. 데이터베이스에서 모든 채팅 내역이 깨끗이 비워지며, 소켓 이벤트를 통해 **브라우저 B의 화면에서도 메시지들이 즉시 빈 화면으로 비워지는 동시성 갱신**이 진행됩니다.

---

## 👑 어드민(Admin) 대시보드 권한 및 미디어 업로드 가이드

관리자(Admin) 권한으로 접속하면 일반 유저는 볼 수 없는 곡/앨범 관리 대시보드가 열립니다.

1. **권한 로그인**: `backend/.env`에 기입한 `ADMIN_EMAIL`과 일치하는 이메일 계정으로 웹 또는 모바일에서 로그인하면, 상단 헤더 영역에 `Admin` 버튼이 표시됩니다.
2. **곡 추가 방법**:
   - `Add Song` 모달을 엽니다.
   - 곡의 제목, 아티스트명을 입력하고 연결될 앨범을 선택합니다.
   - **곡 오디오 파일**(`.mp3` 등)과 **커버 이미지**를 업로드합니다.
   - 등록을 마치면 파일은 Cloudinary로 전송되어 영구 업로드되고, 데이터베이스에 등록되어 홈 화면에 즉시 노출됩니다.
3. **콘솔에서 삭제**: 대시보드의 목록 테이블에서 휴지통 아이콘을 누르면 Cloudinary 저장소의 미디어와 데이터베이스 레코드가 즉각 양방향 영구 삭제 처리됩니다.

---

## 💡 기술적 도전 및 리팩토링 사례

본 프로젝트의 설계상 부딪혔던 한계들과 이를 극복한 모범 개발 사례입니다.

* **Zustand 비동기 클로저 캡처 버그 해결**: 소켓 이벤트를 등록할 때 렌더링 수명주기에 갇혀 이전 상태(메시지 수신 데이터 등)가 캡처되는 버그가 존재했습니다. 스토어 내부에서 상태에 직접 접근하는 대신 `useChatStore.getState()` 전역 힙 접근을 통해 정합성을 100% 실시간으로 동기화했습니다.
* **소켓 라이프사이클 분리**: 화면이 바뀔 때마다 소켓을 닫고 새로 여는 낭비를 차단하기 위해 로그인/로그아웃 주기와 소켓 생성/소멸의 수명주기를 분리해 연결 유실을 극적으로 줄였습니다.
* **Expo 오디오 백그라운드 재생 최적화**: 오디오가 기기 절전 시 끊기거나, 진행률 리스너가 너무 자주 호출되어 메모리 폭동(Re-render)이 일어나던 문제를 `staysActiveInBackground` 설정 및 `500ms 디바운스 업데이트` 기법으로 해결했습니다.

---

## 🌐 프로덕션 빌드 및 배포(Deployment) 절차

로컬 개발 및 실기기 검증이 끝났다면 아래와 같이 호스팅 도메인으로 릴리즈할 수 있습니다.

### 1. 백엔드 배포 (Node.js)
1. Render.com 또는 AWS Elastic Beanstalk과 같은 Node.js 클라우드 호스팅 서비스를 마련합니다.
2. 깃허브 저장소를 연결하고 빌드 명령어로 `npm install`, 스타트 명령어로 `node src/server.js`를 등록합니다.
3. 서버 콘솔에 `MONGO_URI`, `CLERK_SECRET_KEY` 등을 환경 변수로 입력한 뒤 `NODE_ENV=production`을 선언합니다.

### 2. 웹 프론트엔드 배포 (Vite SPA)
1. 프론트엔드 루트 폴더에서 `npm run build`를 실행하여 컴파일 결과물(`dist/` 폴더)을 준비합니다.
2. Vercel 또는 Netlify 서비스에 연동하고 배포합니다.
3. **가장 중요**: 빌드 및 서비스 연결 전에 `frontend/src/lib/axios.ts`의 `baseURL` 경로를 로컬 호스트(`localhost:3000`)가 아닌 **배포 완료된 백엔드 서비스 도메인 주소**로 변경하여 빌드해야 합니다.
