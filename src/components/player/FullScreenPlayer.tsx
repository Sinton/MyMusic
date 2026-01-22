import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronDown, MoreHorizontal, MessageSquare, Shuffle,
    SkipBack, Play, Pause, SkipForward, Repeat, X,
    Heart, ListMusic, User, Disc, Share2, Clock,
    ChevronRight, ChevronLeft
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { mockComments, mockLyrics } from '../../data/mockData';
import { VolumeControl } from './index';
import { usePlaylistStore } from '../../stores/usePlaylistStore';

interface FullScreenPlayerProps {
    isOpen: boolean;
    onClose: () => void;
}

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ isOpen, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [menuView, setMenuView] = useState<'main' | 'playlist'>('main');
    const { isPlaying, togglePlay, currentTrack, nextTrack, previousTrack, currentTimeSec, durationSec, setProgress, queue, setTrack, play, shuffle, repeat, toggleMode, visualizerEnabled } = usePlayerStore();
    const { userPlaylists, addSongToPlaylist } = usePlaylistStore();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = (currentTimeSec / durationSec) * 100;
    const lyricsContainerRef = useRef<HTMLDivElement>(null);

    // Find active lyric index
    const activeLyricIndex = mockLyrics.findIndex((lyric, index) => {
        const nextLyric = mockLyrics[index + 1];
        return currentTimeSec >= lyric.time && (!nextLyric || currentTimeSec < nextLyric.time);
    });

    // Auto-scroll lyrics
    useEffect(() => {
        if (lyricsContainerRef.current && activeLyricIndex !== -1) {
            const container = lyricsContainerRef.current;
            const activeLine = container.children[activeLyricIndex] as HTMLElement;
            if (activeLine) {
                const containerHeight = container.offsetHeight;
                const offsetTop = activeLine.offsetTop;
                const lineHeight = activeLine.offsetHeight;
                container.scrollTo({
                    top: offsetTop - containerHeight / 2 + lineHeight / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeLyricIndex]);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        setProgress(Math.floor(percent * durationSec));
    };

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col bg-[var(--bg-color)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        >
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-8 py-6">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                    <ChevronDown className="w-6 h-6 text-[var(--text-main)]" />
                </button>
                <div className="text-sm font-medium tracking-wide text-[var(--text-secondary)] uppercase">Now Playing</div>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-2 rounded-full transition-colors ${showMenu ? 'bg-white/10' : 'hover:bg-white/10'}`}
                >
                    <MoreHorizontal className="w-6 h-6 text-[var(--text-main)]" />
                </button>
            </div>

            {/* Main Content: 50/50 Split */}
            <div className="relative z-10 flex-1 flex items-center px-12">
                {/* Left side (50% width) - Centering the Vinyl */}
                <div className="flex-1 flex justify-center items-center h-full pr-10">
                    <div className="w-[50vh] h-[50vh] relative group flex items-center justify-center">
                        {/* The Halo Visualizer */}
                        {visualizerEnabled && (
                            <div className="absolute inset-[-20%] z-0 pointer-events-none flex items-center justify-center">
                                <div className={`absolute inset-[-5%] rounded-full bg-[var(--accent-color)] blur-[100px] mix-blend-screen transition-all duration-500 ${isPlaying ? 'animate-[halo-pulse_1.2s_ease-out_infinite]' : 'opacity-20'}`}></div>
                                <div className={`absolute inset-[-15%] rounded-full bg-[var(--accent-color)]/30 blur-[130px] mix-blend-screen transition-all duration-1000 ${isPlaying ? 'animate-[halo-pulse_2.4s_ease-out_infinite_0.4s]' : 'opacity-10'}`}></div>
                                <div className={`absolute inset-[10%] rounded-full border-[15px] border-[var(--accent-color)]/30 blur-[30px] mix-blend-screen ${isPlaying ? 'animate-[halo-rotate_20s_linear_infinite,halo-pulse_1.2s_ease-out_infinite]' : 'opacity-5'}`}></div>
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {Array.from({ length: 48 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-[1.5px] rounded-full mix-blend-screen transition-all duration-300"
                                            style={{
                                                height: isPlaying ? '18%' : '2%',
                                                transformOrigin: 'bottom center',
                                                transform: `rotate(${i * (360 / 48)}deg) translateY(-120%)`,
                                                '--rotation': `${i * (360 / 48)}deg`,
                                                backgroundColor: `var(--accent-color)`,
                                                opacity: isPlaying ? 0.5 : 0.05,
                                                filter: isPlaying ? 'blur(2.5px)' : 'none',
                                                animation: isPlaying ? `music-ring-bar ${0.6 + Math.random() * 0.4}s ease-out infinite` : 'none',
                                                animationDelay: `-${Math.random() * 2}s`,
                                            } as React.CSSProperties}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 rounded-full blur-2xl transform scale-95 group-hover:scale-100 transition-transform duration-700 z-10"></div>
                        <div className="w-[45vh] h-[45vh] rounded-full bg-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-[#222] relative overflow-hidden z-20">
                            <div className="absolute inset-[10px] border border-[#333] rounded-full opacity-50"></div>
                            <div className="absolute inset-[25px] border border-[#333] rounded-full opacity-40"></div>
                            <div className="absolute inset-[40px] border border-[#333] rounded-full opacity-30"></div>
                            <div className="w-full h-full animate-spin-slow-variable relative" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                                <div className="absolute inset-[25%] rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-2 border-[#111] z-20">
                                    <div className={`w-full h-full ${currentTrack.id === 1 ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-tr from-blue-400 to-emerald-400'}`}>
                                        <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                    </div>
                                    <div className="absolute w-4 h-4 bg-[#050505] rounded-full border border-white/10 shadow-inner z-10"></div>
                                </div>
                                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.08)_45deg,transparent_90deg,rgba(255,255,255,0.08)_135deg,transparent_180deg,rgba(255,255,255,0.08)_225deg,transparent_270deg,rgba(255,255,255,0.08)_315deg,transparent_360deg)] rounded-full z-10"></div>
                                <div className="absolute inset-0 bg-[conic-gradient(from_20deg,transparent_0deg,rgba(255,255,255,0.03)_60deg,transparent_120deg)] rounded-full z-10"></div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none z-30"></div>
                        </div>

                        {/* Tonearm */}
                        <div
                            className={`absolute -top-10 -right-10 w-48 h-64 pointer-events-none transition-transform duration-1000 cubic-bezier(0.23, 1, 0.32, 1) z-20 will-change-transform ${isPlaying ? 'rotate-[32deg]' : 'rotate-0'}`}
                            style={{ transformOrigin: '80% 20%' }}
                        >
                            <div className="absolute top-4 right-4 w-16 h-16 bg-[#2a2a2a] rounded-full border border-white/10 shadow-2xl flex items-center justify-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#333] to-[#111] rounded-full shadow-inner border border-white/5 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-[var(--accent-color)] rounded-full blur-[2px] opacity-40"></div>
                                </div>
                            </div>
                            <div className="absolute top-12 right-12 w-3 h-48 bg-gradient-to-r from-[#ccc] via-[#fff] to-[#ccc] rounded-full shadow-xl origin-top transform -rotate-[18deg]">
                                <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-6 h-12 bg-[#111] rounded-sm border border-white/10"></div>
                                <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-16 bg-gradient-to-r from-[#aaa] to-[#fff] origin-top rotate-[25deg] rounded-b-lg shadow-lg">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-[#000] rounded-sm border border-white/5 flex items-center justify-center">
                                        <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side (50% width) - Align lyrics with playback button center (i.e. starting from center line) */}
                <div className="flex-1 flex flex-col justify-center items-start h-full pl-20 overflow-hidden">
                    <div className="max-w-xl w-full">
                        <h1 className="text-4xl font-bold text-[var(--text-main)] mb-2">{currentTrack.title}</h1>
                        <h2 className="text-2xl text-[var(--accent-color)] mb-8">{currentTrack.artist} - {currentTrack.album}</h2>

                        {/* Scrolling Lyrics */}
                        <div
                            ref={lyricsContainerRef}
                            className="space-y-8 text-3xl font-bold text-[var(--text-secondary)] h-[40vh] overflow-y-auto custom-scrollbar-none mask-image-lyrics relative py-[20vh]"
                            style={{ scrollSnapType: 'y proximity' }}
                        >
                            {mockLyrics.map((lyric, index) => {
                                const isActive = index === activeLyricIndex;
                                const isPast = index < activeLyricIndex;
                                return (
                                    <p
                                        key={index}
                                        onClick={() => setProgress(lyric.time)}
                                        className={`cursor-pointer transition-all duration-500 origin-left ${isActive ? 'text-[var(--text-main)] scale-110 opacity-100 blur-0' : 'opacity-20 blur-[2px] hover:opacity-50'} ${isPast && !isActive ? 'scale-95' : ''}`}
                                        style={{ scrollSnapAlign: 'center' }}
                                    >
                                        {lyric.text}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 px-12 pb-12">
                {/* Scrubber */}
                <div className="flex items-center gap-4 mb-6 group">
                    <span className="text-xs text-[var(--text-muted)] w-12 text-right font-mono">{formatTime(currentTimeSec)}</span>
                    <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden cursor-pointer relative" onClick={handleSeek}>
                        <div className="h-full bg-[var(--text-main)] rounded-full group-hover:bg-[var(--accent-color)] relative transition-all duration-300 ease-linear" style={{ width: `${progressPercent}%` }}>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] w-12 font-mono">{formatTime(durationSec)}</span>
                </div>

                {/* Main Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-6 w-[120px]">
                        <button onClick={() => setShowComments(!showComments)} className={`btn-icon ${showComments ? 'text-[var(--accent-color)]' : 'hover:text-[var(--accent-color)]'}`}>
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-8">
                        <button onClick={toggleMode} className={`btn-icon w-10 h-10 transition-colors ${shuffle || repeat === 'one' ? 'text-[var(--accent-color)] active:scale-95' : 'hover:text-white'}`}>
                            {shuffle ? <Shuffle className="w-5 h-5" /> : repeat === 'one' ? <div className="relative"><Repeat className="w-5 h-5" /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6px] font-bold uppercase pt-0.5">1</span></div> : <Repeat className="w-5 h-5" />}
                        </button>

                        <button onClick={previousTrack} className="btn-icon w-10 h-10 hover:text-white active:scale-90 transition-transform">
                            <SkipBack className="w-8 h-8" />
                        </button>
                        <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-[var(--text-main)] text-black flex items-center justify-center hover:scale-105 hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>
                        <button onClick={nextTrack} className="btn-icon w-10 h-10 hover:text-white active:scale-90 transition-transform">
                            <SkipForward className="w-8 h-8" />
                        </button>

                        <button onClick={() => setShowQueue(!showQueue)} className={`btn-icon w-10 h-10 transition-colors ${showQueue ? 'text-[var(--accent-color)]' : 'hover:text-white'}`}>
                            <ListMusic className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-4 items-center justify-end w-[120px]">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.1)] border border-white/10 whitespace-nowrap">
                            <span className="text-[10px] text-[var(--text-muted)] border-r border-white/10 pr-2 mr-0.5">{currentTrack.source}</span>
                            <span className="text-[10px] font-bold text-[#fbbf24]">{currentTrack.quality}</span>
                        </div>
                        <VolumeControl popoverDirection="up" />
                    </div>
                </div>
            </div>

            {/* Sidebars */}
            {/* Comment Sidebar */}
            <div className={`absolute inset-y-0 right-0 w-full lg:w-[450px] bg-[#0a0a0c]/95 backdrop-blur-3xl border-l border-white/10 z-[100] transition-transform duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${showComments ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold">Comments</h3>
                        <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        {mockComments.map(comment => (
                            <div key={comment.id} className="space-y-4 group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full shadow-lg ${comment.avatar}`}></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-white/90">{comment.user}</span>
                                            <span className="text-[10px] text-white/20">{comment.time}</span>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">{comment.content}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{comment.likes} Likes</span>
                                            <button className="text-[10px] text-[var(--accent-color)] font-bold uppercase tracking-wider hover:underline transition-all">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <input type="text" placeholder="Add a comment..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                    </div>
                </div>
            </div>

            {/* Queue Sidebar */}
            <div className={`absolute inset-y-0 right-0 w-full lg:w-[450px] bg-[#0a0a0c]/95 backdrop-blur-3xl border-l border-white/10 z-[100] transition-transform duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${showQueue ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <ListMusic className="w-6 h-6 text-[var(--accent-color)]" />
                            <h3 className="text-xl font-bold text-white">Next Up</h3>
                        </div>
                        <button onClick={() => setShowQueue(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                        {queue.map((track, index) => {
                            const isCurrent = track.id === currentTrack.id;
                            const colors = ['from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500', 'from-blue-500 to-cyan-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500'];
                            const trackColor = colors[(track.id - 1) % colors.length];
                            return (
                                <div key={`${track.id}-${index}`} onClick={() => { setTrack(track); play(); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all group ${isCurrent ? 'bg-[var(--accent-color)]/20 shadow-inner' : 'hover:bg-white/5'}`}>
                                    <div className="text-sm font-mono text-white/20 w-4">{index + 1}</div>
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${trackColor} flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                                        {isCurrent && isPlaying ? (
                                            <div className="flex gap-0.5 items-end h-4">
                                                <div className="w-0.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite] h-full"></div>
                                                <div className="w-0.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite] h-2/3"></div>
                                                <div className="w-0.5 bg-white animate-[music-bar_0.7s_ease-in-out_infinite] h-5/6"></div>
                                            </div>
                                        ) : (
                                            <Play className="w-4 h-4 text-white fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={`font-bold truncate ${isCurrent ? 'text-[var(--accent-color)]' : 'text-white'}`}>{track.title}</div>
                                        <div className="text-sm text-white/40 truncate">{track.artist}</div>
                                    </div>
                                    <div className="text-xs font-mono text-white/30">{track.duration}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Options Menu Sidebar */}
            <div className={`absolute inset-y-0 right-0 w-full lg:w-[320px] bg-[#0a0a0c]/95 backdrop-blur-3xl border-l border-white/10 z-[110] transition-transform duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-bold">Options</h3>
                        <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-2">
                        {menuView === 'main' ? (
                            <>
                                <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                    <Heart className="w-5 h-5 text-white/40 group-hover:text-pink-500 transition-colors" />
                                    <span className="font-medium">Like this song</span>
                                </button>
                                <button onClick={() => setMenuView('playlist')} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <ListMusic className="w-5 h-5 text-white/40 group-hover:text-amber-500 transition-colors" />
                                        <span className="font-medium">Add to Playlist</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20" />
                                </button>
                                <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                    <User className="w-5 h-5 text-white/40 group-hover:text-indigo-400 transition-colors" />
                                    <span className="font-medium">View Artist</span>
                                </button>
                                <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                    <Disc className="w-5 h-5 text-white/40 group-hover:text-emerald-400 transition-colors" />
                                    <span className="font-medium">View Album</span>
                                </button>
                                <div className="my-4 h-px bg-white/5 mx-2"></div>
                                <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                    <Share2 className="w-5 h-5 text-white/40 group-hover:text-rose-400 transition-colors" />
                                    <span className="font-medium">Share</span>
                                </button>
                                <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                    <Clock className="w-5 h-5 text-white/40 group-hover:text-sky-400 transition-colors" />
                                    <span className="font-medium">Sleep Timer</span>
                                </button>
                            </>
                        ) : (
                            <div className="animate-fade-in space-y-2">
                                <button onClick={() => setMenuView('main')} className="w-full flex items-center gap-4 p-3 mb-4 rounded-xl text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="text-sm font-bold">Back to Options</span>
                                </button>
                                {userPlaylists.map(pl => (
                                    <button
                                        key={pl.id}
                                        onClick={() => {
                                            const songToStore = { id: currentTrack.id, title: currentTrack.title, artist: currentTrack.artist, album: currentTrack.album, duration: currentTrack.duration, sources: [], bestSource: currentTrack.source };
                                            addSongToPlaylist(pl.id, songToStore);
                                            setShowMenu(false);
                                            setMenuView('main');
                                            alert(`Added to ${pl.title}`);
                                        }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className={`w-10 h-10 rounded-lg ${pl.cover} flex-shrink-0`}></div>
                                        <div className="text-left">
                                            <div className="font-medium">{pl.title}</div>
                                            <div className="text-xs text-white/40">{pl.count}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-auto pt-8">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Playing From</div>
                            <div className="text-sm font-medium text-white/60">{currentTrack.source} — {currentTrack.quality}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullScreenPlayer;
