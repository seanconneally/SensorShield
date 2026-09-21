import React, { useEffect, useRef, useState } from 'react';
import { applySensoryMitigation, resetSensoryShield } from '../track3/shieldPreview';

export const SensoryShieldPlayground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const gifRef = useRef<HTMLImageElement>(null);

  const [activeRisk, setActiveRisk] = useState<string>('none');

  useEffect(() => () => {
    if (videoRef.current) resetSensoryShield(videoRef.current);
    if (gifRef.current) resetSensoryShield(gifRef.current);
  }, []);

  const triggerShield = (element: HTMLElement, risk: 'medium' | 'high' | 'critical') => {
    if (!element) return;
    const report = {
      overallRisk: risk,
      summary: risk === 'medium' ? 'Possible media animation.' : 'Autoplay video detected.',
      triggers: []
    };
    applySensoryMitigation(element, report);
    setActiveRisk(risk);
  };

  const resetAll = () => {
    if (videoRef.current) resetSensoryShield(videoRef.current);
    if (gifRef.current) resetSensoryShield(gifRef.current);
    setActiveRisk('none');
  };

  return (
    <div className="p-8 space-y-8 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">SensoryShield Interaction Prototype</h2>
        <p className="text-sm text-slate-600">
          Test the vanilla JS + CSS overlay logic generated for the extension's content script.
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => triggerShield(videoRef.current!, 'medium')}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded shadow-sm hover:bg-amber-400"
        >
          Trigger Medium Risk (Warning)
        </button>
        <button
          onClick={() => triggerShield(videoRef.current!, 'high')}
          className="px-4 py-2 bg-red-600 text-white font-bold rounded shadow-sm hover:bg-red-500"
        >
          Trigger High Risk (Shield Card)
        </button>
        <button
          onClick={resetAll}
          className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded shadow-sm hover:bg-slate-300"
        >
          Reset Elements
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">Autoplay Video (Target)</h3>
          {/* Wrapper is intentionally position: relative or static to test the logic */}
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
            <video
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              autoPlay
              loop
              muted
              className="w-full h-auto rounded shadow-sm"
              style={{ display: 'block' }}
            />
          </div>
          <p className="text-xs text-slate-500">
            The script should wrap or absolutely position an overlay based on this element's dimensions.
          </p>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">Animated Image</h3>
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
             <img
              ref={gifRef}
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&q=80"
              alt="Test Image"
              className="w-full h-auto rounded shadow-sm object-cover"
              style={{ display: 'block', height: '240px' }}
            />
          </div>
          <p className="text-xs text-slate-500">
            Test on standard image elements (pretend this is a heavy GIF).
          </p>
        </div>
      </div>
    </div>
  );
};
