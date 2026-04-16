/** Shared character limits for CMS fields (admin UI). */
export const TITLE_MAX = 120
export const SHORT_DESC_MAX = 320
export const EXCERPT_MAX = 400

export function fieldHint(used: number, max: number) {
  return `${used} / ${max}`
}
