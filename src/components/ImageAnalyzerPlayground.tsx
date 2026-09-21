import React, { useState } from 'react';
import { Camera, Sparkles, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { callSensoryRiskApi } from '../track3/sensoryScanner';
import { AISensoryRiskResponse } from '../track3/types';

export const ImageAnalyzerPlayground: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISensoryRiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setLoading(true);
    setError(null);
    try {
      const res = await callSensoryRiskApi(imageSrc);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Playground</span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">Standalone Image Sensory Risk Analyzer</h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload any web screenshot or image asset to inspect the raw Gemini 2.5 Flash detection and JSON response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Upload & Preview */}
          <div className="space-y-3">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2 hover:border-amber-500 transition-colors">
              <Camera className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">Upload screenshot for analysis</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
              />
            </div>

            {imageSrc && (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-[300px] flex items-center justify-center">
                  <img src={imageSrc} alt="Preview" className="max-h-[300px] object-contain" />
                </div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? 'Evaluating with Gemini 2.5 Flash...' : 'Run Sensory Analysis'}
                </button>
              </div>
            )}
          </div>

          {/* Results Output */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Gemini 2.5 Flash Structured Response
            </span>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span>Overall Risk: <strong className="uppercase">{result.overallRisk}</strong></span>
                  <span>Confidence: <strong>{Math.round(result.confidence * 100)}%</strong></span>
                  <span>Triggers: <strong>{result.triggers?.length || 0}</strong></span>
                </div>
                <pre className="p-4 bg-slate-900 text-amber-300 font-mono text-xs rounded-xl overflow-x-auto max-h-[340px]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Upload an image and run analysis to view the output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
