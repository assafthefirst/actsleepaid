/** Thin wrapper over the Web Speech API for exercise voice-over. */

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(
  text: string,
  opts?: { rate?: number; pitch?: number; volume?: number },
) {
  if (!isVoiceSupported()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = opts?.rate ?? 0.95
  utterance.pitch = opts?.pitch ?? 1
  utterance.volume = opts?.volume ?? 1
  window.speechSynthesis.speak(utterance)
}

export function cancelSpeech() {
  if (isVoiceSupported()) window.speechSynthesis.cancel()
}
