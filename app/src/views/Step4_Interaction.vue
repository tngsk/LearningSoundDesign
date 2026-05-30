<script setup lang="ts">
import { useSynthStore } from '@/store/synth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSensor } from '@/composables/useSensor'
import { watch, onUnmounted } from 'vue'

const store = useSynthStore()
const { filter, baseFreq, filterModDepth, filterModValue } = storeToRefs(store)
const router = useRouter()

const { requestAccess, isActive, getNormalizedBeta, stop } = useSensor()

// Sensor Mapping Logic
watch(() => getNormalizedBeta(), (val) => {
    if (isActive.value) {
        filterModValue.value = val
    }
})

onUnmounted(() => {
    stop()
})

const nextStep = () => {
    store.currentStep = 5
    router.push('/step/5')
}

const prevStep = () => {
    store.currentStep = 3
    router.push('/step/3')
}

const toggleSensor = async () => {
    if (isActive.value) {
        stop()
    } else {
        await requestAccess()
    }
}
</script>

<template>
  <div class="step-container space-y-6">
    <h2 class="text-2xl font-bold">Step 4: インタラクション（Sensor）</h2>
    <p class="text-gray-600">スマートフォンの傾き（ジャイロセンサー）を使ってパラメータをリアルタイムに操作します。今回はフィルターのカットオフに結線されています。</p>

    <div class="bg-white p-6 rounded-lg shadow-md space-y-6">

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ベースカットオフ周波数 (Base Cutoff: {{ Math.round(filter.cutoff) }} Hz)</label>
            <input type="range" min="50" max="20000" step="1" v-model="filter.cutoff" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
            <p class="text-xs text-gray-500 mt-1">手動で設定する基準のカットオフ周波数です。</p>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">センサー適用量 (Mod Depth: {{ Math.round(filterModDepth * 100) }}%)</label>
            <input type="range" min="0" max="1" step="0.01" v-model="filterModDepth" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
            <p class="text-xs text-gray-500 mt-1">センサーによる変化の大きさを調整します。</p>
        </div>

        <div class="text-center">
             <button @click="toggleSensor"
                :class="isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'"
                class="text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform">
                {{ isActive ? 'センサーを停止' : 'センサーを許可して開始' }}
            </button>
            <p class="text-xs text-gray-500 mt-2">※スマホを上下に傾けるとフィルターが開閉します。</p>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-center space-x-4">
            <button @mousedown="store.triggerNoteOn" @mouseup="store.triggerNoteOff" @mouseleave="store.triggerNoteOff"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-transform">
                鳴らす (Hold)
            </button>
        </div>
    </div>

    <div class="flex justify-between pt-8">
        <button @click="prevStep" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded shadow transition">
            戻る
        </button>
        <button @click="nextStep" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition">
            次へ: 録音とエディット
        </button>
    </div>
  </div>
</template>
