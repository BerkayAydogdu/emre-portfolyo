import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const text = body.text
  
  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'Text is required for TTS' })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  // Default to a known good multilingual voice if none provided 
  // 'pNInz6obpgDQGcFmaJcg' is "Adam" (deep, standard). 
  // Another good one is "Rachel" -> '21m00Tcm4TlvDq8ikWAM', "Elli" -> 'MF3mGyEYCl7XYWbV9V6O'
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' 
  
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'ELEVENLABS_API_KEY is not configured in environment variables' })
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Required for Turkish support
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8
        }
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('ElevenLabs response error:', err)
      throw createError({ statusCode: response.status, statusMessage: err.detail?.message || 'ElevenLabs API returned an error' })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Set headers so browser receives standard MP3 audio
    event.node.res.setHeader('Content-Type', 'audio/mpeg')
    event.node.res.setHeader('Content-Length', buffer.length)
    
    return buffer
  } catch (error: any) {
    console.error('TTS Proxy Execution Error:', error)
    throw createError({ statusCode: 500, statusMessage: error.message || 'Error communicating with ElevenLabs server' })
  }
})
