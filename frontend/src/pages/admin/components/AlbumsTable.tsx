import { useMusicStore } from "@/store/useMusicStore";
import { Trash2, Library } from "lucide-react";

const AlbumsTable = () => {
  const { albums, isLoading, deleteAlbum, fetchStats, fetchSongs } =
    useMusicStore();

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Do you really want to delete this album? If you delete the album, all songs included in the album will be deleted together.",
      )
    ) {
      await deleteAlbum(id);
      await Promise.all([fetchSongs(), fetchStats()]);
    }
  };

  if (isLoading && albums.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-b-2 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border rounded-lg text-zinc-400 bg-zinc-900/50 border-zinc-800">
        <Library className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm">There are no registered albums.</p>
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
            <th className="px-6 py-4">Release Year</th>
            <th className="px-6 py-4">Songs</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-zinc-800/50 text-zinc-300">
          {albums.map((album) => (
            <tr
              key={album._id}
              className="transition-colors hover:bg-zinc-800/40 group"
            >
              <td className="flex items-center gap-3 px-6 py-3">
                <img
                  src={album.imageUrl}
                  alt={album.title}
                  className="object-cover w-10 h-10 transition-transform duration-200 rounded shadow-md group-hover:scale-105"
                />
                <div>
                  <p className="font-semibold text-white truncate max-w-50">
                    {album.title}
                  </p>
                </div>
              </td>
              <td className="py-3 px-6 text-zinc-400 font-medium truncate max-w-37.5">
                {album.artist}
              </td>
              <td className="px-6 py-3 font-medium text-zinc-400">
                {album.releaseYear}
              </td>
              <td className="h-16 px-6 py-3 font-semibold text-zinc-500">
                {album.songs?.length ?? 0}{" "}
                {album.songs?.length === 1 ? "song" : "songs"}
              </td>
              <td className="px-6 py-3 text-right">
                <button
                  onClick={() => handleDelete(album._id)}
                  className="p-2 transition-colors rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
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
