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
}

export interface Expertise {
  key: string
  icon: string
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
    },
    {
      id: 'ai-yaraticilik',
      titleKey: 'articles.aiCreativity.title',
      excerptKey: 'articles.aiCreativity.excerpt',
      category: 'AI & Sanat',
      date: '2024-02-02',
      readMinutes: 6,
      slug: 'yapay-zeka-ve-yaraticilik-paradoksu',
    },
    {
      id: 'metaverse',
      titleKey: 'articles.metaverse.title',
      excerptKey: 'articles.metaverse.excerpt',
      category: 'Felsefe',
      date: '2024-01-20',
      readMinutes: 10,
      slug: 'metaverse-kacis-mi-evrim-mi',
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

  return { projects, testimonials, articles, expertise, interests, stats }
}
