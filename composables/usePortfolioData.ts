export interface Project {
  id: string
  titleKey: string
  descriptionKey: string
  category: string
  tags: string[]
  /** type is open-ended so new Digital Mind dizins (e.g. 'video') can be added without code changes */
  type: string
  image?: string
  link?: string
  /** Full HTML body shown on the /proje/[id] detail page */
  body?: string
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
  type: string
  image?: string
  link?: string
  /** Full HTML body shown on the /yazi/[slug] detail page */
  body?: string
}

export interface DigitalMindDizin {
  id: string
  label: string
  icon: string
  /** Which portfolio array to filter: 'projects' or 'articles' */
  source: 'projects' | 'articles'
  /** The `type` field value to match in projects/articles */
  filterType: string
}

export interface DigitalMindConfig {
  title: string
  subtitle: string
  tabs: DigitalMindDizin[]
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
      body: `<h2>Araştırmanın Çıkış Noktası</h2>
<p>"Medeniyet" kelimesi, Türkçeye Arapça <em>medine</em> (şehir) kökünden geçmiştir. Oysa bu kökün izleri Sümerce kentleşme mitlerinden ta günümüze uzanan derin bir anlam katmanları ağı taşımaktadır. Araştırma, bu etimolojik yolculuğu kültürel hafıza ile bağlantılı biçimde incelemektedir.</p>
<h2>Yöntem</h2>
<p>Çalışmada karşılaştırmalı dilbilim, kültürel antropoloji ve arkeolojik metin analizleri bir arada kullanılmıştır. Altı farklı dil ailesinden "uygarlık" karşılığı kavramlar, anlam kaymaları ve bağlamsal dönüşümleri bakımından incelenmiştir.</p>
<blockquote>"Bir toplumun kendine verdiği isim, onun dünyayı nasıl gördüğünün aynasıdır."</blockquote>
<h2>Temel Bulgular</h2>
<p>Araştırmanın en ilgi çekici bulgusu, "medeniyet" ve "barbar" kavramlarının tarihsel olarak birbirini tanımlayan bir çift oluşturduğudur. Merkez, periferisi üzerinden kendini kurar; uygarlık, ötekini dışlayarak var olur.</p>
<p>Bu ilişki, günümüz dijital kültüründe de varlığını sürdürmektedir: algoritmik filtre balonları, yeni bir "medeni-barbar" ayrımı üretmektedir.</p>`,
    },
    {
      id: 'etz-hayim',
      titleKey: 'projects.etzHayim.title',
      descriptionKey: 'projects.etzHayim.description',
      category: 'Felsefe',
      type: 'arastirma',
      tags: ['Mistisizm', 'Kozmoloji', 'Felsefe'],
      body: `<h2>Kabala'dan Modern Kozmolojiye</h2>
<p><em>Etz Hayim</em> (Hayat Ağacı), Yahudi mistisizminin temel metinlerinden biridir. 16. yüzyılda Safed'de kaleme alınan bu eser, evrenin on <em>Sefirot</em> üzerinden nasıl tezahür ettiğini anlatır. Araştırma, bu kadim şemayı modern kuantum kozmolojisiyle karşılaştırmaktadır.</p>
<h2>Kozmolojik Paraleller</h2>
<p>Sefirot'un hiyerarşik yapısı ile modern fiziğin boyut teorileri arasında dikkat çekici yapısal benzerlikler bulunmaktadır. <em>Ein Sof</em> kavramı (sonsuz, tanımsız ilk enerji) ile vakum enerjisi arasındaki metaforik örtüşme özellikle incelenmiştir.</p>
<blockquote>"Evren bir ağaçtır; kökleri yukarıda, dalları aşağıdadır." — Zohar</blockquote>
<h2>Günümüze Yansımaları</h2>
<p>Mistik kozmoloji bugün yalnızca tarihin bir sayfası değildir. Bütünsel düşünce sistemleri, çevre felsefesi ve yapay zeka etiği gibi alanlarda kadim şemalar yeniden keşfedilmektedir. Araştırma, bu köprülerin nasıl kurulabileceğini sorgulamaktadır.</p>`,
    },
    {
      id: 'akis',
      titleKey: 'projects.akis.title',
      descriptionKey: 'projects.akis.description',
      category: 'Dijital Kültür',
      type: 'yazi',
      tags: ['Sosyal Medya', 'Psikoloji', 'Teknoloji'],
      body: `<h2>Bir Kelimenin Dönüşümü</h2>
<p>"Akış" kelimesi, dijital çağdan önce doğa ile ilişkiliydi: nehir akışı, zaman akışı, müzik akışı. Ancak sosyal medya platformlarının yükselişiyle birlikte kelime radikal biçimde anlam kaydı yaşadı. Bugün "akışa bakmak", saatler süren pasif bir tüketim eylemini tanımlamaktadır.</p>
<h2>Csikszentmihalyi'den Zuckerberg'e</h2>
<p>Psikolog Mihaly Csikszentmihalyi'nin 1975'te tanımladığı "akış" (flow) durumu, tam tersi bir deneyimi ifade ediyordu: derin konsantrasyon, zorlu görev, zamanın durması. Sosyal medya akışı ise bu deneyimi tersine çevirerek pasifliği, kolay tüketimi ve sonsuz kaydırmayı normalleştirdi.</p>
<blockquote>"Platformlar dikkatimizi değil, dikkatimizin akışını satıyor."</blockquote>
<h2>Dil ve Zihin Üzerindeki Etki</h2>
<p>Bu anlam kayması tesadüf değildir. UX tasarımcıları bilinçli olarak "akan", "akıcı" deneyimler tasarlar. Kullanıcının zihinsel direncini kırmak, içeriği duraksatmadan aktarabilmek için dil de araçsallaştırılmaktadır.</p>`,
    },
    {
      id: 'veri',
      titleKey: 'projects.veri.title',
      descriptionKey: 'projects.veri.description',
      category: 'Teknoloji',
      type: 'yazi',
      tags: ['AI', 'Hafıza', 'Gelecek'],
      body: `<h2>Hatırlamak mı, Depolamak mı?</h2>
<p>İnsan hafızası seçici, duygusal ve sıklıkla yanıltıcıdır; ama bu "kusurlar" aynı zamanda bizi insan yapan özelliklerin ta kendisidir. Dijital hafıza ise mükemmel depolama sunar: her fotoğraf, her mesaj, her konum verisi sonsuza dek saklıdır. Peki bu bizi özgürleştiriyor mu, yoksa geçmişin mahkumu mu yapıyor?</p>
<h2>Dijital Kimlik Krizi</h2>
<p>On yıl önce paylaştığınız bir gönderi bugün kim olduğunuzu tanımlamaya devam ediyor. Platformlar "sizi siz yapan verileri" algoritmalar aracılığıyla sürekli yeniden üretiyor. Bu durum kimlik gelişimini kilitliyor: dijital bir kişi olarak büyümek, dijital geçmişinizle hesaplaşmak anlamına geliyor.</p>
<blockquote>"Unutmak, insan olmanın bir ayrıcalığıydı. Dijital çağ bu ayrıcalığı elimizden aldı."</blockquote>
<h2>Geleceğe Bakış</h2>
<p>Yapay zekanın hafızayı nasıl yeniden tanımlayacağı merak konusudur. Beyin-bilgisayar arayüzleri, anıların doğrudan depolanmasını mümkün kılabilir. Bu durumda "gerçek" hafıza ile "yedeklenmiş" hafıza arasındaki sınır ne olacaktır?</p>`,
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
      body: `<p>Her sabah uyandığınızda telefonunuzu elinize aldığınızda, dijital gölgeniz zaten uyanık ve aktiftir. Uyku saatleriniz, hangi uygulamayı kaç dakika kullandığınız, hangi haberleri atlayıp hangilerini okuduğunuz — hepsi kayıt altında.</p>
<h2>Verinin Anatomisi</h2>
<p>Dijital ayak izleri iki kategoride incelenebilir: <strong>aktif veri</strong> (bilinçli olarak paylaştıklarımız) ve <strong>pasif veri</strong> (farkında olmadan bıraktıklarımız). Araştırmalar, pasif verinin aktif veriden 5 ila 10 kat daha fazla olduğunu göstermektedir.</p>
<p>Bir örnek: Instagram'a fotoğraf yüklediğinizde fotoğrafın kendisi aktif veridir. Ama o fotoğrafı hangi filtreyle, gece mi gündüz mü, haftanın hangi günü yüklediğiniz, beğeni bildirimi gelince kaç saniyede uygulamaya döndüğünüz — bunların tamamı pasif veridir.</p>
<blockquote>"Gerçeklik, kodların değil, insanların ona yüklediği anlamların üzerinde inşa edilir."</blockquote>
<h2>Kimlik Üzerindeki Etkisi</h2>
<p>Veri toplanması tek başına sorun değildir. Asıl mesele bu verinin nasıl yorumlandığı ve kime satıldığıdır. Sigorta şirketleri sosyal medya profillerinize bakarak prim belirleyebilir; işverenler dijital geçmişinizi tarıyor; siyasi kampanyalar mikro-hedefleme ile düşüncelerinizi şekillendirmeye çalışıyor.</p>
<h2>Çözüm Mümkün mü?</h2>
<p>Tam anlamıyla "veri sıfırlama" bugün için bir ütopyadır. Ancak dijital okuryazarlık, verinin nasıl toplandığını anlamak ve bilinçli tercihler yapmak için kritik bir başlangıç noktasıdır. Şeffaflık talep etmek, veri ekonomisinin oyun kurallarını değiştirmenin ilk adımıdır.</p>`,
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
      body: `<p>ChatGPT bir roman yazabilir, Midjourney Van Gogh tarzında resim üretebilir, Suno bir hit şarkı bestelayebilir. Peki sanatçılar bundan korkmalı mı? Bu sorunun cevabı, "yaratıcılık nedir?" sorusunu sormaktan geçiyor.</p>
<h2>Yaratıcılığın Tanımı Üzerine</h2>
<p>Margaret Bove, yaratıcılığı üç türe ayırır: <strong>kombinatoryal</strong> (mevcut fikirleri yeni biçimlerde bir araya getirme), <strong>keşifsel</strong> (kavramsal bir alanın sınırlarını zorlama) ve <strong>dönüşümsel</strong> (o alanın kurallarını kökten değiştirme). Yapay zeka ilk iki türde son derece başarılıdır. Üçüncüsü hâlâ tartışmalıdır.</p>
<blockquote>"Yapay zeka yaratıcılığın aracı mı, yoksa rakibi mi? Belki de ikisi birden."</blockquote>
<h2>İnsan-Makine Ortaklığı</h2>
<p>Gerçek paradoks şu: AI araçlarını en etkin kullananlar, kendi yaratıcı sezgilerini bu araçlarla birleştirenlerdir. Müzisyen Holly Herndon, AI'yı bir enstrüman gibi kullanıyor. Ressam Refik Anadol, algoritmaları fırçası olarak görüyor. Bu yaklaşım, yaratıcılığı ortadan kaldırmıyor; aksine genişletiyor.</p>
<h2>Kaygı mı, Merak mı?</h2>
<p>Tarihin her teknik devrimi sanatçıları kaygılandırdı: fotoğrafın icadı ressamları, dijital müziğin yükselişi müzisyenleri... Her seferinde sanat ayakta kaldı, dönüştü ve zenginleşti. AI devrimi de muhtemelen bu döngünün yeni bir halkasıdır. Asıl soru şu: Bu dönüşümde aktif bir rol mi alacaksınız, yoksa izleyici mi kalacaksınız?</p>`,
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
      body: `<p>2021'de Meta'nın ilanıyla birlikte "metaverse" kelimesi popüler söylemin merkezine oturdu. Ancak kavram aslında çok daha eskidir: Neal Stephenson 1992'de yazdığı <em>Snow Crash</em> romanında bu terimi kullanmış; William Gibson ise ondan önce "siber uzay"ı tanımlamıştı.</p>
<h2>Kaçış mı?</h2>
<p>Metaverse'ün kaçış boyutu tartışmasız vardır. Kronik yalnızlık, ekonomik baskı, iklim krizi ve anlamsızlık hissi — sanal dünyanın çekiciliğinin arkasında bu gerçekliklerin yarattığı ağırlık yatıyor. Second Life'ın 2000'lerdeki yükselişi ve çöküşü bu açıdan öğreticidir: insanlar sanal dünyanın kendi sorunlarını taşıdığını fark ettiklerinde ilgilerini kaybettiler.</p>
<blockquote>"Kaçtığınız yere yanınızda kendinizi de götürürsünüz."</blockquote>
<h2>Evrim mi?</h2>
<p>Öte yandan metaverse, gerçekliği yok etmek değil genişletmek için de kullanılabilir. Uzaktan ameliyat, tarihî anıtların sanal restorasyonu, empati eğitimleri (bir mülteciyi deneyimlemek) — bunlar salt kaçış değil, gerçekliği derinleştirme çabasıdır.</p>
<h2>Felsefi Çerçeve</h2>
<p>Baudrillard'ın "simülakr" kavramı burada yeniden güncellik kazanıyor: Bir noktada sanal deneyim o kadar gerçekçi hale gelecek ki orijinal referansını yitirecek. Bu noktada "gerçek" ve "sanal" ayrımı anlamsızlaşır. Metaverse'ün asıl tehlikesi, bizi kaçırtması değil; "gerçek"i tanımsız kılmasıdır.</p>`,
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

  const digitalMind: DigitalMindConfig = {
    title: 'The Digital Mind',
    subtitle: 'Burada araştırma, proje ve teknik yolculuğumu paylaşıyorum — kalıcı, kişisel ve her an çalışan kütüphanem.',
    tabs: [
      { id: 'arastirmalar', label: 'ARAŞTIRMALAR.exe', icon: 'i-lucide-folder-git-2',  source: 'projects',  filterType: 'arastirma' },
      { id: 'projeler',     label: 'PROJELER.app',     icon: 'i-lucide-monitor-play',   source: 'projects',  filterType: 'yazi'      },
      { id: 'dusunceler',   label: 'DÜŞÜNCELER.txt',   icon: 'i-lucide-file-text',      source: 'articles',  filterType: 'dusunce'   },
      { id: 'analizler',    label: 'ANALİZLER.db',     icon: 'i-lucide-database',       source: 'articles',  filterType: 'analiz'    },
    ],
  }

  return { projects, testimonials, articles, expertise, interests, stats, socials, digitalMind }
}
