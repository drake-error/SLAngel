import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

export default function IntroAnimation({ onComplete }) {
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing SLA-Angel Intelligence Engine...');
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        setProgress(pct);

        if (pct < 25) {
          setStatusText('Initializing SLA-Angel Intelligence Engine...');
        } else if (pct < 55) {
          setStatusText('Synchronizing Statutory Service Guarantee Matrix...');
        } else if (pct < 85) {
          setStatusText('Calibrating AI Escalation & Compliance Monitor...');
        } else {
          setStatusText('SLA-Angel Governance System Ready');
        }
      }
    };

    const handleEnded = () => {
      finishIntro();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    // Fallback safety timer
    const fallbackTimer = setTimeout(() => {
      finishIntro();
    }, 7500);

    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const finishIntro = () => {
    setIsFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] w-screen h-screen bg-white overflow-hidden transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Fullscreen Video Player */}
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        playsInline
        onEnded={finishIntro}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="clean_Logo_intro_animation_202608222305.mp4" type="video/mp4" />
        <source src="./clean_Logo_intro_animation_202608222305.mp4" type="video/mp4" />
        <source src="/clean_Logo_intro_animation_202608222305.mp4" type="video/mp4" />
        <source src="intro.mp4" type="video/mp4" />
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* Floating Top-Right Controls */}
      <div className="absolute top-6 right-8 z-30 flex items-center gap-3">
        {/* Sound Toggle */}
        <button
          onClick={() => {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            if (videoRef.current) {
              videoRef.current.muted = newMuted;
            }
          }}
          className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200/80 shadow-md transition-all duration-200 hover:scale-105"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#0F4A44]" />}
        </button>

        {/* Skip Intro Button */}
        <button
          onClick={finishIntro}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide text-slate-700 hover:text-white bg-white/80 hover:bg-[#0F4A44] backdrop-blur-md border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Floating Bottom Status Pill */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-[#0F4A44] border border-slate-200/80 shadow-lg text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{statusText}</span>
          <span className="font-mono text-slate-400 font-normal pl-1">({Math.round(progress)}%)</span>
        </div>
      </div>

      {/* Ultra-sleek Full-Width Bottom Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100/60 z-30">
        <div
          className="h-full bg-gradient-to-r from-teal-600 via-emerald-500 to-[#0F4A44] transition-all duration-150 ease-out shadow-sm"
          style={{ width: `${Math.max(2, progress)}%` }}
        />
      </div>
    </div>
  );
}
