<template>
  <div class="tag-input">
    <div v-if="modelValue.length" class="tag-chips" role="list">
      <UBadge
        v-for="(tag, i) in modelValue"
        :key="`${tag}-${i}`"
        color="neutral"
        variant="subtle"
        size="sm"
        class="tag-chip"
        role="listitem"
      >
        <span class="tag-text">{{ tag }}</span>
        <button
          type="button"
          class="tag-remove"
          :aria-label="removeLabel(tag)"
          @click="remove(i)"
        >
          <UIcon name="i-lucide-x" class="tag-remove-icon" />
        </button>
      </UBadge>
    </div>
    <UInput
      v-model="draft"
      :placeholder="placeholder"
      size="md"
      class="tag-field"
      @keydown.enter.prevent="commit"
      @keydown="onKeydown"
    />
    <p v-if="hint" class="tag-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string[]
    placeholder?: string
    hint?: string
  }>(),
  {
    placeholder: 'Etiket yazıp Enter',
    hint: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
}>()

const draft = ref('')

function commit() {
  const t = draft.value.trim().replace(/^[,;]+|[,;]+$/g, '')
  if (!t) {
    draft.value = ''
    return
  }
  if (props.modelValue.includes(t)) {
    draft.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, t])
  draft.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === ',' || e.key === ';') {
    e.preventDefault()
    commit()
  }
}

function remove(i: number) {
  const next = props.modelValue.filter((_, j) => j !== i)
  emit('update:modelValue', next)
}

function removeLabel(tag: string) {
  return `"${tag}" etiketini kaldır`
}
</script>

<style scoped>
.tag-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
}

.tag-chip {
  display: inline-flex !important;
  align-items: center;
  gap: 0.25rem;
  max-width: 100%;
  padding-right: 0.15rem !important;
}

.tag-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 14rem;
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem;
  margin: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  opacity: 0.65;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
}

.tag-remove:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

.tag-remove-icon {
  width: 0.85rem;
  height: 0.85rem;
}

.tag-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}
</style>
