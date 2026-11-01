const MOCK_LATENCY_MS = 180

/** Runs against the in-memory db with a small delay, and clones so callers cannot mutate it. */
export const mockRequest = <T>(handler: () => T): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(structuredClone(handler()))
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Request failed'))
      }
    }, MOCK_LATENCY_MS)
  })

export const findOrThrow = <T extends { id: string }>(items: T[], id: string, label: string) => {
  const item = items.find((entry) => entry.id === id)
  if (!item) throw new Error(`${label} not found`)
  return item
}

export const createId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`
