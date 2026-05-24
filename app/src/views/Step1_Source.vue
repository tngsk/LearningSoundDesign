<script setup lang="ts">
import { useSynthStore } from '@/store/synth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const store = useSynthStore()
const { oscType, baseFreq } = storeToRefs(store)
const router = useRouter()

const nextStep = () => {
    store.currentStep = 2
    router.push('/step/2')
}
</script>

<template>
  <div class="step-container space-y-6">
    <h2 class="text-2xl font-bold">Step 1: 音源（Source）</h2>
    <p class="text-gray-600">すべての音は「振動」から始まります。ここでは基本となる波形（オシレーター）の形と高さを選びます。</p>

    <div class="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">波形 (Oscillator Type)</label>
            <div class="flex space-x-4">
                <label v-for="type in ['sine', 'square', 'triangle', 'sawtooth']" :key="type" class="flex items-center space-x-2">
                    <input type="radio" :value="type" v-model="oscType" class="text-blue-600 focus:ring-blue-500">
                    <span class="capitalize">{{ type }}</span>
                </label>
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">基本周波数 (Pitch: {{ baseFreq }} Hz)</label>
            <input type="range" min="50" max="1000" step="1" v-model="baseFreq" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-center space-x-4">
            <button @mousedown="store.triggerNoteOn" @mouseup="store.triggerNoteOff" @mouseleave="store.triggerNoteOff"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-transform">
                鳴らす (Hold)
            </button>
        </div>
    </div>

    <div class="flex justify-end pt-8">
        <button @click="nextStep" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition">
            次へ: 時間と音量
        </button>
    </div>
  </div>
</template>
