import { useMusicStore } from "@/store/useMusicStore";
import { Trash2, Calendar, Music } from "lucide-react";

const SongsTable = () => {
  const { songs, isLoading, deleteSong, fetchStats } = useMusicStore();

  const handleDelete = async (id: string) => {
    if (window.confirm("Do you really want to delete this song?")) {
      await deleteSong(id);
      await fetchStats();
    }
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading && songs.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-b-2 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border rounded-lg text-zinc-400 bg-zinc-900/50 border-zinc-800">
        <Music className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm">There are no songs registered.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border bg-zinc-900/50 border-zinc-800/80 rounded-xl backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-xs font-semibold tracking-wider uppercase border-b border-zinc-800 text-zinc-400">
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Artist</th>
            <th className="px-6 py-4">Date Added</th>
            <th className="px-6 py-4">Duration</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-zinc-800/50 text-zinc-300">
          {songs.map((song) => (
            <tr
              key={song._id}
              className="transition-colors hover:bg-zinc-800/40 group"
            >
              <td className="flex items-center gap-3 px-6 py-3">
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="object-cover w-10 h-10 transition-transform duration-200 rounded shadow-md group-hover:scale-105"
                />
                <div>
                  <p className="font-semibold text-white truncate max-w-50">
                    {song.title}
                  </p>
                </div>
              </td>
              <td className="py-3 px-6 text-zinc-400 font-medium truncate max-w-37.5">
                {song.artist}
              </td>
              <td className="py-3 px-6 text-zinc-500 flex items-center gap-1.5 h-16">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(song.createdAt)}</span>
              </td>
              <td className="px-6 py-3 font-medium text-zinc-400">
                {formatDuration(song.duration)}
              </td>
              <td className="px-6 py-3 text-right">
                <button
                  onClick={() => handleDelete(song._id)}
                  className="p-2 transition-colors rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                  title="Delete Song"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongsTable;
