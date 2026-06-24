import { useNavigate } from "react-router-dom";
import { Music4, Home } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8 bg-zinc-900/10">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative w-28 h-28 bg-zinc-800/40 border border-zinc-800/50 rounded-full flex items-center justify-center shadow-inner">
          <Music4 className="w-14 h-14 text-emerald-500 animate-bounce" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">404 Page Not Found</h1>
      <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-8">
        요청하신 페이지를 찾을 수 없습니다. 주소가 변경되었거나 삭제되었을 수 있습니다. Spotify의 메인 음악 홈으로 돌아가 보시는 건 어떨까요?
      </p>

      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-full transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 hover:scale-105"
      >
        <Home className="w-4 h-4" />
        <span>홈으로 돌아가기</span>
      </button>
    </div>
  );
};

export default NotFoundPage;
