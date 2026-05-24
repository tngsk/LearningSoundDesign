<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { useSynthStore } from '@/store/synth'

const router = useRouter()
const route = useRoute()
const store = useSynthStore()

const startLab = () => {
  router.push('/step/1')
}

const startNeuron = () => {
  router.push('/neuron')
}

onMounted(() => {
    // Check if patch URL param exists
    if (route.query.patch) {
        try {
            const stateJson = atob(route.query.patch as string)
            const state = JSON.parse(stateJson)

            if (state.oscType) store.oscType = state.oscType
            if (state.attack) store.ampEnv.attack = state.attack
            if (state.decay) store.ampEnv.decay = state.decay
            if (state.sustain) store.ampEnv.sustain = state.sustain
            if (state.release) store.ampEnv.release = state.release
            if (state.cutoff) store.filter.cutoff = state.cutoff
            if (state.res) store.filter.resonance = state.res

            alert('共有された音色パッチを読み込みました！')
        } catch(e) {
            console.error('Failed to parse patch', e)
        }
    }
})
</script>

<template>
  <div class="text-center py-10 space-y-8">
    <div>
      <h2 class="text-3xl font-bold mb-4">サウンドデザインの学習</h2>
      <p class="mb-4 text-gray-600">このアプリは音の要素を段階的に操作し、最終的にモジュラーシンセサイザーとして活用できる学習用ツールです。</p>
      <button @click="startLab" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition">
        チュートリアルをはじめる
      </button>
    </div>

    <div class="pt-8 border-t border-gray-200">
      <h2 class="text-2xl font-bold mb-4 font-display text-primary">NEURON SYNTH</h2>
      <p class="mb-4 text-gray-600">ハードウェアの触感を持つ本格的なシンセサイザーモード。</p>
      <button @click="startNeuron" class="bg-primary hover:bg-surface-tint text-white font-bold py-3 px-8 rounded-lg shadow transition">
        Neuron Synth を起動
      </button>
    </div>
  </div>
</template>
