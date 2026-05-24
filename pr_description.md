💡 **What:** Throttled `DeviceOrientationEvent` and `DeviceMotionEvent` updates using `requestAnimationFrame` (rAF) and a dirty flag in `useSensor.ts`.

🎯 **Why:** These sensor events can fire at 60-120Hz. Directly updating Vue reactive state on every event triggers excessive re-renders, watcher evaluations (like in `Step4_Interaction.vue`), and potential main-thread blocking.

📊 **Impact:** Decouples sensor event frequency from reactivity. State now only updates when data has actually changed and only at the screen's refresh rate (~60Hz), significantly reducing unnecessary reactivity overhead and CPU usage.

🔬 **Measurement:**
- Start the dev server.
- Navigate to Step 4 on a mobile device (or simulate sensors in DevTools).
- Observe reduced CPU usage and smoother UI interactions while tilting the device compared to the unthrottled version.
