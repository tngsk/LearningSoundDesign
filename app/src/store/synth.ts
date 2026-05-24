import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { engine } from '@/audio/Engine'

export const useSynthStore = defineStore('synth', () => {
  // Source
  const oscType = ref<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine')
  const baseFreq = ref(261.63) // C4

  // Amp Envelope
  const ampEnv = ref({
    attack: 0.1,
    decay: 0.2,
    sustain: 1.0,
    release: 0.8
  })

  // Filter
  const filter = ref({
    cutoff: 20000,
    resonance: 1
  })

  // Active step (for bypass logic)
  // step 1: Source
  // step 2: Amp Env
  // step 3: Filter
  // ...
  const currentStep = ref(1)

  watch(oscType, (val) => {
    engine.setOscillatorType(val)
  })

  watch(baseFreq, (val) => {
      engine.setOscillatorFreq(val)
  })

  watch(ampEnv, (val) => {
    engine.setAmpEnvelope(val.attack, val.decay, val.sustain, val.release)
  }, { deep: true })

  watch(filter, (val) => {
    engine.setFilter(val.cutoff, val.resonance)
  }, { deep: true })

  const triggerNote = () => {
      engine.start()
      engine.triggerAttackRelease('8n')
  }

  const triggerNoteOn = () => {
      engine.start()
      engine.triggerAttack()
  }

  const triggerNoteOff = () => {
      engine.triggerRelease()
  }

  return {
    oscType,
    baseFreq,
    ampEnv,
    filter,
    currentStep,
    triggerNote,
    triggerNoteOn,
    triggerNoteOff
  }
})
