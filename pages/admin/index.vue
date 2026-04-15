<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32 font-sans relative">

    <!-- ─── STICKY TOPBAR ──────────────────────────────────────────── -->
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-4">
        <!-- lang switch -->
        <UButtonGroup size="sm">
          <UButton :color="lang === 'tr' ? 'primary' : 'gray'" :variant="lang === 'tr' ? 'solid' : 'soft'" @click="lang = 'tr'">🇹🇷 TR</UButton>
          <UButton :color="lang === 'en' ? 'primary' : 'gray'" :variant="lang === 'en' ? 'solid' : 'soft'" @click="lang = 'en'">🇬🇧 EN</UButton>
        </UButtonGroup>
        <div class="text-sm text-gray-500 font-medium hidden sm:block">
          Geçerli Dil: <span class="text-primary font-bold">{{ lang === 'tr' ? 'Türkçe' : 'İngilizce' }}</span>
        </div>
      </div>

      <!-- save -->
      <div class="flex items-center gap-3">
        <UBadge v-if="saveErr" color="red" variant="soft">{{ saveErr }}</UBadge>
        <UBadge v-else-if="saveOk" color="green" variant="soft">✓ Kaydedildi</UBadge>
        <UBadge v-else-if="isDirty" color="amber" variant="soft">● Değişiklik var</UBadge>
        <UButton color="primary" icon="i-lucide-save" :loading="saving" :disabled="!isDirty" @click="saveAll">
          Kaydet
        </UButton>
      </div>
    </div>

    <!-- ─── LOADING ────────────────────────────────────────────────── -->
    <div v-if="pending" class="flex flex-col items-center justify-center p-24 text-gray-400">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-5xl mb-4" />
      <span class="font-medium text-lg">İçerikler Yükleniyor...</span>
    </div>

    <!-- ─── EDITOR BODY ────────────────────────────────────────────── -->
    <UContainer v-else class="py-10 max-w-5xl">
      <UTabs :items="tabItems" class="w-full">

        <!-- ═══════════════════════════════════════════════════════════
             HERO
        ════════════════════════════════════════════════════════════ -->
        <template #hero>
          <UCard class="mt-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <template #header>
              <div class="flex items-center gap-2 font-bold text-primary"><UIcon name="i-lucide-sparkles" /> Hero Bölümü</div>
            </template>

            <div class="flex flex-col gap-6">
              <UFormField label="Profil Fotoğrafı" class="md:col-span-2">
                <AdminImageUpload v-model="portfolio.photo" />
              </UFormField>
              <UFormField label="Üst Metin (Eyebrow)">
                <UInput :model-value="g('hero.eyebrow')" @update:model-value="s('hero.eyebrow',$event)" placeholder="Kim bu dijital gölge?" />
              </UFormField>
              <UFormField label="Sayfa Başlığı (Name)">
                <UInput :model-value="g('hero.name')" @update:model-value="s('hero.name',$event)" placeholder="Kişisel Portfolyom" />
              </UFormField>
              <UFormField label="Alt Başlık (Subtitle)">
                <UInput :model-value="g('hero.subtitle')" @update:model-value="s('hero.subtitle',$event)" placeholder="Ben Emre" />
              </UFormField>
              <UFormField label="CTA Buton Metni">
                <UInput :model-value="g('hero.cta')" @update:model-value="s('hero.cta',$event)" placeholder="Hakkımda Keşfet" />
              </UFormField>

              <UFormField label="Roller (Kayan Metinler)" class="md:col-span-2">
                <div class="flex flex-col gap-3">
                  <div v-for="(_, i) in gArr('hero.roles')" :key="i" class="flex gap-2 items-center">
                    <UInput :model-value="gArr('hero.roles')[i]" @update:model-value="setArrItem('hero.roles', i, $event)" class="flex-1" />
                    <UButton color="red" variant="soft" icon="i-lucide-trash" @click="removeArrItem('hero.roles', i)" />
                  </div>
                  <UButton color="gray" variant="ghost" icon="i-lucide-plus" @click="addArrItem('hero.roles', '')" class="w-fit">Rol Ekle</UButton>
                </div>
              </UFormField>
            </div>
          </UCard>
        </template>

        <!-- ═══════════════════════════════════════════════════════════
             HAKKIMDA
        ════════════════════════════════════════════════════════════ -->
        <template #about>
          <UCard class="mt-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <template #header>
              <div class="flex items-center gap-2 font-bold text-primary"><UIcon name="i-lucide-user" /> Hakkımda Bölümü</div>
            </template>
            <div class="flex flex-col gap-6">
              <UFormField label="Bölüm Etiketi">
                <UInput :model-value="g('about.label')" @update:model-value="s('about.label',$event)" />
              </UFormField>
              <UFormField label="Bölüm Başlığı">
                <UInput :model-value="g('about.title')" @update:model-value="s('about.title',$event)" />
              </UFormField>
              <UFormField label="Bio — Paragraf 1" class="md:col-span-2">
                <UTextarea :model-value="g('about.bio1')" resize :rows="3" @update:model-value="s('about.bio1',$event)" />
              </UFormField>
              <UFormField label="Bio — Paragraf 2" class="md:col-span-2">
                <UTextarea :model-value="g('about.bio2')" resize :rows="3" @update:model-value="s('about.bio2',$event)" />
              </UFormField>
              <UFormField label="Bio — Paragraf 3" class="md:col-span-2">
                <UTextarea :model-value="g('about.bio3')" resize :rows="2" @update:model-value="s('about.bio3',$event)" />
              </UFormField>

              <USeparator class="md:col-span-2 my-2" />

              <UFormField label="İstatistikler" class="md:col-span-2">
                <div class="flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div v-for="(stat, i) in portfolio.stats" :key="stat.labelKey" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <UCard class="text-center py-2" :ui="{ body: { padding: 'p-2 sm:p-2' } }">
                      <div class="text-xl font-bold text-primary truncate">{{ stat.value || '-' }}</div>
                      <div class="text-xs text-gray-500 truncate">{{ stat.labelKey.split('.').pop() }}</div>
                    </UCard>
                    <UFormField label="Değer">
                      <UInput v-model="portfolio.stats[i].value" placeholder="10+" />
                    </UFormField>
                    <UFormField :label="`Etiket (${lang})`">
                      <UInput :model-value="g(stat.labelKey)" @update:model-value="s(stat.labelKey,$event)" />
                    </UFormField>
                  </div>
                </div>
              </UFormField>

              <UFormField label="Uzmanlık Başlığı">
                <UInput :model-value="g('about.expertiseTitle')" @update:model-value="s('about.expertiseTitle',$event)" />
              </UFormField>
              <UFormField label="İlgi Alanları Başlığı">
                <UInput :model-value="g('about.interestsTitle')" @update:model-value="s('about.interestsTitle',$event)" />
              </UFormField>

              <UFormField label="Uzmanlık Alanları" class="col-span-1">
                <div class="flex flex-col gap-3">
                  <div v-for="(exp, i) in portfolio.expertise" :key="i" class="flex gap-2 items-center">
                    <UInput v-model="portfolio.expertise[i].icon" placeholder="i-lucide-star" class="w-14 shrink-0" />
                    <UInput :model-value="g(exp.key)" @update:model-value="s(exp.key,$event)" class="flex-1" />
                    <UButton color="red" variant="soft" icon="i-lucide-trash" @click="portfolio.expertise.splice(i,1)" />
                  </div>
                  <UButton color="gray" variant="ghost" icon="i-lucide-plus" @click="addExpertise" class="w-fit">Alan Ekle</UButton>
                </div>
              </UFormField>

              <UFormField label="İlgi Alanları" class="col-span-1">
                <div class="flex flex-col gap-3">
                  <div v-for="(intKey, i) in portfolio.interests" :key="i" class="flex gap-2 items-center">
                    <UInput :model-value="g(intKey)" @update:model-value="s(intKey,$event)" class="flex-1" />
                    <UButton color="red" variant="soft" icon="i-lucide-trash" @click="portfolio.interests.splice(i,1)" />
                  </div>
                  <UButton color="gray" variant="ghost" icon="i-lucide-plus" @click="addInterest" class="w-fit">Alan Ekle</UButton>
                </div>
              </UFormField>
            </div>
          </UCard>
        </template>

        <!-- ═══════════════════════════════════════════════════════════
             PROJELER
        ════════════════════════════════════════════════════════════ -->
        <template #projects>
          <UCard class="mt-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <template #header>
              <div class="flex items-center gap-2 font-bold text-primary"><UIcon name="i-lucide-folder-open" /> Bölüm Ayarları</div>
            </template>
            <div class="flex flex-col gap-6">
              <UFormField label="Bölüm Etiketi"><UInput :model-value="g('projects.label')" @update:model-value="s('projects.label',$event)" /></UFormField>
              <UFormField label="Bölüm Başlığı"><UInput :model-value="g('projects.title')" @update:model-value="s('projects.title',$event)" /></UFormField>
              <UFormField label="Bölüm Alt Başlığı"><UInput :model-value="g('projects.subtitle')" @update:model-value="s('projects.subtitle',$event)" /></UFormField>
            </div>
          </UCard>

          <UCard v-for="(proj, i) in portfolio.projects" :key="proj.id" class="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 outline outline-1 outline-transparent hover:outline-primary/20 transition-all">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-bold flex items-center gap-2 text-sm">
                  <UBadge :color="proj.type === 'arastirma' ? 'emerald' : 'purple'" variant="subtle">
                    {{ proj.type === 'arastirma' ? '🔬 Araştırma' : '✏️ Yazı' }} #{{ i+1 }}
                  </UBadge>
                </div>
                <div class="flex gap-1">
                  <UButton size="xs" color="gray" variant="soft" icon="i-lucide-arrow-up" :disabled="i===0" @click="moveUp(portfolio.projects, i)" />
                  <UButton size="xs" color="gray" variant="soft" icon="i-lucide-arrow-down" :disabled="i===portfolio.projects.length-1" @click="moveDown(portfolio.projects, i)" />
                  <UButton size="xs" color="red" variant="soft" icon="i-lucide-trash" @click="portfolio.projects.splice(i,1)" />
                </div>
              </div>
            </template>
            <div class="flex flex-col gap-6">
              <UFormField label="Kapak Görseli" class="md:col-span-2">
                <AdminImageUpload v-model="portfolio.projects[i].image" />
              </UFormField>
              <UFormField label="Başlık">
                <UInput :model-value="g(proj.titleKey)" @update:model-value="s(proj.titleKey,$event)" />
              </UFormField>
              <UFormField label="URL / Slug (ID)">
                <UInput v-model="portfolio.projects[i].id" />
              </UFormField>
              <UFormField label="Özet Açıklama" class="md:col-span-2">
                <UTextarea :model-value="g(proj.descriptionKey)" resize :rows="3" @update:model-value="s(proj.descriptionKey,$event)" />
              </UFormField>
              <UFormField label="İçerik / HTML / Markdown Gövdesi" class="md:col-span-2">
                <UTextarea v-model="portfolio.projects[i].body" resize :rows="10" placeholder="<b>Zengin içerik</b> girebilirsiniz..." />
              </UFormField>
              <UFormField label="Tür">
                <USelect v-model="portfolio.projects[i].type" :options="[{label:'Araştırma', value:'arastirma'}, {label:'Yazı', value:'yazi'}]" />
              </UFormField>
              <UFormField label="Kategori">
                <UInput v-model="portfolio.projects[i].category" />
              </UFormField>
              <UFormField label="Etiketler (Virgülle ayrılmış)" class="md:col-span-2">
                <UInput :model-value="proj.tags.join(', ')" @update:model-value="portfolio.projects[i].tags = $event.split(',').map((t:string) => t.trim()).filter(Boolean)" />
              </UFormField>
            </div>
          </UCard>

          <div class="my-6 flex flex-col sm:flex-row gap-4">
             <UButton block size="xl" color="primary" variant="solid" icon="i-lucide-file-plus" class="flex-1 py-6 text-lg tracking-wider font-bold shadow-xl justify-center" @click="addProject('arastirma')">YENİ ARAŞTIRMA (PROJE) EKLE</UButton>
             <UButton block size="xl" color="primary" variant="solid" icon="i-lucide-file-plus" class="flex-1 py-6 text-lg tracking-wider font-bold shadow-xl justify-center" @click="addProject('yazi')">YENİ YAZI (PROJE) EKLE</UButton>
          </div>
        </template>

        <!-- ═══════════════════════════════════════════════════════════
             YAZILAR
        ════════════════════════════════════════════════════════════ -->
        <template #articles>
          <UCard class="mt-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <template #header>
              <div class="flex items-center gap-2 font-bold text-primary"><UIcon name="i-lucide-file-text" /> Bölüm Ayarları</div>
            </template>
            <div class="flex flex-col gap-6">
              <UFormField label="Bölüm Etiketi"><UInput :model-value="g('articles.label')" @update:model-value="s('articles.label',$event)" /></UFormField>
              <UFormField label="Bölüm Başlığı"><UInput :model-value="g('articles.title')" @update:model-value="s('articles.title',$event)" /></UFormField>
              <UFormField label="Bölüm Alt Başlığı"><UInput :model-value="g('articles.subtitle')" @update:model-value="s('articles.subtitle',$event)" /></UFormField>
            </div>
          </UCard>

          <UCard v-for="(art, i) in portfolio.articles" :key="art.id" class="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-colors">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-bold flex items-center gap-2 text-sm">
                  <UBadge :color="art.type === 'dusunce' ? 'blue' : 'amber'" variant="subtle">
                    {{ art.type === 'dusunce' ? '💭 Düşünce' : '🔍 Analiz' }} #{{ i+1 }}
                  </UBadge>
                </div>
                <div class="flex gap-1">
                  <UButton size="xs" color="gray" variant="soft" icon="i-lucide-arrow-up" :disabled="i===0" @click="moveUp(portfolio.articles, i)" />
                  <UButton size="xs" color="gray" variant="soft" icon="i-lucide-arrow-down" :disabled="i===portfolio.articles.length-1" @click="moveDown(portfolio.articles, i)" />
                  <UButton size="xs" color="red" variant="soft" icon="i-lucide-trash" @click="portfolio.articles.splice(i,1)" />
                </div>
              </div>
            </template>

            <div class="flex flex-col gap-6">
              <UFormField label="Kapak Görseli" class="md:col-span-2">
                <AdminImageUpload v-model="portfolio.articles[i].image" />
              </UFormField>
              <UFormField label="Başlık">
                <UInput :model-value="g(art.titleKey)" @update:model-value="s(art.titleKey,$event)" />
              </UFormField>
              <UFormField label="URL / Slug">
                <UInput v-model="portfolio.articles[i].slug" />
              </UFormField>
              <UFormField label="Özet Yazı" class="md:col-span-2">
                <UTextarea :model-value="g(art.excerptKey)" resize :rows="3" @update:model-value="s(art.excerptKey,$event)" />
              </UFormField>
              <UFormField label="Tam İçerik (Gövde)" class="md:col-span-2">
                <UTextarea v-model="portfolio.articles[i].body" resize :rows="12" placeholder="Zengin içerik, başlıklar vb. HTML etiketleri..." />
              </UFormField>
              <UFormField label="Tür">
                <USelect v-model="portfolio.articles[i].type" :options="[{label:'Düşünce', value:'dusunce'}, {label:'Analiz', value:'analiz'}]" />
              </UFormField>
              <UFormField label="Kategori">
                <UInput v-model="portfolio.articles[i].category" />
              </UFormField>
              <UFormField label="Tarih">
                <UInput v-model="portfolio.articles[i].date" type="date" />
              </UFormField>
              <UFormField label="Okuma Süresi">
                <UInput :model-value="String(art.readMinutes)" type="number" @update:model-value="portfolio.articles[i].readMinutes = Number($event)" />
              </UFormField>
            </div>
          </UCard>

          <div class="my-6 flex flex-col sm:flex-row gap-4">
             <UButton block size="xl" color="primary" variant="solid" icon="i-lucide-file-text" class="flex-1 py-6 text-lg tracking-wider font-bold shadow-xl justify-center" @click="addArticle('dusunce')">YENİ DÜŞÜNCE YAZISI EKLE</UButton>
             <UButton block size="xl" color="primary" variant="solid" icon="i-lucide-file-text" class="flex-1 py-6 text-lg tracking-wider font-bold shadow-xl justify-center" @click="addArticle('analiz')">YENİ ANALİZ YAZISI EKLE</UButton>
          </div>
        </template>

        <!-- ═══════════════════════════════════════════════════════════
             REFERANSLAR
        ════════════════════════════════════════════════════════════ -->
        <template #testimonials>
          <UCard class="mt-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <template #header>
              <div class="flex items-center gap-2 font-bold text-primary"><UIcon name="i-lucide-quote" /> Bölüm Ayarları</div>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Bölüm Etiketi"><UInput :model-value="g('testimonials.label')" @update:model-value="s('testimonials.label',$event)" /></UFormField>
              <UFormField label="Bölüm Başlığı"><UInput :model-value="g('testimonials.title')" @update:model-value="s('testimonials.title',$event)" /></UFormField>
            </div>
          </UCard>

          <UCard v-for="(t, i) in portfolio.testimonials" :key="t.id" class="mb-6 shadow-sm border-gray-200 dark:border-gray-800">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="font-bold text-sm text-primary flex items-center gap-2">💬 {{ t.name || 'İsimsiz Referans' }}</div>
                <div class="flex gap-1">
                  <UButton size="xs" color="gray" variant="soft" icon="i-lucide-arrow-up" :disabled="i===0" @click="moveUp(portfolio.testimonials, i)" />
                  <UButton size="xs" color="gray" variant="soft" icon="i-lucide-arrow-down" :disabled="i===portfolio.testimonials.length-1" @click="moveDown(portfolio.testimonials, i)" />
                  <UButton size="xs" color="red" variant="soft" icon="i-lucide-trash" @click="portfolio.testimonials.splice(i,1)" />
                </div>
              </div>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="İsim"><UInput v-model="portfolio.testimonials[i].name" /></UFormField>
              <UFormField label="Kurum"><UInput v-model="portfolio.testimonials[i].organization" /></UFormField>
              <UFormField label="Unvan" class="md:col-span-2"><UInput :model-value="g(t.titleKey)" @update:model-value="s(t.titleKey,$event)" /></UFormField>
              <UFormField label="Referans Metni" class="md:col-span-2"><UTextarea :model-value="g(t.quoteKey)" resize :rows="3" @update:model-value="s(t.quoteKey,$event)" /></UFormField>
            </div>
          </UCard>

          <div class="my-6">
            <UButton block size="xl" color="primary" variant="solid" icon="i-lucide-message-square-plus" class="py-6 text-lg tracking-wider font-bold shadow-xl justify-center" @click="addTestimonial">YENİ REFERANS EKLENTİSİ EKLE</UButton>
          </div>
        </template>

        <!-- ═══════════════════════════════════════════════════════════
             İLETİŞİM
        ════════════════════════════════════════════════════════════ -->
        <template #contact>
          <UCard class="mt-6 shadow-sm border-gray-200 dark:border-gray-800">
            <template #header><div class="flex items-center gap-2 font-bold text-primary"><UIcon name="i-lucide-mail" /> İletişim Ayarları</div></template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Bölüm Etiketi"><UInput :model-value="g('contact.label')" @update:model-value="s('contact.label',$event)" /></UFormField>
              <UFormField label="Başlık"><UInput :model-value="g('contact.title')" @update:model-value="s('contact.title',$event)" /></UFormField>
              <UFormField label="Açıklama" class="md:col-span-2"><UTextarea :model-value="g('contact.subtitle')" :rows="2" @update:model-value="s('contact.subtitle',$event)" /></UFormField>
              
              <USeparator class="md:col-span-2 my-2" />
              
              <UFormField label="E-Posta Adresi"><UInput :model-value="g('contact.info.email')" @update:model-value="s('contact.info.email',$event)" /></UFormField>
              <UFormField label="Lokasyon"><UInput :model-value="g('contact.info.location')" @update:model-value="s('contact.info.location',$event)" /></UFormField>
              <UFormField label="Footer Telif Metni" class="md:col-span-2"><UInput :model-value="g('contact.copyright')" @update:model-value="s('contact.copyright',$event)" /></UFormField>

              <USeparator label="Form Alanları" class="md:col-span-2 my-2" />

              <UFormField label="İsim Etiketi"><UInput :model-value="g('contact.form.name')" @update:model-value="s('contact.form.name',$event)" /></UFormField>
              <UFormField label="İsim Placeholder"><UInput :model-value="g('contact.form.namePlaceholder')" @update:model-value="s('contact.form.namePlaceholder',$event)" /></UFormField>
              <UFormField label="E-posta Etiketi"><UInput :model-value="g('contact.form.email')" @update:model-value="s('contact.form.email',$event)" /></UFormField>
              <UFormField label="E-posta Placeholder"><UInput :model-value="g('contact.form.emailPlaceholder')" @update:model-value="s('contact.form.emailPlaceholder',$event)" /></UFormField>
              <UFormField label="Mesaj Etiketi"><UInput :model-value="g('contact.form.message')" @update:model-value="s('contact.form.message',$event)" /></UFormField>
              <UFormField label="Mesaj Placeholder"><UInput :model-value="g('contact.form.messagePlaceholder')" @update:model-value="s('contact.form.messagePlaceholder',$event)" /></UFormField>
              <UFormField label="Gönder Butonu"><UInput :model-value="g('contact.form.submit')" @update:model-value="s('contact.form.submit',$event)" /></UFormField>
              <UFormField label="Başarı Mesajı"><UInput :model-value="g('contact.form.success')" @update:model-value="s('contact.form.success',$event)" /></UFormField>
            </div>
          </UCard>
        </template>

        <!-- ═══════════════════════════════════════════════════════════
             SOSYAL
        ════════════════════════════════════════════════════════════ -->
        <template #socials>
          <UCard v-for="(soc, i) in portfolio.socials" :key="soc.id" class="mt-6 mb-6 shadow-sm border-gray-200 dark:border-gray-800">
            <template #header>
              <div class="flex justify-between items-center text-sm font-bold text-primary">
                 <div><UIcon :name="soc.icon || 'i-lucide-link'" class="mr-2"/> {{ soc.platform }} Kartı</div>
                 <div class="flex gap-1">
                   <UButton size="xs" color="gray" variant="soft" icon="i-lucide-arrow-up" :disabled="i===0" @click="moveUp(portfolio.socials, i)" />
                   <UButton size="xs" color="gray" variant="soft" icon="i-lucide-arrow-down" :disabled="i===portfolio.socials.length-1" @click="moveDown(portfolio.socials, i)" />
                   <UButton size="xs" color="red" variant="soft" icon="i-lucide-trash" @click="portfolio.socials.splice(i,1)" />
                 </div>
              </div>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Platform Türü">
                <USelect v-model="portfolio.socials[i].type" :options="PLATFORMS.map(p => ({ label: p.label, value: p.type }))" @update:model-value="setPlatform(i, PLATFORMS.find(x => x.type === $event)!)" />
              </UFormField>
              <UFormField label="Kullanıcı / Handle"><UInput v-model="portfolio.socials[i].handle" /></UFormField>
              <UFormField label="Adres URL" class="md:col-span-2"><UInput v-model="portfolio.socials[i].url" /></UFormField>
              
              <UFormField v-if="soc.type==='x'" label="Tweet Metni" class="md:col-span-2"><UTextarea v-model="portfolio.socials[i].text" :rows="3" /></UFormField>
              <UFormField v-if="['medium','linkedin'].includes(soc.type)" label="Başlık" class="md:col-span-2"><UInput v-model="portfolio.socials[i].title" /></UFormField>
              <UFormField v-if="['instagram','medium'].includes(soc.type)" label="Arka Plan Görseli" class="md:col-span-2"><AdminImageUpload v-model="portfolio.socials[i].image" /></UFormField>
            </div>
          </UCard>
          <div class="my-6">
            <UButton block size="xl" color="primary" variant="solid" icon="i-lucide-plus-circle" class="py-6 text-lg tracking-wider font-bold shadow-xl justify-center" @click="addSocial">YENİ OLAN KARTI OLUŞTUR</UButton>
          </div>
        </template>

        <!-- ═══════════════════════════════════════════════════════════
             NAV (UI Metinleri)
        ════════════════════════════════════════════════════════════ -->
        <template #nav>
           <UCard class="mt-6 border-gray-200 dark:border-gray-800">
             <template #header><div class="flex items-center gap-2 font-bold text-primary"><UIcon name="i-lucide-settings" /> Sabit UI Metinleri</div></template>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <USeparator label="Menü İsimleri" class="md:col-span-2" />
               <UFormField v-for="k in ['about','projects','references','articles','contact']" :key="k" :label="k.toUpperCase()">
                 <UInput :model-value="g(`nav.${k}`)" @update:model-value="s(`nav.${k}`,$event)" />
               </UFormField>
               <USeparator label="Sanal Asistan (Chat)" class="md:col-span-2 mt-4" />
               <UFormField label="Başlık"><UInput :model-value="g('chat.title')" @update:model-value="s('chat.title',$event)" /></UFormField>
               <UFormField label="Online Durum"><UInput :model-value="g('chat.online')" @update:model-value="s('chat.online',$event)" /></UFormField>
               <UFormField label="Hoşgeldin Mesajı" class="md:col-span-2"><UTextarea :model-value="g('chat.welcome')" :rows="3" @update:model-value="s('chat.welcome',$event)" /></UFormField>
               <UFormField label="Placeholder"><UInput :model-value="g('chat.placeholder')" @update:model-value="s('chat.placeholder',$event)" /></UFormField>
             </div>
           </UCard>
        </template>

      </UTabs>
    </UContainer>

    <!-- ─── STICKY SAVE BOTTOM ──────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade-slide-up">
        <div v-if="isDirty" class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-900 text-white rounded-2xl shadow-xl px-5 py-3 border border-gray-700">
          <div class="flex items-center gap-2 text-sm font-medium"><UIcon name="i-lucide-info" class="text-amber-400" /> Kaydedilmemiş veriler var</div>
          <UButton color="primary" icon="i-lucide-save" :loading="saving" @click="saveAll">Kaydet</UButton>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { deepGet, deepSet } from '~/utils/deepSet'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

// ── Tab Layout & Constants
const tabItems = [
  { key: 'hero',         slot: 'hero',         label: 'Hero',        icon: 'i-lucide-sparkles' },
  { key: 'about',        slot: 'about',        label: 'Hakkımda',    icon: 'i-lucide-user' },
  { key: 'projects',     slot: 'projects',     label: 'Projeler',    icon: 'i-lucide-folder-open' },
  { key: 'articles',     slot: 'articles',     label: 'Yazılar',     icon: 'i-lucide-file-text' },
  { key: 'testimonials', slot: 'testimonials', label: 'Referanslar', icon: 'i-lucide-quote' },
  { key: 'contact',      slot: 'contact',      label: 'İletişim',    icon: 'i-lucide-mail' },
  { key: 'socials',      slot: 'socials',      label: 'Sosyal Ağ',   icon: 'i-lucide-share-2' },
  { key: 'nav',          slot: 'nav',          label: 'UI Metinleri',icon: 'i-lucide-settings' },
]

const PLATFORMS = [
  { type: 'instagram', label: 'Instagram', icon: 'i-simple-icons-instagram', platform: 'Instagram' },
  { type: 'x',         label: 'X (Twitter)', icon: 'i-simple-icons-x',         platform: 'X' },
  { type: 'medium',    label: 'Medium',      icon: 'i-simple-icons-medium',    platform: 'Medium' },
  { type: 'linkedin',  label: 'LinkedIn',    icon: 'i-simple-icons-linkedin',  platform: 'LinkedIn' },
]

// ── State
const lang = ref<'tr' | 'en'>('tr')
const tr        = reactive<Record<string, unknown>>({})
const en        = reactive<Record<string, unknown>>({})
const portfolio = reactive<Record<string, any>>({
  photo: '', projects: [], testimonials: [], articles: [],
  expertise: [], interests: [], stats: [], socials: [],
})

const lastSaved = ref('')
const pending = ref(true)

async function loadAll() {
  const [trData, enData, pdData] = await Promise.all([
    $fetch<Record<string, unknown>>('/api/admin/content/tr'),
    $fetch<Record<string, unknown>>('/api/admin/content/en'),
    $fetch<Record<string, any>>('/api/admin/portfolio-data'),
  ])
  Object.assign(tr, JSON.parse(JSON.stringify(trData)))
  Object.assign(en, JSON.parse(JSON.stringify(enData)))
  Object.assign(portfolio, JSON.parse(JSON.stringify(pdData)))
  snapshot()
  pending.value = false
}

function snapshot() {
  lastSaved.value = JSON.stringify({ tr: toRaw(tr), en: toRaw(en), portfolio: toRaw(portfolio) })
}

onMounted(loadAll)

// ── Helpers
const loc = computed<Record<string, unknown>>(() => lang.value === 'tr' ? tr : en)

function g(path: string): string { return (deepGet(loc.value, path) as string) ?? '' }
function s(path: string, val: string) { deepSet(loc.value, path, val) }
function gArr(path: string): string[] { return (deepGet(loc.value, path) as string[]) ?? [] }
function setArrItem(path: string, idx: number, val: string) {
  const arr = [...gArr(path)]; arr[idx] = val; deepSet(loc.value, path, arr)
}
function addArrItem(path: string, val: string) {
  deepSet(loc.value, path, [...gArr(path), val])
}
function removeArrItem(path: string, idx: number) {
  deepSet(loc.value, path, gArr(path).filter((_, i) => i !== idx))
}

const isDirty = computed(() =>
  JSON.stringify({ tr: toRaw(tr), en: toRaw(en), portfolio: toRaw(portfolio) }) !== lastSaved.value
)

function moveUp<T>(arr: T[], idx: number) {
  if (idx === 0) return
  const c = [...arr];[c[idx-1], c[idx]] = [c[idx]!, c[idx-1]!]; arr.splice(0, arr.length, ...c)
}
function moveDown<T>(arr: T[], idx: number) {
  if (idx === arr.length-1) return
  const c = [...arr];[c[idx+1], c[idx]] = [c[idx]!, c[idx+1]!]; arr.splice(0, arr.length, ...c)
}

function addProject(type: 'arastirma' | 'yazi') {
  const ts = Date.now()
  const id = `proj-${ts}`
  const tKey = `projects.${id}.title`
  const dKey = `projects.${id}.description`
  deepSet(tr, tKey, ''); deepSet(tr, dKey, '')
  deepSet(en, tKey, ''); deepSet(en, dKey, '')
  portfolio.projects.push({ id, titleKey: tKey, descriptionKey: dKey, category: '', tags: [], type, image: '', body: '' })
}

function addArticle(type: 'dusunce' | 'analiz') {
  const ts = Date.now()
  const id = `art-${ts}`
  const tKey = `articles.${id}.title`
  const eKey = `articles.${id}.excerpt`
  deepSet(tr, tKey, ''); deepSet(tr, eKey, '')
  deepSet(en, tKey, ''); deepSet(en, eKey, '')
  portfolio.articles.push({
    id, titleKey: tKey, excerptKey: eKey, category: '',
    date: new Date().toISOString().slice(0,10), readMinutes: 5,
    slug: `yeni-yazi-${ts}`, type, image: '', body: ''
  })
}

function addTestimonial() {
  const ts = Date.now()
  const id = `test-${ts}`
  const qKey = `testimonials.${id}.quote`
  const jKey = `testimonials.${id}.title`
  deepSet(tr, qKey, ''); deepSet(tr, jKey, '')
  deepSet(en, qKey, ''); deepSet(en, jKey, '')
  portfolio.testimonials.push({ id, quoteKey: qKey, titleKey: jKey, name: '', organization: '' })
}

function addExpertise() {
  const ts = Date.now()
  const key = `about.expertise.alan${ts}`
  deepSet(tr, key, ''); deepSet(en, key, '')
  portfolio.expertise.push({ key, icon: 'i-lucide-star' })
}

function addInterest() {
  const ts = Date.now()
  const key = `about.interests.alan${ts}`
  deepSet(tr, key, ''); deepSet(en, key, '')
  portfolio.interests.push(key)
}

function addSocial() {
  portfolio.socials = portfolio.socials || []
  portfolio.socials.push({
    id: `soc-${Date.now()}`, platform: 'Instagram', type: 'instagram',
    handle: '@yeni', icon: 'i-simple-icons-instagram', url: 'https://instagram.com'
  })
}

function setPlatform(i: number, p: typeof PLATFORMS[number]) {
  portfolio.socials[i].type     = p.type
  portfolio.socials[i].platform = p.platform
  portfolio.socials[i].icon     = p.icon
}

// ── Save
const saving  = ref(false)
const saveOk  = ref(false)
const saveErr = ref('')

async function saveAll() {
  saving.value = true; saveOk.value = false; saveErr.value = ''
  try {
    await Promise.all([
      $fetch('/api/admin/content/tr',      { method: 'PUT', body: JSON.parse(JSON.stringify(tr)) }),
      $fetch('/api/admin/content/en',      { method: 'PUT', body: JSON.parse(JSON.stringify(en)) }),
      $fetch('/api/admin/portfolio-data',  { method: 'PUT', body: JSON.parse(JSON.stringify(portfolio)) }),
    ])
    snapshot()
    saveOk.value = true
    setTimeout(() => (saveOk.value = false), 4000)
  } catch (err: any) {
    saveErr.value = err?.data?.message ?? 'Kaydetme başarısız.'
    setTimeout(() => (saveErr.value = ''), 5000)
  } finally {
    saving.value = false
  }
}

onBeforeRouteLeave(() => {
  if (isDirty.value) return confirm('Kaydedilmemiş değişiklikler var. Ayrılmak istediğinden emin misin?')
})
</script>

<style scoped>
.fade-slide-up-enter-active, .fade-slide-up-leave-active { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
.fade-slide-up-enter-from, .fade-slide-up-leave-to { opacity: 0; transform: translate(-50%, 30px); }
</style>
