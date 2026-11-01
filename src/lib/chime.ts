const NOTES_HZ = [660, 880]
const NOTE_SECONDS = 0.16

/** Browsers only allow audio after someone has interacted with the page. */
export const playOrderChime = () => {
  const context = new AudioContext()
  NOTES_HZ.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime + index * NOTE_SECONDS
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.2, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + NOTE_SECONDS)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + NOTE_SECONDS)
  })
}
