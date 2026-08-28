import React from 'react';
import {
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Headphones,
  Sparkles,
  Download,
  Loader2,
  Mic
} from 'lucide-react';
import { ScholarMessage } from '../types';
import { StudioVoicePersona, SCHOLAR_VOICES } from '../utils/speechEngine';

interface AiScholarAudioSuiteProps {
  messages: ScholarMessage[];
  currentAudioUrl: string | null;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  selectedVoice: StudioVoicePersona;
  volume: number;
  isMuted: boolean;
  activeReadingTitle?: string;
  onPlayLatest: () => void;
  onPlayEntireSession: () => void;
  onTogglePlayPause: () => void;
  onSeek: (seconds: number) => void;
  onSkip: (delta: number) => void;
  onSpeedChange: (speed: number) => void;
  onVoiceChange: (voice: StudioVoicePersona) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onDownloadAudio: () => void;
}

export const AiScholarAudioSuite: React.FC<AiScholarAudioSuiteProps> = ({
  messages,
  currentAudioUrl,
  isPlaying,
  isLoadingAudio,
  currentTime,
  duration,
  playbackSpeed,
  selectedVoice,
  volume,
  isMuted,
  activeReadingTitle,
  onPlayLatest,
  onPlayEntireSession,
  onTogglePlayPause,
  onSeek,
  onSkip,
  onSpeedChange,
  onVoiceChange,
  onVolumeChange,
  onToggleMute,
  onDownloadAudio,
}) => {
  const assistantMessages = messages.filter(
    (m) => m.role === 'assistant' && m.content && m.content.trim().length > 0
  );

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="ai-scholar-audio-suite"
      className="w-full rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white shadow-xl shadow-stone-950/25 border-2 border-amber-500/40 p-4 sm:p-6 mb-6 relative overflow-hidden transition-all"
    >
      {/* Decorative Background Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-amber-500/20 relative z-10">
        
        {/* Title & Human Voice Guarantee Badge */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Mic className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-amiri font-bold text-lg sm:text-xl text-amber-200">
                صوت الشيخ الطبيعي للمدارسة الشرعية
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold font-tajawal flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                صوت عربي بشري طبيعي ووقور
              </span>
            </div>
            <p className="text-xs text-amber-100/70 font-tajawal mt-0.5">
              تلاوة وقراءة شرعية بنبرة عالم جليل ومخارج حروف عربية فصيحة ومضبوطة
            </p>
          </div>
        </div>

        {/* Natural Voice Persona Selector */}
        <div className="flex items-center gap-1.5 bg-stone-950/80 p-1.5 rounded-2xl border border-amber-500/30 flex-wrap">
          {SCHOLAR_VOICES.map((v) => {
            const isSelected = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onVoiceChange(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-tajawal transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold scale-102 ring-1 ring-amber-300'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
                title={v.desc}
              >
                <span>{v.icon}</span>
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Controls & Progress Section */}
      <div className="pt-4 space-y-4 relative z-10">
        
        {/* Quick Action Buttons & Current Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Quick Triggers */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onPlayLatest}
              disabled={isLoadingAudio || assistantMessages.length === 0}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                isPlaying && (!activeReadingTitle || activeReadingTitle.includes('الجواب الأخير'))
                  ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 shadow-amber-500/30 font-extrabold'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 hover:border-amber-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>استماع لصوت الشيخ للجواب الأخير</span>
            </button>

            <button
              onClick={onPlayEntireSession}
              disabled={isLoadingAudio || assistantMessages.length === 0}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white border border-stone-700 hover:border-stone-500 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Headphones className="w-4 h-4 text-amber-400" />
              <span>تلاوة كامل مجلس المدارسة</span>
            </button>
          </div>

          {/* Active Audio Status / Animated Waveform */}
          <div className="flex items-center gap-3 bg-stone-950/50 px-3.5 py-1.5 rounded-xl border border-stone-800 self-start sm:self-auto">
            {isPlaying ? (
              <div className="flex items-center gap-1 h-5 px-1">
                {[40, 70, 90, 60, 100, 50, 80, 65].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-amber-400 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${idx * 0.12}s`,
                      animationDuration: '0.8s',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            )}

            <span className="text-xs font-tajawal text-amber-100/90 truncate max-w-[200px] sm:max-w-[280px]">
              {isLoadingAudio ? (
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  جاري تحضير صوت الشيخ الطبيعي...
                </span>
              ) : activeReadingTitle ? (
                activeReadingTitle
              ) : (
                'جاهز لتلاوة وقراءة بيان الشيخ'
              )}
            </span>
          </div>
        </div>

        {/* Audio Progress Scrubber */}
        <div className="space-y-1.5 pt-1">
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              disabled={duration === 0 && !isPlaying}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden disabled:opacity-40"
              style={{
                background: `linear-gradient(to right, #f59e0b ${progressPercent}%, #292524 ${progressPercent}%)`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-200/60 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>

        {/* Primary Playback Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Main Control Cluster (Rewind, Play/Pause, Forward, Speed) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Rewind 10s */}
            <button
              onClick={() => onSkip(-10)}
              disabled={!isPlaying && currentTime === 0}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 hover:text-white transition-all border border-stone-700 disabled:opacity-40 cursor-pointer"
              title="تراجع 10 ثوانٍ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={onTogglePlayPause}
              disabled={isLoadingAudio && !isPlaying}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-stone-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل صوت الشيخ الطبيعي'}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
              ) : isPlaying ? (
                <>
                  <Pause className="w-5 h-5 text-stone-950 fill-stone-950" />
                  <span className="text-xs sm:text-sm font-tajawal">إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 text-stone-950 fill-stone-950" />
                  <span className="text-xs sm:text-sm font-tajawal">
                    تشغيل صوت الشيخ
                  </span>
                </>
              )}
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => onSkip(10)}
              disabled={!isPlaying && currentTime === 0}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 hover:text-white transition-all border border-stone-700 disabled:opacity-40 cursor-pointer"
              title="تقديم 10 ثوانٍ"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Speed Selector Buttons */}
            <div className="flex items-center bg-stone-950/70 p-1 rounded-xl border border-stone-800 text-[11px] font-bold font-mono">
              {[0.85, 1.0, 1.15, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-amber-500 text-stone-950 font-extrabold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                  title={`سرعة القراءة ${speed}x`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Volume & Audio Download Cluster */}
          <div className="flex items-center gap-3">
            
            {/* Volume & Mute */}
            <div className="hidden sm:flex items-center gap-2 bg-stone-950/50 px-3 py-1.5 rounded-xl border border-stone-800">
              <button
                onClick={onToggleMute}
                className="text-amber-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-16 sm:w-20 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-hidden"
              />
            </div>

            {/* Download Audio Clip */}
            {currentAudioUrl && (
              <button
                onClick={onDownloadAudio}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-white border border-stone-700 transition-all flex items-center gap-1.5 text-xs font-bold font-tajawal cursor-pointer"
                title="تحميل المقطع الصوتي بصوت الشيخ على جهازك"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">تحميل التسجيل</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
