# Sound Design Lab: Code Templates

このドキュメントは、プロジェクトで使用されている各機能の核となるコードを抽出し、教育目的やカスタマイズしやすいように独立したテンプレートとしてまとめたものです。

---

## 1. 基本的なシンセサイザーエンジン (Tone.js)
音源（オシレーター）、フィルター、エンベロープ、マスターボリュームの基本構成です。
※ 安全のため、マスターボリュームは -12dB に設定し、フィルターのレゾナンスの上げすぎに注意してください。

```typescript
import * as Tone from 'tone';

export class SimpleAudioEngine {
  private osc: Tone.OmniOscillator<any>;
  private ampEnv: Tone.AmplitudeEnvelope;
  private filter: Tone.Filter;
  private masterVolume: Tone.Volume;

  constructor() {
    // 1. オシレーター（音源）の作成
    this.osc = new Tone.OmniOscillator('C4', 'sine');

    // 2. フィルターの作成（高音を削るローパス）
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 20000,
      rolloff: -24
    });

    // 3. アンプ・エンベロープ（時間的な音量変化）の作成
    this.ampEnv = new Tone.AmplitudeEnvelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 1.0,
      release: 0.8
    });

    // 4. マスターボリュームの作成（音割れ防止のため -12dB 推奨）
    this.masterVolume = new Tone.Volume(-12);

    // 5. ルーティング（接続）
    // Osc -> Filter -> AmpEnv -> MasterVolume -> 最終出力
    this.osc.connect(this.filter);
    this.filter.connect(this.ampEnv);
    this.ampEnv.connect(this.masterVolume);
    this.masterVolume.toDestination();
  }

  // オーディオコンテキストを開始し、オシレーターを起動する
  public async init() {
    await Tone.start();
    if (this.osc.state !== 'started') {
        this.osc.start();
    }
  }

  // 音を鳴らす（押した時）
  public noteOn() {
    this.ampEnv.triggerAttack();
  }

  // 音を止める（離した時）
  public noteOff() {
    this.ampEnv.triggerRelease();
  }

  // 波形を変更する
  public setOscillatorType(type: 'sine' | 'square' | 'triangle' | 'sawtooth') {
    this.osc.type = type;
  }
}
```

---

## 2. マイク録音 (Tone.js)
ユーザーのマイクから音声を取得し、録音する機能です。

```typescript
import * as Tone from 'tone';

export class SimpleRecorder {
  private mic: Tone.UserMedia | null = null;
  private recorder: Tone.Recorder | null = null;
  private audioBuffer: Tone.ToneAudioBuffer | null = null;

  // マイクの使用許可を求め、準備する
  async initMic() {
    this.mic = new Tone.UserMedia();
    await this.mic.open();
    this.recorder = new Tone.Recorder();
    this.mic.connect(this.recorder);
  }

  // 録音開始
  async start() {
    if (!this.recorder || !this.mic) return;
    await Tone.start();
    this.recorder.start();
  }

  // 録音停止と、編集用バッファの取得
  async stop() {
    if (!this.recorder) return null;

    // 録音データをBlobとして取得
    const blob = await this.recorder.stop();

    // BlobをToneAudioBufferに変換（波形編集などに使用するため）
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = Tone.getContext().rawContext as AudioContext;
    const audioData = await audioContext.decodeAudioData(arrayBuffer);
    this.audioBuffer = new Tone.ToneAudioBuffer(audioData);

    return this.audioBuffer;
  }
}
```

---

## 3. オーディオ編集 (波形のトリミングとノーマライズ)
録音したオーディオバッファ(`ToneAudioBuffer`)を直接編集する機能です。

```typescript
import * as Tone from 'tone';

// バッファを切り取る（トリミング）
// startPercent: 0〜1, endPercent: 0〜1
export function trimBuffer(toneBuffer: Tone.ToneAudioBuffer, startPercent: number, endPercent: number): Tone.ToneAudioBuffer | null {
  const buffer = toneBuffer.get();
  if (!buffer) return null;

  const startSample = Math.floor(buffer.length * startPercent);
  const endSample = Math.floor(buffer.length * endPercent);
  const newLength = endSample - startSample;

  if (newLength <= 0) return null;

  const audioContext = Tone.getContext().rawContext as AudioContext;
  const newBuffer = audioContext.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);

  // 指定された範囲のデータを新しいバッファにコピー
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const oldData = buffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);
    newData.set(oldData.subarray(startSample, endSample));
  }

  toneBuffer.set(newBuffer);
  return toneBuffer;
}

// 音量を最大化する（ノーマライズ）
export function normalizeBuffer(toneBuffer: Tone.ToneAudioBuffer): Tone.ToneAudioBuffer | null {
  const buffer = toneBuffer.get();
  if (!buffer) return null;

  let maxAmp = 0;
  // 最大の振幅（音量）を探す
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      const absVal = Math.abs(data[i]);
      if (absVal > maxAmp) maxAmp = absVal;
    }
  }

  if (maxAmp === 0) return toneBuffer; // 無音の場合

  const multiplier = 1.0 / maxAmp;

  // 全てのデータに倍率を掛けて最大化する
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      data[i] *= multiplier;
    }
  }

  return toneBuffer;
}
```

---

## 4. 波形の描画 (WaveSurfer.js)
オーディオバッファをWaveSurfer.jsに渡して画面に波形を描画する機能です。

```typescript
// ※ DOM要素 `<div id="waveform"></div>` が存在する必要があります
import WaveSurfer from 'wavesurfer.js';
import * as Tone from 'tone';

let wavesurfer: WaveSurfer | null = null;

// WaveSurferの初期化
export function initWaveSurfer(containerId: string) {
  wavesurfer = WaveSurfer.create({
    container: `#${containerId}`,
    waveColor: 'violet',
    progressColor: 'purple',
    height: 100,
    normalize: false, // 自前でノーマライズを行うためfalse
  });
}

// ToneAudioBufferをWaveSurferに読み込ませる
export function loadBufferToWaveSurfer(toneBuffer: Tone.ToneAudioBuffer) {
  if (!wavesurfer || !toneBuffer.get()) return;
  const buffer = toneBuffer.get()!;

  // オーディオバッファからWAV Blobを生成
  const wavBlob = bufferToWaveBlob(buffer);
  const url = URL.createObjectURL(wavBlob);
  wavesurfer.load(url);
}

// (ヘルパー関数) AudioBuffer を WAV 形式の Blob に変換する処理
// 長くなるため、主要な流れのみ記載しています。
function bufferToWaveBlob(abuffer: AudioBuffer): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);

  // 1. WAVヘッダを書き込む処理 (RIFF, WAVE, fmt, data 等)
  // ...

  // 2. PCMデータを書き込む処理 (Float32 から 16-bit 整数に変換)
  // ...

  return new Blob([buffer], {type: "audio/wav"});
}
```

---

## 5. Vue 3 + Pinia による状態管理
コンポーネント間でシンセサイザーのパラメータを共有・監視するパターンです。

```typescript
// store/synth.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { engine } from '@/audio/Engine'; // 1のエンジン

export const useSynthStore = defineStore('synth', () => {
  // パラメータの定義
  const oscType = ref<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine');

  // 値が変更されたら、自動的にエンジンに反映する (watch)
  watch(oscType, (newVal) => {
    engine.setOscillatorType(newVal);
  });

  // 音を鳴らすアクション
  const triggerNoteOn = () => {
      engine.init(); // 必要に応じて開始
      engine.noteOn();
  };

  const triggerNoteOff = () => {
      engine.noteOff();
  };

  return {
    oscType,
    triggerNoteOn,
    triggerNoteOff
  };
});
```
