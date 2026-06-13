export function playTick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 800; gain.gain.value = 0.06
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.05)
  } catch {}
}

export function playCorrect() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'; gain.gain.value = 0.12
      osc.start(ctx.currentTime + i * 0.1); osc.stop(ctx.currentTime + i * 0.1 + 0.15)
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15)
    })
  } catch {}
}

export function playWrong() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [400, 300]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sawtooth'; gain.gain.value = 0.1
      osc.start(ctx.currentTime + i * 0.15); osc.stop(ctx.currentTime + i * 0.15 + 0.2)
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.2)
    })
  } catch {}
}

export function playVictory() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const melody = [523, 587, 659, 784, 659, 784, 1047]
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'; gain.gain.value = 0.1
      const t = ctx.currentTime + i * 0.12
      osc.start(t); osc.stop(t + 0.18)
      gain.gain.setValueAtTime(0.1, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    })
  } catch {}
}
