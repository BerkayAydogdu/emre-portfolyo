import type { ChatPageContextPayload } from '~/types/chatContext'

export type { ChatPageContextPayload }

export function buildPageContextBlock(ctx: ChatPageContextPayload | null | undefined): string {
  if (!ctx || !ctx.where) return ''
  const lines = [
    '── Ziyaretçinin şu an baktığı yer (bağlam) ──',
    `Konum özeti: ${ctx.where}`,
  ]
  if (ctx.detail?.trim()) {
    lines.push('Detay (başlık, özet ve varsa SAYFA İÇERİĞİ / ARTICLE BODY tam metin):')
    lines.push(ctx.detail.trim())
  }

  if (ctx.kind === 'article' || ctx.kind === 'project') {
    lines.push(
      'ÖZET KURALI (çok önemli): Yukarıda tam metin varsa, ziyaretçi “içerik ne / ne anlatıyor / özetle” dediğinde metnin sadece ilk cümlelerini veya ilk paragrafını tekrarlama; bu yanlış.',
      'Metnin tamamını dikkate al: ana tema, gelişen düşünce, önemli alt başlıkların konusu ve varsa sonuç. Bunları kendi cümlelerinle kısa bir özet olarak ver (genelde 3–6 cümle).',
      'Uzun alıntı yapma; özet tercih et. İlk 500 karaktere takılıp kalmak yasak.',
    )
  }

  const dmFolderDetail =
    ctx.kind === 'home-section' &&
    ctx.detail &&
    (ctx.detail.includes('KLASÖR GÖRÜNÜMÜ') || ctx.detail.includes('DIGITAL MIND FOLDER'))
  if (dmFolderDetail) {
    lines.push(
      'DIGITAL MIND KLASÖRÜ: Yukarıda kart başlıkları ve özetler varsa “tam metin yok” diye yüzeysen olmaz; başlık + özet + varsa metin parçasından konuyu anlat.',
      'Tam gövde eksikse dürüst ol ama yine de özetten ne anlaşıldığını 3–5 cümleyle anlat; kullanıcıyı boş cevaba itme.',
    )
  }

  lines.push(
    '“İçerik ne / ne anlatıyor / ne diyor” gibi sorularda yukarıdaki SAYFA İÇERİĞİ veya PAGE BODY metnine dayan; genel portfolyo listesinden kopyalama.',
    '“Bu sayfa ne hakkında?” için başlık + tam metinden çıkardığın özet; genel portfolyo bilgisini sadece metin yoksa kullan.',
  )
  return '\n\n' + lines.join('\n')
}
