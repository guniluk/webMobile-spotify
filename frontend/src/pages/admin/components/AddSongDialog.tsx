import React, { useRef, useState } from "react";
import { useMusicStore } from "@/store/useMusicStore";
import { X, Upload, Music, Image as ImageIcon, CheckCircle } from "lucide-react";

interface AddSongDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSongDialog = ({ isOpen, onClose }: AddSongDialogProps) => {
  const { albums, createSong, fetchStats } = useMusicStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [durationStr, setDurationStr] = useState(""); // MM:SS or seconds

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const parseDuration = (str: string): number => {
    // MM:SS 형식 파싱
    if (str.includes(":")) {
      const parts = str.split(":");
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return minutes * 60 + seconds;
    }
    // 그냥 숫자(초)인 경우
    return parseInt(str, 10) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !artist.trim() || !durationStr.trim()) {
      setError("모든 텍스트 필드를 입력해 주세요.");
      return;
    }

    if (!imageFile) {
      setError("커버 이미지를 업로드해 주세요.");
      return;
    }

    if (!audioFile) {
      setError("오디오 파일을 업로드해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const duration = parseDuration(durationStr);
      if (duration <= 0) {
        throw new Error("올바른 재생 시간을 입력해 주세요 (예: 3:20 또는 초 단위 숫자).");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("duration", duration.toString());
      if (albumId) {
        formData.append("albumId", albumId);
      }
      formData.append("imageFile", imageFile);
      formData.append("audioFile", audioFile);

      await createSong(formData);
      await fetchStats();

      // Reset form
      setTitle("");
      setArtist("");
      setAlbumId("");
      setDurationStr("");
      setImageFile(null);
      setAudioFile(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "노래 추가에 실패했습니다.");
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
          <Music className="w-5 h-5 text-green-500" />
          <span>Add New Song</span>
        </h2>
        <p className="text-xs text-zinc-400 mb-6">
          음악 카탈로그에 새로운 노래를 추가합니다.
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
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title"
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

          {/* Duration & Album */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <input
                type="text"
                value={durationStr}
                onChange={(e) => setDurationStr(e.target.value)}
                placeholder="e.g. 3:45 or 225"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/60 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Album (Optional)
              </label>
              <select
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/60 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors cursor-pointer"
              >
                <option value="">None (Single)</option>
                {albums.map((album) => (
                  <option key={album._id} value={album._id}>
                    {album.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Cover Image File
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
                    Upload Cover Image
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    PNG, JPG or WEBP up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Audio File
            </label>
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioChange}
              accept="audio/*"
              className="hidden"
            />
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-green-500 bg-zinc-800/40 hover:bg-zinc-800/80 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
            >
              {audioFile ? (
                <div className="flex flex-col items-center text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2 animate-bounce" />
                  <p className="text-xs text-white font-medium truncate max-w-[250px]">
                    {audioFile.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-zinc-500 group-hover:text-green-500 mb-2 transition-colors duration-300" />
                  <p className="text-xs text-zinc-300 font-medium">
                    Upload Audio File
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    MP3, WAV or OGG up to 10MB
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
                <span>Add Song</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSongDialog;
