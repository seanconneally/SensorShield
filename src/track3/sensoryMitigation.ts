/**
 * Visual Sensory Shield - Story 6: Sensory Mitigation Injector
 * 
 * Applies real-time visual mitigations based on AI risk levels:
 * 1. Pause animations (HTML5 video pause, universal animation-play-state: paused!important)
 * 2. Warm low-luminance CSS filters (photophobia relief, amber hue tint, peak luminance reduction)
 * 3. Desaturate aggressive neon colors (saturate clamp, glare suppression)
 * 4. Place soft opt-in warning shields over high-risk media (shield overlay with opt-in button)
 * 
 * Injects and manages active page CSS and media DOM modifications.
 */

import { MitigationState, DetectedTrigger } from './types';

const STYLE_ELEMENT_ID = 'sensory-shield-injected-styles';
const OVERLAY_CLASS = 'sensory-shield-opt-in-overlay';

export const DEFAULT_MITIGATION_STATE: MitigationState = {
  enabled: true,
  riskLevel: 'HIGH_RISK',
  pauseAnimations: true,
  applyWarmFilter: true,
  warmthFactor: 38, // 38% sepia / amber warmth
  brightnessLevel: 0.88, // 88% low-luminance
  desaturateNeon: true,
  placeWarningShields: true,
  revealedMediaIds: [],
};

/**
 * Builds the dynamic CSS rules to inject into the page <head>
 */
export function generateMitigationCSS(state: MitigationState, rootSelector: string = ''): string {
  if (!state.enabled) return '';

  const prefix = rootSelector ? `${rootSelector} ` : '';
  const rules: string[] = [];

  // 1. Pause Animations & Transitions
  if (state.pauseAnimations) {
    rules.push(`
      ${prefix}*, ${prefix}*::before, ${prefix}*::after {
        animation-play-state: paused !important;
        animation-duration: 0.001s !important;
        transition-duration: 0.001s !important;
      }
    `);
  }

  // 2. Warm Low-Luminance CSS Filter (Photophobia & Eye Strain Protection)
  if (state.applyWarmFilter) {
    const sepiaVal = state.warmthFactor; // 0 to 100
    const brightnessVal = state.brightnessLevel; // 0.65 to 1.0
    const contrastVal = Math.max(0.88, 1 - (state.warmthFactor * 0.0015));

    if (rootSelector) {
      rules.push(`
        ${rootSelector} {
          filter: sepia(${sepiaVal}%) brightness(${brightnessVal}) contrast(${contrastVal}) saturate(0.88) !important;
          transition: filter 0.3s ease-in-out;
        }
      `);
    } else {
      rules.push(`
        html {
          filter: sepia(${sepiaVal}%) brightness(${brightnessVal}) contrast(${contrastVal}) saturate(0.88) !important;
          transition: filter 0.3s ease-in-out;
        }
      `);
    }
  }

  // 3. Desaturate Aggressive Neon Colors
  if (state.desaturateNeon) {
    rules.push(`
      ${prefix}[data-sensory-neon="true"],
      ${prefix}.sensory-neon-hazard,
      ${prefix}.neon-strobe-box,
      ${prefix}.neon-flash-banner {
        filter: saturate(0.35) brightness(0.92) contrast(0.95) !important;
        box-shadow: none !important;
        text-shadow: none !important;
        transition: filter 0.25s ease-out;
      }
    `);
  }

  // 4. Opt-in Shield Overlay Styles
  rules.push(`
    .${OVERLAY_CLASS} {
      position: absolute;
      inset: 0;
      z-index: 50;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      text-align: center;
      border-radius: 12px;
      border: 1px solid rgba(251, 191, 36, 0.35);
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      animation: sensoryShieldFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }

    @keyframes sensoryShieldFadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    .${OVERLAY_CLASS} .sensory-shield-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.4);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      color: #fef3c7;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }

    .${OVERLAY_CLASS} .sensory-shield-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 4px 0;
      line-height: 1.3;
    }

    .${OVERLAY_CLASS} .sensory-shield-desc {
      font-size: 12px;
      color: #cbd5e1;
      margin: 0 0 12px 0;
      max-width: 280px;
      line-height: 1.4;
    }

    .${OVERLAY_CLASS} .sensory-reveal-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #f8fafc;
      color: #0f172a;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.1s ease;
    }

    .${OVERLAY_CLASS} .sensory-reveal-btn:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }

    .${OVERLAY_CLASS} .sensory-reveal-btn:active {
      transform: translateY(0);
    }
  `);

  return rules.join('\n');
}

/**
 * Injects or updates the <style> element on the page
 */
export function injectMitigationStyles(state: MitigationState, rootSelector: string = ''): void {
  let styleEl = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = generateMitigationCSS(state, rootSelector);
}

/**
 * Pauses or plays video elements in target root
 */
export function updateVideoMitigation(state: MitigationState, root: HTMLElement): void {
  const videos = root.querySelectorAll('video');
  videos.forEach((video) => {
    if (state.enabled && state.pauseAnimations) {
      if (!video.paused) {
        try {
          video.pause();
          video.dataset.sensoryPaused = 'true';
        } catch {
          // Ignore pause errors
        }
      }
    } else if (video.dataset.sensoryPaused === 'true') {
      try {
        video.play();
        delete video.dataset.sensoryPaused;
      } catch {
        // Autoplay may be blocked without user gesture
      }
    }
  });
}

/**
 * Injects or updates soft warning shield overlays over high-risk media elements
 */
export function updateWarningShieldOverlays(
  state: MitigationState,
  triggers: DetectedTrigger[],
  root: HTMLElement,
  onRevealMedia?: (triggerId: string) => void
): void {
  // First clean up existing overlays
  const existingOverlays = root.querySelectorAll(`.${OVERLAY_CLASS}`);
  existingOverlays.forEach((overlay) => overlay.remove());

  if (!state.enabled || !state.placeWarningShields) {
    return;
  }

  triggers.forEach((trigger) => {
    // Only shield media and high severity triggers
    const isShieldTarget =
      trigger.type === 'video_autoplay' ||
      trigger.type === 'animated_gif' ||
      (trigger.type === 'rapid_css_animation' && trigger.severity === 'critical');

    if (!isShieldTarget) return;

    // Check if user previously opted to reveal this item
    if (state.revealedMediaIds.includes(trigger.id)) {
      return;
    }

    const targetEl = trigger.element || root.querySelector(trigger.selector) as HTMLElement | null;
    if (!targetEl) return;

    // Ensure parent has relative or absolute position for positioning overlay
    const computedPosition = window.getComputedStyle(targetEl).position;
    if (computedPosition === 'static') {
      targetEl.style.position = 'relative';
    }

    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute('data-shield-trigger-id', trigger.id);

    // Build soft card content
    const badgeText = trigger.severity === 'critical' ? '⚡ Strobe Shield' : '🛡 Sensory Shield';
    const typeLabel = trigger.type === 'video_autoplay' ? 'Autoplay Video Paused' : (trigger.type === 'animated_gif' ? 'Animated Asset Shielded' : 'Flashing Animation Paused');

    overlay.innerHTML = `
      <span class="sensory-shield-badge">${badgeText}</span>
      <h4 class="sensory-shield-title">${typeLabel}</h4>
      <p class="sensory-shield-desc">${trigger.description.slice(0, 85)}...</p>
      <button type="button" class="sensory-reveal-btn" data-reveal-id="${trigger.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        Reveal Media
      </button>
    `;

    // Hook click event to trigger opt-in reveal
    const btn = overlay.querySelector('button');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.remove();
        if (onRevealMedia) {
          onRevealMedia(trigger.id);
        }
      });
    }

    targetEl.appendChild(overlay);
  });
}

/**
 * Removes all mitigations completely from the DOM
 */
export function removeMitigations(root: HTMLElement): void {
  const styleEl = document.getElementById(STYLE_ELEMENT_ID);
  if (styleEl) styleEl.remove();

  const overlays = root.querySelectorAll(`.${OVERLAY_CLASS}`);
  overlays.forEach(o => o.remove());

  const videos = root.querySelectorAll('video');
  videos.forEach(v => {
    if (v.dataset.sensoryPaused === 'true') {
      try {
        v.play();
      } catch {}
      delete v.dataset.sensoryPaused;
    }
  });
}
