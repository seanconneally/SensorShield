import { WebpageData } from './types';

export const MOCK_WEBPAGES: WebpageData[] = [
  {
    id: 'page-1',
    url: 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions',
    domain: 'developer.mozilla.org',
    title: 'Modern WebExtensions & Manifest V3 Architecture',
    favicon: '🌐',
    publishedDate: 'Sept 2026',
    readingTimeMin: 4,
    wordCount: 780,
    author: 'Browser Architecture Team',
    description: 'Learn the core building blocks of modern browser extensions: background service workers, isolated content scripts, popup actions, and side panels.',
    tags: ['Extensions', 'JavaScript', 'Manifest V3', 'Web APIs'],
    headings: [
      { level: 2, text: 'The Anatomy of a Web Extension', id: 'anatomy' },
      { level: 3, text: '1. The Action Popup', id: 'popup' },
      { level: 3, text: '2. Declarative Content Scripts', id: 'content-scripts' },
      { level: 3, text: '3. Background Service Worker', id: 'service-worker' },
      { level: 2, text: 'Event-Driven Message Passing', id: 'messages' },
      { level: 2, text: 'Storage and Persistent State', id: 'storage' }
    ],
    contentParagraphs: [
      'Extensions augment browser functionality with web technologies like HTML, CSS, and TypeScript. In Manifest V3, extensions operate on an event-driven architecture designed for high battery efficiency, sandboxed security, and reliable performance.',
      'The action popup provides instant transient controls right in the browser toolbar. It communicates asynchronously with active tabs using chrome.tabs.sendMessage or orchestrates background operations via chrome.runtime.sendMessage.',
      'Content scripts run within the execution boundary of web pages. They have direct access to the DOM, enabling custom highlighters, ad annotators, inline translators, accessibility tools, and automated form helpers.',
      'Service workers replace old background pages. They wake up on specific events such as tab activation, web navigation, alarms, or incoming messages, perform computation, and cleanly shut down to conserve system memory.',
      'Persistent data uses chrome.storage.local or chrome.storage.sync, guaranteeing frictionless multi-device synchronization without requiring dedicated server infrastructure for basic client storage.'
    ]
  },
  {
    id: 'page-2',
    url: 'https://github.com/chromium/chromium/tree/main/extensions',
    domain: 'github.com',
    title: 'chromium/chromium: Browser Extensions Subsystem',
    favicon: '🐙',
    publishedDate: 'Updated 2 hours ago',
    readingTimeMin: 3,
    wordCount: 540,
    author: 'google-chromium-bot',
    description: 'Open source implementation of the Chromium extensions engine including Chrome runtime APIs, permissions parser, and side panel dispatcher.',
    tags: ['C++', 'Chromium', 'Open Source', 'Security'],
    headings: [
      { level: 2, text: 'Repository Overview', id: 'overview' },
      { level: 2, text: 'Core Subsystems', id: 'subsystems' },
      { level: 3, text: 'API Dispatcher & Native Bindings', id: 'dispatcher' },
      { level: 2, text: 'Security Model & Sandboxing', id: 'security' }
    ],
    contentParagraphs: [
      'The Chromium extensions system powers Chrome, Edge, Brave, Opera, and Vivaldi. It ensures web-based extension components execute in isolated worlds, protecting user sessions and secure cookies against untrusted page scripts.',
      'The runtime module orchestrates asynchronous IPC between renderer processes, browser UI components, and the network stack. DeclarativeNetRequest handles network rule filtering with ultra-low latency.',
      'Developers can test extension builds locally by turning on Developer Mode in chrome://extensions and selecting "Load unpacked" pointing to the directory with manifest.json.'
    ]
  },
  {
    id: 'page-3',
    url: 'https://store.minimalistcraft.com/products/slate-desk-mat',
    domain: 'minimalistcraft.com',
    title: 'Craftsman Wool Felt & Slate Desk Mat — Studio Edition',
    favicon: '🛍️',
    publishedDate: 'In Stock',
    readingTimeMin: 2,
    wordCount: 390,
    author: 'Studio Goods Co.',
    description: 'High-density natural merino wool desk mat with integrated cable grooves and non-slip cork backing. Designed for clean workspace productivity.',
    tags: ['Workspace', 'Design', 'Gear', 'Desk Setup'],
    headings: [
      { level: 2, text: 'Product Highlights', id: 'highlights' },
      { level: 2, text: 'Material Specifications', id: 'materials' },
      { level: 2, text: 'Customer Reviews & Feedback', id: 'reviews' }
    ],
    contentParagraphs: [
      'Engineered for developers and designers who value tactile feel and clutter-free desk surfaces. Merino wool naturally regulates thermal friction while damping mechanical keyboard vibrations.',
      'Includes a hidden magnetic channel for routing USB-C charging cables neatly along the upper perimeter without requiring adhesive cable clips.',
      'Dimensions: 900mm x 400mm x 4mm. Certified Oeko-Tex Standard 100 eco-friendly sustainable harvest.'
    ]
  }
];
