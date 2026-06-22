import { useEffect, useState, useRef } from "react";
import { usePlayerStore, audio } from "@/store/usePlayerStore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
} from "lucide-react";

export const PlaybackControls = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    volume,
    setVolume,
  } = usePlayerStore();

  const [currentTime, setCurrentTime] = useState(audio ? audio.currentTime : 0);
  const [duration, setDuration] = useState(audio ? audio.duration || 0 : 0);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(volume);

  useEffect(() => {
    if (!audio) return;

    const audioElement = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration || 0);
    };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Initial state Sync asynchronously to avoid cascading renders warning
    const timeoutId = setTimeout(() => {
      setCurrentTime(audioElement.currentTime);
      setDuration(audioElement.duration || 0);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [currentSong]);

  if (!currentSong) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolumeRef.current);
      setIsMuted(false);
    } else {
      prevVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="w-full bg-[#121212] border-t border-white/10 px-4 py-3 md:py-4 flex flex-col md:grid md:grid-cols-3 items-center justify-between gap-3 md:gap-0 rounded-lg mt-2">
      {/* Left side - Track Info */}
      <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
        <img
          src={currentSong.imageUrl}
          alt={currentSong.title}
          className="w-12 h-12 md:w-14 md:h-14 object-cover rounded shadow-md shrink-0"
        />
        <div className="min-w-0 flex-1 md:flex-none">
          <h4 className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
            {currentSong.title}
          </h4>
          <p className="text-xs text-neutral-400 truncate hover:underline cursor-pointer">
            {currentSong.artist}
          </p>
        </div>
      </div>

      {/* Center - Controls & Timeline */}
      <div className="flex flex-col items-center gap-2 w-full max-w-140 mx-auto">
        {/* Buttons */}
        <div className="flex items-center gap-4 md:gap-6">
          <button className="text-neutral-400 hover:text-white transition-colors cursor-pointer hidden md:block">
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={playPrevious}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button className="text-neutral-400 hover:text-white transition-colors cursor-pointer hidden md:block">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full text-xs text-neutral-400">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || currentSong.duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer hover:bg-neutral-500 accent-green-500 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:opacity-0 [&:hover::-webkit-slider-thumb]:opacity-100 transition-all"
          />
          <span className="w-8 text-left">
            {formatTime(duration || currentSong.duration)}
          </span>
        </div>
      </div>

      {/* Right side - Volume */}
      <div className="hidden md:flex items-center justify-end gap-3 w-full md:w-auto">
        <button
          onClick={toggleMute}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 md:w-24 h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer hover:bg-neutral-500 accent-green-500 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:opacity-0 [&:hover::-webkit-slider-thumb]:opacity-100 transition-all"
        />
      </div>
    </div>
  );
};

export default PlaybackControls;
