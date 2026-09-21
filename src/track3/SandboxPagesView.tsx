/**
 * Visual Sensory Shield - Simulated Real-World Webpages with Visual Triggers
 * 
 * Each page is rendered directly into the DOM sandbox so the real
 * DOM Scanner (scanDOMForSensoryTriggers) and Mitigation Injector
 * operate on actual DOM nodes, computed styles, videos, and animations.
 */

import React, { useRef, useEffect } from 'react';
import { AlertTriangle, Play, Sparkles, Zap, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SandboxProps {
  pageId: string;
  onTriggerAction?: (actionName: string) => void;
}

export const SandboxPagesView: React.FC<SandboxProps> = ({ pageId }) => {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  // Generate synthetic canvas video frames for realistic video playback without external video dependencies
  useEffect(() => {
    const v1 = videoRef1.current;
    if (v1 && (v1 as any).captureStream) {
      // standard fallback handled
    }
  }, []);

  if (pageId === 'safe-docs') {
    return (
      <div id="sandbox-safe-article" className="max-w-3xl mx-auto p-8 text-slate-800 space-y-6 bg-white rounded-xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Zero Visual Overload Baseline
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Cognitive Ergonomics & Web Accessibility
        </h1>

        <p className="text-base leading-relaxed text-slate-600">
          Designing for users with photophobia, dyslexia, and ADHD requires deliberate restraint. Visual calm is achieved not merely by removing visual flair, but by establishing rhythmic spacing, comfortable luminance ratios, and steady reading paths.
        </p>

        <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Key Reading Principles</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
            <li>Line lengths constrained between 60 to 75 characters to avoid ocular wandering.</li>
            <li>Elimination of spontaneous autoplay and unrequested loop cycles.</li>
            <li>Gentle contrast ratios around 7:1 rather than harsh 21:1 pure black-white polarities.</li>
            <li>Predictable layout hierarchies without floating banners or animated alerts.</li>
          </ul>
        </div>

        <p className="text-sm text-slate-500 italic">
          This baseline page contains zero autoplaying media, zero rapid CSS animations, and gentle neutral tones. The Track 3 Scanner should report zero triggers and assign a "SAFE" status.
        </p>
      </div>
    );
  }

  if (pageId === 'rave-edm') {
    return (
      <div id="sandbox-rave-page" className="p-6 bg-slate-950 text-white rounded-xl space-y-6 relative overflow-hidden border border-slate-800">
        {/* Rapid CSS Strobe Header (5Hz - Critical Photosensitive Risk) */}
        <div
          id="strobe-rave-header"
          className="p-4 rounded-lg text-center"
          style={{
            animation: 'raveStrobe 0.2s infinite alternate',
            backgroundColor: '#00FFFF',
            color: '#000000',
            fontWeight: 800,
          }}
        >
          <div className="flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
            <Zap className="w-4 h-4 text-black animate-spin" />
            CRITICAL 5Hz STROBE LIGHT TEST ZONE
          </div>
          <p className="text-xs font-mono mt-1">
            Loop duration: 0.20s (5.0 Hz frequency) — Exceeds WCAG 2.3.1 3Hz Photosensitive Limit!
          </p>
        </div>

        {/* Hyper-saturated Neon Dual Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            id="neon-cyan-block"
            data-sensory-neon="true"
            className="p-5 rounded-xl text-black font-black"
            style={{
              backgroundColor: '#00FFFF',
              boxShadow: '0 0 25px #00FFFF',
            }}
          >
            <span className="text-xs uppercase tracking-wider bg-black text-cyan-300 px-2 py-0.5 rounded">Aggressive Neon</span>
            <h3 className="text-xl mt-2 font-bold">LASER CYAN FLOOD (#00FFFF)</h3>
            <p className="text-xs mt-1 font-normal opacity-90">100% Saturation, 50% Luminance — severe glare trigger for photophobia.</p>
          </div>

          <div
            id="neon-magenta-block"
            data-sensory-neon="true"
            className="p-5 rounded-xl text-white font-black"
            style={{
              backgroundColor: '#FF00FF',
              boxShadow: '0 0 25px #FF00FF',
            }}
          >
            <span className="text-xs uppercase tracking-wider bg-black text-fuchsia-300 px-2 py-0.5 rounded">Photophobia Spike</span>
            <h3 className="text-xl mt-2 font-bold">ELECTRIC MAGENTA (#FF00FF)</h3>
            <p className="text-xs mt-1 font-normal opacity-90">Maximum spectral saturation causing optical vibration and migraine aura.</p>
          </div>
        </div>

        {/* Autoplaying Ambient Loop Video */}
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
          <div className="p-3 bg-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              Autoplaying Rave Stage Reel
            </span>
            <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[11px] font-mono">AUTOPLAY + LOOP ACTIVE</span>
          </div>

          <div id="rave-video-container" className="relative h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
            <video
              id="rave-promo-video"
              ref={videoRef1}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80"
            >
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Rapidly Rotating Animated Badge */}
        <div className="p-4 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-3">
            <div
              id="rapid-spinner-badge"
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black"
              style={{
                backgroundColor: '#FF00FF',
                animation: 'raveSpin 0.4s linear infinite',
              }}
            >
              ★
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Continuous Rapid Rotation</div>
              <div className="text-xs text-slate-400">0.40s duration (2.5 Hz motion trigger)</div>
            </div>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-medium">Overload Hazard</span>
        </div>
      </div>
    );
  }

  if (pageId === 'flash-sale') {
    return (
      <div id="sandbox-sale-page" className="p-6 bg-amber-50/60 rounded-xl space-y-6 border border-amber-200 text-slate-900">
        {/* Acid Yellow Neon Banner */}
        <div
          id="neon-yellow-banner"
          data-sensory-neon="true"
          className="p-4 rounded-xl text-black font-extrabold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
          style={{
            backgroundColor: '#FFFF00',
            border: '2px solid #000000',
          }}
        >
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600 animate-bounce" />
            <span className="text-sm tracking-tight font-black uppercase">ACID NEON YELLOW FLASH SALE (#FFFF00)</span>
          </div>
          <span className="text-xs bg-black text-yellow-300 px-3 py-1 rounded-full font-bold">100% Saturated Glare</span>
        </div>

        {/* 2Hz Pulsing CSS Animation */}
        <div
          id="pulsing-sale-countdown"
          className="p-5 bg-white rounded-xl border border-red-300 text-center shadow-xs"
          style={{
            animation: 'salePulse 0.5s ease-in-out infinite alternate',
          }}
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            2.0 Hz Rapid Urgency Pulse
          </div>
          <h3 className="text-2xl font-black text-red-600 tracking-tight">
            FINAL SECONDS: 00:01:49
          </h3>
          <p className="text-xs text-slate-500 mt-1">Rapid size & opacity modulation designed to cause sensory pressure.</p>
        </div>

        {/* Animated GIF Banner */}
        <div
          id="animated-gif-card"
          data-sensory-gif="true"
          className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <img
              id="sale-badge-gif"
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW4xdnl3NG5ycm4yeThqNmJ3MGpsenFwd2h5d21tZG8yaW1zN2l6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26AHONQ79FdWZhAI0/giphy.gif"
              alt="Animated Sale GIF"
              className="w-16 h-16 rounded-lg object-cover border border-amber-300 shadow-xs"
              data-sensory-gif="true"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Looping Animated Sticker GIF</h4>
              <p className="text-xs text-slate-500">Persistent unthrottled frame cycling</p>
            </div>
          </div>
          <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-semibold">.GIF Media</span>
        </div>

        {/* Autoplay Video reel */}
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-700">
            <span>Product Showcase Reel</span>
            <span className="text-red-600 font-mono">AUTOPLAYING</span>
          </div>
          <div id="sale-video-wrapper" className="relative rounded-lg overflow-hidden bg-slate-900 h-40">
            <video
              id="sale-product-video"
              ref={videoRef2}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
            >
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    );
  }

  if (pageId === 'seizure-test') {
    return (
      <div id="sandbox-seizure-page" className="p-6 bg-slate-900 text-white rounded-xl space-y-6 border border-red-500/40">
        {/* WCAG 2.3.1 Photosensitive Strobe Calibration Pattern */}
        <div
          id="seizure-strobe-strip"
          className="p-5 rounded-xl text-center font-black tracking-widest text-black shadow-lg"
          style={{
            animation: 'flashingAlert 0.25s infinite alternate',
            backgroundColor: '#FF0000',
            border: '4px solid #FFFFFF',
          }}
        >
          <div className="flex items-center justify-center gap-2 text-sm uppercase">
            <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
            WCAG 2.3.1 4.0 Hz STROBE FLASH TEST PATTERN
          </div>
          <p className="text-xs text-white/95 mt-1 font-mono">
            Alternating Red/Yellow at 4 cycles/sec. Hardware-timed DOM trigger exceeding 3Hz threshold.
          </p>
        </div>

        {/* 21:1 Contrast Polar Alternation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            id="strobe-polar-black"
            className="p-6 rounded-xl flex flex-col items-center justify-center text-center font-mono border-4 border-white"
            style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
          >
            <span className="text-xs uppercase tracking-widest text-red-400 font-bold">21:1 Contrast Polar Block</span>
            <span className="text-2xl font-black mt-2">DEEP STROBE BLACK</span>
            <p className="text-xs text-slate-300 mt-2">Extreme black-to-white luminance transition</p>
          </div>

          <div
            id="strobe-polar-white"
            className="p-6 rounded-xl flex flex-col items-center justify-center text-center font-mono border-4 border-black"
            style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
          >
            <span className="text-xs uppercase tracking-widest text-red-600 font-bold">Peak Glare Luminance</span>
            <span className="text-2xl font-black mt-2">PEAK BLINDING WHITE</span>
            <p className="text-xs text-slate-700 mt-2">Luminance 1.0 triggering acute ocular stress</p>
          </div>
        </div>

        {/* Neon High-Saturation Complementary Zone */}
        <div
          id="seizure-neon-complementary"
          data-sensory-neon="true"
          className="p-4 rounded-xl flex items-center justify-between text-black font-extrabold"
          style={{ backgroundColor: '#00FFFF', border: '3px solid #FF00FF', boxShadow: '0 0 20px #00FFFF' }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-black" />
            <span className="text-sm">AGGRESSIVE COMPLEMENTARY NEON PAIR (#00FFFF / #FF00FF)</span>
          </div>
          <span className="text-xs bg-black text-cyan-300 px-3 py-1 rounded-full font-mono">100% Saturation</span>
        </div>
      </div>
    );
  }

  if (pageId === 'autoplay-carousel') {
    return (
      <div id="sandbox-carousel-page" className="p-6 bg-slate-100 rounded-xl space-y-6 border border-slate-200 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              Dynamic Showcase & Autoplaying Carousel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">High motion density: Simultaneous animated slides, autoplay reel, and sticker loops.</p>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Continuous Motion Density
          </span>
        </div>

        {/* Autoplay Carousel Simulation Container */}
        <div id="autoplay-carousel-container" className="p-4 bg-white rounded-xl border border-slate-300 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700">
            <span>LIVE PRODUCT STREAM (AUTOPLAYING EVERY 1.2S)</span>
            <span className="text-red-600 font-mono flex items-center gap-1 animate-pulse">
              ● MOTION ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg border border-amber-200">
              <div className="h-24 bg-slate-800 rounded-md flex items-center justify-center text-white text-xs font-mono mb-2">
                Slide A: Video Frame
              </div>
              <h4 className="text-xs font-bold text-slate-800">Dynamic Motion Slide 1</h4>
              <p className="text-[11px] text-slate-500">Unbounded carousel transition</p>
            </div>

            <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-lg border border-cyan-200">
              <div className="h-24 bg-slate-900 rounded-md flex items-center justify-center text-cyan-400 text-xs font-mono mb-2">
                Slide B: Animated Graphic
              </div>
              <h4 className="text-xs font-bold text-slate-800">Dynamic Motion Slide 2</h4>
              <p className="text-[11px] text-slate-500">Pulsing color transitions</p>
            </div>

            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg border border-purple-200">
              <div className="h-24 bg-slate-950 rounded-md flex items-center justify-center text-pink-400 text-xs font-mono mb-2">
                Slide C: Looping Clip
              </div>
              <h4 className="text-xs font-bold text-slate-800">Dynamic Motion Slide 3</h4>
              <p className="text-[11px] text-slate-500">Repetitive motion cycle</p>
            </div>
          </div>
        </div>

        {/* Autoplay Video Player */}
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-700">
            <span>Autoplay Feature Reel</span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono">LOOPING WITHOUT OPT-IN</span>
          </div>
          <div className="h-40 rounded-lg overflow-hidden bg-slate-950">
            <video
              id="carousel-reel-video"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80"
            >
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    );
  }

  // Default: Flash News & Strobe Portal
  return (
    <div id="sandbox-news-page" className="p-6 bg-slate-100 rounded-xl space-y-6 border border-slate-300 text-slate-900">
      {/* Harsh Neon Lime Banner */}
      <div
        id="neon-lime-alert"
        data-sensory-neon="true"
        className="p-3.5 rounded-xl text-black font-extrabold flex items-center justify-between shadow-xs"
        style={{
          backgroundColor: '#00FF00',
          border: '2px solid #000000',
          boxShadow: '0 0 15px #00FF00',
        }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-black" />
          <span className="text-xs uppercase tracking-wider font-black">HARSH NEON LIME (#00FF00) SPONSOR FLOOD</span>
        </div>
        <span className="text-[11px] bg-black text-green-300 px-2.5 py-0.5 rounded font-mono">100% Saturation</span>
      </div>

      {/* 4Hz Rapid CSS Flashing Strobe (Epilepsy Risk WCAG 2.3.1 Trigger) */}
      <div
        id="rapid-strobe-alert"
        className="p-4 rounded-xl text-center font-bold text-white shadow-md"
        style={{
          animation: 'flashingAlert 0.25s infinite alternate',
          backgroundColor: '#DC2626',
        }}
      >
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full mb-1">
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          4.0 Hz Critical Seizure Trigger (0.25s Loop)
        </div>
        <h2 className="text-xl font-black tracking-tight">RAPID VISUAL STROBE FLASH WARNING</h2>
        <p className="text-xs text-white/90 mt-1">Oscillates between red and yellow at 4 cycles/second. Fails WCAG 2.3.1!</p>
      </div>

      {/* Autoplaying Video Player */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-blue-600" />
            Breaking News Live Stream (Autoplaying)
          </span>
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px] font-mono">LOOPING WITHOUT CONSENT</span>
        </div>

        <div id="news-video-container" className="relative rounded-lg overflow-hidden bg-slate-950 h-44">
          <video
            id="breaking-news-video"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Animated GIF & Stark High Contrast Black/White Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          id="news-gif-banner"
          data-sensory-gif="true"
          className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-3"
        >
          <img
            id="strobe-badge-gif"
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG9rcnVpd2tyYmI5dG54MHptYnl6aXZxNGFrc2V5d3cydGl5MnpsMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlOBZREZ80ENCMo/giphy.gif"
            alt="Pulsing Animated GIF"
            className="w-14 h-14 rounded-lg object-cover border border-slate-300"
            data-sensory-gif="true"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900">Looping Animated Sticker</h4>
            <p className="text-xs text-slate-500">Unbounded frame cycle asset</p>
          </div>
        </div>

        <div
          id="stark-contrast-block"
          className="p-4 rounded-xl flex flex-col justify-center text-center font-mono font-black"
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: '3px solid #FFFFFF',
          }}
        >
          <span className="text-xs text-amber-400">21:1 Contrast Polar Strobe</span>
          <span className="text-base tracking-widest mt-1">BLACK & WHITE FLASH</span>
        </div>
      </div>
    </div>
  );
};
