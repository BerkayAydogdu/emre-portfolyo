export interface ChatPageContextPayload {
  kind: 'home-section' | 'project' | 'article' | 'other'
  path: string
  /** Short line: where the user is (Turkish or English ok — model handles both) */
  where: string
  /** Extra text for "what is this about" questions */
  detail?: string
}
