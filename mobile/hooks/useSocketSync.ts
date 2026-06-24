import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useChatStore } from "@/store/useChatStore";
import { usePlayerStore } from "@/store/usePlayerStore";

export const useSocketSync = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { connectSocket, disconnectSocket, initiateActivityUpdate } = useChatStore();
  const { currentSong, isPlaying } = usePlayerStore();

  // 1. Clerk 로그인 세션 및 사용자 정보가 로드되면 실시간 소켓 연결 수립
  useEffect(() => {
    if (isSignedIn && user?.id) {
      connectSocket(user.id);
    }

    return () => {
      if (!isSignedIn) {
        disconnectSocket();
      }
    };
  }, [isSignedIn, user, connectSocket, disconnectSocket]);

  // 2. 모바일 플레이어 오디오 상태가 변할 때마다 백엔드로 실시간 재생 활동(Listening) 전송
  useEffect(() => {
    if (isSignedIn && user?.id) {
      if (isPlaying && currentSong) {
        initiateActivityUpdate("Listening", `${currentSong.title} - ${currentSong.artist}`);
      } else {
        initiateActivityUpdate("Online", null);
      }
    }
  }, [isPlaying, currentSong, isSignedIn, user, initiateActivityUpdate]);
};
