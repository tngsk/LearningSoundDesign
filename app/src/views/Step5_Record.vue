<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { recorder } from '@/audio/Recorder'
import { useAudioEditor } from '@/composables/useAudioEditor'

const router = useRouter()
const isRecording = ref(false)
const hasBuffer = ref(false)
const trimStart = ref(0)
const trimEnd = ref(100)

const { loadBuffer, playPause, isPlaying } = useAudioEditor('waveform')

const toggleRecording = async () => {
    // Note: recorder.mic access is private now, handled in Recorder.ts initMic logic if preferred.
    if (!recorder.getBuffer() && !isRecording.value) { // Very rough check, relying on initMic safety
        await recorder.initMic()
    }

    if (isRecording.value) {
        const buffer = await recorder.stopRecording()
        isRecording.value = false
        if (buffer) {
            hasBuffer.value = true
            loadBuffer(buffer)
        }
    } else {
        await recorder.startRecording()
        isRecording.value = true
        hasBuffer.value = false
    }
}

const applyTrim = () => {
    const buffer = recorder.trim(trimStart.value / 100, trimEnd.value / 100)
    if (buffer) {
        loadBuffer(buffer)
        // Reset sliders
        trimStart.value = 0
        trimEnd.value = 100
    }
}

const applyNormalize = () => {
    const buffer = recorder.normalize()
    if (buffer) {
        loadBuffer(buffer)
    }
}

const nextStep = () => {
    router.push('/step/6') // Final/Export step
}

const prevStep = () => {
    router.push('/step/4')
}
</script>

<template>
  <div class="step-container space-y-6">
    <h2 class="text-2xl font-bold">Step 5: 録音とエディット</h2>
    <p class="text-gray-600">マイクから音を録音し、素材として扱えるように波形を編集（トリミング・ノーマライズ）します。</p>

    <div class="bg-white p-6 rounded-lg shadow-md space-y-6">

        <div class="text-center">
             <button @click="toggleRecording"
                :class="isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-600'"
                class="text-white hover:bg-red-700 font-bold py-3 px-8 rounded-full shadow-lg transition-colors">
                {{ isRecording ? '録音停止' : 'マイク録音開始' }}
            </button>
        </div>

        <div v-show="hasBuffer" class="space-y-4">
             <div id="waveform" class="w-full h-32 bg-gray-50 border border-gray-200 rounded"></div>

             <div class="flex justify-center">
                <button @click="playPause" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full shadow">
                     {{ isPlaying ? '停止' : '再生' }}
                </button>
             </div>

             <div class="border-t pt-4">
                 <h4 class="font-bold mb-2">エディット</h4>

                 <div class="space-y-2 mb-4">
                     <label class="block text-sm text-gray-700">トリミング (Start: {{ trimStart }}% / End: {{ trimEnd }}%)</label>
                     <div class="flex items-center space-x-2">
                        <input type="range" min="0" max="99" v-model="trimStart" class="w-full">
                        <input type="range" min="1" max="100" v-model="trimEnd" class="w-full">
                     </div>
                     <button @click="applyTrim" class="bg-gray-200 hover:bg-gray-300 py-1 px-4 rounded text-sm">トリミング適用</button>
                 </div>

                 <button @click="applyNormalize" class="bg-gray-200 hover:bg-gray-300 py-1 px-4 rounded text-sm">ノーマライズ（音量最大化）</button>
             </div>
        </div>
    </div>

    <div class="flex justify-between pt-8">
        <button @click="prevStep" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded shadow transition">
            戻る
        </button>
        <button @click="nextStep" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition">
            次へ: 最終出力
        </button>
    </div>
  </div>
</template>
