import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sparkles,
  Download,
  Camera,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2,
  Terminal,
  FileCode,
  Layers,
  Presentation,
  Play,
  Flame,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { TEST_PAGES_META } from './track3/mockPages';
import { SandboxPagesView } from './track3/SandboxPagesView';
import {
  scanDOMForSensoryTriggers,
  captureViewportScreenshot,
  callSensoryRiskApi,
  reconcileSignals,
} from './track3/sensoryScanner';
import {
  DetectedTrigger,
  AISensoryRiskResponse,
  SignalReconciliation,
  AIRiskTier,
  MitigationState,
} from './track3/types';
import { DEFAULT_MITIGATION_STATE } from './track3/sensoryMitigation';
import { BoundingBoxOverlay } from './components/BoundingBoxOverlay';
import { ImageAnalyzerPlayground } from './components/ImageAnalyzerPlayground';
import { PromptReferenceModal } from './components/PromptReferenceModal';
import { ReconciliationVisualizer } from './components/ReconciliationVisualizer';
import { PresentationSlideView } from './components/PresentationSlideView';
import { SensoryShieldPlayground } from './components/SensoryShieldPlayground';
import { downloadExtensionZip } from './track3/extensionExport';

type ActiveTab = 'sandbox' | 'image-analyzer' | 'reconciliation' | 'prompt-spec' | 'presentation' | 'shield-prototype';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sandbox');

  const [selectedPageId, setSelectedPageId] = useState<string>('seizure-test');

  // DOM Scanner state
  const [domTriggers, setDomTriggers] = useState<DetectedTrigger[]>([]);
  const [scanningDOM, setScanningDOM] = useState<boolean>(false);

  // AI Analysis & Reconciliation state
  const [analyzingAI, setAnalyzingAI] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AISensoryRiskResponse | null>(null);
  const [reconciliation, setReconciliation] = useState<SignalReconciliation | null>(null);
  const [softOptInBanner, setSoftOptInBanner] = useState<string | null>(null);

  // Mitigation controls
  const [mitigations, setMitigations] = useState<MitigationState>({
    ...DEFAULT_MITIGATION_STATE,
    enabled: true,
  });
  const [showShields, setShowShields] = useState<boolean>(true);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [apiHealth, setApiHealth] = useState<{ ok: boolean; model: string }>({
    ok: true,
    model: 'gemini-2.5-flash',
  });

  const sandboxContainerRef = useRef<HTMLDivElement>(null);

  // Check server health
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'ok') {
          setApiHealth({ ok: true, model: data.model || 'gemini-2.5-flash' });
        }
      })
      .catch(() => {
        // server running locally or fallback
      });
  }, []);

  // Run DOM scan whenever page preset changes or DOM mutates
  const triggerDomScan = () => {
    if (!sandboxContainerRef.current) return;
    setScanningDOM(true);
    setTimeout(() => {
      if (sandboxContainerRef.current) {
        const triggers = scanDOMForSensoryTriggers(sandboxContainerRef.current);
        setDomTriggers(triggers);
      }
      setScanningDOM(false);
    }, 150);
  };

  useEffect(() => {
    // Reset AI analysis and re-run DOM scan when preset changes
    setAiResult(null);
    setReconciliation(null);
    setSoftOptInBanner(null);

    const timer = setTimeout(() => {
      triggerDomScan();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedPageId]);

  // Live MutationObserver for DOM changes
  useEffect(() => {
    if (!sandboxContainerRef.current) return;

    const observer = new MutationObserver(() => {
      triggerDomScan();
    });

    observer.observe(sandboxContainerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'src', 'autoplay', 'loop'],
    });

    return () => observer.disconnect();
  }, [selectedPageId]);

  // Handle Viewport Screenshot + Gemini 2.5 Flash Vision Analysis
  const handleScanViewportWithAI = async () => {
    if (!sandboxContainerRef.current) return;
    setAnalyzingAI(true);
    setSoftOptInBanner(null);

    try {
      // 1. Capture viewport screenshot as base64 JPEG
      const base64Screenshot = await captureViewportScreenshot(sandboxContainerRef.current);

      // 2. Call backend /api/sensory-risk powered by Gemini 2.5 Flash
      const aiResponse = await callSensoryRiskApi(base64Screenshot);
      setAiResult(aiResponse);

      // 3. Reconcile Story 5 DOM timing with Gemini AI screenshot analysis
      const reconciled = reconcileSignals(domTriggers, aiResponse);
      setReconciliation(reconciled);

      // 4. Story 6 Mitigation Tier Execution:
      // High / Critical -> auto-apply warm filter + freeze motion + shields
      if (reconciled.finalTier === 'high' || reconciled.finalTier === 'critical') {
        setMitigations((prev) => ({
          ...prev,
          enabled: true,
          applyWarmFilter: true,
          pauseAnimations: true,
          desaturateNeon: true,
          placeWarningShields: true,
          warmthFactor: reconciled.finalTier === 'critical' ? 45 : 35,
          brightnessLevel: reconciled.finalTier === 'critical' ? 0.84 : 0.88,
        }));
        setShowShields(true);
      } else if (reconciled.finalTier === 'medium') {
        // Medium tier: Soft opt-in prompt
        setSoftOptInBanner(
          `⚠️ Moderate Sensory Stimuli Identified: ${aiResponse.summary || 'Elevated motion or contrast present.'}`
        );
      }
    } catch (err) {
      console.error('AI Sensory Scan failed:', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadExtensionZip();
    } catch (err) {
      console.error('Failed to bundle extension:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const activePageMeta = TEST_PAGES_META.find((p) => p.id === selectedPageId) || TEST_PAGES_META[0];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Application Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900">Visual Sensory Shield</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                  Track 3 • Story 5 & 6
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Visual Trigger Scanner, AI Risk Screenshot Dispatcher & Mitigation Injector
              </p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sandbox & Scanner
            </button>
            <button
              onClick={() => setActiveTab('image-analyzer')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'image-analyzer'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Risk Analyzer
            </button>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'reconciliation'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Signal Reconciliation
            </button>
            <button
              onClick={() => setActiveTab('prompt-spec')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'prompt-spec'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prompt Spec
            </button>
            <button
              onClick={() => setActiveTab('shield-prototype')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'shield-prototype'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shield UI
            </button>
            <button
              onClick={() => setActiveTab('presentation')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'presentation'
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Slide 3 Deck
            </button>
          </nav>

          {/* Right Action: Extension Packager */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono font-semibold text-slate-700">{apiHealth.model}</span>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{downloadingZip ? 'Packaging...' : 'Export Extension (.zip)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Row */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-3 py-1 rounded-lg shrink-0 ${
            activeTab === 'sandbox' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Sandbox
        </button>
        <button
          onClick={() => setActiveTab('image-analyzer')}
          className={`px-3 py-1 rounded-lg shrink-0 ${
            activeTab === 'image-analyzer' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          AI Analyzer
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-3 py-1 rounded-lg shrink-0 ${
            activeTab === 'reconciliation' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Reconciliation
        </button>
        <button
          onClick={() => setActiveTab('prompt-spec')}
          className={`px-3 py-1 rounded-lg shrink-0 ${
            activeTab === 'prompt-spec' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Prompt Spec
        </button>
        <button
          onClick={() => setActiveTab('shield-prototype')}
          className={`px-3 py-1 rounded-lg shrink-0 ${
            activeTab === 'shield-prototype' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Shield UI
        </button>
        <button
          onClick={() => setActiveTab('presentation')}
          className={`px-3 py-1 rounded-lg shrink-0 ${
            activeTab === 'presentation' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600'
          }`}
        >
          Slide 3 Deck
        </button>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'image-analyzer' && <ImageAnalyzerPlayground />}

        {activeTab === 'reconciliation' && (
          <ReconciliationVisualizer reconciliation={reconciliation} />
        )}

        {activeTab === 'prompt-spec' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <PromptReferenceModal />
          </div>
        )}

        {activeTab === 'shield-prototype' && <SensoryShieldPlayground />}

        {activeTab === 'presentation' && (
          <PresentationSlideView onReturnToTestbed={() => setActiveTab('sandbox')} />
        )}

        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            {/* Top Controls & Preset Selector */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    1. Select Real-World Test Scenario
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Live HTML DOM environments with actual CSS animations, HTML5 looping video, and neon colors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={triggerDomScan}
                    disabled={scanningDOM}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${scanningDOM ? 'animate-spin' : ''}`} />
                    Rescan DOM
                  </button>

                  <button
                    onClick={handleScanViewportWithAI}
                    disabled={analyzingAI}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {analyzingAI ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-slate-950" />
                    )}
                    {analyzingAI ? 'Gemini Analyzing...' : 'Scan Viewport with Gemini 2.5 Flash'}
                  </button>
                </div>
              </div>

              {/* Preset Selector Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {TEST_PAGES_META.map((preset) => {
                  const isSelected = selectedPageId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPageId(preset.id)}
                      className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 line-clamp-1 block">
                        {preset.name}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded inline-block mt-1 ${
                          preset.baseRisk === 'HIGH_RISK'
                            ? 'bg-red-100 text-red-700'
                            : preset.baseRisk === 'SAFE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {preset.baseRisk}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reconciled Protection Status Banner */}
            {reconciliation && (
              <div className="p-4 rounded-xl border bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      reconciliation.finalTier === 'critical'
                        ? 'bg-red-600 text-white'
                        : reconciliation.finalTier === 'high'
                        ? 'bg-orange-600 text-white'
                        : reconciliation.finalTier === 'medium'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Signal Reconciliation Active
                      </span>
                      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
                        {reconciliation.dominantSource}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {reconciliation.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase px-3 py-1 rounded ${
                      reconciliation.finalTier === 'critical'
                        ? 'bg-red-600 text-white'
                        : reconciliation.finalTier === 'high'
                        ? 'bg-orange-600 text-white'
                        : reconciliation.finalTier === 'medium'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {reconciliation.finalTier} PROTECTION
                  </span>
                </div>
              </div>
            )}

            {/* Soft Opt-In Banner for Medium Tier */}
            {softOptInBanner && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{softOptInBanner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMitigations((prev) => ({
                        ...prev,
                        enabled: true,
                        applyWarmFilter: true,
                        pauseAnimations: true,
                        desaturateNeon: true,
                      }));
                      setSoftOptInBanner(null);
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors cursor-pointer"
                  >
                    Enable Shield
                  </button>
                  <button
                    onClick={() => setSoftOptInBanner(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Split Grid: Live Viewport on Left, Telemetry & Mitigation Controls on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Live Sandbox Viewport */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Interactive Viewport Sandbox
                    </span>
                    <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {activePageMeta.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mitigations.enabled}
                        onChange={(e) =>
                          setMitigations((prev) => ({ ...prev, enabled: e.target.checked }))
                        }
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold">Master Shield</span>
                    </label>
                  </div>
                </div>

                {/* The Viewport Container with Dynamic Mitigations and Bounding Boxes */}
                <div
                  ref={sandboxContainerRef}
                  id="sandbox-viewport-container"
                  className={`relative rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-white min-h-[460px] transition-all ${
                    mitigations.enabled && mitigations.pauseAnimations
                      ? 'sensory-shield-pause-motion'
                      : ''
                  } ${
                    mitigations.enabled && mitigations.applyWarmFilter
                      ? 'sensory-shield-warm-filter'
                      : ''
                  } ${
                    mitigations.enabled && mitigations.desaturateNeon
                      ? 'sensory-shield-desaturate-neon'
                      : ''
                  }`}
                  style={
                    {
                      '--sensory-warmth': `${mitigations.warmthFactor}%`,
                      '--sensory-brightness': `${mitigations.brightnessLevel}`,
                    } as React.CSSProperties
                  }
                >
                  {/* Real DOM Sandbox Component */}
                  <SandboxPagesView pageId={selectedPageId} />

                  {/* Normalized Bounding Box Warning Shields from Gemini 2.5 Flash */}
                  {aiResult && aiResult.triggers && (
                    <BoundingBoxOverlay
                      triggers={aiResult.triggers}
                      containerWidth={sandboxContainerRef.current?.clientWidth || 800}
                      containerHeight={sandboxContainerRef.current?.clientHeight || 500}
                      showShields={showShields && mitigations.enabled}
                    />
                  )}

                  {/* Active Loading Overlay */}
                  {analyzingAI && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-40">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                      <span className="text-sm font-bold">Capturing Viewport & Querying Gemini 2.5 Flash...</span>
                      <span className="text-xs text-slate-300 mt-1 font-mono">
                        POST /api/sensory-risk • Evaluating strobing, neon, and contrast
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>
                    Story 5 DOM triggers detected: <strong>{domTriggers.length}</strong>
                  </span>
                  <span>
                    AI risk assessment: <strong>{aiResult?.overallRisk || 'Not yet dispatched'}</strong>
                  </span>
                </div>
              </div>

              {/* Right Column: DOM Telemetry & Story 6 Mitigation Tuning */}
              <div className="lg:col-span-4 space-y-4">
                {/* Mitigation Injector Controls */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      Story 6: Mitigation Injector
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">Active Page CSS</span>
                  </div>

                  {/* Toggle Controls */}
                  <div className="space-y-2.5 text-xs">
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-semibold text-slate-800">Warm Low-Luminance Filter</span>
                      <input
                        type="checkbox"
                        checked={mitigations.applyWarmFilter}
                        onChange={(e) =>
                          setMitigations((prev) => ({ ...prev, applyWarmFilter: e.target.checked }))
                        }
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>

                    {mitigations.applyWarmFilter && (
                      <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 space-y-2">
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-amber-900 mb-1">
                            <span>Amber Warmth: {mitigations.warmthFactor}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            value={mitigations.warmthFactor}
                            onChange={(e) =>
                              setMitigations((prev) => ({
                                ...prev,
                                warmthFactor: parseInt(e.target.value),
                              }))
                            }
                            className="w-full accent-amber-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-amber-900 mb-1">
                            <span>Brightness: {Math.round(mitigations.brightnessLevel * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="65"
                            max="100"
                            value={Math.round(mitigations.brightnessLevel * 100)}
                            onChange={(e) =>
                              setMitigations((prev) => ({
                                ...prev,
                                brightnessLevel: parseInt(e.target.value) / 100,
                              }))
                            }
                            className="w-full accent-amber-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-semibold text-slate-800">Pause Animations & Videos</span>
                      <input
                        type="checkbox"
                        checked={mitigations.pauseAnimations}
                        onChange={(e) =>
                          setMitigations((prev) => ({
                            ...prev,
                            pauseAnimations: e.target.checked,
                          }))
                        }
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-semibold text-slate-800">Desaturate Harsh Neon Colors</span>
                      <input
                        type="checkbox"
                        checked={mitigations.desaturateNeon}
                        onChange={(e) =>
                          setMitigations((prev) => ({
                            ...prev,
                            desaturateNeon: e.target.checked,
                          }))
                        }
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <span className="font-semibold text-slate-800">Frosted Bounding Shields</span>
                      <input
                        type="checkbox"
                        checked={showShields}
                        onChange={(e) => setShowShields(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Story 5 Live DOM Scanner Telemetry */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      Story 5: DOM Scanner Telemetry
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-700">
                      {domTriggers.length} Active
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {domTriggers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                        Zero visual hazards in active DOM subtree.
                      </div>
                    ) : (
                      domTriggers.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{t.title}</span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                t.severity === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : t.severity === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {t.severity}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-tight">{t.description}</p>
                          {t.metrics.hz && (
                            <div className="text-[10px] font-mono text-red-600 font-bold">
                              Oscillation Frequency: {t.metrics.hz} Hz (WCAG Limit: 3.0 Hz)
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Analysis Quick Preview Card */}
                {aiResult && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        AI Output Summary
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {Math.round(aiResult.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      "{aiResult.summary}"
                    </p>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Triggers: {aiResult.triggers?.length || 0}</span>
                      <button
                        onClick={() => setActiveTab('image-analyzer')}
                        className="text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        Inspect Raw JSON →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
