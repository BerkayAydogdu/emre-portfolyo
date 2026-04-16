import type { ChatPageContextPayload } from '~/types/chatContext'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequestOptions {
  /** Current page / section so the model can answer “what is this about?” */
  pageContext?: ChatPageContextPayload | null
}

export function useCloudflareAI() {
  /**
   * Stream chat response from the Cloudflare AI proxy.
   * Calls onChunk for each token and resolves with the full text.
   */
  async function streamChat(
    messages: ChatMessage[],
    onChunk: (token: string) => void,
    options?: ChatRequestOptions,
  ): Promise<string> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        stream: true,
        pageContext: options?.pageContext ?? null,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`API error ${response.status}: ${errorText}`)
    }

    if (!response.body) {
      throw new Error('No response body received')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data) as { response?: string }
          if (parsed.response) {
            fullText += parsed.response
            onChunk(parsed.response)
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim()
      if (trimmed.startsWith('data: ') && trimmed.slice(6) !== '[DONE]') {
        try {
          const parsed = JSON.parse(trimmed.slice(6)) as { response?: string }
          if (parsed.response) {
            fullText += parsed.response
            onChunk(parsed.response)
          }
        } catch {}
      }
    }

    return fullText
  }

  /**
   * Non-streaming: wait for the complete response (used by voice bot).
   */
  async function chat(messages: ChatMessage[], options?: ChatRequestOptions): Promise<string> {
    try {
      const res = await $fetch<string>('/api/chat', {
        method: 'POST',
        body: {
          messages,
          stream: false,
          pageContext: options?.pageContext ?? null,
        },
      })
      // $fetch may return a string directly or a wrapped value
      if (typeof res === 'string') return res
      // If somehow returned as object, try to extract
      if (res && typeof res === 'object' && 'result' in (res as any)) {
        return (res as any).result?.response ?? ''
      }
      return String(res ?? '')
    } catch (error: any) {
      console.error('Chat API error:', error?.message || error)
      throw error
    }
  }

  return { streamChat, chat }
}
