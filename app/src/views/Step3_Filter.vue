<script setup lang="ts">
import { useSynthStore } from '@/store/synth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const store = useSynthStore()
const { filter } = storeToRefs(store)
const router = useRouter()

const nextStep = () => {
    store.currentStep = 4
    router.push('/step/4')
}

const prevStep = () => {
    store.currentStep = 2
    router.push('/step/2')
}
</script>

<template>
  <div class="step-container space-y-6">
    <h2 class="text-2xl font-bold">Step 3: 質感（Filter）</h2>
    <p class="text-gray-600">音の特定の周波数成分を削り取ることで、こもった音にしたり、鋭い音にしたりします。「物体の遮蔽」や「空間の開閉」を表現できます。</p>

    <div class="bg-white p-6 rounded-lg shadow-md space-y-6">

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">カットオフ周波数 (Cutoff: {{ Math.round(filter.cutoff) }} Hz)</label>
            <input type="range" min="50" max="20000" step="1" v-model="filter.cutoff" class="w-full">
            <p class="text-xs text-gray-500 mt-1">値を下げると高音が削られ、こもった音（壁の向こうの音のような）になります。</p>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">レゾナンス (Resonance/Q: {{ filter.resonance }})</label>
            <input type="range" min="0" max="20" step="0.1" v-model="filter.resonance" class="w-full">
            <p class="text-xs text-gray-500 mt-1">カットオフ付近の周波数を強調し、クセのある「ミョーン」という質感を作ります。</p>
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
            次へ: センサー変調
        </button>
    </div>
  </div>
</template>
