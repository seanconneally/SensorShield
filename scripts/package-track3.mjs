import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
const source = new URL('../ai-accessibility-extension/extension/', import.meta.url);
const target = new URL('../track3-extension/', import.meta.url);
await mkdir(target, { recursive: true });
for (const name of ['sensory-shield.js', 'sensory-shield.css', 'background.js', 'popup.html', 'popup.js']) {
  await copyFile(new URL(name, source), new URL(name, target));
}
await writeFile(new URL('manifest.json', target), JSON.stringify({
  manifest_version: 3, name: 'Visual Sensory Shield — Track 3', version: '1.0.0',
  permissions: ['activeTab', 'storage'],
  host_permissions: ['http://localhost/*', 'http://127.0.0.1/*'],
  action: { default_popup: 'popup.html' }, background: { service_worker: 'background.js' },
  content_scripts: [{ matches: ['http://*/*', 'https://*/*'], js: ['sensory-shield.js'], css: ['sensory-shield.css'], run_at: 'document_idle' }]
}, null, 2));
console.log('Load track3-extension/ as an unpacked Chrome extension.');
