/** Ids for rows added inside a form, before they are saved. */
export const createId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`
