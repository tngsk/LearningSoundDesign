import * as Tone from 'tone'

export class AudioRecorder {
  private mic: Tone.UserMedia | null = null
  private recorder: Tone.Recorder | null = null
  private recordingBlob: Blob | null = null
  private audioBuffer: Tone.ToneAudioBuffer | null = null

  async initMic() {
    this.mic = new Tone.UserMedia()
    await this.mic.open()
    this.recorder = new Tone.Recorder()
    this.mic.connect(this.recorder)
  }

  async startRecording() {
    if (!this.recorder || !this.mic) return
    await Tone.start()
    this.recorder.start()
  }

  async stopRecording() {
    if (!this.recorder) return null
    const blob = await this.recorder.stop()
    this.recordingBlob = blob

    // Convert blob to ToneAudioBuffer for editing
    const arrayBuffer = await blob.arrayBuffer()
    const audioContext = Tone.getContext().rawContext as AudioContext
    const audioData = await audioContext.decodeAudioData(arrayBuffer)
    this.audioBuffer = new Tone.ToneAudioBuffer(audioData)

    return this.audioBuffer
  }

  getBuffer() {
      return this.audioBuffer
  }

  // Edit tools
  trim(startPercent: number, endPercent: number) {
    if (!this.audioBuffer) return
    const buffer = this.audioBuffer.get()
    if (!buffer) return

    const startSample = Math.floor(buffer.length * startPercent)
    const endSample = Math.floor(buffer.length * endPercent)
    const newLength = endSample - startSample

    if (newLength <= 0) return

    const audioContext = Tone.getContext().rawContext as AudioContext
    const newBuffer = audioContext.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const oldData = buffer.getChannelData(channel)
      const newData = newBuffer.getChannelData(channel)
      newData.set(oldData.subarray(startSample, endSample))
    }

    this.audioBuffer.set(newBuffer)
    return this.audioBuffer
  }

  normalize() {
    if (!this.audioBuffer) return
    const buffer = this.audioBuffer.get()
    if (!buffer) return

    let maxAmp = 0
    // Find max amplitude
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < data.length; i++) {
        const absVal = Math.abs(data[i])
        if (absVal > maxAmp) maxAmp = absVal
      }
    }

    if (maxAmp === 0) return this.audioBuffer // Silent buffer

    const multiplier = 1.0 / maxAmp

    // Apply multiplier
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < data.length; i++) {
        data[i] *= multiplier
      }
    }

    // ToneAudioBuffer wrapper doesn't automatically detect modifications to the underlying buffer in some versions,
    // but typically it works if we get/set correctly or modify in place if Tone permits.
    return this.audioBuffer
  }
}

export const recorder = new AudioRecorder()
