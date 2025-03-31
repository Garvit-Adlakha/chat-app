import React, { useState, useRef } from 'react'
import { transformImage } from '../../lib/feature'
import { IconFileHorizontalFilled, IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react'

// FileIcon component for document representation
const FileIcon = () => (
  <div className="flex flex-col items-center p-3 sm:p-4 md:p-6 bg-zinc-900 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-900/90 transition-colors w-full max-w-[200px] mx-auto">
    <IconFileHorizontalFilled className="w-8 h-8 sm:w-10 sm:h-10" />
    <span className="text-xs sm:text-sm text-gray-500 mt-1">
      Document
    </span>
  </div>
)

const RenderAttachments = (file, url) => {
    switch(file){
        case "video":
            return (
                <div className="w-full max-w-md mx-auto">
                    <video 
                        src={url} 
                        preload='none' 
                        controls 
                        className="w-full h-auto rounded-lg object-cover max-h-[300px]" 
                    />
                </div>
            )
        case "image":
            return (
                <div className="w-full max-w-md mx-auto">
                    <img     
                        src={transformImage(url, 200)}
                        alt="Attachment"
                        className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] h-auto max-h-[200px] object-contain mx-auto rounded-lg"
                    />
                </div>
            )
        case "audio":
            return (
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    <AudioPlayer url={url} />
                </div>
            )
        default:
            return <FileIcon />
    }
}

const AudioPlayer = ({ url }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlay = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgress = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        audioRef.current.currentTime = newTime;
        setProgress(pos * 100);
        setCurrentTime(newTime);
    };

    const handleTimeUpdate = () => {
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setCurrentTime(current);
        setProgress((current / duration) * 100);
    };

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    return (
        <div 
            className="flex items-center gap-3 p-3 rounded-lg bg-black/20" 
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={togglePlay}
                className="p-2 rounded-full hover:bg-black/30 active:bg-black/40 transition-colors"
            >
                {isPlaying ? (
                    <IconPlayerPauseFilled className="w-5 h-5" />
                ) : (
                    <IconPlayerPlayFilled className="w-5 h-5" />
                )}
            </button>
            <div className="flex-1 flex flex-col gap-1 min-w-[150px]">
                <div 
                    ref={progressBarRef}
                    className="w-full bg-black/20 rounded-full h-1.5 cursor-pointer relative overflow-hidden"
                    onClick={handleProgress}
                >
                    <div 
                        className="absolute top-0 left-0 h-full bg-white/90 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-white/70">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
                className="hidden"
            />
        </div>
    );
};

export default RenderAttachments