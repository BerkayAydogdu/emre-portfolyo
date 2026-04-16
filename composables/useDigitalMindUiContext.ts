/**
 * Tracks the active Digital Mind sidebar tab so the chatbot can describe
 * "what folder" the visitor is browsing (düşünceler, araştırmalar, etc.).
 */
export function useDigitalMindUiContext() {
  return useState('dm-chat-ui-context', () => ({
    label: '',
    filterType: '',
    source: '' as '' | 'projects' | 'articles',
  }))
}
