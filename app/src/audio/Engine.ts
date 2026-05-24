import * as Tone from 'tone'

export class AudioEngine {
  private osc: Tone.OmniOscillator<any>
  private ampEnv: Tone.AmplitudeEnvelope
  private filter: Tone.Filter
  private lfo: Tone.LFO
  private pitchEnv: Tone.Envelope

  constructor() {
    this.osc = new Tone.OmniOscillator('C4', 'sine')

    // Amp Envelope
    this.ampEnv = new Tone.AmplitudeEnvelope({
      attack: 0.1,
      decay: 0.2,
      sustain: 1.0,
      release: 0.8
    })

    // Filter
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 20000, // Open by default
      rolloff: -24
    })

    // LFO (initially not connected)
    this.lfo = new Tone.LFO(1, -100, 100)

    // Pitch Envelope
    this.pitchEnv = new Tone.Envelope({
        attack: 0,
        decay: 0.1,
        sustain: 0,
        release: 0
    })

    // Routing: Osc -> Filter -> AmpEnv -> Master
    this.osc.connect(this.filter)
    this.filter.connect(this.ampEnv)
    this.ampEnv.toDestination()
  }

  public async start() {
    await Tone.start()
    if (this.osc.state !== 'started') {
        this.osc.start()
    }
  }

  public triggerAttackRelease(duration: Tone.Unit.Time = '8n') {
    this.ampEnv.triggerAttackRelease(duration)
    // Add logic later if pitch env is enabled
  }

  public triggerAttack() {
      this.ampEnv.triggerAttack()
  }

  public triggerRelease() {
      this.ampEnv.triggerRelease()
  }

  public setOscillatorType(type: 'sine' | 'square' | 'triangle' | 'sawtooth') {
    this.osc.type = type
  }

  public setOscillatorFreq(freq: number) {
      this.osc.frequency.value = freq;
  }

  public setAmpEnvelope(attack: number, decay: number, sustain: number, release: number) {
    this.ampEnv.attack = attack
    this.ampEnv.decay = decay
    this.ampEnv.sustain = sustain
    this.ampEnv.release = release
  }

  public setFilter(cutoff: number, res: number) {
    this.filter.frequency.value = cutoff
    this.filter.Q.value = res
  }
}

export const engine = new AudioEngine()
