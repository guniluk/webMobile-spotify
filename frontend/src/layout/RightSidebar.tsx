import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useChatStore } from "@/store/useChatStore";
import { Users, Music } from "lucide-react";

const RightSidebar = () => {
  const { users, fetchUsers, isLoading } = useChatStore();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      fetchUsers();
    }
  }, [isSignedIn, fetchUsers]);

  // 본인 제외하고 목록 표시
  const filteredUsers = users.filter((u) => u.clerkId !== user?.id);

  return (
    <div className="h-full bg-[#121212] rounded-lg p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-zinc-400">
        <Users className="w-5 h-5 shrink-0" />
        <h3 className="text-sm font-semibold text-zinc-200 truncate">
          What they're listening to
        </h3>
      </div>

      {!isSignedIn ? (
        <LoginPlaceHolder />
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 min-h-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <div className="space-y-4">
            {isLoading ? (
              <SkeletonLoading />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No activity available.
              </div>
            ) : (
              filteredUsers.map((friend) => {
                // 사용자가 요청한 세팅: 음악을 듣는 상태로 변경 (isListening = true, 녹색 점 활성화)
                const isListening = false;
                const statusText = "Idle";

                // 각 친구들이 서로 다른 노래를 듣고 있는 것처럼 연출하기 위한 모의 곡 리스트
                const mockSongs = [
                  "Blinding Lights • The Weeknd",
                  "Attention • NewJeans",
                  "Seven • Jung Kook",
                  "Super Shy • NewJeans",
                  "Dynamite • BTS",
                ];
                const songIndex =
                  friend._id.charCodeAt(friend._id.length - 1) %
                  mockSongs.length;
                const currentSong = mockSongs[songIndex];

                return (
                  <div
                    key={friend._id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800/40 transition-all duration-200 cursor-pointer group"
                  >
                    {/* User Image with status dot */}
                    <div className="relative w-10 h-10 shrink-0">
                      <img
                        src={friend.imageUrl}
                        alt={friend.fullName}
                        className="w-full h-full object-cover rounded-full"
                      />
                      {/* 상태 표시 점 (회색: bg-zinc-500, 녹색: bg-emerald-500) */}
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#121212] ${
                          isListening ? "bg-emerald-500" : "bg-zinc-500"
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors duration-150">
                          {friend.fullName}
                        </span>
                        {isListening && (
                          <Music className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {isListening ? (
                          <span className="text-xs text-emerald-400 truncate">
                            {currentSong}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 truncate">
                            {statusText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LoginPlaceHolder = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
    <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 text-zinc-400">
      <Users className="w-8 h-8" />
    </div>
    <h4 className="text-sm font-semibold text-zinc-200 mb-2">
      See what friends are playing
    </h4>
    <p className="text-xs text-zinc-400 max-w-50 mb-4">
      Sign in to see your friends' real-time activity and what music they are
      listening to.
    </p>
  </div>
);

const SkeletonLoading = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 rounded-md animate-pulse"
        >
          <div className="w-10 h-10 bg-zinc-800 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800 rounded-sm w-3/4" />
            <div className="h-3 bg-zinc-800 rounded-sm w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RightSidebar;
