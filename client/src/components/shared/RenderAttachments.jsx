import React, { useState, useRef, useEffect } from 'react'
import { transformImage } from '../../lib/feature'
import { 
    IconFileHorizontalFilled, 
    IconPlayerPlayFilled, 
    IconPlayerPauseFilled, 
    IconDownload, 
    IconVolume, 
    IconVolumeOff,
    IconMaximize,
    IconPlayerTrackNext,
    IconPlayerTrackPrev,
    IconFileTypePdf
} from '@tabler/icons-react'

// FileIcon component for document representation
const FileIcon = () => (
  <div className="flex flex-col items-center p-4 bg-zinc-900/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg hover:bg-zinc-800 hover:scale-[1.02] transition-all duration-300 w-full max-w-[200px] mx-auto">
    <div className="bg-gray-800/60 p-3 rounded-full mb-2">
      <IconFileHorizontalFilled className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
    </div>
    <span className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
      Document
    </span>
  </div>
)

const PdfAttachment = ({ url, onClick }) => {
    const filename = url.split('/').pop();
    
    return (
        <div 
            className="flex flex-col items-center p-4 bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg w-full max-w-[280px] mx-auto relative cursor-pointer"
            onClick={onClick}
        >
            {/* Icon container */}
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 p-4 rounded-xl mb-3 relative">
                <IconFileTypePdf className="w-12 h-12 text-red-400" stroke={1.5} />
                <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent animate-pulse rounded-xl" />
            </div>
            
            {/* File info */}
            <div className="space-y-1 text-center z-10">
                <p className="text-xs text-gray-400">PDF Document</p>
            </div>
        </div>
    );
};

const RenderAttachments = (file, url) => {
    const handlePdfOpen = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Force download instead of opening in browser
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop(); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    switch(file){
        case "video":
            return <CustomVideoPlayer url={url} />
        case "image":
            return (
                <div className="w-full max-w-md mx-auto group">
                    <div className="overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-700 bg-zinc-900/30 p-1">
                        <img     
                            src={transformImage(url, 300)}
                            alt="Attachment"
                            className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] h-auto max-h-[250px] object-contain mx-auto rounded-lg group-hover:scale-[1.02] transition-transform duration-300"
                            loading="lazy"
                        />
                    </div>
                </div>
            )
        case "audio":
            return (
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    <AudioPlayer url={url} />
                </div>
            )
        case "pdf":
            return <PdfAttachment url={url} onClick={(e) => handlePdfOpen(e, url)} />;
        default:
            return <FileIcon />
    }
}

const CustomVideoPlayer = ({ url }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const togglePlay = () => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(err => {
                console.error("Error playing video:", err);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgress = (e) => {
        if (!videoRef.current) return;
        
        const video = videoRef.current;
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        
        const video = videoRef.current;
        setProgress((video.currentTime / video.duration) * 100);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e) => {
        if (!videoRef.current) return;
        
        const value = parseFloat(e.target.value);
        videoRef.current.volume = value;
        setVolume(value);
        setIsMuted(value === 0);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        
        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) {
                containerRef.current.webkitRequestFullscreen();
            } else if (containerRef.current.msRequestFullscreen) {
                containerRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                document.fullscreenElement === containerRef.current ||
                document.webkitFullscreenElement === containerRef.current ||
                document.msFullscreenElement === containerRef.current
            );
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const skip = (seconds) => {
        if (!videoRef.current) return;
        
        videoRef.current.currentTime += seconds;
    };

    return (
        <div 
            ref={containerRef}
            className="w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-lg relative bg-black"
        >
            <video
                ref={videoRef}
                src={url}
                className="w-full h-auto rounded-xl object-cover max-h-[300px]"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
            />
            
            {/* Custom Controls - always visible */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                {/* Progress bar */}
                <div 
                    className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4"
                    onClick={handleProgress}
                >
                    <div 
                        className="h-full bg-red-500 rounded-full relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-400 rounded-full"></div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => skip(-10)} className="text-white hover:text-red-400 transition-colors">
                            <IconPlayerTrackPrev className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={togglePlay}
                            className="text-white hover:text-red-400 transition-colors"
                        >
                            {isPlaying ? (
                                <IconPlayerPauseFilled className="w-6 h-6" />
                            ) : (
                                <IconPlayerPlayFilled className="w-6 h-6" />
                            )}
                        </button>
                        <button onClick={() => skip(10)} className="text-white hover:text-red-400 transition-colors">
                            <IconPlayerTrackNext className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute} className="text-white hover:text-red-400 transition-colors">
                                {isMuted ? <IconVolumeOff className="w-5 h-5" /> : <IconVolume className="w-5 h-5" />}
                            </button>
                            <input 
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 accent-red-500"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={toggleFullscreen}
                        className="text-white hover:text-red-400 transition-colors"
                    >
                        <IconMaximize className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

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
        
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgress = (e) => {
        if (!audioRef.current || !progressBarRef.current) return;
        
        e.preventDefault();
        e.stopPropagation();
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        if (!isNaN(newTime) && isFinite(newTime)) {
            audioRef.current.currentTime = newTime;
            setProgress(pos * 100);
            setCurrentTime(newTime);
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setCurrentTime(current);
        setProgress((current / duration) * 100);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        
        setDuration(audioRef.current.duration);
    };

    return (
        <div 
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300" 
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={togglePlay}
                className="p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 transition-colors text-white"
            >
                {isPlaying ? (
                    <IconPlayerPauseFilled className="w-5 h-5" />
                ) : (
                    <IconPlayerPlayFilled className="w-5 h-5" />
                )}
            </button>
            <div className="flex-1 flex flex-col gap-1.5 min-w-[150px]">
                <div 
                    ref={progressBarRef}
                    className="w-full bg-gray-700 rounded-full h-2 cursor-pointer relative overflow-hidden"
                    onClick={handleProgress}
                >
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-white/80">
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