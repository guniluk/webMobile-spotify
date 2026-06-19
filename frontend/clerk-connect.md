# Vite + React (TypeScript) 환경에서 Clerk 인증 연동하기 (초보자 가이드)

이 가이드는 Clerk 서비스를 이용하여 프론트엔드 프로젝트에 사용자 인증(로그인, 회원가입, 로그아웃 등) 기능을 처음부터 끝까지 연동하는 순서를 아주 쉽게 설명합니다. (Clerk v6 최신 API 기준)

---

## 🚀 전체 흐름 요약
1. [Clerk 웹사이트 설정] Clerk 계정 가입 및 애플리케이션 생성
2. [환경 변수 설정] 복사한 API Key 프로젝트에 추가
3. [터미널 라이브러리 설치] `@clerk/react` 패키지 설치
4. [코드 수정] `main.tsx` 및 `App.tsx` 인증 환경 연동
5. [테스트] 로컬 서버 실행 후 확인

---

## Step 1. Clerk 웹사이트 설정 (Clerk Website)

1. **Clerk 공식 홈페이지 접속 및 가입**
   - [Clerk Dashboard](https://dashboard.clerk.com/)에 접속하여 회원가입을 진행합니다. (Google 이나 GitHub 계정 연동 가입 추천)
   
2. **애플리케이션 생성**
   - 가입이 완료되면 **"Create Application"** 버튼을 클릭합니다.
   - **Application Name**에 프로젝트 이름(예: `Spotify Clone`)을 적습니다.
   - 사용자가 로그인할 수 있는 방식을 선택합니다 (Email, Google, Github 등 기본 활성화 항목 체크).
   - 하단의 **"Create Application"**을 누릅니다.

3. **API Keys 복사**
   - 생성 완료 후 대시보드 화면에 바로 **`VITE_CLERK_PUBLISHABLE_KEY`**와 **`CLERK_SECRET_KEY`**가 표시됩니다.
   - 복사 버튼을 눌러 메모장 등에 따로 보관해 둡니다.

---

## Step 2. 환경 변수 설정 (Env Setting)

Vite 개발 서버가 API Key를 안전하게 로드할 수 있도록 설정합니다.

1. 프론트엔드 프로젝트 폴더 루트에 `.env.local` 파일을 생성합니다.
2. Step 1에서 복사한 API Key를 다음과 같이 적고 저장합니다:

```env
# Clerk 웹 대시보드에서 제공한 값 그대로 기입합니다.
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

> ⚠️ **주의**: `.env.local` 파일은 API Key 유출 방지를 위해 `.gitignore`에 자동 포함되어 깃허브 등 원격 저장소에 업로드되지 않아야 합니다.

---

## Step 3. 라이브러리 설치 (Terminal Install)

인증 연동을 위한 Clerk SDK 패키지를 터미널에서 설치합니다.

```bash
# frontend 폴더 경로에서 아래 명령어를 실행합니다.
npm install @clerk/react
```

---

## Step 4. 코드 수정 (Code Modify)

### 1) Entry Point 설정 (`src/main.tsx`)
애플리케이션 최상단에 `ClerkProvider`를 감싸서 전체 React 컴포넌트 트리에서 인증 컨텍스트를 사용할 수 있도록 합니다.

[src/main.tsx](file:///Users/guniluk/Desktop/CODING/webMobile-spotify/frontend/src/main.tsx) 파일을 아래와 같이 작성합니다:

```typescript
import { ClerkProvider } from '@clerk/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 환경 변수에서 Publishable Key를 가져옵니다.
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// API Key가 없으면 앱을 실행하지 않고 에러를 발생시킵니다.
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ClerkProvider로 App 전체를 감쌉니다. */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>,
)
```

---

### 2) 인증 상태에 따른 화면 처리 (`src/App.tsx`)
Clerk v6 SDK의 최신 문법인 `<Show />` 컴포넌트를 사용하여 로그인 상태/로그아웃 상태에 따라 다르게 보일 화면을 구성합니다.

[src/App.tsx](file:///Users/guniluk/Desktop/CODING/webMobile-spotify/frontend/src/App.tsx) 파일을 아래와 같이 작성합니다:

```tsx
import { Show, SignInButton, UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button"; // shadcn/ui 버튼 컴포넌트

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full bg-card text-card-foreground border rounded-xl shadow-lg p-6 space-y-4 text-center">
        <h2 className="text-2xl font-bold text-primary">Spotify Clone & Clerk Auth</h2>
        <p className="text-muted-foreground text-sm">
          인증 기능 연동이 성공적으로 완료되었습니다!
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t border-border">
          
          {/* 1. 로그아웃 상태일 때 보일 화면 */}
          <Show when="signed-out">
            <p className="text-sm text-muted-foreground">현재 로그아웃 상태입니다.</p>
            {/* mode="modal"로 지정하여 팝업 형식의 로그인 창을 띄웁니다. */}
            <SignInButton mode="modal">
              <Button variant="default" className="w-full">로그인 / 회원가입</Button>
            </SignInButton>
          </Show>
          
          {/* 2. 로그인 상태일 때 보일 화면 */}
          <Show when="signed-in">
            <p className="text-sm text-muted-foreground">성공적으로 로그인되었습니다!</p>
            <div className="flex items-center gap-2">
              {/* 유저 프로필 아이콘 및 로그아웃 버튼 역할을 수행하는 컴포넌트 */}
              <UserButton />
              <span className="text-sm font-semibold">내 계정 관리</span>
            </div>
          </Show>
          
        </div>
      </div>
    </div>
  );
}

export default App;
```

---

## Step 5. 로컬 서버 구동 및 테스트 (Run & Test)

모든 코드 수정이 완료되었다면 아래 명령어로 서버를 띄워 테스트를 해봅니다.

```bash
# 개발 서버 가동
npm run dev
```

1. 브라우저(`http://localhost:5173`)를 열어 화면을 확인합니다.
2. **"로그인 / 회원가입"** 버튼을 눌렀을 때 Clerk 로그인 모달창이 정상적으로 뜨는지 확인합니다.
3. 소셜 로그인 혹은 이메일 인증을 통해 로그인을 진행합니다.
4. 로그인 완료 후 렌더링된 우측 상단의 `UserButton`(프로필 이미지)을 눌러 정보 확인 및 로그아웃이 원활히 이루어지는지 검증합니다.
