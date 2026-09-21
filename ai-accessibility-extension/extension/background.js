// API base URL for the Express backend (server.ts)
const API_ENDPOINTS = [
    "http://127.0.0.1:3000",
    "http://localhost:3000"
];

async function fetchFromAvailableServer(path, payload) {
    for (const base of API_ENDPOINTS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        let response;
        try {
            response = await fetch(base + path, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), signal: controller.signal
            });
        } catch (error) {
            if (error.name === 'AbortError') throw new Error('AI request timed out. Please try again.');
            continue;
        } finally { clearTimeout(timeoutId); }
        const data = await response.json().catch(() => { throw new Error('Backend returned an invalid JSON response.'); });
        if (!response.ok || data.error) throw new Error(data.error || data.detail || ('Backend error ' + response.status));
        return data;
    }
    throw new Error('Cannot reach the backend. Start npm run dev or the Python server, then try again.');
}

async function handleTextSimplification(text) {
    if (typeof text !== 'string' || !text.trim()) throw new Error('Select some text to simplify.');
    const data = await fetchFromAvailableServer('/api/simplify', { text });
    if (typeof data.summary !== 'string' || !Array.isArray(data.bullets) || !data.bullets.every(item => typeof item === 'string')) {
        throw new Error('The AI service returned an invalid summary. Please try again.');
    }
    return data;
}

// Sends an image (as base64) to the proxy to be checked for sensory hazards
async function handleSensoryAnalysis(base64Image) {
    try {
        return await fetchFromAvailableServer("/api/sensory-risk", { base64Image });
    } catch (e) {
        console.warn("[Background] Remote proxy unreachable for sensory analysis:", e);
        throw new Error("Sensory risk service unreachable: " + e.message);
    }
}

// Capture is separate so Track 3 sends the standardized image payload.
async function captureSensoryViewport(sender) {
    if (!sender.tab || sender.frameId !== 0) throw new Error('Capture requires the top-level tab');
    const [active] = await chrome.tabs.query({ active: true, windowId: sender.tab.windowId });
    if (active?.id !== sender.tab.id) throw new Error('Activate this tab before capturing');
    const image = await chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'jpeg', quality: 80 });
    const [after] = await chrome.tabs.query({ active: true, windowId: sender.tab.windowId });
    if (after?.id !== sender.tab.id) throw new Error('Active tab changed during capture');
    return image;
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let task;
    if (message.action === 'CAPTURE_SENSORY_VIEWPORT') task = captureSensoryViewport(sender);
    else if (message.action === 'ANALYZE_SENSORY_RISK') {
        const image = message.base64Image;
        if (typeof image !== 'string' || !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > 12000000) {
            sendResponse({ ok: false, error: 'Expected a PNG or JPEG data URL under 12 MB' }); return;
        }
        task = handleSensoryAnalysis(image);
    } else if (message.action === 'SIMPLIFY_TEXT') task = handleTextSimplification(message.text ?? message.payload);
    else return false;
    task.then(data => sendResponse({ ok: true, data }), error => sendResponse({ ok: false, error: error.message }));
    return true;
});
