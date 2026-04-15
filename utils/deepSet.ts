/**
 * Set a nested value on an object by a dot-separated path.
 * e.g. deepSet(obj, 'a.b.c', 'value')
 */
export function deepSet(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
  current[keys[keys.length - 1]!] = value
}

/**
 * Get a nested value from an object by a dot-separated path.
 */
export function deepGet(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}
