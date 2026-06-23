import React, { useRef, useState } from "react";
import { useMusicStore } from "@/store/useMusicStore";
import { X, Image as ImageIcon, Library, CheckCircle } from "lucide-react";

interface AddAlbumDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAlbumDialog = ({ isOpen, onClose }: AddAlbumDialogProps) => {
  const { createAlbum, fetchStats } = useMusicStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());

  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !artist.trim()) {
      setError("모든 텍스트 필드를 입력해 주세요.");
      return;
    }

    if (!imageFile) {
      setError("앨범 커버 이미지를 업로드해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("releaseYear", releaseYear.toString());
      formData.append("imageFile", imageFile);

      await createAlbum(formData);
      await fetchStats();

      // Reset form
      setTitle("");
      setArtist("");
      setReleaseYear(new Date().getFullYear());
      setImageFile(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "앨범 추가에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-md shadow-2xl relative animate-in fade-in-50 zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Library className="w-5 h-5 text-green-500" />
          <span>Add New Album</span>
        </h2>
        <p className="text-xs text-zinc-400 mb-6">
          음악 카탈로그에 새로운 앨범을 추가합니다.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Album Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter album title"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/60 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Artist */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Artist
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/60 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Release Year */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Release Year
            </label>
            <input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(parseInt(e.target.value, 10))}
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Album Cover Image File
            </label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-green-500 bg-zinc-800/40 hover:bg-zinc-800/80 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
            >
              {imageFile ? (
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2 animate-bounce" />
                  <p className="text-xs text-white font-medium truncate max-w-[250px]">
                    {imageFile.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-zinc-500 group-hover:text-green-500 mb-2 transition-colors duration-300" />
                  <p className="text-xs text-zinc-300 font-medium">
                    Upload Album Cover Image
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    PNG, JPG or WEBP up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 hover:border-zinc-600 rounded-lg text-zinc-300 text-sm font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-semibold rounded-lg shadow-lg hover:shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Album</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAlbumDialog;
