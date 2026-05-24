<script setup lang="ts">
import { useSynthStore } from '@/store/synth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const store = useSynthStore()
const { ampEnv } = storeToRefs(store)
const router = useRouter()

const nextStep = () => {
    store.currentStep = 3
    router.push('/step/3')
}

const prevStep = () => {
    store.currentStep = 1
    router.push('/step/1')
}
</script>

<template>
  <div class="step-container space-y-6">
    <h2 class="text-2xl font-bold">Step 2: 音量と時間（Amp Envelope）</h2>
    <p class="text-gray-600">音がどのように立ち上がり、どのように消えていくか（エンベロープ）をデザインします。アタックを短くすると「打撃」のようになり、長くすると「風」のようになります。</p>

    <div class="bg-white p-6 rounded-lg shadow-md space-y-6">

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">アタック (Attack: {{ ampEnv.attack }}s)</label>
            <input type="range" min="0.01" max="2" step="0.01" v-model="ampEnv.attack" class="w-full">
            <p class="text-xs text-gray-500 mt-1">音が最大音量に達するまでの時間。「硬さ」や「接触感」を表現します。</p>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ディケイ (Decay: {{ ampEnv.decay }}s)</label>
            <input type="range" min="0.01" max="2" step="0.01" v-model="ampEnv.decay" class="w-full">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">サステイン (Sustain: {{ ampEnv.sustain }})</label>
            <input type="range" min="0" max="1" step="0.01" v-model="ampEnv.sustain" class="w-full">
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">リリース (Release: {{ ampEnv.release }}s)</label>
            <input type="range" min="0.01" max="5" step="0.01" v-model="ampEnv.release" class="w-full">
             <p class="text-xs text-gray-500 mt-1">ボタンを離してから音が消えるまでの時間。「空間の広さ」や「余韻」を表現します。</p>
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
            次へ: フィルター
        </button>
    </div>
  </div>
</template>
