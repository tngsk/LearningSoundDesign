## 2024-05-24 - Throttling High-Frequency Sensor Events
**Learning:** Tying high-frequency browser events (like `DeviceOrientationEvent` and `DeviceMotionEvent`, which fire ~60-120Hz) directly to Vue reactive state without throttling creates excessive reactivity updates, leading to poor performance and main-thread blocking.
**Action:** Decouple event frequency from UI updates by storing the raw event data in non-reactive variables, and use `requestAnimationFrame` (rAF) to synchronize that data into reactive state. This ensures UI updates align optimally with the screen's refresh rate (typically 60Hz) rather than raw sensor throughput.
## 2024-05-24 - Throttling High-Frequency Sensor Events (Update)
**Learning:** When using `requestAnimationFrame` to throttle state updates, it's critical to include a "dirty" flag. Updating reactive state inside rAF *unconditionally* will trigger reactivity 60 times a second even if the sensor values haven't changed, causing constant CPU usage and defeating the purpose of the optimization.
**Action:** Always implement an `isDirty` flag set by event listeners, and check `if (isDirty)` inside the rAF loop before updating state and resetting the flag.
## 2024-05-25 - Extracted Core Functionality into Templates
**Learning:** Understanding the core architecture of the audio application (Tone.js, WaveSurfer.js, Pinia state) helps in extracting useful, standalone templates for educational purposes. We successfully extracted the synth engine, recording, audio editing, waveform visualization, and state management logic into a documented `TEMPLATES.md` file.
**Action:** No direct performance impact, but ensures the core concepts are easily accessible for customization and learning without navigating the full app structure.
## 2024-05-30 - Decoupling Base Parameters from Modulation
**Learning:** Directly modifying base state variables (like filter cutoff) with high-frequency sensor inputs breaks manual user control.
**Action:** Separate base parameter state from modulation state. Use a watcher that combines both the base value and the modulation amount (Value * Depth) to calculate the final target value sent to the audio engine, preserving manual control of the base parameter.
