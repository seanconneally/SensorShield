import '../../ai-accessibility-extension/extension/sensory-shield.js';
// Preview adapter uses the same mitigation implementation as the extension.
const shield = () => (globalThis as typeof globalThis & { __sensoryShield: {
  apply(element: HTMLElement, report: { overallRisk: string; summary?: string }): void;
  reset(element: HTMLElement): void;
} }).__sensoryShield;
export function applySensoryMitigation(element: HTMLElement, report: { overallRisk: string; summary?: string }) {
  shield().apply(element, report);
}
export function resetSensoryShield(element: HTMLElement) { shield().reset(element); }
