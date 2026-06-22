import { useEffect } from "react";
import Topbar from "@/components/Topbar";
import { useMusicStore, type Song } from "@/store/useMusicStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Pause } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good night";
};

function HomePage() {
  const {
    featuredSongs,
    madeForYouSongs,
    trendingSongs,
    fetchFeaturedSongs,
    fetchMadeForYouSongs,
    fetchTrendingSongs,
    isLoading,
  } = useMusicStore();

  const { currentSong, isPlaying, playSong, initializeQueue } =
    usePlayerStore();

  useEffect(() => {
    fetchFeaturedSongs();
    fetchMadeForYouSongs();
    fetchTrendingSongs();
  }, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs]);

  const greeting = getGreeting();

  const handlePlaySong = (song: Song, sectionSongs: Song[]) => {
    if (sectionSongs.length > 0) {
      initializeQueue(sectionSongs);
    }
    playSong(song);
  };

  return (
    <div className="space-y-8 select-none">
      <Topbar />

      {/* Featured Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
          {greeting}
        </h1>

        {isLoading ? (
          <FeaturedSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSongs.slice(0, 6).map((song) => {
              const isCurrent = currentSong?._id === song._id;
              const isPlayingSong = isCurrent && isPlaying;

              return (
                <div
                  key={song._id}
                  onClick={() => handlePlaySong(song, featuredSongs)}
                  className="flex items-center bg-zinc-800/30 hover:bg-zinc-800/60 rounded-md overflow-hidden transition-all group relative cursor-pointer pr-4"
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-20 h-20 object-cover shrink-0"
                  />
                  <div className="flex-1 p-4 min-w-0">
                    <h3 className="font-semibold text-white truncate text-base">
                      {song.title}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md">
                    <button className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                      {isPlayingSong ? (
                        <Pause className="w-5 h-5 text-black fill-black" />
                      ) : (
                        <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Made For You Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
          Made For You
        </h2>
        {isLoading ? (
          <SectionSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {madeForYouSongs.slice(0, 4).map((song) => {
              const isCurrent = currentSong?._id === song._id;
              const isPlayingSong = isCurrent && isPlaying;

              return (
                <div
                  key={song._id}
                  onClick={() => handlePlaySong(song, madeForYouSongs)}
                  className="bg-zinc-900/40 p-4 rounded-md hover:bg-zinc-800/40 transition-all cursor-pointer group relative flex flex-col min-w-0"
                >
                  <div className="relative w-full aspect-square mb-4 shadow-lg shrink-0">
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-end p-3">
                      <button className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform translate-y-2 group-hover:translate-y-0 duration-200">
                        {isPlayingSong ? (
                          <Pause className="w-4 h-4 text-black fill-black" />
                        ) : (
                          <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white truncate text-sm mb-1">
                    {song.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trending Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
          Trending
        </h2>
        {isLoading ? (
          <SectionSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trendingSongs.slice(0, 4).map((song) => {
              const isCurrent = currentSong?._id === song._id;
              const isPlayingSong = isCurrent && isPlaying;

              return (
                <div
                  key={song._id}
                  onClick={() => handlePlaySong(song, trendingSongs)}
                  className="bg-zinc-900/40 p-4 rounded-md hover:bg-zinc-800/40 transition-all cursor-pointer group relative flex flex-col min-w-0"
                >
                  <div className="relative w-full aspect-square mb-4 shadow-lg shrink-0">
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-end p-3">
                      <button className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform translate-y-2 group-hover:translate-y-0 duration-200">
                        {isPlayingSong ? (
                          <Pause className="w-4 h-4 text-black fill-black" />
                        ) : (
                          <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white truncate text-sm mb-1">
                    {song.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const FeaturedSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center bg-zinc-800/30 rounded-md overflow-hidden animate-pulse"
      >
        <div className="w-20 h-20 bg-zinc-800 shrink-0" />
        <div className="flex-1 p-4 space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-zinc-800 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const SectionSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-zinc-900/40 p-4 rounded-md animate-pulse">
        <div className="w-full aspect-square bg-zinc-800 rounded-md mb-4" />
        <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    ))}
  </div>
);

export default HomePage;
