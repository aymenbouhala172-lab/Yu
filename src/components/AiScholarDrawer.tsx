import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Brain, 
  Globe, 
  Zap, 
  Bot, 
  ExternalLink, 
  RotateCcw, 
  Loader2, 
  Copy, 
  Check, 
  HelpCircle,
  ArrowRight,
  History,
  Trash2,
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Calendar,
  Layers,
  ChevronLeft,
  Volume2,
  VolumeX,
  Headphones,
  Play,
  Pause
} from 'lucide-react';
import { ScholarMessage, LessonContent } from '../types';
import { 
  loadScholarHistory, 
  saveScholarHistory, 
  ScholarSession, 
  createNewScholarSession 
} from '../utils/scholarHistory';
import { AiScholarAudioSuite } from './AiScholarAudioSuite';
import { 
  StudioVoicePersona, 
  sanitizeArabicForSpeech, 
  clientAudioCache,
  fetchNaturalScholarAudio
} from '../utils/speechEngine';

interface AiScholarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLesson?: LessonContent;
  doorTitle?: string;
  initialPrompt?: string;
  startWithHistoryOpen?: boolean;
}

export const AiScholarDrawer: React.FC<AiScholarDrawerProps> = ({
  isOpen,
  onClose,
  currentLesson,
  doorTitle,
  initialPrompt,
  startWithHistoryOpen,
}) => {
  // History State
  const [history, setHistory] = useState<ScholarSession[]>(loadScholarHistory());
  const [isHistoryOpen, setIsHistoryOpen] = useState(startWithHistoryOpen || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  // Active Session State
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session-${Date.now()}`);
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>('استشارة شرعية جديدة');
  
  const [messages, setMessages] = useState<ScholarMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `السلام عليكم ورحمة الله وبركاته، مرحباً بك يا طالب العلم في مجلس المدارسة والتفقه الشرعي.

أنا معلمك ومساعدك الشرعي، يسعدني الإجابة عن استشكالاتك، تفكيك الشبهات المعاصرة، وإيراد الأدلة الشرعية ووجوه الاستدلال والضوابط الفقهية بدقة وتأصيل رصين.

لكل مسألة تطرحها هنا سجلٌّ خاص ومستقل يُحفظ تلقائياً في "سجل المدارسة"، لتتمكن من الرجوع إلى كل استشارة على حِدة بكل ترتيب ووضوح.

تفضل بكتابة سؤالك في خانة السؤال السفلية، وستظهر لك الإجابة هنا مفصلة ومريحة للقراءة والتأمل.`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      mode: 'thinking',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [selectedMode, setSelectedMode] = useState<'thinking' | 'search' | 'fast'>('thinking');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge' | 'huge'>('xlarge');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [linkToLessonContext, setLinkToLessonContext] = useState<boolean>(true);

  // Audio Recitation Suite State (Pure Natural Sheikh Voice)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<StudioVoicePersona>('charon');
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeReadingTitle, setActiveReadingTitle] = useState<string>('');
  const [activeReadingMessageId, setActiveReadingMessageId] = useState<string | null>(null);
  const [lastReadText, setLastReadText] = useState<string>('');
  const [audioNotice, setAudioNotice] = useState<{
    message: string;
    type: 'info' | 'error' | 'success';
    canRetry?: boolean;
  } | null>(null);

  const stopAllAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        // Ignore
      }
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setActiveReadingMessageId(null);
  }, []);

  // Initialize and bind audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveReadingMessageId(null);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Stop audio when closing the drawer
  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
    }
  }, [isOpen, stopAllAudio]);

  useEffect(() => {
    setIsHistoryOpen(startWithHistoryOpen || false);
  }, [startWithHistoryOpen]);

  useEffect(() => {
    if (initialPrompt) {
      setInputPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Sync current conversation to history storage
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      setHistory(prev => {
        const existingIndex = prev.findIndex(s => s.id === currentSessionId);
        const firstUserText = userMessages[0]?.content || '';
        const derivedTitle = currentSessionTitle !== 'استشارة شرعية جديدة' && currentSessionTitle 
          ? currentSessionTitle 
          : (firstUserText.length > 55 ? firstUserText.substring(0, 52) + '...' : firstUserText || 'مسألة فقهية');
        
        const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
        const preview = lastAssistantMsg?.content ? lastAssistantMsg.content.substring(0, 100) + '...' : undefined;

        let updated = [...prev];
        const sessionData: ScholarSession = {
          id: currentSessionId,
          title: derivedTitle,
          preview,
          date: existingIndex !== -1 ? prev[existingIndex].date : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doorTitle: (linkToLessonContext && currentLesson) ? doorTitle : undefined,
          lessonTitle: (linkToLessonContext && currentLesson) ? currentLesson.title : undefined,
          mode: selectedMode,
          messages,
        };

        if (existingIndex !== -1) {
          updated[existingIndex] = sessionData;
        } else {
          updated = [sessionData, ...updated];
        }

        saveScholarHistory(updated);
        return updated;
      });
    }
  }, [messages, currentSessionId, currentSessionTitle, selectedMode, linkToLessonContext, currentLesson, doorTitle]);

  if (!isOpen) return null;

  // Create a brand new distinct conversation
  const handleStartNewSession = () => {
    const newSession = createNewScholarSession(
      undefined, 
      (linkToLessonContext && currentLesson) ? doorTitle : undefined, 
      (linkToLessonContext && currentLesson) ? currentLesson.title : undefined
    );
    setCurrentSessionId(newSession.id);
    setCurrentSessionTitle(newSession.title);
    setMessages(newSession.messages);
    setIsHistoryOpen(false);
  };

  // Load an existing distinct conversation
  const handleLoadSession = (session: ScholarSession) => {
    setCurrentSessionId(session.id);
    setCurrentSessionTitle(session.title);
    setMessages(session.messages);
    if (session.mode) {
      setSelectedMode(session.mode);
    }
    setIsHistoryOpen(false);
  };

  // Delete a specific conversation record
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveScholarHistory(updated);
      return updated;
    });
    if (currentSessionId === sessionId) {
      handleStartNewSession();
    }
  };

  // Clear all conversations history
  const handleClearAllHistory = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع المحادثات السابقة من السجل؟')) {
      setHistory([]);
      saveScholarHistory([]);
      handleStartNewSession();
    }
  };

  // Save renamed conversation title
  const handleSaveRename = (sessionId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editingTitleText.trim()) return;

    setHistory(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, title: editingTitleText.trim() } : s);
      saveScholarHistory(updated);
      return updated;
    });

    if (currentSessionId === sessionId) {
      setCurrentSessionTitle(editingTitleText.trim());
    }

    setEditingSessionId(null);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Natural Sheikh Audio Player (Pure Studio AI Voice)
  const playNaturalAudio = useCallback(async (text: string, title?: string, messageId?: string) => {
    try {
      setIsLoadingAudio(true);
      setActiveReadingTitle(title || 'تلاوة بيان الشيخ بصوت طبيعي');
      setActiveReadingMessageId(messageId || null);
      setLastReadText(text);
      setAudioNotice(null);

      // Request authentic Studio Sheikh voice
      const res = await fetchNaturalScholarAudio(text, selectedVoice);
      if (res.success && res.audioUrl) {
        setCurrentAudioUrl(res.audioUrl);
        if (audioRef.current) {
          audioRef.current.src = res.audioUrl;
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.volume = isMuted ? 0 : volume;
          await audioRef.current.play().catch(e => console.warn('Audio play error:', e));
        }
        setIsPlaying(true);
        setAudioNotice(null);
      } else {
        setIsPlaying(false);
        setActiveReadingMessageId(null);
        setAudioNotice({
          message: res.error || 'تعذر استدعاء صوت الشيخ في هذه اللحظة، اضغط إعادة المحاولة.',
          type: 'warning',
          canRetry: true,
        });
      }
    } catch (err: any) {
      console.error('Audio recitation error:', err);
      setIsPlaying(false);
      setActiveReadingMessageId(null);
      setAudioNotice({
        message: 'حدث خطأ في الاتصال بمحرك صوت الشيخ، يرجى إعادة المحاولة.',
        type: 'error',
        canRetry: true,
      });
    } finally {
      setIsLoadingAudio(false);
    }
  }, [selectedVoice, playbackSpeed, volume, isMuted]);

  // Audio Playback Toggle / Trigger Handler
  const handlePlayAudioText = useCallback(async (text: string, title?: string, messageId?: string) => {
    if (!text || !text.trim()) return;

    // Toggle pause/play if clicking currently playing item
    if (activeReadingMessageId === messageId && currentAudioUrl) {
      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      } else {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.warn('Audio play error:', e));
          setIsPlaying(true);
        } else {
          playNaturalAudio(text, title, messageId);
        }
      }
      return;
    }

    stopAllAudio();
    playNaturalAudio(text, title, messageId);
  }, [activeReadingMessageId, isPlaying, currentAudioUrl, stopAllAudio, playNaturalAudio]);

  const handlePlayLatest = () => {
    const assistantMsgs = messages.filter(m => m.role === 'assistant' && m.content && m.content.trim().length > 0);
    const latest = assistantMsgs[assistantMsgs.length - 1];
    if (latest) {
      handlePlayAudioText(latest.content, 'تلاوة الجواب الأخير للشيخ', latest.id);
    }
  };

  const handlePlayEntireSession = () => {
    const assistantMsgs = messages.filter(m => m.role === 'assistant' && m.content && m.content.trim().length > 0);
    if (assistantMsgs.length === 0) return;
    const compiled = assistantMsgs.map((m, idx) => `البيان رقم ${idx + 1}: ${m.content}`).join('\n\n');
    handlePlayAudioText(compiled, 'تلاوة كامل مجالس المدارسة', 'entire-session');
  };

  const handleTogglePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current && currentAudioUrl) {
        audioRef.current.play().catch((e) => console.warn('Audio play error:', e));
        setIsPlaying(true);
      } else {
        handlePlayLatest();
      }
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (delta: number) => {
    if (audioRef.current) {
      const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVoiceChange = (voice: StudioVoicePersona) => {
    setSelectedVoice(voice);
    if (lastReadText && !isLoadingAudio) {
      stopAllAudio();
      setTimeout(() => {
        playNaturalAudio(lastReadText, activeReadingTitle, activeReadingMessageId || undefined);
      }, 50);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const handleDownloadAudio = () => {
    if (!currentAudioUrl) return;
    const a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = `bayan-al-sheikh-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt.trim();
    if (!textToSend || isLoading) return;

    // Auto-update title on first question if not renamed
    if (messages.filter(m => m.role === 'user').length === 0 && currentSessionTitle === 'استشارة شرعية جديدة') {
      const newTitle = textToSend.length > 55 ? textToSend.substring(0, 52) + '...' : textToSend;
      setCurrentSessionTitle(newTitle);
    }

    const userMsg: ScholarMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      contextLessonId: linkToLessonContext ? currentLesson?.id : undefined,
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: ScholarMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      mode: selectedMode,
    };

    setMessages(prev => [...prev, userMsg, initialAssistantMsg]);
    setInputPrompt('');
    setIsLoading(true);

    let accumulatedText = '';
    try {
      const response = await fetch('/api/ai/scholarly-consultation/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          mode: selectedMode,
          lessonContext: (linkToLessonContext && currentLesson) ? {
            doorTitle,
            lessonTitle: currentLesson.title,
            centralRule: currentLesson.centralRule,
          } : undefined,
          chatHistory: messages
            .filter(m => m.id !== 'welcome' && !m.id.startsWith('welcome-') && m.content && m.content.trim().length > 0)
            .slice(-6)
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed, fallback to standard');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedSources: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const trimmed = event.trim();
          if (trimmed.startsWith('data: ')) {
            const dataContent = trimmed.substring(6).trim();
            if (dataContent === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages(prev =>
                  prev.map(m => (m.id === assistantMsgId ? { ...m, content: accumulatedText } : m))
                );
              }
              if (parsed.sources) {
                accumulatedSources = parsed.sources;
                setMessages(prev =>
                  prev.map(m => (m.id === assistantMsgId ? { ...m, sources: accumulatedSources } : m))
                );
              }
              if (parsed.error && !accumulatedText) {
                accumulatedText = parsed.error;
                setMessages(prev =>
                  prev.map(m => (m.id === assistantMsgId ? { ...m, content: accumulatedText } : m))
                );
              }
            } catch (jsonErr) {
              console.warn('Failed to parse SSE JSON line:', dataContent, jsonErr);
            }
          }
        }
      }

      // If empty after stream, try fallback
      if (!accumulatedText.trim()) {
        const fallbackRes = await fetch('/api/ai/scholarly-consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            mode: selectedMode,
            lessonContext: (linkToLessonContext && currentLesson) ? {
              doorTitle,
              lessonTitle: currentLesson.title,
              centralRule: currentLesson.centralRule,
            } : undefined,
            chatHistory: messages.filter(m => m.id !== 'welcome' && !m.id.startsWith('welcome-')).slice(-6).map(m => ({ role: m.role, content: m.content })),
          }),
        });
        const fallbackData = await fallbackRes.json();
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? {
            ...m,
            content: fallbackData.reply || fallbackData.error || 'بارك الله فيك ونفع بك.',
            sources: fallbackData.sources || [],
          } : m))
        );
      }
    } catch (err) {
      console.error('Streaming error, falling back to standard endpoint:', err);
      try {
        const fallbackRes = await fetch('/api/ai/scholarly-consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            mode: selectedMode,
            lessonContext: (linkToLessonContext && currentLesson) ? {
              doorTitle,
              lessonTitle: currentLesson.title,
              centralRule: currentLesson.centralRule,
            } : undefined,
            chatHistory: messages.filter(m => m.id !== 'welcome' && !m.id.startsWith('welcome-')).slice(-6).map(m => ({ role: m.role, content: m.content })),
          }),
        });
        const fallbackData = await fallbackRes.json();
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? {
            ...m,
            content: fallbackData.reply || fallbackData.error || 'بارك الله فيك ونفع بك.',
            sources: fallbackData.sources || [],
          } : m))
        );
      } catch (finalErr) {
        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? {
            ...m,
            content: 'عذراً، حدث تعثر مؤقت في معالجة الاستفسار. يرجى إعادة إرسال السؤال وسيجيب الشيخ مباشرة.',
          } : m))
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'سؤال في نازلة معاصرة', prompt: 'ما هو التكييف الفقهي للتعامل بالعملات الرقمية المشفرة وتطبيقات الذكاء الاصطناعي؟' },
    { label: 'توجيه الأدلة في الدرس', prompt: `وضح لي وجه استدلال العلماء بالأدلة الواردة في هذا الباب وتطبيقاتها المعاصرة.` },
    { label: 'مقارنة المذاهب الأربعة', prompt: 'ما هي أقوال أئمة المذاهب الفقهية الأربعة في هذه المسألة مع حجة كل مذهب باختصار رصين؟' },
    { label: 'تفنيد شبهة فكرية', prompt: 'كيف نرد بمنهجية عقلية ونقلية محكمة على الشبهات الإلحادية حول الشرور والمصائب في الكون؟' },
    { label: 'اختبر فهمي شفهياً', prompt: 'اطرح عليّ مسألة فرعية دقيقة واختبر تطبيقي للقواعد الفقهية وانتظر جوابي لتصححه لي.' },
  ];

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'huge':
        return 'text-xl sm:text-2xl md:text-[26px] leading-[2.3] md:leading-[2.5]';
      case 'xlarge':
        return 'text-lg sm:text-xl md:text-[22px] leading-[2.2] md:leading-[2.35]';
      case 'large':
        return 'text-base sm:text-lg md:text-[20px] leading-[2.1] md:leading-[2.2]';
      case 'normal':
      default:
        return 'text-sm sm:text-base md:text-[18px] leading-[2.0] md:leading-[2.1]';
    }
  };

  // Filtered history based on search query
  const filteredHistory = history.filter(session => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = session.title.toLowerCase().includes(q);
    const matchesDoor = session.doorTitle?.toLowerCase().includes(q);
    const matchesLesson = session.lessonTitle?.toLowerCase().includes(q);
    const matchesMessages = session.messages.some(m => m.content.toLowerCase().includes(q));
    return matchesTitle || matchesDoor || matchesLesson || matchesMessages;
  });

  return (
    <div className="min-h-screen h-screen w-full flex flex-col bg-[#FDFBF7] text-stone-900 overflow-hidden select-text font-sans">
      
      {/* 1. TOP HEADER (Navigation & Active Session Info) */}
      <header className="px-3 sm:px-6 md:px-8 py-3 bg-white border-b border-stone-200 flex items-center justify-between shrink-0 z-30 shadow-xs gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* PROMINENT ORANGE RETURN TO MAIN MENU BUTTON */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-950/20 border border-yellow-300/50 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer z-10"
            title="الرجوع إلى القائمة الرئيسية للمنهاج"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
            <span className="font-cairo font-bold whitespace-nowrap">الرجوع إلى القائمة الرئيسية</span>
          </button>

          <div className="hidden sm:flex w-9 h-9 rounded-2xl bg-amber-600 items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Active Conversation Title & Context */}
          <div className="min-w-0 flex-1 hidden md:block">
            <div className="flex items-center gap-2">
              <h2 className="font-amiri font-bold text-base sm:text-lg text-stone-900 truncate">
                {currentSessionTitle}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                <MessageSquare className="w-3 h-3" />
                سجل مستقل
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-tajawal truncate">
              {doorTitle ? `${doorTitle} • ` : ''}
              {currentLesson?.title ? `${currentLesson.title} • ` : ''}
              تُحفظ ردود هذه المسألة منفصلة في سجلك
            </p>
          </div>
        </div>

        {/* Action & Customization Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Mode Selector Pill Buttons */}
          <div className="hidden xl:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setSelectedMode('thinking')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedMode === 'thinking' ? 'bg-purple-100 text-purple-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              <span>استنباط عميق</span>
            </button>
            <button
              onClick={() => setSelectedMode('search')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedMode === 'search' ? 'bg-blue-100 text-blue-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>توثيق وبحث</span>
            </button>
            <button
              onClick={() => setSelectedMode('fast')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                selectedMode === 'fast' ? 'bg-amber-100 text-amber-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>حوار ميسر</span>
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="hidden sm:flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200 text-xs font-bold text-stone-600">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg transition-colors ${fontSize === 'normal' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'}`}
              title="خط قياسي"
            >
              أ
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg transition-colors ${fontSize === 'large' ? 'bg-white text-stone-900 shadow-2xs' : 'hover:text-stone-900'}`}
              title="خط متوسط"
            >
              أ+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded-lg transition-colors ${fontSize === 'xlarge' ? 'bg-amber-600 text-white shadow-2xs font-bold' : 'hover:text-stone-900'}`}
              title="خط مثالي"
            >
              أ++
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2 py-1 rounded-lg transition-colors ${fontSize === 'huge' ? 'bg-amber-600 text-white shadow-2xs font-bold' : 'hover:text-stone-900'}`}
              title="خط كبير جداً"
            >
              أ+++
            </button>
          </div>

          {/* New Independent Conversation Button */}
          <button
            onClick={handleStartNewSession}
            title="بدء محادثة وسجل مستقل جديد"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all text-xs font-bold shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">محادثة جديدة</span>
          </button>

          {/* History Button with count badge */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            title="سجل المحادثات والمجالس السابقة"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 border border-stone-200 hover:border-amber-300 transition-colors text-xs font-bold shadow-2xs shrink-0"
          >
            <History className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">السجل</span>
            {history.length > 0 && (
              <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {history.length}
              </span>
            )}
          </button>

          {/* Close Icon Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-200 transition-colors shadow-2xs"
            title="إغلاق والعودة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hidden Audio Element for Master Stream & Recitation */}
      <audio ref={audioRef} className="hidden" preload="auto" />

      {/* 2. GIANT READING CANVAS */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-6 bg-[#FDFBF7]">
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">
          
          {/* TOP NATURAL HUMAN VOICE SCHOLAR SUITE */}
          <AiScholarAudioSuite
            messages={messages}
            currentAudioUrl={currentAudioUrl}
            isPlaying={isPlaying}
            isLoadingAudio={isLoadingAudio}
            currentTime={currentTime}
            duration={duration}
            playbackSpeed={playbackSpeed}
            selectedVoice={selectedVoice}
            volume={volume}
            isMuted={isMuted}
            activeReadingTitle={activeReadingTitle}
            onPlayLatest={handlePlayLatest}
            onPlayEntireSession={handlePlayEntireSession}
            onTogglePlayPause={handleTogglePlayPause}
            onSeek={handleSeek}
            onSkip={handleSkip}
            onSpeedChange={handleSpeedChange}
            onVoiceChange={handleVoiceChange}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onDownloadAudio={handleDownloadAudio}
          />

          {/* Real-time Audio Notice & Status Feedback */}
          {audioNotice && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold font-tajawal transition-all shadow-md animate-fade-in ${
                audioNotice.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-900'
                  : audioNotice.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isLoadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700 shrink-0" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-700 shrink-0" />
                )}
                <span>{audioNotice.message}</span>
              </div>
              <div className="flex items-center gap-2">
                {audioNotice.canRetry && lastReadText && (
                  <button
                    onClick={() => playNaturalAudio(lastReadText, activeReadingTitle, activeReadingMessageId || undefined)}
                    disabled={isLoadingAudio}
                    className="px-3 py-1 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    إعادة المحاولة
                  </button>
                )}
                <button
                  onClick={() => setAudioNotice(null)}
                  className="p-1 rounded-lg hover:bg-black/5 text-stone-500 cursor-pointer"
                  title="إغلاق التنبيه"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">
              
              {/* USER Message */}
              {msg.role === 'user' ? (
                <div className="my-3 py-2.5 px-4 rounded-2xl bg-amber-900/10 border border-amber-300/40 flex items-center justify-between gap-3 text-stone-800 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-amber-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      س
                    </div>
                    <span className="text-xs font-bold text-amber-900 shrink-0">استشكالك:</span>
                    <span className="text-sm sm:text-base font-bold text-stone-900 truncate">
                      {msg.content}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono shrink-0">{msg.timestamp}</span>
                </div>
              ) : (
                
                /* ASSISTANT Message: EXPANSIVE SCHOLARLY READING BOARD */
                <article className="w-full rounded-3xl bg-white border border-stone-200/90 shadow-xl shadow-stone-900/5 overflow-hidden transition-all">
                  
                  {/* Top Bar of the Answer Board */}
                  <div className="px-6 sm:px-10 py-4 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 border-b border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-amiri font-bold text-lg sm:text-xl text-stone-900">
                          بيان وتأصيل العالم الشرعي
                        </h3>
                      </div>
                      {msg.mode && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white text-amber-900 border border-amber-200/80 shadow-2xs">
                          {msg.mode.includes('thinking') ? 'استنباط عميق' : msg.mode.includes('search') ? 'بحث وتوثيق معتمد' : 'حوار مدارسة'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Audio Recitation Button for this specific message */}
                      {msg.content && msg.content.trim().length > 0 && (
                        <button
                          onClick={() => handlePlayAudioText(msg.content, 'تلاوة هذا البيان الفقهي', msg.id)}
                          disabled={isLoadingAudio}
                          title="استماع لهذا البيان بصوت الشيخ أو المنشد الفصيح"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                            isPlaying && activeReadingMessageId === msg.id
                              ? 'bg-amber-500 text-stone-950 border-amber-600 ring-2 ring-amber-400 font-extrabold scale-102'
                              : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200/90 hover:border-amber-400'
                          }`}
                        >
                          {isLoadingAudio && activeReadingMessageId === msg.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                          ) : isPlaying && activeReadingMessageId === msg.id ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>إيقاف القراءة</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                              <span>استماع للبيان</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyText(msg.content, msg.id)}
                        title="نسخ البيان كاملاً"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 text-xs font-bold transition-all shadow-2xs"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            <span>نسخ الجواب</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Scholarly Text Area */}
                  <div className="p-6 sm:p-10 md:p-14 lg:p-16">
                    <div className={`font-amiri text-stone-900 font-normal whitespace-pre-wrap ${getFontSizeClass()} text-right selection:bg-amber-100 selection:text-amber-950`}>
                      {msg.content ? (
                        <>
                          {msg.content}
                          {isLoading && msg.id === messages[messages.length - 1]?.id && (
                            <span className="inline-block w-2.5 h-5.5 bg-amber-600 animate-pulse mr-1.5 align-middle rounded-xs" />
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-3.5 text-amber-900 py-4 font-tajawal text-base">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-700 shrink-0" />
                          <div>
                            <span className="font-bold font-amiri text-lg text-amber-950 block">
                              {selectedMode === 'thinking'
                                ? 'الشيخ يستحضر تحرير المسألة ويبدأ بسط البيان فوراً...'
                                : selectedMode === 'search'
                                ? 'جاري توثيق المسألة والقرارات المعتمدة...'
                                : 'جاري كتابة البيان الفقهي مباشرة...'}
                            </span>
                            <span className="text-xs text-stone-500 font-tajawal">
                              تتدفق الإجابة حيّة وبصورة فورية مع حفظ كامل التفصيل والتأصيل
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Grounding Web Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-10 pt-6 border-t-2 border-stone-100 space-y-3">
                        <span className="text-sm font-bold text-blue-900 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          المصادر والقرارات المعتمدة التي استند إليها البيان:
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {msg.sources.map((s, sIdx) => (
                            <a
                              key={sIdx}
                              href={s.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-xs sm:text-sm text-blue-900 transition-colors shadow-2xs font-bold"
                            >
                              <span className="truncate max-w-[280px]">{s.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 3. QUICK CHIPS STRIP */}
      <div className="px-4 sm:px-8 py-2 bg-stone-50 border-t border-stone-200 shrink-0">
        <div className="w-full max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs font-bold text-stone-500 shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            نماذج مسائل:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-3 py-1 rounded-xl bg-white hover:bg-amber-50 hover:border-amber-300 border border-stone-200 text-xs text-stone-700 hover:text-amber-900 whitespace-nowrap transition-all font-bold shadow-2xs shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. COMPACT & NEAT INPUT BAR */}
      <footer className="px-4 sm:px-8 py-3 bg-white border-t border-stone-200 shrink-0 z-20 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="w-full max-w-7xl mx-auto flex items-center gap-3"
        >
          {/* Question Input Field */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="اكتب سؤالك أو استشكالك هنا باختصار، وسيجيب الشيخ في الشاشة الكبيرة أعلاه..."
              className="w-full py-3 px-5 pr-11 rounded-2xl bg-stone-100 border border-stone-300 text-sm sm:text-base text-stone-900 placeholder-stone-500 focus:outline-none focus:bg-white focus:border-amber-600 transition-all shadow-inner font-tajawal"
            />
            <div className="absolute right-3.5 text-stone-400">
              <HelpCircle className="w-5 h-5 text-amber-700" />
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold shadow-md shadow-amber-800/20 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2 text-sm sm:text-base"
            title="إرسال السؤال للشيخ"
          >
            <Send className="w-4 h-4" />
            <span>سؤال الشيخ</span>
          </button>
        </form>
      </footer>

      {/* 5. HISTORY DRAWER: INDIVIDUAL CONVERSATIONS RECORD (سجل المحادثات المستقلة) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end animate-fade-in font-sans">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsHistoryOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="relative w-full max-w-md sm:max-w-lg bg-[#FDFBF7] border-r sm:border-r-0 sm:border-l border-stone-200 shadow-2xl flex flex-col h-full z-10">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-amiri font-bold text-lg sm:text-xl text-stone-900">سجل المحادثات والمجالس</h3>
                  <p className="text-[11px] text-stone-500">كل محادثة مسجلة على حدة مع كامل أسئلتها وأجوبتها</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                title="إغلاق السجل"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Bar (Search + New Conversation Button) */}
            <div className="p-3 sm:p-4 bg-white/60 border-b border-stone-200 space-y-3 shrink-0">
              <button
                onClick={handleStartNewSession}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>بدء محادثة / استشارة مستقلة جديدة</span>
              </button>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في عناوين المحادثات السابقة أو نصوصها..."
                  className="w-full pr-9 pl-4 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-amber-500 transition-all placeholder-stone-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="p-8 text-center text-stone-500 font-tajawal space-y-2">
                  <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-stone-700 text-sm">
                    {searchQuery ? 'لم يتم العثور على محادثات تطابق بحثك' : 'لا توجد محادثات سابقة مسجلة'}
                  </p>
                  <p className="text-xs text-stone-400">
                    عندما تسأل الشيخ الذكي، ستُحفظ كل مسألة في سجل منفصل تلقائياً
                  </p>
                </div>
              ) : (
                filteredHistory.map((session) => {
                  const isCurrent = currentSessionId === session.id;
                  const questionCount = session.messages.filter(m => m.role === 'user').length;
                  const isEditing = editingSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => handleLoadSession(session)}
                      className={`w-full text-right p-3.5 rounded-2xl transition-all cursor-pointer border group relative ${
                        isCurrent
                          ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30 shadow-sm'
                          : 'bg-white hover:bg-stone-50/90 border-stone-200 hover:border-amber-200 shadow-2xs'
                      }`}
                    >
                      {/* Top Row: Title & Action Icons */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <form 
                              onSubmit={(e) => handleSaveRename(session.id, e)} 
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                type="text"
                                value={editingTitleText}
                                onChange={(e) => setEditingTitleText(e.target.value)}
                                autoFocus
                                className="flex-1 px-2 py-1 bg-white border border-amber-400 rounded-lg text-xs font-bold text-stone-900 focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="p-1 rounded-md bg-amber-600 text-white text-xs hover:bg-amber-700"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSessionId(null)}
                                className="p-1 rounded-md bg-stone-200 text-stone-600 text-xs hover:bg-stone-300"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          ) : (
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-900 transition-colors">
                              {session.title}
                            </h4>
                          )}
                        </div>

                        {/* Inline Actions */}
                        {!isEditing && (
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(session.id);
                                setEditingTitleText(session.title);
                              }}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-100 transition-colors"
                              title="تعديل عنوان المسألة"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="حذف هذا السجل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Preview Snippet */}
                      {session.preview && (
                        <p className="text-[11px] text-stone-500 line-clamp-2 font-tajawal mb-2 leading-relaxed">
                          {session.preview}
                        </p>
                      )}

                      {/* Footer Info: Context, Badges, Date */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-stone-100 text-[10px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {session.doorTitle && (
                            <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium truncate max-w-[120px]">
                              {session.doorTitle}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100/70 text-amber-800 font-bold">
                            {questionCount} {questionCount === 1 ? 'مسألة' : 'مسائل'}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              المحادثة المفتوحة حالياً
                            </span>
                          )}
                        </div>

                        <span className="text-stone-400 font-mono flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3 text-stone-300" />
                          {new Date(session.updatedAt || session.date).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Clear All */}
            {history.length > 0 && (
              <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-stone-500 font-mono">
                  إجمالي المحادثات: {history.length}
                </span>
                <button
                  onClick={handleClearAllHistory}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-bold transition-colors"
                >
                  حذف السجل بالكامل
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

