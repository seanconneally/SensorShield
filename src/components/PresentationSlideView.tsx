import React from 'react';
import { Presentation, ArrowLeft, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface PresentationSlideViewProps {
  onReturnToTestbed: () => void;
}

export const PresentationSlideView: React.FC<PresentationSlideViewProps> = ({ onReturnToTestbed }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-800">Track 3: Visual Sensory Shield Pitch Deck</h2>
        </div>
        <button
          onClick={onReturnToTestbed}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Sandbox
        </button>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 space-y-6 shadow-sm">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Slide 3: Track 3 Solution</span>
          <h1 className="text-2xl font-bold">Visual Sensory Shield: Dual-Signal Protection</h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time visual safety engine protecting users with photosensitive epilepsy, migraines, ADHD, and sensory processing disorders from digital overload.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">1</div>
            <h3 className="font-bold text-base text-amber-300">Story 5: DOM Timing Scanner</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Detects high-frequency CSS strobe (&gt;= 3Hz), unmuted autoplaying HTML5 video, animated GIFs, and hyper-saturated neon glare blocks directly from DOM properties.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">2</div>
            <h3 className="font-bold text-base text-blue-300">Gemini 2.5 Flash Vision</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multimodal fallback analyzing screenshot viewports to detect high-contrast blocks, complex motion density, and repetitive patterns with normalized bounding boxes.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</div>
            <h3 className="font-bold text-base text-emerald-300">Story 6: Mitigation Injector</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly freezes animations, injects warm amber photophobia filter, desaturates neon, and places frosted-glass opt-in shields over dangerous media regions.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-300">
            <strong>Cross-Track Interoperability:</strong> Follows standardized Chrome Runtime message schema (<code>ANALYZE_SENSORY_RISK</code> / <code>SIMPLIFY_TEXT</code>).
          </span>
        </div>
      </div>
    </div>
  );
};
