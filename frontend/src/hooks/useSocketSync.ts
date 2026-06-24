import { useEffect } from "react";
import { useUser } from "@clerk/react";
import { useChatStore } from "@/store/useChatStore";
import { usePlayerStore } from "@/store/usePlayerStore";

/**
 * 전역 실시간 소켓 상태 및 음악 감지 동기화를 처리하는 커스텀 훅.
 * 최상위 App 컴포넌트에 배치하여 관심사를 라우팅 정의와 분리합니다.
 */
export const useSocketSync = () => {
  const { user } = useUser();
  const { connectSocket, disconnectSocket, initiateActivityUpdate } = useChatStore();
  const { currentSong, isPlaying } = usePlayerStore();

  // 1. 로그인 여부에 따른 전역 소켓 연결 수명 주기 제어
  useEffect(() => {
    if (user) {
      connectSocket(user.id);
    } else {
      disconnectSocket();
    }
  }, [user, connectSocket, disconnectSocket]);

  // 2. 브라우저 음악 재생 상태(currentSong, isPlaying)에 반응해 실시간 소켓 활동 동기화
  useEffect(() => {
    if (user) {
      if (currentSong && isPlaying) {
        initiateActivityUpdate("Listening", `${currentSong.title} • ${currentSong.artist}`);
      } else {
        initiateActivityUpdate("Idle", null);
      }
    }
  }, [user, currentSong, isPlaying, initiateActivityUpdate]);
};
