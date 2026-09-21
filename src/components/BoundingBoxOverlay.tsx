import React, { useState } from 'react';
import { AITrigger } from '../track3/types';
import { ShieldAlert, Eye } from 'lucide-react';

interface BoundingBoxOverlayProps {
  triggers: AITrigger[];
  containerWidth: number;
  containerHeight: number;
  showShields: boolean;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  triggers,
  containerWidth,
  containerHeight,
  showShields,
}) => {
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  if (!triggers || triggers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {triggers.map((trigger, idx) => {
        if (!trigger.boundingBox) return null;
        const { x, y, width, height } = trigger.boundingBox;
        const isRevealed = revealedIndices.includes(idx);

        const left = Math.round(x * containerWidth);
        const top = Math.round(y * containerHeight);
        const w = Math.max(80, Math.round(width * containerWidth));
        const h = Math.max(50, Math.round(height * containerHeight));

        const isHazard = trigger.severity === 'high' || trigger.recommendedMitigation === 'add_opt_in_shield';

        return (
          <div
            key={idx}
            className={`absolute transition-all duration-200 border-2 rounded-lg pointer-events-auto ${
              trigger.severity === 'high'
                ? 'border-red-500 bg-red-500/10'
                : trigger.severity === 'medium'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-blue-500 bg-blue-500/10'
            }`}
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${w}px`,
              height: `${h}px`,
            }}
          >
            {/* Tag Badge */}
            <div className="absolute -top-6 left-0 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1 shadow-sm whitespace-nowrap">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  trigger.severity === 'high' ? 'bg-red-400' : 'bg-amber-400'
                }`}
              />
              <span>{trigger.type}</span>
              <span className="opacity-70">({trigger.status})</span>
            </div>

            {/* Protective Opt-in Shield if enabled and hazard */}
            {showShields && isHazard && !isRevealed && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-lg flex flex-col items-center justify-center p-2 text-center text-white space-y-1.5">
                <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
                <div className="text-[11px] font-bold text-amber-300">Sensory Shield Active</div>
                <p className="text-[10px] text-slate-300 line-clamp-2 max-w-[200px]">
                  {trigger.description}
                </p>
                <button
                  type="button"
                  onClick={() => setRevealedIndices((prev) => [...prev, idx])}
                  className="mt-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Reveal Media
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
