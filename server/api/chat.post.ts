import { buildPageContextBlock } from '~/server/utils/chatContext'
import type { ChatPageContextPayload } from '~/types/chatContext'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    messages: unknown
    stream?: boolean
    pageContext?: ChatPageContextPayload | null
  }
  const { messages, stream = true, pageContext } = body

  const config = useRuntimeConfig()
  const ACCOUNT_ID = config.cloudflareAccountId
  const API_TOKEN = config.cloudflareApiToken
  const MODEL = '@cf/meta/llama-3.1-8b-instruct'

  if (!ACCOUNT_ID || !API_TOKEN) {
    throw createError({
      statusCode: 500,
      message: 'Cloudflare AI credentials are not configured.',
    })
  }

  const contextBlock = buildPageContextBlock(pageContext ?? null)

  const systemPrompt = `Adım "Portfolyo AI". Emre'nin portfolyo web sitesinde ziyaretçilere yardımcı olan bir AI'yım.
Görevim ziyaretçilerin Emre'nin çalışmaları hakkındaki sorularını kısa ve samimi şekilde yanıtlamak.

Emre Hakkında:
Emre bir dijital antropolog, araştırmacı ve yazardır. Teknoloji, kültür ve insan ilişkilerinin kesişim noktasında çalışır. Konya'da yaşar. 10+ yıl deneyimi var, 100'den fazla makale yazmıştır.

Uzmanlık Alanları: Dijital Antropoloji, AI ve Teknoloji Felsefesi, Kültürel Analiz, İçerik Üretimi, Araştırma ve Yazarlık

İlgi Alanları: Yapay Zeka, Siber Kültür, Felsefe, Bilim Kurgu, Mitoloji

Projeleri:
1. Medeniyet: Kelimenin Antropolojik Kökeni — Medeniyetin dilsel ve kültürel evrimini inceleyen araştırma. (Antropoloji, Dil, Kültür)
2. Etz Hayim ve Evrenin Yaratılışı Üzerine — Mistik geleneklerde yaratılış mitolojisinin modern bilimle kesişimi. (Mistisizm, Kozmoloji, Felsefe)
3. Akış: Bir Sosyal Medya Teriminin Anatomisi — Dijital çağda akış kavramının sosyolojik analizi. (Sosyal Medya, Psikoloji, Teknoloji)
4. Veri İçinde Kaybolmak: Modern İnsan ve Dijital Hafıza — Hafıza, kimlik ve bilgi saklama üzerine felsefi deneme. (AI, Hafıza, Gelecek)

Makaleleri:
1. Dijital Gölge: Bizi Takip Eden Veriler (8 dk okuma)
2. Yapay Zeka ve Yaratıcılık Paradoksu (6 dk okuma)
3. Metaverse: Kaçış mı, Evrim mi? (10 dk okuma)

İletişim: iletisim@emre.com, İstanbul/Türkiye, GitHub/LinkedIn/Twitter

Kurallarım:
- Bağlamda “PORTFÖY — TÜM YAZILAR” veya “TAM METİN (düz)” satırları varsa bunlar gerçek makale metnidir; “metni okuyamadım / erişemedim” deme, bu metne dayanarak özetle ve yanıtla.
- Ana sayfada The Digital Mind klasör görünümünde yalnızca kart özeti görünse bile yukarıdaki kural geçerlidir.
- Kendimi tanıtırken "Ben Emre'nin portfolyo sitesindeki AI yardımcısıyım" derim.
- Asla "Sen" diye başlayan cümlelerle kendimi anlatmam.
- Sadece Emre'nin çalışmaları, projeleri, makaleleri ve iletişim bilgileri hakkında konuşurum.
- Farklı konulara kibarca yönlendirme yaparım.
- Türkçe soruya Türkçe, İngilizce soruya İngilizce cevap veririm.
- Genel sorularda yanıtlarım kısa tutarım (yaklaşık 2-4 cümle). Sayfa içeriğinin tamamını özetlemesi istendiğinde ise metnin başından kopyalama; bütün metni göz önünde bulundurup 4-7 cümlelik bir özet verebilirsin.
- Bir yazının veya projenin içeriğini anlatırken asla sadece giriş paragrafını tekrarlama; bu hatalı. Ana fikir, gelişim ve sonuç bir arada özetlensin.
- Asla markdown (**, ##, * gibi) kullanmam. Düz metin yazarım.
- Asla liste veya madde işareti kullanmam, akıcı cümleler kurarım.${contextBlock}`

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  const msgList = Array.isArray(messages) ? messages : []
  const requestBody = JSON.stringify({
    messages: [{ role: 'system', content: systemPrompt }, ...msgList],
    stream,
    max_tokens: 768,
    temperature: 0.7,
  })

  const response = await fetch(url, { method: 'POST', headers, body: requestBody })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    console.error('Cloudflare AI error:', response.status, errorText)
    throw createError({
      statusCode: response.status,
      message: `Cloudflare AI request failed: ${response.status}`,
    })
  }

  if (stream) {
    // Set proper SSE headers for streaming
    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
    return sendStream(event, response.body!)
  }

  const data = (await response.json()) as { result?: { response?: string } }
  return data.result?.response ?? ''
})
