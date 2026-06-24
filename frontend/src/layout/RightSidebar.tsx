import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useChatStore, type User } from "@/store/useChatStore";
import { Users, Music, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RightSidebar = () => {
  const {
    users,
    fetchUsers,
    isLoading,
    onlineUsers,
    userActivities,
    unreadUsers,
    setSelectedUser,
    selectedUser,
  } = useChatStore();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      fetchUsers();
    }
  }, [isSignedIn, fetchUsers]);

  // 본인 제외하고 최근 대화(메시지) 순으로 정렬하여 표시
  const filteredUsers = users
    .filter((u) => u.clerkId !== user?.id)
    .sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });

  // 친구 클릭 시 해당 친구를 선택하고 채팅 페이지로 이동시키는 핸들러
  const handleFriendClick = (friend: User) => {
    setSelectedUser(friend);
    navigate("/chat");
  };

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
                const activityInfo = userActivities[friend.clerkId];
                const isOnline = onlineUsers.includes(friend.clerkId);
                const isListening =
                  isOnline && activityInfo?.status === "Listening";
                const statusText = isOnline ? "Online" : "Offline";
                const currentSong = isListening ? activityInfo.activity : null;
                const isUnread = unreadUsers.includes(friend._id); // 해당 친구가 보낸 안 읽은 메시지가 있는지 여부
                const isSelected = selectedUser?._id === friend._id;

                return (
                  <div
                    key={friend._id}
                    onClick={() => handleFriendClick(friend)}
                    className={`flex items-center gap-3 p-2 rounded-md transition-all duration-200 cursor-pointer group ${
                      isSelected ? "bg-zinc-800" : "hover:bg-zinc-800/40"
                    }`}
                  >
                    {/* User Image with status dot & Check icon indicator (Blinking removed as requested) */}
                    <div className="relative w-10 h-10 shrink-0">
                      <img
                        src={friend.imageUrl}
                        alt={friend.fullName}
                        className="w-full h-full object-cover rounded-full border border-[#121212]"
                      />

                      {/* 안 읽은 새 메시지 노티 알림 체크 마크 (깜박임 대신 체크 표시 노출) */}
                      {isUnread && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#121212] flex items-center justify-center text-black shadow-md shadow-emerald-500/20 z-10 animate-scale-in">
                          <Check className="w-3 h-3 stroke-3" />
                        </span>
                      )}

                      {/* 상태 표시 점 (회색: 오프라인, 녹색: 온라인) */}
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#121212] ${
                          isOnline ? "bg-emerald-500" : "bg-zinc-500"
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium truncate transition-colors duration-150 ${
                            isUnread
                              ? "text-emerald-400 font-bold"
                              : "text-white group-hover:text-emerald-400"
                          }`}
                        >
                          {friend.fullName}
                        </span>
                        {isListening && (
                          <Music className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {isListening ? (
                          <span className="text-xs text-emerald-400 truncate font-medium">
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
