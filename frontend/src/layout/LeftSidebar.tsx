import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Library,
  Play,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@clerk/react';
import { useMusicStore } from '@/store/useMusicStore';
import { useAuthStore } from '@/store/useAuthStore';

const LeftSidebar = () => {
  const { albums, fetchAlbums, isLoading } = useMusicStore();
  const { isAdmin, checkAdminStatus, reset } = useAuthStore();
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        if (!isAdmin) {
          checkAdminStatus();
        }
      } else {
        reset();
      }
    }
  }, [isLoaded, isSignedIn, isAdmin, checkAdminStatus, reset]);

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Navigation Box */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-4">
        <Link
          to="/"
          className={`flex items-center gap-4 text-sm font-semibold transition-colors duration-200 justify-center md:justify-start ${
            location.pathname === '/'
              ? 'text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="hidden md:inline">Home</span>
        </Link>
        {isSignedIn && (
          <Link
            to="/chat"
            className={`flex items-center gap-4 text-sm font-semibold transition-colors duration-200 justify-center md:justify-start ${
              location.pathname === '/chat'
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline">Messages</span>
          </Link>
        )}
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-4 text-sm font-semibold transition-colors duration-200 justify-center md:justify-start ${
              location.pathname === '/admin'
                ? 'text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline">Admin Dashboard</span>
          </Link>
        )}
      </div>

      {/* Library Box */}
      <div className="bg-[#121212] rounded-lg p-4 flex-1 flex flex-col min-h-0 gap-4">
        <div className="flex items-center justify-center md:justify-start text-zinc-400">
          <div className="flex items-center gap-2 text-sm font-semibold hover:text-white transition-colors duration-200 cursor-pointer">
            <Library className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline">Playlists</span>
          </div>
        </div>

        {/* Album List / Scroll Area */}
        <div className="flex-1 overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <div className="space-y-2">
            {isLoading ? (
              // Skeleton Loading
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-md justify-center md:justify-start"
                >
                  <div className="w-12 h-12 bg-zinc-800 rounded-md animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 hidden md:block">
                    <div className="h-4 bg-zinc-800 rounded-sm animate-pulse w-3/4" />
                    <div className="h-3 bg-zinc-800 rounded-sm animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : albums.length === 0 ? (
              <div className="text-xs text-zinc-500 py-8 text-center">
                <span className="hidden md:inline">No albums available.</span>
                <span className="inline md:hidden">—</span>
              </div>
            ) : (
              // Album items
              albums.map((album) => (
                <Link
                  key={album._id}
                  to={`/albums/${album._id}`}
                  className={`group flex items-center gap-3 p-2 rounded-md transition-all duration-200 hover:bg-zinc-800/50 justify-center md:justify-start ${
                    location.pathname === `/albums/${album._id}`
                      ? 'bg-zinc-800'
                      : ''
                  }`}
                >
                  <div className="relative w-12 h-12 shrink-0">
                    <img
                      src={album.imageUrl}
                      alt={album.title}
                      className="w-full h-full object-cover rounded-md shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 hidden md:block">
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors duration-150">
                      {album.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      Album • {album.artist}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
