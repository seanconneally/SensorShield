/**
 * Visual Sensory Shield - Interactive Testbeds for DOM Scanner & Mitigation Injector
 * 
 * Includes realistic test pages featuring:
 * - Autoplaying looping videos
 * - Animated GIFs & graphic loops
 * - Rapidly cycling CSS animations (< 1s, >= 3Hz epilepsy triggers)
 * - Harsh high-contrast and hyper-saturated neon color blocks (#00FF00, #FF00FF, #00FFFF, #FFFF00)
 * - Safe baseline page to verify zero false positives
 */

import type React from 'react';

export interface TestPageDefinition {
  id: string;
  name: string;
  category: string;
  tagline: string;
  expectedTriggers: {
    videos: number;
    gifs: number;
    rapidAnims: number;
    neonBlocks: number;
  };
  expectedRisk: 'HIGH_RISK' | 'MODERATE_RISK' | 'SAFE';
  render: () => React.ReactNode;
}

export const TEST_PAGES_META = [
  {
    id: 'seizure-test',
    name: 'Seizure-Warning Test Pattern',
    category: 'WCAG 2.3.1 Photosensitive Strobe',
    tagline: 'High-frequency 4.0Hz alternating flash grating, 21:1 polar contrast oscillation, and strobe warning trigger.',
    triggers: ['4.0Hz Critical Strobe Oscillation', '21:1 Contrast Polar Flashing', 'Neon Cyan/Magenta Alternation', 'Harsh Glare Trigger'],
    baseRisk: 'HIGH_RISK' as const,
  },
  {
    id: 'autoplay-carousel',
    name: 'Page with Autoplay Carousel',
    category: 'Continuous Motion Density',
    tagline: 'Unbounded automatic slide transitions, looping video reel, and animated promotional badges.',
    triggers: ['Infinite Autoplaying Carousel', 'High Motion Density', 'Looping Promotional Video', 'Animated Badges'],
    baseRisk: 'HIGH_RISK' as const,
  },
  {
    id: 'flash-news',
    name: 'StrobeTech & Flash Ad Portal',
    category: 'Heavy Ad Overload',
    tagline: 'High-frequency 4Hz strobe badges, autoplay video, and dual acid neon banners.',
    triggers: ['4Hz Rapid CSS Strobe', 'Autoplay Video', 'Neon Lime #00FF00 Banner', 'Animated GIF Loop'],
    baseRisk: 'HIGH_RISK' as const,
  },
  {
    id: 'rave-edm',
    name: 'NeonPulse Festival Promo',
    category: 'Extreme Photophobia & Strobe',
    tagline: 'Ultra-fast 5Hz alternating pulse, laser cyan #00FFFF, and infinite looping reel.',
    triggers: ['5Hz Critical Seizure Risk', 'Autoplay Background Reel', 'Laser Cyan #00FFFF', 'Electric Magenta #FF00FF'],
    baseRisk: 'HIGH_RISK' as const,
  },
  {
    id: 'flash-sale',
    name: 'MegaDeal Urgency Mart',
    category: 'Commercial Sensory Pressure',
    tagline: 'Rapidly cycling discount countdown, neon yellow #FFFF00 alert, animated sticker.',
    triggers: ['2Hz Pulsing Alert', 'Hyper Acid Yellow #FFFF00', 'Animated GIF Sticker', 'Autoplay Promo Clip'],
    baseRisk: 'HIGH_RISK' as const,
  },
  {
    id: 'safe-docs',
    name: 'Normal Article Page (Calm Baseline)',
    category: 'Safe Sensory Baseline',
    tagline: 'Zero visual hazards, relaxed typography, comfortable luminance contrast, and zero autoplay media.',
    triggers: ['Zero Hazards Detected (Conforms to WCAG 2.3.1)'],
    baseRisk: 'SAFE' as const,
  },
];
