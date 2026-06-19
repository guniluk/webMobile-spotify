import { Show, SignInButton, UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full bg-card text-card-foreground border rounded-xl shadow-lg p-6 space-y-4 text-center">
        <h2 className="text-2xl font-bold text-primary">Spotify Clone & Clerk Auth</h2>
        <p className="text-muted-foreground text-sm">
          Tailwind CSS v4, shadcn/ui, 그리고 Clerk 인증이 연동되었습니다!
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t border-border">
          <Show when="signed-out">
            <p className="text-sm text-muted-foreground">현재 로그아웃 상태입니다.</p>
            <SignInButton mode="modal">
              <Button variant="default" className="w-full">로그인 / 회원가입</Button>
            </SignInButton>
          </Show>
          
          <Show when="signed-in">
            <p className="text-sm text-muted-foreground">성공적으로 로그인되었습니다!</p>
            <div className="flex items-center gap-2">
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
