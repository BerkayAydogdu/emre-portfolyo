export interface Project {
  id: string
  titleKey: string
  descriptionKey: string
  category: string
  tags: string[]
  /** 'arastirma' for research items, 'yazi' for writings */
  type: 'arastirma' | 'yazi'
  /** Optional image path relative to /public  e.g. '/images/projects/medeniyet.jpg' */
  image?: string
}

export interface Testimonial {
  id: string
  quoteKey: string
  name: string
  titleKey: string
  organization: string
}

export interface Article {
  id: string
  titleKey: string
  excerptKey: string
  category: string
  date: string
  readMinutes: number
  slug: string
  /** 'dusunce' for thought pieces, 'analiz' for analysis */
  type: 'dusunce' | 'analiz'
  /** Optional cover image path e.g. '/images/articles/ornek.jpg' */
  image?: string
}

export interface Expertise {
  key: string
  icon: string
}

export interface SocialCard {
  id: string
  platform: string
  type: 'instagram' | 'x' | 'medium' | 'linkedin'
  handle: string
  text?: string
  title?: string
  image?: string
  icon: string
  url: string
}

export function usePortfolioData() {
  const projects: Project[] = [
    {
      id: 'medeniyet',
      titleKey: 'projects.medeniyet.title',
      descriptionKey: 'projects.medeniyet.description',
      category: 'Araştırma',
      type: 'arastirma',
      tags: ['Antropoloji', 'Dil', 'Kültür'],
      // image: '/images/projects/medeniyet.jpg',
    },
    {
      id: 'etz-hayim',
      titleKey: 'projects.etzHayim.title',
      descriptionKey: 'projects.etzHayim.description',
      category: 'Felsefe',
      type: 'arastirma',
      tags: ['Mistisizm', 'Kozmoloji', 'Felsefe'],
      // image: '/images/projects/etz-hayim.jpg',
    },
    {
      id: 'akis',
      titleKey: 'projects.akis.title',
      descriptionKey: 'projects.akis.description',
      category: 'Dijital Kültür',
      type: 'yazi',
      tags: ['Sosyal Medya', 'Psikoloji', 'Teknoloji'],
      // image: '/images/projects/akis.jpg',
    },
    {
      id: 'veri',
      titleKey: 'projects.veri.title',
      descriptionKey: 'projects.veri.description',
      category: 'Teknoloji',
      type: 'yazi',
      tags: ['AI', 'Hafıza', 'Gelecek'],
      // image: '/images/projects/veri.jpg',
    },
  ]

  const testimonials: Testimonial[] = [
    {
      id: 'ayse',
      quoteKey: 'testimonials.ayse.quote',
      name: 'Dr. Ayşe Yılmaz',
      titleKey: 'testimonials.ayse.title',
      organization: 'İstanbul Üniversitesi',
    },
    {
      id: 'mehmet',
      quoteKey: 'testimonials.mehmet.quote',
      name: 'Mehmet Kaya',
      titleKey: 'testimonials.mehmet.title',
      organization: 'TechVision AI',
    },
    {
      id: 'zeynep',
      quoteKey: 'testimonials.zeynep.quote',
      name: 'Zeynep Arslan',
      titleKey: 'testimonials.zeynep.title',
      organization: 'Kültür Merkezi',
    },
  ]

  const articles: Article[] = [
    {
      id: 'dijital-golge',
      titleKey: 'articles.digitalShadow.title',
      excerptKey: 'articles.digitalShadow.excerpt',
      category: 'Teknoloji',
      date: '2024-03-15',
      readMinutes: 8,
      slug: 'dijital-golge-bizi-takip-eden-veriler',
      type: 'analiz',
      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'ai-yaraticilik',
      titleKey: 'articles.aiCreativity.title',
      excerptKey: 'articles.aiCreativity.excerpt',
      category: 'AI & Sanat',
      date: '2024-02-02',
      readMinutes: 6,
      slug: 'yapay-zeka-ve-yaraticilik-paradoksu',
      type: 'dusunce',
    },
    {
      id: 'metaverse',
      titleKey: 'articles.metaverse.title',
      excerptKey: 'articles.metaverse.excerpt',
      category: 'Felsefe',
      date: '2024-01-20',
      readMinutes: 10,
      slug: 'metaverse-kacis-mi-evrim-mi',
      type: 'dusunce',
    },
  ]

  const expertise: Expertise[] = [
    { key: 'about.expertise.digitalAnthropology', icon: 'i-lucide-globe' },
    { key: 'about.expertise.aiPhilosophy', icon: 'i-lucide-cpu' },
    { key: 'about.expertise.culturalAnalysis', icon: 'i-lucide-layers' },
    { key: 'about.expertise.contentCreation', icon: 'i-lucide-pen-line' },
    { key: 'about.expertise.research', icon: 'i-lucide-search' },
  ]

  const interests: string[] = [
    'about.interests.ai',
    'about.interests.cyberCulture',
    'about.interests.philosophy',
    'about.interests.sciFi',
    'about.interests.mythology',
  ]

  const stats = [
    { value: '10+', labelKey: 'about.stats.years' },
    { value: '100+', labelKey: 'about.stats.articles' },
    { value: '3', labelKey: 'about.stats.fields' },
  ]

  const socials: SocialCard[] = [
    {
      id: 'soc-1',
      platform: 'Instagram',
      type: 'instagram',
      handle: '@emre.dijital',
      image: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=600&auto=format&fit=crop',
      icon: 'i-simple-icons-instagram',
      url: 'https://instagram.com'
    },
    {
      id: 'soc-2',
      platform: 'X',
      type: 'x',
      handle: '@dijitalgolge',
      text: '"Gerçeklik, kodların değil, insanların ona yüklediği anlamların üzerinde inşa edilir." — Yeni makalem yayında 👇',
      icon: 'i-simple-icons-x',
      url: 'https://twitter.com'
    },
    {
      id: 'soc-3',
      platform: 'Medium',
      type: 'medium',
      handle: 'Emre Öncü',
      title: 'Yapay Zeka Çağında Antropoloji: İnsan Ne Yana Düşer?',
      image: 'https://images.unsplash.com/photo-1620712948343-0008ce8a568b?q=80&w=600&auto=format&fit=crop',
      icon: 'i-simple-icons-medium',
      url: 'https://medium.com'
    },
    {
      id: 'soc-4',
      platform: 'LinkedIn',
      type: 'linkedin',
      handle: 'Emre',
      title: 'Dijital Antropolog | UX Danışmanı | Teknoloji & İnsan Araştırmacısı',
      icon: 'i-simple-icons-linkedin',
      url: 'https://linkedin.com'
    }
  ]

  return { projects, testimonials, articles, expertise, interests, stats, socials }
}
