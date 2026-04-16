import { useCloudflareAI } from './useCloudflareAI'

export function useVoiceBot() {
  const transcript = ref('')
  const aiResponse = ref('')
  const isListening = ref(false)
  const isProcessing = ref(false)
  const isSupported = ref(false)
  const isSpeaking = ref(false)
  const isBraveBrowser = ref(false)
  const speechFailed = ref(false)
  const recognition = shallowRef<any>(null)
  const error = ref('')
  const audioEngine = ref<HTMLAudioElement | null>(null)

  const { chat } = useCloudflareAI()
  const chatPageContext = useChatPageContext()

  // Check support only on client side
  if (import.meta.client) {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    isSupported.value = !!SR

    // Detect Brave browser
    const nav = navigator as any
    if (nav.brave && typeof nav.brave.isBrave === 'function') {
      nav.brave.isBrave().then((result: boolean) => {
        isBraveBrowser.value = result
      })
    }
  }

  function startListening(lang: 'tr-TR' | 'en-US' = 'tr-TR') {
    if (!import.meta.client) return

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!SR) {
      error.value = lang === 'tr-TR'
        ? 'Ses tanıma bu tarayıcıda desteklenmiyor.'
        : 'Speech recognition is not supported in this browser.'
      return
    }

    // Reset previous state
    transcript.value = ''
    aiResponse.value = ''
    error.value = ''

    try {
      recognition.value = new SR()
      recognition.value.lang = lang
      recognition.value.continuous = false
      recognition.value.interimResults = true
      recognition.value.maxAlternatives = 1

      recognition.value.onresult = (e: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = 0; i < e.results.length; i++) {
          const result = e.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        transcript.value = finalTranscript || interimTranscript
      }

      recognition.value.onend = () => {
        isListening.value = false
        if (transcript.value.trim()) {
          sendToAI(lang)
        }
      }

      recognition.value.onerror = (e: any) => {
        console.error('SpeechRecognition error:', e.error)
        isListening.value = false

        if (e.error === 'not-allowed') {
          error.value = lang === 'tr-TR'
            ? 'Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.'
            : 'Microphone permission denied. Please allow in browser settings.'
        } else if (e.error === 'no-speech') {
          error.value = lang === 'tr-TR'
            ? 'Ses algılanamadı. Lütfen tekrar deneyin.'
            : 'No speech detected. Please try again.'
        } else if (e.error === 'network') {
          // This commonly happens in Brave and privacy-focused browsers
          // that block Google's speech recognition servers
          speechFailed.value = true
          error.value = lang === 'tr-TR'
            ? 'Ses tanıma servisi bu tarayıcıda engellenmiş. Aşağıdaki metin kutusunu kullanarak sorunuzu yazabilirsiniz.'
            : 'Speech recognition service is blocked in this browser. You can type your question in the text box below.'
        } else if (e.error === 'aborted') {
          // User aborted, no need for error
        } else {
          error.value = lang === 'tr-TR'
            ? `Ses tanıma hatası: ${e.error}`
            : `Speech recognition error: ${e.error}`
        }
      }

      recognition.value.start()
      isListening.value = true
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err)
      isListening.value = false
      speechFailed.value = true
      error.value = lang === 'tr-TR'
        ? 'Ses tanıma başlatılamadı. Aşağıdaki metin kutusunu kullanarak sorunuzu yazabilirsiniz.'
        : 'Failed to start speech recognition. You can type your question in the text box below.'
    }
  }

  function stopListening() {
    try {
      recognition.value?.stop()
    } catch {}
    isListening.value = false
  }

  /**
   * Send a text query to AI — used by both voice transcript and text input fallback
   */
  async function sendToAI(lang: 'tr-TR' | 'en-US' = 'tr-TR', text?: string) {
    const query = text || transcript.value
    if (!query.trim()) return

    if (text) transcript.value = text
    isProcessing.value = true
    error.value = ''

    try {
      const response = await chat(
        [{ role: 'user', content: query }],
        { pageContext: chatPageContext.value },
      )
      aiResponse.value = response
      speak(response, lang)
    } catch (err: any) {
      console.error('AI response error:', err)
      aiResponse.value = lang === 'tr-TR'
        ? 'Üzgünüm, yanıt alınamadı. Lütfen tekrar deneyin.'
        : 'Sorry, could not get a response. Please try again.'
    } finally {
      isProcessing.value = false
    }
  }

  async function speak(text: string, lang: 'tr-TR' | 'en-US' = 'tr-TR') {
    if (!import.meta.client) return
    
    stopSpeaking()

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang })
      })

      if (!response.ok) {
        throw new Error('ElevenLabs API returned an error, falling back to Browser TTS.')
      }

      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      
      const audio = new Audio(audioUrl)
      audioEngine.value = audio
      
      audio.onplay = () => { isSpeaking.value = true }
      audio.onended = () => { 
        isSpeaking.value = false
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => { 
        isSpeaking.value = false
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
    } catch (e) {
      console.warn('Network TTS failed, using offline fallback', e)
      fallbackSpeak(text, lang)
    }
  }

  function fallbackSpeak(text: string, lang: 'tr-TR' | 'en-US' = 'tr-TR') {
    if (!import.meta.client || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang
    utt.rate = 0.95

    const voices = window.speechSynthesis.getVoices()
    const langVoice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)))
    if (langVoice) utt.voice = langVoice

    utt.onstart = () => { isSpeaking.value = true }
    utt.onend = () => { isSpeaking.value = false }
    utt.onerror = () => { isSpeaking.value = false }

    window.speechSynthesis.speak(utt)
  }

  function stopSpeaking() {
    if (!import.meta.client) return
    
    if (audioEngine.value) {
      audioEngine.value.pause()
      audioEngine.value.currentTime = 0
      audioEngine.value = null
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    
    isSpeaking.value = false
  }

  function toggle(lang: 'tr-TR' | 'en-US' = 'tr-TR') {
    if (isListening.value) {
      stopListening()
    } else {
      startListening(lang)
    }
  }

  onUnmounted(() => {
    try { recognition.value?.stop() } catch {}
    if (import.meta.client) {
      stopSpeaking()
    }
  })

  return {
    transcript,
    aiResponse,
    isListening,
    isProcessing,
    isSupported,
    isSpeaking,
    isBraveBrowser,
    speechFailed,
    error,
    toggle,
    sendToAI,
    speak,
    stopSpeaking,
  }
}
