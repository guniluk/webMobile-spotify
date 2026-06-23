import { useMusicStore } from "@/store/useMusicStore";
import { Trash2, Library } from "lucide-react";

const AlbumsTable = () => {
  const { albums, isLoading, deleteAlbum, fetchStats, fetchSongs } = useMusicStore();

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "정말로 이 앨범을 삭제하시겠습니까? 앨범을 삭제하면 앨범에 포함된 모든 노래가 함께 삭제됩니다."
      )
    ) {
      await deleteAlbum(id);
      await Promise.all([fetchSongs(), fetchStats()]);
    }
  };

  if (isLoading && albums.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-zinc-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <Library className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm">등록된 앨범이 없습니다.</p>
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
            <th className="py-4 px-6">Release Year</th>
            <th className="py-4 px-6">Songs</th>
            <th className="py-4 px-6 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50 text-zinc-300 text-sm">
          {albums.map((album) => (
            <tr
              key={album._id}
              className="hover:bg-zinc-800/40 transition-colors group"
            >
              <td className="py-3 px-6 flex items-center gap-3">
                <img
                  src={album.imageUrl}
                  alt={album.title}
                  className="w-10 h-10 rounded object-cover shadow-md group-hover:scale-105 transition-transform duration-200"
                />
                <div>
                  <p className="font-semibold text-white truncate max-w-[200px]">
                    {album.title}
                  </p>
                </div>
              </td>
              <td className="py-3 px-6 text-zinc-400 font-medium truncate max-w-[150px]">
                {album.artist}
              </td>
              <td className="py-3 px-6 text-zinc-400 font-medium">
                {album.releaseYear}
              </td>
              <td className="py-3 px-6 text-zinc-500 font-semibold h-16">
                {album.songs?.length ?? 0} {album.songs?.length === 1 ? "song" : "songs"}
              </td>
              <td className="py-3 px-6 text-right">
                <button
                  onClick={() => handleDelete(album._id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete Album"
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

export default AlbumsTable;
