<script setup lang="ts">
import { useSynthStore } from '@/store/synth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import * as Tone from 'tone'

const store = useSynthStore()
const { oscType, ampEnv, filter } = storeToRefs(store)
const router = useRouter()
const isRecordingOutput = ref(false)
const outputUrl = ref('')

const prevStep = () => {
    router.push('/step/5')
}

const copyShareLink = () => {
    // Generate a simple state object
    const state = {
        oscType: oscType.value,
        attack: ampEnv.value.attack,
        decay: ampEnv.value.decay,
        sustain: ampEnv.value.sustain,
        release: ampEnv.value.release,
        cutoff: filter.value.cutoff,
        res: filter.value.resonance
    }

    // Create base64 URL
    const b64 = btoa(JSON.stringify(state))
    const url = `${window.location.origin}/?patch=${b64}`

    navigator.clipboard.writeText(url)
    alert('共有リンクをクリップボードにコピーしました！\n' + url)
}

let masterRecorder: Tone.Recorder | null = null

const toggleMasterRecord = async () => {
    if (isRecordingOutput.value) {
        if (!masterRecorder) return
        const recording = await masterRecorder.stop()
        outputUrl.value = URL.createObjectURL(recording)
        isRecordingOutput.value = false
    } else {
        masterRecorder = new Tone.Recorder()
        Tone.getDestination().connect(masterRecorder)
        await Tone.start()
        masterRecorder.start()
        isRecordingOutput.value = true
        outputUrl.value = ''
    }
}
</script>

<template>
  <div class="step-container space-y-6">
    <h2 class="text-2xl font-bold">Step 6: 出力とシェア</h2>
    <p class="text-gray-600">あなたがデザインした音のパラメータの最終確認と、オーディオの書き出し、他の人へのシェアが行えます。</p>

    <div class="bg-white p-6 rounded-lg shadow-md space-y-6">

        <div>
            <h3 class="font-bold text-lg mb-2">現在のパラメータ（モジュール状態）</h3>
            <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
Oscillator: {{ oscType }}
Amp Env: A({{ ampEnv.attack }}s) D({{ ampEnv.decay }}s) S({{ ampEnv.sustain }}) R({{ ampEnv.release }}s)
Filter: Cutoff({{ Math.round(filter.cutoff) }}Hz) Res({{ filter.resonance }})
            </pre>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-center space-x-4">
             <button @mousedown="store.triggerNoteOn" @mouseup="store.triggerNoteOff" @mouseleave="store.triggerNoteOff"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-transform">
                鳴らす (Hold)
            </button>
        </div>

        <div class="pt-4 border-t border-gray-100 space-y-4">
            <h3 class="font-bold">マスター出力の録音・書き出し</h3>
            <div class="flex justify-center space-x-4">
                 <button @click="toggleMasterRecord"
                    :class="isRecordingOutput ? 'bg-red-500 animate-pulse' : 'bg-gray-800'"
                    class="text-white hover:bg-gray-900 font-bold py-2 px-6 rounded shadow transition">
                    {{ isRecordingOutput ? '■ 録音を停止して書き出す' : '● シンセの演奏を録音開始' }}
                </button>
            </div>
            <div v-if="outputUrl" class="text-center">
                <audio :src="outputUrl" controls class="w-full mb-2"></audio>
                <a :href="outputUrl" download="synth_output.webm" class="text-blue-600 hover:underline">オーディオファイルをダウンロード (.webm)</a>
            </div>
        </div>

        <div class="pt-4 flex justify-center">
            <button @click="copyShareLink" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow transition">
                🔗 この音色をシェアする（URLコピー）
            </button>
        </div>
    </div>

    <div class="flex justify-between pt-8">
        <button @click="prevStep" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded shadow transition">
            戻る
        </button>
    </div>
  </div>
</template>
