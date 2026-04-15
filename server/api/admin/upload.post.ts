import { put } from '@vercel/blob'

// Ensure Nitro knows how to parse multi-part form data implicitly or we use the builtin Nitro helper.
export default defineEventHandler(async (event) => {
  try {
    const files = await readMultipartFormData(event)
    
    if (!files || files.length === 0) {
      throw createError({ statusCode: 400, message: 'No file uploaded' })
    }

    // the first uploaded file chunk
    const uploadedFile = files[0]
    
    if (!uploadedFile.filename || !uploadedFile.data) {
      throw createError({ statusCode: 400, message: 'Invalid file upload data' })
    }

    // Safely figure out the file extension
    const parts = uploadedFile.filename.split('.')
    const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : 'png'
    
    // Basic image security layer
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    if (!allowedExts.includes(ext as string)) {
      throw createError({ statusCode: 400, message: 'Invalid file type. Only images allowed.' })
    }

    // Create a random, safe filename
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1000)}`
    const newFilename = `portfolio-${uniqueId}.${ext}`
    
    // Check for the ENV variable. Vercel sets this automatically in their runtime, 
    // but in local, we need it in .env for this function to work.
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      throw createError({ statusCode: 500, message: 'BLOB_READ_WRITE_TOKEN is missing in the environment variables.' })
    }

    // Stream the binary data directly to Vercel's Blob Storage securely
    const blob = await put(newFilename, uploadedFile.data, {
      access: 'public',
      token: token // specify token explicitly
    })
    
    // Return the absolute Cloud URL
    return { 
      success: true, 
      url: blob.url 
    }
    
  } catch (err: any) {
    console.error('Vercel Blob Upload Error:', err)
    throw createError({
      statusCode: Number(err.statusCode) || 500,
      message: err.message || 'File upload failed or Vercel Blob is not configured.'
    })
  }
})
