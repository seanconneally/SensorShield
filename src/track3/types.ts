/**
 * Visual Sensory Shield - Track 3 Data Types
 * Story 5: Visual Trigger & Overload Scanner
 * Story 6: Sensory Mitigation Injector
 */

export type TriggerType =
  | 'video_autoplay'
  | 'animated_gif'
  | 'rapid_css_animation'
  | 'harsh_contrast_block';

export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface DetectedTrigger {
  id: string;
  type: TriggerType;
  tagName: string;
  selector: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  metrics: {
    hz?: number;
    duration?: string;
    contrastRatio?: number;
    luminance?: number;
    isAutoplay?: boolean;
    isLooping?: boolean;
    mediaSrc?: string;
    colors?: string[];
  };
  element?: HTMLElement;
}

export type AIRiskLevel = 'SAFE' | 'MODERATE_RISK' | 'HIGH_RISK';

export interface SensoryAnalysisResult {
  riskLevel: AIRiskLevel;
  overallScore: number; // 0 (safest) to 100 (critical overload)
  detectedCount: number;
  summary: string;
  reasons: string[];
  recommendedMitigations: {
    pauseAnimations: boolean;
    applyWarmFilter: boolean;
    desaturateNeon: boolean;
    placeWarningShields: boolean;
    warmthFactor: number; // e.g. 35%
    brightnessLevel: number; // e.g. 0.88
  };
}

export interface MitigationState {
  enabled: boolean;
  riskLevel: AIRiskLevel;
  pauseAnimations: boolean;
  applyWarmFilter: boolean;
  warmthFactor: number; // 0 - 100
  brightnessLevel: number; // 0.60 - 1.0
  desaturateNeon: boolean;
  placeWarningShields: boolean;
  revealedMediaIds: string[]; // IDs of elements the user opted to reveal
}

export interface ChromeRuntimeMessage {
  id: string;
  timestamp: string;
  action: 'ANALYZE_SENSORY_RISK' | 'SIMPLIFY_TEXT' | 'SENSORY_RISK_RESPONSE' | 'APPLY_MITIGATION';
  sender: 'content-script (track-3)' | 'background.js' | 'ui';
  payload: Record<string, any>;
  status: 'dispatched' | 'received' | 'processed';
}

export type SandboxPage = {
  id: string;
  name: string;
  category: string;
  description: string;
  triggersPresent: string[];
  baseRisk: AIRiskLevel;
};

/**
 * Google AI Studio Prompt Schema - Gemini 2.5 Flash Structured Output
 * Track 3: Visual Sensory Shield — ANALYZE_SENSORY_RISK / handleSensoryAnalysis(base64Image)
 */
export type AIRiskTier = 'low' | 'medium' | 'high' | 'critical';

export type AITriggerType =
  | 'flashing_strobing'
  | 'high_contrast_block'
  | 'neon_saturation'
  | 'motion_density'
  | 'repetitive_pattern';

export type AITriggerStatus = 'confirmed' | 'suspected';

export type AITriggerSeverity = 'low' | 'medium' | 'high';

export type AIMitigation =
  | 'pause_animation'
  | 'apply_warm_filter'
  | 'desaturate'
  | 'add_opt_in_shield'
  | 'reduce_contrast';

export interface AIBoundingBox {
  x: number; // 0.0 - 1.0 normalized
  y: number; // 0.0 - 1.0 normalized
  width: number;
  height: number;
}

export interface AITrigger {
  type: AITriggerType;
  status: AITriggerStatus;
  severity: AITriggerSeverity;
  boundingBox: AIBoundingBox;
  description: string;
  recommendedMitigation: AIMitigation;
}

export interface AISensoryRiskResponse {
  overallRisk: AIRiskTier;
  confidence: number;
  triggers: AITrigger[];
  summary: string;
}

/**
 * Story 5 + AI Signal Reconciliation
 * Primary signal: Story 5 DOM Scanner (animation frame rate, GIF/video play state, CSS duration)
 * Secondary signal: Gemini AI screenshot analyzer
 * Final tier: max(DOM risk, AI risk)
 */
export interface SignalReconciliation {
  domRisk: AIRiskTier;
  aiRisk: AIRiskTier;
  finalTier: AIRiskTier;
  dominantSource: 'DOM_SCANNER (Confirmed)' | 'GEMINI_AI (Multimodal Vision)' | 'CONCURRENT_AGREEMENT';
  explanation: string;
}
