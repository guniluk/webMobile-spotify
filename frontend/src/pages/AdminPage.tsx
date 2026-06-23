import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMusicStore } from "@/store/useMusicStore";
import { useAuthStore } from "@/store/useAuthStore";
import DashboardStats from "./admin/components/DashboardStats";
import SongsTable from "./admin/components/SongsTable";
import AlbumsTable from "./admin/components/AlbumsTable";
import AddSongDialog from "./admin/components/AddSongDialog";
import AddAlbumDialog from "./admin/components/AddAlbumDialog";
import {
  Music,
  Disc,
  Plus,
  Library,
  Settings,
  ShieldAlert,
  Home,
} from "lucide-react";
import Topbar from "@/components/Topbar";

const AdminPage = () => {
  const { fetchSongs, fetchAlbums, fetchStats, songs, albums } =
    useMusicStore();
  const { isAdmin } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"songs" | "albums">("songs");
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  // 어드민 권한 확인이 통과된 경우에만 관련 음악 데이터 호출
  useEffect(() => {
    if (isAdmin) {
      fetchSongs();
      fetchAlbums();
      fetchStats();
    }
  }, [isAdmin, fetchSongs, fetchAlbums, fetchStats]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-4 animate-bounce">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">접근 제한됨</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            죄송합니다. 이 페이지는 관리자만 접근할 수 있습니다. <br />
            관리자 계정으로 로그인해 주세요.
          </p>
          <a
            href="/"
            className="inline-flex w-full justify-center px-4 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg shadow-lg hover:shadow-green-500/10 transition-all duration-300"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 to-black text-white">
      {/* Top Header */}
      <Topbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20 shadow-inner">
              <Settings className="w-8 h-8 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-extrabold text-2xl tracking-tighter">
                  Spotify
                </span>
                <span className="text-white font-extrabold text-2xl tracking-tight">
                  Music Manager
                </span>
              </div>
              <p className="text-zinc-400 text-sm mt-0.5 font-medium">
                Manage your music catalog
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white text-sm font-semibold transition-all duration-300 shadow-md w-fit cursor-pointer animate-in fade-in slide-in-from-right-3"
          >
            <Home className="w-4 h-4 text-green-500" />
            <span>Home</span>
          </Link>
        </div>

        {/* Dashboard Stat Cards */}
        <DashboardStats />

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-3 mb-6 bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-800/80 w-fit">
          <button
            onClick={() => setActiveTab("songs")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === "songs"
                ? "bg-green-500 text-black shadow-lg shadow-green-500/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Songs</span>
          </button>
          <button
            onClick={() => setActiveTab("albums")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === "albums"
                ? "bg-green-500 text-black shadow-lg shadow-green-500/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>Albums</span>
          </button>
        </div>

        {/* Content Section (Library Lists) */}
        <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-xl">
          {/* Library Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              {activeTab === "songs" ? (
                <>
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Songs Library
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium">
                      총 {songs.length}곡
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-violet-500/10 text-violet-500 rounded-lg">
                    <Library className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Albums Library
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium">
                      총 {albums.length}개 앨범
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Add Button */}
            {activeTab === "songs" ? (
              <button
                onClick={() => setIsSongModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg shadow-lg hover:shadow-green-500/10 transition-all active:scale-95 duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Song</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAlbumModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg shadow-lg hover:shadow-green-500/10 transition-all active:scale-95 duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Album</span>
              </button>
            )}
          </div>

          {/* List Area with Scroll */}
          <div className="max-h-125 overflow-y-auto pr-1 custom-scrollbar">
            {activeTab === "songs" ? <SongsTable /> : <AlbumsTable />}
          </div>
        </div>
      </main>

      {/* Upload Modals */}
      <AddSongDialog
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
      />
      <AddAlbumDialog
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
      />
    </div>
  );
};

export default AdminPage;
