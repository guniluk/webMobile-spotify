import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMusicStore } from "@/store/useMusicStore";
import type { Song } from "@/store/useMusicStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Pause, Clock } from "lucide-react";

const AlbumPage = () => {
  const { albumId } = useParams();
  const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
  const { currentSong, isPlaying, playSong, togglePlay, initializeQueue } =
    usePlayerStore();

  useEffect(() => {
    if (albumId) {
      fetchAlbumById(albumId);
    }
  }, [albumId, fetchAlbumById]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="w-40 h-40 md:w-56 md:h-56 bg-neutral-800 rounded shadow-2xl"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-neutral-800 rounded w-20"></div>
            <div className="h-12 bg-neutral-800 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
          </div>
        </div>

        {/* Play Button Skeleton */}
        <div className="py-6">
          <div className="w-14 h-14 bg-neutral-800 rounded-full"></div>
        </div>

        {/* Song List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="w-4 h-4 bg-neutral-800 rounded"></div>
              <div className="w-10 h-10 bg-neutral-800 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-800 rounded w-1/3"></div>
                <div className="h-3 bg-neutral-800 rounded w-1/4"></div>
              </div>
              <div className="w-20 h-4 bg-neutral-800 rounded hidden md:block"></div>
              <div className="w-10 h-4 bg-neutral-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentAlbum) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-400">
        <p className="text-xl font-semibold">Album not found</p>
      </div>
    );
  }

  // Format track duration (seconds -> MM:SS)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Format release date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isAlbumPlaying = currentAlbum.songs.some(
    (song) => song._id === currentSong?._id,
  );

  const handlePlayAlbum = () => {
    if (!currentAlbum.songs || currentAlbum.songs.length === 0) return;

    if (isAlbumPlaying) {
      togglePlay();
    } else {
      initializeQueue(currentAlbum.songs);
      playSong(currentAlbum.songs[0]);
    }
  };

  const handlePlaySong = (song: Song) => {
    initializeQueue(currentAlbum.songs);
    playSong(song);
  };

  return (
    <div className="relative min-h-full bg-linear-to-b from-purple-900/60 via-zinc-900 to-black text-white p-4 md:p-6">
      {/* Album Header */}
      <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 pb-6 pt-4 text-center lg:text-left">
        <img
          src={currentAlbum?.imageUrl}
          alt={currentAlbum?.title}
          className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded shadow-[0_8px_24px_rgba(0,0,0,0.5)] object-cover shrink-0"
        />
        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
            Album
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-white tracking-tight leading-tight mb-2 wrap-break-word">
            {currentAlbum?.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm text-neutral-300 font-medium">
            <span className="font-bold text-white">{currentAlbum?.artist}</span>
            <span>•</span>
            <span>{currentAlbum?.songs?.length || 0} songs</span>
            <span>•</span>
            <span>{currentAlbum?.releaseYear}</span>
          </div>
        </div>
      </div>

      {/* Action Bar (Play Button) */}
      <div className="py-6 flex items-center justify-center lg:justify-start">
        <button
          onClick={handlePlayAlbum}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isAlbumPlaying && isPlaying ? (
            <Pause className="w-7 h-7 fill-black text-black" />
          ) : (
            <Play className="w-7 h-7 fill-black text-black ml-1" />
          )}
        </button>
      </div>

      {/* Song List Table */}
      <div className="mt-4">
        {/* Table Header */}
        <div className="grid grid-cols-[32px_1fr_auto] md:grid-cols-[40px_4fr_2fr_1fr] gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="hidden md:block">Released Date</div>
          <div className="text-right pr-4">
            <Clock className="w-4 h-4 inline-block" />
          </div>
        </div>

        {/* Table Body */}
        <div className="space-y-1 mt-3">
          {currentAlbum?.songs?.map((song, index) => {
            const isCurrentSong = currentSong?._id === song._id;
            return (
              <div
                key={song._id}
                onDoubleClick={() => handlePlaySong(song)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handlePlaySong(song);
                  }
                }}
                className="grid grid-cols-[32px_1fr_auto] md:grid-cols-[40px_4fr_2fr_1fr] gap-4 items-center px-4 py-3 hover:bg-white/10 rounded-md group cursor-pointer transition-colors duration-150 focus:outline-none focus:bg-white/10"
              >
                {/* Index / Play Button */}
                <div className="flex items-center justify-center w-8 md:w-10">
                  {isCurrentSong && isPlaying ? (
                    <div className="text-green-500 font-bold group-hover:hidden animate-pulse">
                      🔊
                    </div>
                  ) : (
                    <span
                      className={`text-neutral-400 group-hover:hidden font-semibold text-sm ${
                        isCurrentSong ? "text-green-500" : ""
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}

                  <button
                    onClick={() => handlePlaySong(song)}
                    className="hidden group-hover:block text-white hover:scale-105 active:scale-95 transition-transform"
                  >
                    {isCurrentSong && isPlaying ? (
                      <Pause className="w-4 h-4 fill-white text-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Title & Image */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-10 h-10 object-cover rounded shrink-0 shadow"
                  />
                  <div className="min-w-0">
                    <p
                      className={`font-medium truncate text-sm ${
                        isCurrentSong ? "text-green-500" : "text-white"
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-neutral-400 group-hover:text-neutral-300 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Released Date */}
                <div className="hidden md:block text-sm text-neutral-400 truncate">
                  {formatDate(song.createdAt)}
                </div>

                {/* Duration */}
                <div className="text-sm text-neutral-400 text-right pr-4 font-medium">
                  {formatDuration(song.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlbumPage;
