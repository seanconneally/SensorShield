import React from 'react';
import { SignalReconciliation } from '../track3/types';
import { ShieldAlert, ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';

interface ReconciliationVisualizerProps {
  reconciliation: SignalReconciliation | null;
}

export const ReconciliationVisualizer: React.FC<ReconciliationVisualizerProps> = ({ reconciliation }) => {
  if (!reconciliation) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Reconciliation Data Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Switch to the Sandbox tab and click <strong>"Scan Viewport with Gemini 2.5 Flash"</strong> to capture the rendered viewport and reconcile DOM timing with AI vision analysis.
        </p>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-slate-950';
      default:
        return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Signal Fusion & Reconciliation
            </span>
            <h2 className="text-lg font-bold text-slate-900">Dual-Signal Decision Matrix</h2>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-100 font-mono text-slate-700 rounded-md font-bold">
            Dominant: {reconciliation.dominantSource}
          </span>
        </div>

        {/* 3-Column Signal Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* DOM Scanner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800 uppercase">Primary: DOM Scanner</span>
            </div>
            <p className="text-xs text-slate-600">
              Hardware/timing telemetry (CSS cycle duration, HTML5 video play-state, GIF headers).
            </p>
            <div className="pt-2">
              <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${getTierColor(reconciliation.domRisk)}`}>
                {reconciliation.domRisk}
              </span>
            </div>
          </div>

          {/* Merge Arrow */}
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
            <ArrowRight className="w-6 h-6 hidden md:block" />
            <span className="text-[11px] font-bold uppercase text-slate-500">Reconciled Max</span>
          </div>

          {/* Gemini AI Vision */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase">Backstop: Gemini 2.5 Flash</span>
            </div>
            <p className="text-xs text-slate-600">
              Multimodal viewport evaluation (harsh neon blocks, repetitive patterns, layout density).
            </p>
            <div className="pt-2">
              <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${getTierColor(reconciliation.aiRisk)}`}>
                {reconciliation.aiRisk}
              </span>
            </div>
          </div>
        </div>

        {/* Final Decision Banner */}
        <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-amber-300">
              Final Enforced Protection Tier: {reconciliation.finalTier.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {reconciliation.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
