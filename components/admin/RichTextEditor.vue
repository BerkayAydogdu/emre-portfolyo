<template>
  <div class="rte-wrapper" :class="{ 'rte-wrapper--fullscreen': fullscreen }">
    <!-- Toolbar -->
    <div class="rte-toolbar" v-if="editor">
      <span class="toolbar-label">Yapı</span>
      <div class="toolbar-group">
        <button
          v-for="h in headingLevels"
          :key="h"
          class="tb-btn"
          :class="{ active: editor.isActive('heading', { level: h }) }"
          :title="`Başlık ${h}`"
          @click="editor.chain().focus().toggleHeading({ level: h }).run()"
        >
          H{{ h }}
        </button>
      </div>

      <div class="toolbar-sep" />

      <span class="toolbar-label">Biçim</span>
      <div class="toolbar-group">
        <button
          class="tb-btn"
          :class="{ active: editor.isActive('bold') }"
          title="Kalın"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <strong>B</strong>
        </button>
        <button
          class="tb-btn"
          :class="{ active: editor.isActive('italic') }"
          title="İtalik"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <em>I</em>
        </button>
        <button
          class="tb-btn"
          :class="{ active: editor.isActive('underline') }"
          title="Altı Çizili"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <span style="text-decoration:underline">U</span>
        </button>
        <button
          class="tb-btn"
          :class="{ active: editor.isActive('strike') }"
          title="Üstü Çizili"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <s>S</s>
        </button>
      </div>

      <div class="toolbar-sep" />

      <span class="toolbar-label">Liste</span>
      <div class="toolbar-group">
        <button
          class="tb-btn"
          :class="{ active: editor.isActive('bulletList') }"
          title="Madde Listesi"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          ≡
        </button>
        <button
          class="tb-btn"
          :class="{ active: editor.isActive('orderedList') }"
          title="Numaralı Liste"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          1.
        </button>
        <button
          class="tb-btn"
          :class="{ active: editor.isActive('blockquote') }"
          title="Alıntı"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          "
        </button>
        <button
          class="tb-btn"
          :class="{ active: editor.isActive('codeBlock') }"
          title="Kod Bloğu"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          &lt;/&gt;
        </button>
      </div>

      <div class="toolbar-sep" />

      <span class="toolbar-label">Ek</span>
      <div class="toolbar-group">
        <button class="tb-btn" title="Yatay Çizgi" @click="editor.chain().focus().setHorizontalRule().run()">
          —
        </button>
        <button
          class="tb-btn"
          :class="{ active: linkActive }"
          title="Link Ekle/Kaldır"
          @click="toggleLink"
        >
          🔗
        </button>
      </div>

      <div class="toolbar-sep" />

      <span class="toolbar-label">Geçmiş</span>
      <div class="toolbar-group">
        <button class="tb-btn" title="Geri Al" @click="editor.chain().focus().undo().run()">
          ↩
        </button>
        <button class="tb-btn" title="İleri Al" @click="editor.chain().focus().redo().run()">
          ↪
        </button>
      </div>

      <div class="toolbar-group ml-auto">
        <button
          type="button"
          class="tb-btn tb-btn-sm"
          :title="fullscreen ? 'Tam ekrandan çık' : 'Tam ekran'"
          @click="fullscreen = !fullscreen"
        >
          {{ fullscreen ? '⤓' : '⤢' }}
        </button>
        <button
          class="tb-btn tb-btn-sm"
          :class="{ active: showHtml }"
          title="HTML Düzenle"
          @click="toggleHtmlMode"
        >
          HTML
        </button>
      </div>
    </div>

    <!-- Visual editor -->
    <EditorContent v-if="!showHtml" :editor="editor" class="rte-content" />

    <!-- Raw HTML fallback -->
    <textarea
      v-else
      v-model="rawHtml"
      class="rte-html"
      spellcheck="false"
      @blur="syncFromHtml"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted, onUnmounted, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const headingLevels = [1, 2, 3] as const

const showHtml = ref(false)
const fullscreen = ref(false)
const rawHtml = ref(props.modelValue ?? '')

function onKeyEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && fullscreen.value) fullscreen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeyEscape)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyEscape)
})

const editor = useEditor({
  content: props.modelValue ?? '',
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder ?? 'İçeriği buraya yazın…' }),
  ],
  onUpdate({ editor }) {
    const html = editor.getHTML()
    rawHtml.value = html
    emit('update:modelValue', html)
  },
})

// sync when parent changes value externally
watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  const current = editor.value.getHTML()
  if (val !== current) {
    editor.value.commands.setContent(val ?? '', { emitUpdate: false })
    rawHtml.value = val ?? ''
  }
})

function toggleHtmlMode() {
  if (!showHtml.value) {
    rawHtml.value = editor.value?.getHTML() ?? ''
  }
  showHtml.value = !showHtml.value
}

function syncFromHtml() {
  editor.value?.commands.setContent(rawHtml.value, { emitUpdate: false })
  emit('update:modelValue', rawHtml.value)
}

const linkActive = computed(() => editor.value?.isActive('link') ?? false)

function toggleLink() {
  if (!editor.value) return
  if (editor.value.isActive('link')) {
    editor.value.chain().focus().unsetLink().run()
  } else {
    const url = prompt('URL girin:', 'https://')
    if (url) editor.value.chain().focus().setLink({ href: url }).run()
  }
}

onBeforeUnmount(() => editor.value?.destroy())
</script>

<style scoped>
.rte-wrapper {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  overflow: hidden;
  background: #ffffff;
  color: #111827;
  color-scheme: light;
  display: flex;
  flex-direction: column;
}

.rte-wrapper--fullscreen {
  position: fixed;
  inset: 1rem;
  z-index: 200;
  max-height: none !important;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
}

.rte-wrapper--fullscreen .rte-content {
  max-height: calc(100vh - 8rem);
  flex: 1;
}

.rte-wrapper--fullscreen .rte-html {
  max-height: calc(100vh - 8rem);
}

/* ── Toolbar ── */
.toolbar-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin-right: 0.15rem;
  user-select: none;
}

.rte-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.5rem 0.65rem;
  background: linear-gradient(to bottom, #fafafa, #f4f4f5);
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-group {
  display: flex;
  gap: 0.1rem;
  align-items: center;
}

.ml-auto { margin-left: auto; }

.toolbar-sep {
  width: 1px;
  height: 1.25rem;
  background: #e5e7eb;
  margin: 0 0.25rem;
}

.tb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 0.25rem;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
  line-height: 1;
  font-family: inherit;
}

.tb-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.tb-btn.active {
  background: #111827;
  color: #fff;
}

.tb-btn-sm {
  font-size: 0.7rem;
  padding: 0 0.4rem;
}

/* ── Editor content area ── */
.rte-content {
  min-height: 200px;
  max-height: 480px;
  overflow-y: auto;
  padding: 1rem 1.1rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #111827;
  cursor: text;
}

.rte-content :deep(.ProseMirror) {
  outline: none;
  min-height: 160px;
}

.rte-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
  float: left;
  height: 0;
}

.rte-content :deep(h1) { font-size: 1.6rem; font-weight: 800; margin: 1rem 0 0.5rem; color: #111827; }
.rte-content :deep(h2) { font-size: 1.35rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #111827; }
.rte-content :deep(h3) { font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.4rem; color: #111827; }
.rte-content :deep(p)  { margin: 0 0 0.75rem; }
.rte-content :deep(strong) { font-weight: 700; }
.rte-content :deep(em) { font-style: italic; }
.rte-content :deep(u) { text-decoration: underline; }
.rte-content :deep(s) { text-decoration: line-through; }

.rte-content :deep(blockquote) {
  border-left: 3px solid #7c3aed;
  padding: 0.5rem 1rem;
  margin: 0.75rem 0;
  background: #faf5ff;
  border-radius: 0 8px 8px 0;
  color: #6d28d9;
  font-style: italic;
}

.rte-content :deep(ul) { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
.rte-content :deep(ol) { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
.rte-content :deep(li) { margin-bottom: 0.2rem; }

.rte-content :deep(code) {
  background: #f3f4f6;
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #7c3aed;
}

.rte-content :deep(pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.rte-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.rte-content :deep(hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 1rem 0;
}

.rte-content :deep(a) {
  color: #7c3aed;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ── Raw HTML textarea ── */
.rte-html {
  min-height: 200px;
  max-height: 480px;
  width: 100%;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #374151;
  background: #f9fafb;
  border: none;
  resize: vertical;
  outline: none;
}
</style>
