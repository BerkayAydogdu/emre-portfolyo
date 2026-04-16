import { put } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, message: 'No form data.' })

  const file = form.find(f => f.name === 'file')
  if (!file || !file.data) throw createError({ statusCode: 400, message: 'No file found.' })

  const filename = file.filename ?? `upload-${Date.now()}`
  const contentType = file.type ?? 'application/octet-stream'

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw createError({ statusCode: 500, message: 'BLOB_READ_WRITE_TOKEN not set.' })

  const blob = await put(filename, file.data, {
    access: 'public',
    contentType,
    token,
  })

  return { url: blob.url }
})
