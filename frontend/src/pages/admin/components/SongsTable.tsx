import { useMusicStore } from "@/store/useMusicStore";
import { Trash2, Calendar, Music } from "lucide-react";

const SongsTable = () => {
  const { songs, isLoading, deleteSong, fetchStats } = useMusicStore();

  const handleDelete = async (id: string) => {
    if (window.confirm("정말로 이 노래를 삭제하시겠습니까?")) {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-zinc-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <Music className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm">등록된 노래가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-zinc-900/50 border border-zinc-800/80 rounded-xl backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <th className="py-4 px-6">Title</th>
            <th className="py-4 px-6">Artist</th>
            <th className="py-4 px-6">Date Added</th>
            <th className="py-4 px-6">Duration</th>
            <th className="py-4 px-6 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50 text-zinc-300 text-sm">
          {songs.map((song) => (
            <tr
              key={song._id}
              className="hover:bg-zinc-800/40 transition-colors group"
            >
              <td className="py-3 px-6 flex items-center gap-3">
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover shadow-md group-hover:scale-105 transition-transform duration-200"
                />
                <div>
                  <p className="font-semibold text-white truncate max-w-[200px]">
                    {song.title}
                  </p>
                </div>
              </td>
              <td className="py-3 px-6 text-zinc-400 font-medium truncate max-w-[150px]">
                {song.artist}
              </td>
              <td className="py-3 px-6 text-zinc-500 flex items-center gap-1.5 h-16">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(song.createdAt)}</span>
              </td>
              <td className="py-3 px-6 text-zinc-400 font-medium">
                {formatDuration(song.duration)}
              </td>
              <td className="py-3 px-6 text-right">
                <button
                  onClick={() => handleDelete(song._id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
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
