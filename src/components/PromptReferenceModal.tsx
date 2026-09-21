import React from 'react';
import { FileCode, Terminal } from 'lucide-react';

export const PromptReferenceModal: React.FC = () => {
  return (
    <div className="space-y-4 text-slate-800">
      <div className="border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Specification
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">
          Gemini 2.5 Flash Structured Prompt Specification
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Prompt contract utilized by the backend proxy at <code>POST /api/sensory-risk</code> and Extension background script.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Terminal className="w-4 h-4 text-amber-600" />
          <span>System Instruction</span>
        </div>
        <pre className="p-4 bg-slate-900 text-slate-200 text-xs rounded-xl overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
{`You are a visual sensory safety analyzer embedded in a browser accessibility extension. You are shown a screenshot of a web page's current viewport. Your job is to detect content that could trigger photosensitive epilepsy, migraine, sensory overload, or ADHD-related attentional overload — and to recommend a specific, minimal mitigation for each issue.

Analyze the image for:
1. Flashing/strobing risk — rapid brightness changes, high-contrast flicker patterns, animated GIFs mid-flash, video frames suggesting rapid cuts
2. Harsh high-contrast blocks — pure black/white or saturated complementary color pairs covering large screen area
3. Aggressive saturated/neon color zones — oversaturated reds, magentas, cyans that cause visual fatigue
4. Busy motion density — many moving/animated elements simultaneously visible (carousels, autoplay video, animated ads, parallax)
5. Repetitive high-frequency patterns — tight stripes, moiré-prone patterns, spinning elements

For each issue found, estimate its screen region (as a normalized bounding box, 0–1 scale, origin top-left) and severity.
If you can't confirm true flashing/strobing from a still image, flag it as 'suspected' rather than 'confirmed' and lower severity accordingly.
Always respond with valid JSON matching the schema exactly.`}
        </pre>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <FileCode className="w-4 h-4 text-blue-600" />
          <span>JSON Output Schema Contract</span>
        </div>
        <pre className="p-4 bg-slate-900 text-amber-300 text-xs rounded-xl overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
{`{
  "overallRisk": "low" | "medium" | "high" | "critical",
  "confidence": 0.95,
  "triggers": [
    {
      "type": "flashing_strobing" | "high_contrast_block" | "neon_saturation" | "motion_density" | "repetitive_pattern",
      "status": "confirmed" | "suspected",
      "severity": "low" | "medium" | "high",
      "boundingBox": { "x": 0.05, "y": 0.1, "width": 0.9, "height": 0.2 },
      "description": "High-frequency brightness cycling indicating strobing risk.",
      "recommendedMitigation": "pause_animation" | "apply_warm_filter" | "desaturate" | "add_opt_in_shield" | "reduce_contrast"
    }
  ],
  "summary": "User-facing high-level summary sentence."
}`}
        </pre>
      </div>
    </div>
  );
};
