import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { MessageSquare, Send, Headphones, Trash2 } from "lucide-react";
import { useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";

// 시간 포맷 헬퍼 함수 (오전/오후 HH:MM)
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "오후" : "오전";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0시를 12시로 표시
  return `${ampm} ${hours}:${minutes}`;
};

const ChatPage = () => {
  const { isSignedIn, isLoaded } = useUser(); // Clerk의 로그인 여부 및 로드 완료 상태 가져오기
  const {
    messages,
    selectedUser,
    isLoading,
    fetchUsers,
    fetchMessages,
    sendMessage,
    onlineUsers,
    userActivities,
    setIsChatActive, // 채팅 활성화 플래그 함수 임포트
    clearMessages, // 메시지 삭제 함수 임포트
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 안 읽은 새 메시지 영역의 강조 및 구분선 노출 여부를 관리하는 상태
  const [showUnreadDivider, setShowUnreadDivider] = useState(true);
  const [prevUserId, setPrevUserId] = useState<string | undefined>(selectedUser?._id);

  // 이전 선택한 유저와 현재 유저가 다르면 상태를 리셋 (동기 리렌더 방지 패턴)
  if (selectedUser?._id !== prevUserId) {
    setPrevUserId(selectedUser?._id);
    setShowUnreadDivider(true);
  }

  // 1. 컴포넌트 마운트 시 전체 유저 목록 로드 및 채팅 화면 활성화 플래그 관리
  useEffect(() => {
    if (isSignedIn) {
      fetchUsers();
    }
    setIsChatActive(true); // 채팅 페이지 들어옴 표시

    return () => {
      setIsChatActive(false); // 채팅 페이지를 나감 표시
    };
  }, [fetchUsers, isSignedIn, setIsChatActive]);

  // 2. 대화 상대 선택 시 해당 사용자와의 메시지 목록 로드 및 구분선 타이머 작동
  useEffect(() => {
    if (selectedUser && isSignedIn) {
      fetchMessages(selectedUser._id);
      
      const timer = setTimeout(() => {
        setShowUnreadDivider(false);
      }, 10000); // 10초

      return () => clearTimeout(timer);
    }
  }, [selectedUser, fetchMessages, isSignedIn]);

  // 3. 메시지가 추가되거나 상대방이 바뀌면 채팅창 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. 메시지 전송 핸들러
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser) return;

    await sendMessage(selectedUser._id, inputMessage.trim());
    setInputMessage("");
  };

  // 5. 메시지 전체 삭제 핸들러
  const handleEraseMessages = async () => {
    if (!selectedUser) return;
    const confirmDelete = window.confirm(
      `${selectedUser.fullName}님과의 모든 채팅 메시지를 삭제하시겠습니까?\n삭제된 메시지는 복구할 수 없습니다.`
    );
    
    if (confirmDelete) {
      await clearMessages(selectedUser._id);
    }
  };

  // Clerk 인증 상태가 아직 로드되지 않은 상태라면 로딩 표시
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 로그인하지 않은 비인증 사용자가 접근하려 할 경우 홈페이지("/")로 튕겨냄 (Route Guard)
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // 새로운 메시지 구분선 출력을 위한 변수
  let unreadDividerRendered = false;

  return (
    <div className="h-[calc(100vh-130px)] bg-[#121212] rounded-lg overflow-hidden border border-zinc-800/30 flex flex-col">
      {selectedUser ? (
        <>
          {/* 1. 대화 상대방 헤더 */}
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-[#121212]/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <img
                  src={selectedUser.imageUrl}
                  alt={selectedUser.fullName}
                  className="w-full h-full object-cover rounded-full border border-zinc-700/50"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-[#121212] ${
                    onlineUsers.includes(selectedUser.clerkId) ? "bg-emerald-500" : "bg-zinc-500"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">{selectedUser.fullName}</h3>
                <p className="text-xs text-zinc-400">
                  {onlineUsers.includes(selectedUser.clerkId) ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* 상대방이 노래 재생 중일 때 헤더에 표시 */}
              {onlineUsers.includes(selectedUser.clerkId) &&
                userActivities[selectedUser.clerkId]?.status === "Listening" && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 max-w-[150px] sm:max-w-xs md:max-w-md shrink-0 animate-pulse">
                    <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-emerald-300 truncate font-medium">
                      {userActivities[selectedUser.clerkId].activity}
                    </span>
                  </div>
                )}

              {/* 메시지 삭제 버튼 */}
              <button
                onClick={handleEraseMessages}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                title="Erase chatting messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Erase messages</span>
              </button>
            </div>
          </div>

          {/* 2. 메시지 내용 영역 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                <MessageSquare className="w-12 h-12 text-zinc-700 animate-bounce" />
                <p className="text-sm">Start your conversation with {selectedUser.fullName}</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMyMessage = message.senderId !== selectedUser._id;
                // 내가 받음 + 안 읽은 메시지 확인
                const isUnread = !isMyMessage && !message.isRead;
                
                // 구분선 노출 중일 때만 안 읽은 영역으로 강조 및 구분선 렌더링
                const shouldHighlight = isUnread && showUnreadDivider;

                return (
                  <div key={message._id}>
                    {/* 신규 안 읽은 메시지 구분선 (10초가 지나 다 확인하면 부드럽게 사라짐) */}
                    {shouldHighlight && !unreadDividerRendered && (
                      (() => {
                        unreadDividerRendered = true;
                        return (
                          <div className="flex items-center my-6 transition-all duration-500 ease-in-out">
                            <div className="flex-1 border-t border-emerald-500/30 animate-pulse" />
                            <span className="px-4 py-1.5 bg-emerald-500/10 rounded-full text-[10px] text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/20 shadow-sm shadow-emerald-500/5 animate-fade-in">
                              New Messages
                            </span>
                            <div className="flex-1 border-t border-emerald-500/30 animate-pulse" />
                          </div>
                        );
                      })()
                    )}

                    <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mt-2`}>
                      <div
                        className={`max-w-md p-4 rounded-2xl relative shadow-md group border transition-all duration-500 ${
                          isMyMessage
                            ? "bg-emerald-600 text-white rounded-tr-none border-transparent"
                            : shouldHighlight
                            ? "bg-zinc-900 text-zinc-200 rounded-tl-none border-emerald-500/40 ring-4 ring-emerald-500/5 shadow-lg shadow-emerald-500/5"
                            : "bg-zinc-800 text-zinc-200 rounded-tl-none border-transparent"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-2">
                          {message.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 opacity-60">
                          <span className="text-[9px] ml-auto">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. 메시지 입력창 */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-zinc-800/50 bg-[#121212]/80 backdrop-blur-md flex items-center gap-3 shrink-0"
          >
            <input
              type="text"
              placeholder={`Send a message to ${selectedUser.fullName}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-zinc-800 text-white text-sm rounded-full py-3 px-5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black disabled:text-zinc-600 rounded-full transition-all duration-200 cursor-pointer shadow-md disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      ) : (
        // 4. 플레이스홀더 영역 (화면 중앙 정렬)
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500 bg-[#181818]/20">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 bg-zinc-800/40 border border-zinc-800/50 rounded-full flex items-center justify-center shadow-inner">
              <MessageSquare className="w-12 h-12 text-zinc-400 animate-bounce" />
            </div>
          </div>
          <h3 className="text-zinc-200 font-extrabold text-xl mb-2 tracking-tight">No conversation selected</h3>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed mb-6">
            오른쪽 사이드바의 친구 목록에서 대화할 대상을 선택하여 실시간 채팅을 시작해보세요!
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
