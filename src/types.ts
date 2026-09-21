export interface ExtensionConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  hostPermissions: string[];
  features: {
    popup: boolean;
    sidePanel: boolean;
    contentScript: boolean;
    backgroundServiceWorker: boolean;
    optionsPage: boolean;
    contextMenu: boolean;
    storageSync: boolean;
  };
}

export interface WebpageData {
  id: string;
  url: string;
  title: string;
  favicon: string;
  domain: string;
  publishedDate: string;
  readingTimeMin: number;
  wordCount: number;
  author: string;
  description: string;
  headings: { level: number; text: string; id: string }[];
  contentParagraphs: string[];
  tags: string[];
}

export interface SavedPageNote {
  id: string;
  url: string;
  pageTitle: string;
  text: string;
  highlightedText?: string;
  createdAt: string;
  color: 'yellow' | 'green' | 'blue' | 'purple';
}

export interface RuntimeMessage {
  id: string;
  timestamp: string;
  sender: 'popup' | 'content-script' | 'service-worker' | 'side-panel';
  receiver: 'popup' | 'content-script' | 'service-worker' | 'side-panel' | 'broadcast';
  action: string;
  payload: Record<string, any>;
  status: 'sent' | 'delivered' | 'processed';
}

export interface ExtensionStorage {
  notes: SavedPageNote[];
  readingList: { url: string; title: string; addedAt: string; read: boolean }[];
  badgeText: string;
  badgeColor: string;
  customSettings: {
    autoHighlight: boolean;
    showFloatingWidget: boolean;
    themeMode: 'system' | 'light' | 'dark';
    enableShortcuts: boolean;
    apiEndpoint: string;
  };
}
