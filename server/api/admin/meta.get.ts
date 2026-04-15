import { getContentMeta } from '~/server/utils/kv'

export default defineEventHandler(async () => {
  return await getContentMeta()
})
