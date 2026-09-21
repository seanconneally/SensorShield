import JSZip from 'jszip';
import content from '../../ai-accessibility-extension/extension/sensory-shield.js?raw';
import css from '../../ai-accessibility-extension/extension/sensory-shield.css?raw';
import background from '../../ai-accessibility-extension/extension/background.js?raw';
import popup from '../../ai-accessibility-extension/extension/popup.html?raw';
import popupScript from '../../ai-accessibility-extension/extension/popup.js?raw';

export const EXTENSION_MANIFEST = JSON.stringify({
  manifest_version: 3, name: 'Visual Sensory Shield — Track 3', version: '1.0.0',
  permissions: ['activeTab', 'storage'],
  host_permissions: ['http://localhost/*', 'http://127.0.0.1/*'],
  action: { default_popup: 'popup.html' },
  background: { service_worker: 'background.js' },
  content_scripts: [{ matches: ['http://*/*', 'https://*/*'], js: ['sensory-shield.js'], css: ['sensory-shield.css'], run_at: 'document_idle' }],
}, null, 2);
export const EXTENSION_CONTENT_SCRIPT = content;
export const EXTENSION_CSS = css;
export const BACKGROUND_BRIDGE_SCRIPT = background;
export async function downloadExtensionZip(): Promise<void> {
  const zip = new JSZip();
  for (const [name, text] of Object.entries({ 'manifest.json': EXTENSION_MANIFEST,
    'sensory-shield.js': content, 'sensory-shield.css': css, 'background.js': background,
    'popup.html': popup, 'popup.js': popupScript })) zip.file(name, text);
  const url = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'visual-sensory-shield-extension-v3.zip';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
