import type { ChatPageContextPayload } from '~/types/chatContext'
import type { Article, Project } from '~/composables/usePortfolioData'

/** Enough plain text for the model to paraphrase / answer “içerik ne” questions */
const BODY_PLAIN_MAX = 12_000
/** Per item in Digital Mind folder catalog (multiple cards on screen) */
const DM_ITEM_BODY_MAX = 4_000
/** Full article plain text in the “all portfolio articles” appendix (Digital Mind chat) */
const DM_ALL_ARTICLES_BODY_MAX = 12_000

function stripHtml(html: string, maxLen: number): string {
  if (!html) return ''
  const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : plain
}

function withBodyFallbackArticle(a: Article, staticArticles: Article[]): Article {
  if (a.body && String(a.body).replace(/\s/g, '').length > 40) return a
  const fb = staticArticles.find(s => s.slug === a.slug || s.id === a.id)
  if (fb?.body) return { ...a, body: fb.body }
  return a
}

function withBodyFallbackProject(p: Project, staticProjects: Project[]): Project {
  if (p.body && String(p.body).replace(/\s/g, '').length > 40) return p
  const fb = staticProjects.find(s => s.id === p.id)
  if (fb?.body) return { ...p, body: fb.body }
  return p
}

const HOME_SECTIONS: Record<string, { tr: string; en: string }> = {
  '': { tr: 'Ana sayfa — portfolyonun genel görünümü', en: 'Home page — portfolio overview' },
  '#hero': { tr: 'Hero bölümü — giriş ve tanıtım', en: 'Hero section — introduction' },
  '#voice': { tr: 'Sesli asistan bölümü', en: 'Voice assistant section' },
  '#about': { tr: 'Hakkımda bölümü', en: 'About section' },
  '#digital-mind': { tr: 'The Digital Mind — projeler ve yazılar klasör görünümü', en: 'The Digital Mind — projects and articles library view' },
  '#references': { tr: 'Referanslar bölümü', en: 'Testimonials section' },
  '#contact': { tr: 'İletişim bölümü', en: 'Contact section' },
}

function buildDigitalMindFolderCatalog(args: {
  dmUi: { label: string; filterType: string; source: '' | 'projects' | 'articles' }
  projects: Project[]
  articles: Article[]
  staticProjects: Project[]
  staticArticles: Article[]
  t: (k: string) => string
  loc: 'tr' | 'en'
}): string {
  const { dmUi, projects, articles, staticProjects, staticArticles, t, loc } = args
  if (!dmUi.source || !dmUi.filterType) return ''

  const intro =
    loc === 'tr'
      ? 'KLASÖR GÖRÜNÜMÜ (The Digital Mind): Önce bu sekmedeki kartlar listelenir. Aynı sohbet bağlamında genelde “PORTFÖY — TÜM YAZILAR” bölümünde tam metinler de verilir; önce o bloğa bak. Kartta kısa metin yoksa bile o blokta tam metin olabilir.'
      : 'DIGITAL MIND FOLDER VIEW: Cards in the current tab are listed first. The same context usually includes a “PORTFOLIO — ALL ARTICLES” section with full plain text—check there before saying text is unavailable.'

  const blocks: string[] = [intro]

  if (dmUi.source === 'projects') {
    const list = projects.filter((p) => p.type === dmUi.filterType)
    list.forEach((raw) => {
      const p = withBodyFallbackProject(raw, staticProjects)
      const title = t(p.titleKey)
      const excerpt = t(p.descriptionKey || '')
      const bodyPlain = p.body ? stripHtml(p.body, DM_ITEM_BODY_MAX) : ''
      blocks.push(
        [
          '---',
          loc === 'tr' ? `Proje kartı — Başlık: ${title}` : `Project card — Title: ${title}`,
          excerpt ? (loc === 'tr' ? `Kısa açıklama: ${excerpt}` : `Short description: ${excerpt}`) : '',
          bodyPlain
            ? loc === 'tr'
              ? `Detay metninden özet (varsa):\n${bodyPlain}`
              : `Detail body excerpt (if any):\n${bodyPlain}`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
    })
  } else {
    const list = articles.filter((a) => a.type === dmUi.filterType)
    list.forEach((raw) => {
      const a = withBodyFallbackArticle(raw, staticArticles)
      const title = t(a.titleKey)
      const excerpt = t(a.excerptKey || '')
      const bodyPlain = a.body ? stripHtml(a.body, DM_ITEM_BODY_MAX) : ''
      blocks.push(
        [
          '---',
          loc === 'tr' ? `Yazı kartı — Başlık: ${title}` : `Article card — Title: ${title}`,
          excerpt ? (loc === 'tr' ? `Kart özeti / giriş: ${excerpt}` : `Card excerpt: ${excerpt}`) : '',
          bodyPlain
            ? loc === 'tr'
              ? `Metin parçası (varsa, düz):\n${bodyPlain}`
              : `Body excerpt (plain, if any):\n${bodyPlain}`
            : loc === 'tr'
              ? 'Not: Bu kart için tam gövde metni burada yok; yalnızca başlık ve kart özetini kullan.'
              : 'Note: Full body not loaded for this card—use title + card excerpt only.',
        ]
          .filter(Boolean)
          .join('\n'),
      )
    })
  }

  return blocks.join('\n\n')
}

/**
 * Every article body (merged with static fallback) so the model can answer even when
 * the visitor’s folder tab doesn’t include that piece (e.g. “Dijital Gölge” is type analiz).
 */
function buildAllArticlesPlainAppendix(
  articles: Article[],
  staticArticles: Article[],
  t: (k: string) => string,
  loc: 'tr' | 'en',
): string {
  const head =
    loc === 'tr'
      ? 'PORTFÖY — TÜM YAZILAR (tam metin / düz yazı). Aşağıda metin varsa “metni okuyamadım” veya “yalnızca başlık görüyorum” deme; bu blok kaynak metindir. Klasör sekmesi farklı olsa da buradaki yazılar hakkında soru sorulabilir.'
      : 'PORTFOLIO — ALL ARTICLES (plain text). If text appears below, do not say you cannot read it; this block is the source. Questions may refer to any piece regardless of the active folder tab.'

  const parts: string[] = [head]
  for (const raw of articles) {
    const a = withBodyFallbackArticle(raw, staticArticles)
    const title = t(a.titleKey)
    const excerpt = t(a.excerptKey || '')
    const bodyPlain = a.body ? stripHtml(a.body, DM_ALL_ARTICLES_BODY_MAX) : ''
    parts.push(
      [
        '---',
        loc === 'tr' ? `Yazı — Başlık: ${title}` : `Article — Title: ${title}`,
        a.type ? (loc === 'tr' ? `Tür (Digital Mind): ${a.type}` : `Type: ${a.type}`) : '',
        excerpt ? (loc === 'tr' ? `Özet: ${excerpt}` : `Excerpt: ${excerpt}`) : '',
        bodyPlain
          ? loc === 'tr'
            ? `TAM METİN (düz):\n${bodyPlain}`
            : `FULL TEXT (plain):\n${bodyPlain}`
          : loc === 'tr'
            ? 'Metin: (bu kayıtta gövde yok — yalnızca başlık/özet)'
            : 'Body: (no body in this record)',
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }
  return parts.join('\n\n')
}

export function useChatPageContext() {
  const route = useRoute()
  const { t, locale } = useI18n()
  const { projects, articles } = usePortfolioDataRuntime()
  const staticPortfolio = usePortfolioData()
  const dmUi = useDigitalMindUiContext()
  const dmSectionInView = useState('dm-chat-section-in-view', () => false)

  return computed((): ChatPageContextPayload => {
    const path = route.path
    const hash = (route.hash || '').toLowerCase() || ''
    const loc = locale.value === 'en' ? 'en' : 'tr'

    if (path.startsWith('/proje/')) {
      const id = path.replace('/proje/', '').replace(/\/$/, '')
      const raw = projects.value.find(x => x.id === id)
      if (!raw) {
        return {
          kind: 'project',
          path,
          where: loc === 'tr' ? 'Proje sayfası (içerik yüklenemedi)' : 'Project page (content unavailable)',
        }
      }
      const p = withBodyFallbackProject(raw, staticPortfolio.projects)
      const title = t(p.titleKey)
      const excerpt = t(p.descriptionKey || '')
      const bodyPlain = p.body ? stripHtml(p.body, BODY_PLAIN_MAX) : ''
      const detail = [
        `Başlık: ${title}`,
        p.category ? `Kategori: ${p.category}` : '',
        excerpt ? `Kısa açıklama (kart): ${excerpt}` : '',
        bodyPlain
          ? (loc === 'tr'
            ? `SAYFA İÇERİĞİ (detay metni, düz yazı — “içerik ne / ne anlatıyor” sorularında bunu kullan):\n${bodyPlain}`
            : `PAGE BODY (plain text from detail page — use for “what does it say” questions):\n${bodyPlain}`)
          : (loc === 'tr'
            ? 'Not: Bu proje için henüz detay metni yok.'
            : 'Note: No detail body for this project yet.'),
      ].filter(Boolean).join('\n\n')

      return {
        kind: 'project',
        path,
        where: loc === 'tr'
          ? `Proje detayı: «${title}» (${p.type || 'proje'})`
          : `Project detail: "${title}" (${p.type || 'project'})`,
        detail,
      }
    }

    if (path.startsWith('/yazi/')) {
      const slug = path.replace('/yazi/', '').replace(/\/$/, '')
      const raw = articles.value.find(x => x.slug === slug)
      if (!raw) {
        return {
          kind: 'article',
          path,
          where: loc === 'tr' ? 'Yazı sayfası (içerik yüklenemedi)' : 'Article page (content unavailable)',
        }
      }
      const a = withBodyFallbackArticle(raw, staticPortfolio.articles)
      const title = t(a.titleKey)
      const excerpt = t(a.excerptKey || '')
      const bodyPlain = a.body ? stripHtml(a.body, BODY_PLAIN_MAX) : ''
      const detail = [
        `Başlık: ${title}`,
        a.category ? `Kategori: ${a.category}` : '',
        a.date ? `Tarih: ${a.date}` : '',
        excerpt ? `Özet (giriş/kart): ${excerpt}` : '',
        bodyPlain
          ? (loc === 'tr'
            ? `SAYFA İÇERİĞİ (makalenin tam metni, düz yazı — “içerik ne / ne anlatıyor” sorularında bunu kullan):\n${bodyPlain}`
            : `ARTICLE BODY (full text as plain — use for “what does it say” questions):\n${bodyPlain}`)
          : (loc === 'tr'
            ? 'Not: Bu yazı için henüz gövde metni yok.'
            : 'Note: No article body yet.'),
      ].filter(Boolean).join('\n\n')

      return {
        kind: 'article',
        path,
        where: loc === 'tr'
          ? `Yazı detayı: «${title}» (${a.type || 'yazı'})`
          : `Article detail: "${title}" (${a.type || 'article'})`,
        detail,
      }
    }

    if (path === '/' || path === '') {
      const h = hash || (import.meta.client ? (window.location.hash || '').toLowerCase() : '')
      const section = HOME_SECTIONS[h] ?? HOME_SECTIONS['']
      const whereBase = loc === 'en' ? section.en : section.tr

      const inDigitalMindCtx =
        dmUi.value.label &&
        dmUi.value.source &&
        dmUi.value.filterType &&
        (h === '#digital-mind' || dmSectionInView.value)

      let where = whereBase
      if (inDigitalMindCtx) {
        const src = dmUi.value.source === 'articles'
          ? (loc === 'tr' ? 'yazılar' : 'articles')
          : (loc === 'tr' ? 'projeler' : 'projects')
        where = loc === 'tr'
          ? `The Digital Mind — seçili klasör: «${dmUi.value.label}» (${src}, tür=${dmUi.value.filterType})`
          : `The Digital Mind — selected folder: "${dmUi.value.label}" (${src}, type=${dmUi.value.filterType})`
      }

      const detailCatalog = inDigitalMindCtx
        ? buildDigitalMindFolderCatalog({
            dmUi: {
              label: dmUi.value.label,
              filterType: dmUi.value.filterType,
              source: dmUi.value.source,
            },
            projects: projects.value,
            articles: articles.value,
            staticProjects: staticPortfolio.projects,
            staticArticles: staticPortfolio.articles,
            t,
            loc,
          })
        : ''

      const detailAllArticles =
        inDigitalMindCtx && staticPortfolio.articles.length
          ? buildAllArticlesPlainAppendix(
              articles.value,
              staticPortfolio.articles,
              t,
              loc,
            )
        : ''

      const detailHint =
        inDigitalMindCtx && !detailCatalog
          ? loc === 'tr'
            ? `Kullanıcı "${dmUi.value.label}" sekmesine bakıyor; liste henüz yüklenemedi.`
            : `The visitor is on tab "${dmUi.value.label}"; list data was unavailable.`
          : ''

      return {
        kind: 'home-section',
        path: path + (h || ''),
        where,
        detail:
          [detailCatalog, detailAllArticles, detailHint].filter(Boolean).join('\n\n\n') || undefined,
      }
    }

    return {
      kind: 'other',
      path,
      where: loc === 'tr' ? `Sayfa: ${path}` : `Page: ${path}`,
    }
  })
}
