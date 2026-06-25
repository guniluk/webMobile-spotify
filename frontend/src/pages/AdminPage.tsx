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
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-950">
        <div className="w-full max-w-md p-8 text-center border shadow-2xl bg-zinc-900 border-zinc-800 rounded-2xl">
          <div className="inline-flex p-4 mb-4 text-red-500 rounded-full bg-red-500/10 animate-bounce">
            <ShieldAlert size={48} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">
            You are not Admin
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-zinc-400">
            You are not authorized to access this page. Please login with an
            admin account.
          </p>
          <a
            href="/"
            className="inline-flex w-full justify-center px-4 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg shadow-lg hover:shadow-green-500/10 transition-all duration-300"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-linear-to-b from-zinc-900 to-black">
      {/* Top Header */}
      <Topbar />

      <main className="px-4 py-8 mx-auto max-w-7xl md:px-8">
        {/* Title Section */}
        <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 text-green-500 border shadow-inner bg-green-500/10 rounded-2xl border-green-500/20">
              <Settings className="w-8 h-8 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tighter text-green-500">
                  Spotify
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-white">
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
        <div className="p-6 border bg-zinc-900/20 border-zinc-800/60 rounded-2xl backdrop-blur-xl">
          {/* Library Header */}
          <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              {activeTab === "songs" ? (
                <>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Songs Library
                    </h2>
                    <p className="text-xs font-medium text-zinc-500">
                      Total {songs.length} Songs
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                    <Library className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Albums Library
                    </h2>
                    <p className="text-xs font-medium text-zinc-500">
                      Total {albums.length} Albums
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
          <div className="pr-1 overflow-y-auto max-h-125 custom-scrollbar">
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
