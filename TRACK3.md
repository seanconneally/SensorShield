# Track 3 — TikTok and Reel video warnings

## Install / update

Run `node scripts/package-track3.mjs`. In `chrome://extensions`, load `track3-extension/` as unpacked (Developer mode), or click **Reload** on the existing extension. Reload your TikTok or Reels tab too, so the previous page-wide scanner is removed. Enable **Video Protection** in the popup.

## Behavior

- Automatically finds visible TikTok videos and Instagram/Facebook Reels, including newly inserted videos and source changes in recycled players.
- Samples video frames locally during playback. Static page backgrounds, text, images, and other page animations are left alone. There are no page-wide filters or blackout layers.
- Repeated large-area brightness/red-color changes trigger a **Possible flashing detected** warning. Only that video pauses and receives an opaque cream-colored warning card.
- **Proceed at your own risk** uncovers and resumes that video. The decision lasts for that video source until it reloads.
- **Skip video** keeps the video paused and hidden and scrolls to the next matching video if one is already in the DOM. Otherwise it shows “Video skipped” and you can scroll normally. No unrelated navigation controls are clicked.
- Turning protection off removes warning cards, stops frame callbacks and restores video visibility. Paused videos are not automatically restarted.
- The popup's **Rescan videos** button and Alt+V rediscover videos. Automatic monitoring already runs while enabled.

No Gemini key or server is needed for this flow. Video frames stay on the device. The existing Track 1 AI message bridge is retained for integration but is not called by automatic video monitoring.

## Detection limits

This is a live heuristic, not an epilepsy safety guarantee, a full-video prescan, or a WCAG conformance checker. It observes frames as they play, so the beginning of a flash sequence may be visible before detection. Quiet initial frames do not certify later content as safe.

The heuristic looks for six opposing brightness/red transitions in a rolling second, each affecting at least 20% of a 64×36 sampled frame. It does not implement the full general-flash/red-flash visual-field thresholds. It can miss patterns or flashes and can flag rapid editing that is not hazardous.

Cross-origin/DRM restrictions can block canvas frame reads. Such videos get **This video could not be checked**, with the same proceed/skip choices, rather than a fabricated risk result. The extension does not bypass browser restrictions. Hidden tabs and offscreen videos are not sampled. Site markup may change; ordinary Instagram/Facebook feed videos outside identifiable Reel containers are excluded.

References: [W3C flash criteria](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold), [video frame callbacks](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback), [canvas cross-origin restrictions](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image).

## Check

`node --test tests/track3.test.mjs`, `npm run lint`, `npm run build`.

Manual Chrome checks: enable on TikTok/Reels; verify ordinary video playback continues and the rest of the page is unchanged; verify proceed/skip on a warning; scroll to a new video; disable and verify restoration. Confirm inaccessible videos say “could not be checked.” Live site and authenticated-feed behavior requires Chrome verification.

The ZIP download in the builder and `scripts/package-track3.mjs` both package the canonical script at `ai-accessibility-extension/extension/sensory-shield.js`.
