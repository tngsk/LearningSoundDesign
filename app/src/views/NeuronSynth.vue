<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSynthStore } from '@/store/synth'

const router = useRouter()
const store = useSynthStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number
let time = 0

const drawWave = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#00f8f8'

  const midY = canvas.height / 2
  const amp = canvas.height * 0.3
  const freq = 0.02

  for (let x = 0; x < canvas.width; x++) {
    // Hybrid Sine-Sawtooth logic based on current oscType
    let y = midY
    const t = x * freq + time

    if (store.oscType === 'sine') {
      y += Math.sin(t) * amp
    } else if (store.oscType === 'sawtooth') {
      y += ((t % (Math.PI * 2)) / Math.PI - 1) * amp
    } else if (store.oscType === 'square') {
      y += (Math.sin(t) > 0 ? 1 : -1) * amp
    } else {
      // Default Hybrid
      const sine = Math.sin(t)
      const saw = (t % (Math.PI * 2)) / Math.PI - 1
      const hybrid = sine * 0.7 + saw * 0.3
      y += hybrid * amp
    }

    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  time += 0.1
  animationId = requestAnimationFrame(drawWave)
}

const resizeCanvas = () => {
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.offsetWidth
    canvasRef.value.height = canvasRef.value.offsetHeight
  }
}

onMounted(() => {
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()
  drawWave()

  // Set initial default values
  store.filter.cutoff = 12400
  store.filter.resonance = 15
  store.oscType = 'sine'
  store.ampEnv.attack = 0.1
  store.ampEnv.decay = 0.2
  store.ampEnv.sustain = 0.5
  store.ampEnv.release = 1.0
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  cancelAnimationFrame(animationId)
})

const goHome = () => {
  router.push('/')
}

// XY Pad Logic
const xyPadRef = ref<HTMLElement | null>(null)
const crosshairX = ref(0)
const crosshairY = ref(0)
const isDragging = ref(false)

const updateFilterFromXY = (clientX: number, clientY: number) => {
  if (!xyPadRef.value) return

  const rect = xyPadRef.value.getBoundingClientRect()
  let x = clientX - rect.left
  let y = clientY - rect.top

  // Clamp values
  x = Math.max(0, Math.min(x, rect.width))
  y = Math.max(0, Math.min(y, rect.height))

  crosshairX.value = x
  crosshairY.value = y

  // Map X to cutoff (100Hz to 20000Hz)
  const normalizedX = x / rect.width
  const cutoff = Math.max(100, normalizedX * 20000)
  store.filter.cutoff = cutoff

  // Map Y to resonance (0 to 30)
  const normalizedY = 1 - (y / rect.height)
  store.filter.resonance = normalizedY * 30
}

const onXYMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  updateFilterFromXY(e.clientX, e.clientY)
}

const onXYMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    updateFilterFromXY(e.clientX, e.clientY)
  }
}

const onXYMouseUp = () => {
  isDragging.value = false
}

// Touch support
const onXYTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  updateFilterFromXY(e.touches[0].clientX, e.touches[0].clientY)
}
const onXYTouchMove = (e: TouchEvent) => {
  if (isDragging.value) {
    e.preventDefault() // Prevent scrolling while interacting
    updateFilterFromXY(e.touches[0].clientX, e.touches[0].clientY)
  }
}

// Helper to format values
const formatCutoff = (val: number) => {
  if (val > 1000) {
    return (val / 1000).toFixed(1) + ' kHz'
  }
  return Math.round(val) + ' Hz'
}

const formatReso = (val: number) => {
  return Math.round(val) + '%'
}

// Ensure crosshair syncs with store if changed elsewhere
watch(() => store.filter.cutoff, (newCutoff) => {
  if (!isDragging.value && xyPadRef.value) {
    const rect = xyPadRef.value.getBoundingClientRect()
    crosshairX.value = (newCutoff / 20000) * rect.width
  }
})

watch(() => store.filter.resonance, (newReso) => {
  if (!isDragging.value && xyPadRef.value) {
    const rect = xyPadRef.value.getBoundingClientRect()
    crosshairY.value = (1 - (newReso / 30)) * rect.height
  }
})

</script>

<template>
  <div class="bg-background text-on-background font-body-md min-h-screen pb-24 text-left">
    <!-- TopAppBar -->
    <header class="flex justify-between items-center px-margin-sm h-14 w-full z-50 border-b border-outline bg-surface-container-low fixed top-0 left-0">
      <div class="flex items-center gap-4">
        <button @click="goHome" class="p-2 active:translate-y-[1px] transition-transform">
          <span class="material-symbols-outlined text-primary">menu</span>
        </button>
        <h1 class="font-display text-display tracking-tighter text-primary">NEURON SYNTH</h1>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">V1.0.4-BETA</span>
        <button class="p-2 active:translate-y-[1px] transition-transform">
          <span class="material-symbols-outlined text-primary">settings</span>
        </button>
      </div>
    </header>

    <main class="pt-20 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter">
      <!-- Oscillator Section -->
      <section class="md:col-span-8 bg-surface-container border border-outline-variant p-panel-padding recessed-panel">
        <div class="flex justify-between items-center mb-gutter">
          <h2 class="font-label-caps text-label-caps text-on-surface-variant">OSCILLATOR / MASTER</h2>
          <div class="flex gap-2">
            <div class="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_#00f8f8]"></div>
            <span class="font-label-caps text-[8px] leading-none uppercase">Signal</span>
          </div>
        </div>

        <div class="bg-black aspect-[21/9] w-full rounded border border-on-surface-variant relative overflow-hidden flex items-center justify-center mb-margin-sm">
          <canvas ref="canvasRef" class="w-full h-full wave-canvas"></canvas>
          <div class="absolute top-2 left-2 font-label-data text-secondary-container opacity-50 uppercase">
            {{ store.oscType }}_WAVE
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-label-caps text-label-caps text-on-surface-variant">WAVEFORM SELECT</label>
            <div class="flex bg-surface-container-highest p-1 border border-outline rounded-sm">
              <button @click="store.oscType = 'sine'" :class="store.oscType === 'sine' ? 'bg-on-secondary-fixed-variant text-secondary-fixed' : 'text-on-surface-variant hover:bg-surface-container-low'" class="flex-1 font-label-caps text-label-caps py-2 rounded-sm transition-colors">SINE</button>
              <button @click="store.oscType = 'sawtooth'" :class="store.oscType === 'sawtooth' ? 'bg-on-secondary-fixed-variant text-secondary-fixed' : 'text-on-surface-variant hover:bg-surface-container-low'" class="flex-1 font-label-caps text-label-caps py-2 rounded-sm transition-colors">SAW</button>
              <button @click="store.oscType = 'square'" :class="store.oscType === 'square' ? 'bg-on-secondary-fixed-variant text-secondary-fixed' : 'text-on-surface-variant hover:bg-surface-container-low'" class="flex-1 font-label-caps text-label-caps py-2 rounded-sm transition-colors">SQR</button>
            </div>
          </div>

          <div class="flex flex-col items-center gap-2">
            <label class="font-label-caps text-label-caps text-on-surface-variant">MASTER TUNE</label>
            <div class="relative w-16 h-16 bg-surface-container-high rounded-full border-2 border-outline-variant flex items-center justify-center knob-shadow">
               <input type="range" min="50" max="1000" v-model.number="store.baseFreq" class="absolute inset-0 opacity-0 cursor-ew-resize z-10 w-full h-full" />
              <div class="absolute w-1 h-6 bg-primary-container top-1 rounded-full origin-bottom" :style="`transform: rotate(${-135 + ((store.baseFreq - 50) / 950) * 270}deg)`"></div>
              <div class="w-10 h-10 bg-surface rounded-full border border-outline-variant"></div>
            </div>
            <span class="font-label-data text-label-data text-primary">{{ Math.round(store.baseFreq) }} Hz</span>
          </div>
        </div>
      </section>

      <!-- Filter Section -->
      <section class="md:col-span-4 bg-surface-container border border-outline-variant p-panel-padding recessed-panel">
        <h2 class="font-label-caps text-label-caps text-on-surface-variant mb-gutter">FILTER / LADDER</h2>

        <div ref="xyPadRef"
             @mousedown="onXYMouseDown"
             @mousemove="onXYMouseMove"
             @mouseup="onXYMouseUp"
             @mouseleave="onXYMouseUp"
             @touchstart.prevent="onXYTouchStart"
             @touchmove.prevent="onXYTouchMove"
             @touchend="onXYMouseUp"
             class="relative w-full aspect-square bg-surface-container-lowest border border-outline mb-4 cursor-crosshair overflow-hidden"
             id="xyPad">
          <!-- Grid Lines -->
          <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: linear-gradient(#1a1c1c 1px, transparent 1px), linear-gradient(90deg, #1a1c1c 1px, transparent 1px); background-size: 20px 20px;"></div>

          <!-- Crosshair -->
          <div class="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none" :style="`left: ${crosshairX}px; top: ${crosshairY}px`" id="crosshair">
            <div class="absolute top-1/2 left-0 w-full h-[1px] bg-secondary-container"></div>
            <div class="absolute top-0 left-1/2 w-[1px] h-full bg-secondary-container"></div>
            <div class="absolute inset-0 border border-secondary-container rounded-full" :class="{'animate-pulse': false}"></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <span class="font-label-caps text-[9px] text-on-surface-variant">CUTOFF</span>
            <span class="font-label-data text-label-data">{{ formatCutoff(store.filter.cutoff) }}</span>
          </div>
          <div class="flex flex-col text-right">
            <span class="font-label-caps text-[9px] text-on-surface-variant">RESONANCE</span>
            <span class="font-label-data text-label-data">{{ formatReso(store.filter.resonance) }}</span>
          </div>
        </div>
      </section>

      <!-- ADSR Section -->
      <section class="md:col-span-12 bg-surface-container border border-outline-variant p-panel-padding recessed-panel">
        <div class="flex justify-between items-center mb-margin-sm">
          <h2 class="font-label-caps text-label-caps text-on-surface-variant">ENVELOPE / ADSR</h2>
          <div class="flex gap-4">
            <span class="font-label-data text-[10px] text-primary">MOD_SOURCE: VELOCITY</span>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-8">
          <!-- Curve Visualization -->
          <div class="flex-1 h-32 bg-surface-container-highest border border-outline rounded-sm relative">
            <svg class="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <!-- Simple dynamic curve based on ADSR values -->
              <path class="drop-shadow-[0_0_2px_rgba(255,107,0,0.5)]"
                    :d="`M 0 100 L ${Math.max(1, store.ampEnv.attack * 100)} 10 L ${store.ampEnv.attack * 100 + store.ampEnv.decay * 100} ${100 - (store.ampEnv.sustain * 90)} L ${300} ${100 - (store.ampEnv.sustain * 90)} L ${300 + store.ampEnv.release * 50} 100`"
                    fill="none" stroke="#ff6b00" stroke-width="2"></path>
              <circle :cx="Math.max(1, store.ampEnv.attack * 100)" cy="10" fill="#ff6b00" r="3"></circle>
              <circle :cx="store.ampEnv.attack * 100 + store.ampEnv.decay * 100" :cy="100 - (store.ampEnv.sustain * 90)" fill="#ff6b00" r="3"></circle>
              <circle cx="300" :cy="100 - (store.ampEnv.sustain * 90)" fill="#ff6b00" r="3"></circle>
            </svg>
            <div class="absolute bottom-1 left-2 font-label-caps text-[8px] text-on-surface-variant opacity-50">TIME -&gt;</div>
          </div>

          <!-- Sliders -->
          <div class="flex justify-between md:w-1/2 px-4 gap-4">
            <div class="flex flex-col items-center gap-2 flex-1">
              <input type="range" orient="vertical" min="0.01" max="2" step="0.01" v-model.number="store.ampEnv.attack" class="h-32 w-4 slider-vertical" />
              <span class="font-label-caps text-label-caps">ATTACK</span>
            </div>
            <div class="flex flex-col items-center gap-2 flex-1">
              <input type="range" orient="vertical" min="0.01" max="2" step="0.01" v-model.number="store.ampEnv.decay" class="h-32 w-4 slider-vertical" />
              <span class="font-label-caps text-label-caps">DECAY</span>
            </div>
            <div class="flex flex-col items-center gap-2 flex-1">
              <input type="range" orient="vertical" min="0" max="1" step="0.01" v-model.number="store.ampEnv.sustain" class="h-32 w-4 slider-vertical" />
              <span class="font-label-caps text-label-caps">SUSTAIN</span>
            </div>
            <div class="flex flex-col items-center gap-2 flex-1">
              <input type="range" orient="vertical" min="0.01" max="5" step="0.01" v-model.number="store.ampEnv.release" class="h-32 w-4 slider-vertical" />
              <span class="font-label-caps text-label-caps">RELEASE</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- BottomNavBar for Global Actions -->
    <nav class="fixed bottom-0 left-0 w-full flex justify-center items-center py-gutter bg-surface-container-highest border-t border-outline-variant z-50">
        <button @mousedown="store.triggerNoteOn" @mouseup="store.triggerNoteOff" @mouseleave="store.triggerNoteOff"
                @touchstart.prevent="store.triggerNoteOn" @touchend.prevent="store.triggerNoteOff"
                class="flex flex-col items-center justify-center bg-primary-container text-on-primary w-full max-w-sm mx-4 py-4 rounded-sm shadow-lg active:scale-[0.98] transition-all font-display text-xl tracking-widest uppercase">
          PLAY SYNTH
        </button>
    </nav>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.recessed-panel {
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.1), inset -1px -1px 2px rgba(255,255,255,0.7);
}
.knob-shadow {
  box-shadow: 2px 2px 0px rgba(0,0,0,0.2);
}
.wave-canvas {
  filter: drop-shadow(0 0 4px var(--color-secondary-container, #00f8f8));
}

/* Custom vertical slider styling */
.slider-vertical {
  -webkit-appearance: slider-vertical;
  appearance: slider-vertical;
  width: 24px;
  background: transparent;
  cursor: pointer;
}

.slider-vertical::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 24px;
  width: 12px;
  background: var(--color-primary-container, #ff6b00);
  border: 1px solid var(--color-on-primary-fixed, #351000);
  border-radius: 2px;
  cursor: pointer;
}

.slider-vertical::-moz-range-thumb {
  height: 24px;
  width: 12px;
  background: var(--color-primary-container, #ff6b00);
  border: 1px solid var(--color-on-primary-fixed, #351000);
  border-radius: 2px;
  cursor: pointer;
}

.slider-vertical::-webkit-slider-runnable-track {
  width: 4px;
  background: var(--color-surface-dim, #dadada);
  border-radius: 2px;
  margin-left: 10px;
}

.slider-vertical::-moz-range-track {
  width: 4px;
  background: var(--color-surface-dim, #dadada);
  border-radius: 2px;
}
</style>
