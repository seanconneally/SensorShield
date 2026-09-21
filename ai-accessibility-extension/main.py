import os
import json
import requests
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSy_your_key_here")
PORT = int(os.getenv("PORT", 8000))

if GEMINI_API_KEY == "AIzaSy_your_key_here":
    print("WARNING: GEMINI_API_KEY is still the placeholder. Please update .env")

app = FastAPI(title="AI Accessibility Proxy")

# Allow CORS for the extension
# allow_credentials=False is required when allow_origins=["*"] by browser security rules
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body schemas
class TextRequest(BaseModel):
    text: str

class ImageRequest(BaseModel):
    base64Image: str

@app.get("/")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "model": "gemini-3.6-flash"}

@app.post("/api/simplify")
def simplify_text(req: TextRequest):
    """
    Simplifies text using Gemini.
    Notice we use `def` instead of `async def`. This ensures the blocking
    `requests.post` call runs in FastAPI's threadpool and doesn't stall the async event loop.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": "simplify complex content into 3-6 short plain-language bullet points for ADHD/dyslexia readers, preserving meaning."}]
        },
        "contents": [
            {"parts": [{"text": req.text}]}
        ],
        "generationConfig": {
            # Enforce JSON output format and schema
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "summary": {"type": "STRING"},
                    "bullets": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["summary", "bullets"]
            }
        }
    }

    resp = requests.post(url, json=payload, timeout=25)
    if not resp.ok:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    try:
        # Extract the JSON text from the Gemini response structure
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(raw_text)
    except Exception as e:
        # If it isn't valid JSON, still return valid JSON with an error field
        raise HTTPException(status_code=502, detail="AI service returned an invalid summary.") from e

@app.post("/api/sensory-risk")
def sensory_risk(req: ImageRequest):
    """
    Track 3: Visual Sensory Shield — ANALYZE_SENSORY_RISK / handleSensoryAnalysis(base64Image)
    Analyzes an image for photosensitive hazards and sensory overload risks using Gemini 2.5 Flash.
    """
    img_data = req.base64Image
    mime_type = "image/jpeg"  # Default fallback
    
    # Strip the data URI header if present to get the pure base64 string and mime type
    if img_data.startswith("data:"):
        header, base64_str = img_data.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0]
        img_data = base64_str

    # Gemini 2.5 Flash endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={GEMINI_API_KEY}"
    
    system_instruction = (
        "You are a visual sensory safety analyzer embedded in a browser accessibility extension. "
        "You are shown a screenshot of a web page's current viewport. Your job is to detect content that "
        "could trigger photosensitive epilepsy, migraine, sensory overload, or ADHD-related attentional "
        "overload — and to recommend a specific, minimal mitigation for each issue.\n\n"
        "Analyze the image for:\n"
        "1. Flashing/strobing risk — rapid brightness changes, high-contrast flicker patterns, animated GIFs mid-flash, video frames suggesting rapid cuts\n"
        "2. Harsh high-contrast blocks — pure black/white or saturated complementary color pairs covering large screen area\n"
        "3. Aggressive saturated/neon color zones — oversaturated reds, magentas, cyans that cause visual fatigue\n"
        "4. Busy motion density — many moving/animated elements simultaneously visible (carousels, autoplay video, animated ads, parallax)\n"
        "5. Repetitive high-frequency patterns — tight stripes, moiré-prone patterns, spinning elements\n\n"
        "For each issue found, estimate its screen region (as a normalized bounding box, 0–1 scale, origin top-left) and severity.\n\n"
        "You do not have access to DOM or timing data — judge only what is visible in this single frame. "
        "If you can't confirm true flashing/strobing from a still image, flag it as 'suspected' rather than 'confirmed' "
        "and lower severity accordingly.\n\n"
        "Always respond with valid JSON only, matching the schema exactly. No prose, no markdown fences, no explanation outside the JSON."
    )

    payload = {
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": [
            {
                "parts": [
                    {"text": "Analyze this webpage screenshot for photosensitive and sensory-overload risk. Return findings per the required schema."},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": img_data
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "overallRisk": {
                        "type": "STRING",
                        "enum": ["low", "medium", "high", "critical"]
                    },
                    "confidence": {
                        "type": "NUMBER"
                    },
                    "triggers": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "type": {
                                    "type": "STRING",
                                    "enum": [
                                        "flashing_strobing",
                                        "high_contrast_block",
                                        "neon_saturation",
                                        "motion_density",
                                        "repetitive_pattern"
                                    ]
                                },
                                "status": {
                                    "type": "STRING",
                                    "enum": ["confirmed", "suspected"]
                                },
                                "severity": {
                                    "type": "STRING",
                                    "enum": ["low", "medium", "high"]
                                },
                                "boundingBox": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "x": {"type": "NUMBER"},
                                        "y": {"type": "NUMBER"},
                                        "width": {"type": "NUMBER"},
                                        "height": {"type": "NUMBER"}
                                    },
                                    "required": ["x", "y", "width", "height"]
                                },
                                "description": {"type": "STRING"},
                                "recommendedMitigation": {
                                    "type": "STRING",
                                    "enum": [
                                        "pause_animation",
                                        "apply_warm_filter",
                                        "desaturate",
                                        "add_opt_in_shield",
                                        "reduce_contrast"
                                    ]
                                }
                            },
                            "required": ["type", "status", "severity", "boundingBox", "description", "recommendedMitigation"]
                        }
                    },
                    "summary": {"type": "STRING"}
                },
                "required": ["overallRisk", "confidence", "triggers", "summary"]
            }
        }
    }

    resp = requests.post(url, json=payload, timeout=25)
    if not resp.ok:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    try:
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(raw_text)
    except Exception as e:
        return {
            "overallRisk": "low",
            "confidence": 0.0,
            "triggers": [],
            "summary": "Error parsing sensory risk analysis response.",
            "error": str(e)
        }

if __name__ == "__main__":
    # Run the server on localhost when executing this file
    uvicorn.run(app, host="127.0.0.1", port=PORT)
