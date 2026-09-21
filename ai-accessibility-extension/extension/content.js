console.log("AI Accessibility Extension Shell Loaded.");

// Helper function to send text to the background script for simplification
function simplifyText(text) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: "SIMPLIFY_TEXT", payload: text },
            (response) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                if (!response?.ok) {
                    return reject(new Error(response?.error || "No response from extension. Reload the extension and this page."));
                }
                resolve(response.data);
            }
        );
    });
}

// Helper function to send an image frame to the background script for hazard analysis
function analyzeSensoryRisk(base64Image) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: "ANALYZE_SENSORY_RISK", base64Image },
            (response) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                if (!response?.ok) {
                    return reject(new Error(response?.error || "No response from extension. Reload the extension and this page."));
                }
                resolve(response.data);
            }
        );
    });
}

// Expose a test function to the window for manual testing in the DevTools console.
// NOTE: This lives in the content script's isolated world. To call it, you MUST 
// select the extension's context in the DevTools console dropdown (not the page context).
window.testIntegrationContract = async function() {
    console.log("Testing text simplification...");
    try {
        const textResult = await simplifyText("The juxtaposition of asynchronous parallel execution environments yields non-deterministic race conditions.");
        console.log("Simplify Result:", textResult);
    } catch (e) {
        console.error("Simplify Error:", e);
    }

    console.log("Testing sensory risk analysis...");
    try {
        // A tiny 1x1 pixel red dot as a dummy base64 image
        const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        const riskResult = await analyzeSensoryRisk(dummyImage);
        console.log("Sensory Risk Result:", riskResult);
    } catch (e) {
        console.error("Sensory Risk Error:", e);
    }
};

// ============================================================================
// TRACK 2: Smart Text Simplification (Frontend / DOM Specialist A)
// Story 3: Text Selection & Extraction Listener
// Story 4: Dyslexia Reader UI & Injector
// ============================================================================

document.addEventListener('keydown', async (e) => {
    // Listen for Alt + S (Option + S on Mac)
    if (e.altKey && e.code === 'KeyS') {
        e.preventDefault();
        
        const selection = window.getSelection();
        let targetText = '';
        let targetNode = null;
        let isSelection = false;

        // 1. Try to capture user-highlighted text
        if (selection && selection.toString().trim().length > 0) {
            targetText = selection.toString();
            // Get the common ancestor of the selection
            targetNode = selection.getRangeAt(0).commonAncestorContainer;
            if (targetNode.nodeType === Node.TEXT_NODE) {
                targetNode = targetNode.parentNode; // Move up to element node
            }
            isSelection = true;
        } 
        // 2. Fallback to main article nodes if no selection
        else {
            const article = document.querySelector('article, main, [role="main"]');
            if (article) {
                targetText = article.innerText;
                targetNode = article;
            } else {
                // If no main article tag, fallback to body
                targetText = document.body.innerText;
                targetNode = document.body;
            }
        }

        if (!targetText.trim() || !targetNode) {
            console.log("No text found to simplify.");
            return;
        }

        console.log("Alt+S detected. Extracting text...", targetText.substring(0, 50) + "...");

        // Build the replacement container UI (Story 4)
        const container = document.createElement('div');
        // Ensure it gets the OpenDyslexic styling class
        container.className = 'accessibility-dyslexia-mode dyslexia-panel';
        container.innerHTML = `
            <div class="dyslexia-header">
                <span class="dyslexia-title">✨ AI Plain-Language Summary</span>
                <button class="dyslexia-close" title="Close and restore original text">✕</button>
            </div>
            <div class="dyslexia-content">
                <div class="dyslexia-loading">Simplifying text with Gemini Flash...</div>
            </div>
        `;

        // Inject container into DOM
        if (isSelection) {
            // For selections, insert after the container block
            if (targetNode.nextSibling) {
                targetNode.parentNode.insertBefore(container, targetNode.nextSibling);
            } else {
                targetNode.parentNode.appendChild(container);
            }
        } else {
            // For full article, insert at the top
            if (targetNode.firstChild) {
                targetNode.insertBefore(container, targetNode.firstChild);
            } else {
                targetNode.appendChild(container);
            }
        }

        // Close button: remove the panel and restore original text if hidden
        container.querySelector('.dyslexia-close').addEventListener('click', () => {
            container.remove();
            if (isSelection && targetNode) {
                targetNode.classList.remove('dyslexia-hidden-original');
            }
        });

        // (Optional) Hide the original complex text for focus
        // We only hide if it's a specific selection to avoid wiping out the whole page
        if (isSelection) {
            targetNode.classList.add('dyslexia-hidden-original');
        }

        // Send to Background script via helper
        try {
            const result = await simplifyText(targetText);
            
            // Replaces raw text with high-readability bullet points (Story 4)
            const contentDiv = container.querySelector('.dyslexia-content');
            
            // Format result: Check if it's an object with summary and bullets
            let formattedHTML = "";
            if (typeof result === "object" && result.summary) {
                formattedHTML += `<p class="dyslexia-paragraph"><strong>Summary:</strong> ${result.summary}</p>`;
                if (result.bullets && Array.isArray(result.bullets)) {
                    result.bullets.forEach(bullet => {
                        const cleanText = bullet.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        formattedHTML += `<div class="dyslexia-bullet">${cleanText}</div>`;
                    });
                }
            } else if (typeof result === "string") {
                // Fallback for string format
                formattedHTML = result.split('\n').map(line => {
                    const trimmed = line.trim();
                    if (/^[-*•]\s+/.test(trimmed)) {
                        const cleanText = trimmed.replace(/^[-*•]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return `<div class="dyslexia-bullet">${cleanText}</div>`;
                    } else if (trimmed) {
                        const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return `<p class="dyslexia-paragraph">${cleanText}</p>`;
                    }
                    return '';
                }).join('');
            }
            
            contentDiv.innerHTML = formattedHTML || `<p class="dyslexia-paragraph">${JSON.stringify(result)}</p>`;
            
        } catch (error) {
            console.error("Simplification failed:", error);
            container.querySelector('.dyslexia-content').innerHTML = `
                <div class="dyslexia-error">Failed to simplify text: ${error.message}</div>
            `;
        }
    }
});

