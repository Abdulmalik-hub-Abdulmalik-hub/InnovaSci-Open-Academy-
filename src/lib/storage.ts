import { writeFile, mkdir, unlink, readdir, stat } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { randomBytes } from "crypto"

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "materials")
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const APP_URL = process.env.APP_URL || "http://localhost:3000"

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "application/zip",
  "application/x-rar-compressed",
]

export interface UploadResult {
  success: boolean
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  storageType?: string
  error?: string
}

export interface FileInfo {
  originalName: string
  storedName: string
  fileUrl: string
  fileSize: number
  fileType: string
  mimeType: string
}

// S3 Configuration
interface S3Config {
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  endpoint?: string
}

function getS3Config(): S3Config | null {
  if (process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.AWS_S3_BUCKET) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION || "us-east-1",
      endpoint: process.env.AWS_S3_ENDPOINT,
    }
  }
  return null
}

// Determine file type category
export function getFileTypeCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "IMAGE"
  if (mimeType.startsWith("video/")) return "VIDEO"
  if (mimeType.startsWith("audio/")) return "AUDIO"
  if (mimeType.includes("pdf") || mimeType.includes("document") || 
      mimeType.includes("presentation") || mimeType.includes("spreadsheet")) return "DOCUMENT"
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("compressed")) return "ARCHIVE"
  return "OTHER"
}

export async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export function getFileExtension(mimeType: string, originalName: string): string {
  const mimeToExt: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "application/zip": ".zip",
    "application/x-rar-compressed": ".rar",
  }

  return mimeToExt[mimeType] || path.extname(originalName)
}

// Generate S3 presigned URL for upload
export async function generateUploadUrl(
  fileName: string,
  mimeType: string
): Promise<{ uploadUrl: string; fileUrl: string; key: string } | null> {
  const s3Config = getS3Config()
  if (!s3Config) return null

  try {
    const ext = path.extname(fileName)
    const key = `uploads/${Date.now()}_${randomBytes(8).toString("hex")}${ext}`
    
    // For S3, we'll use a PUT presigned URL
    const signedUrlExpireSeconds = 3600 // 1 hour
    
    // Use AWS S3 presigned URL generation
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner")
    
    const client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      ...(s3Config.endpoint && { endpoint: s3Config.endpoint }),
    })

    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      ContentType: mimeType,
    })

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: signedUrlExpireSeconds })
    const fileUrl = s3Config.endpoint 
      ? `${s3Config.endpoint}/${s3Config.bucket}/${key}`
      : `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`

    return { uploadUrl, fileUrl, key }
  } catch (error) {
    console.error("S3 presigned URL error:", error)
    return null
  }
}

// Generate signed URL for downloading/viewing
export async function generateSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
  const s3Config = getS3Config()
  
  // If local storage, just return the URL
  if (!s3Config || fileUrl.startsWith("/")) {
    return `${APP_URL}${fileUrl}`
  }

  try {
    // Extract key from URL
    const key = fileUrl.replace(
      `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/`,
      ""
    ).replace(`${s3Config.endpoint}/${s3Config.bucket}/`, "")

    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3")
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner")

    const client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    })

    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    })

    return await getSignedUrl(client, command, { expiresIn })
  } catch (error) {
    console.error("Generate signed URL error:", error)
    return fileUrl
  }
}

export async function uploadFile(
  file: File,
  customName?: string
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `File type "${file.type}" is not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, Images, Videos, Audio, ZIP, RAR`,
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      }
    }

    // Check if using S3
    const s3Config = getS3Config()
    if (s3Config) {
      // Upload to S3
      const ext = getFileExtension(file.type, file.name)
      const timestamp = Date.now()
      const randomStr = randomBytes(8).toString("hex")
      const baseName = customName
        ? customName.replace(/[^a-zA-Z0-9-_]/g, "_")
        : path.parse(file.name).name.replace(/[^a-zA-Z0-9-_]/g, "_")
      const storedName = `${baseName}_${timestamp}_${randomStr}${ext}`
      const key = `uploads/${storedName}`

      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
      
      const client = new S3Client({
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
      })

      const buffer = Buffer.from(await file.arrayBuffer())
      
      await client.send(new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }))

      const fileUrl = s3Config.endpoint
        ? `${s3Config.endpoint}/${s3Config.bucket}/${key}`
        : `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`

      return {
        success: true,
        fileUrl,
        fileName: storedName,
        fileSize: file.size,
        fileType: getFileTypeCategory(file.type),
        storageType: "s3",
      }
    }

    // Fall back to local storage
    await ensureUploadDir()

    // Generate unique filename
    const ext = getFileExtension(file.type, file.name)
    const timestamp = Date.now()
    const randomStr = randomBytes(8).toString("hex")
    const baseName = customName
      ? customName.replace(/[^a-zA-Z0-9-_]/g, "_")
      : path.parse(file.name).name.replace(/[^a-zA-Z0-9-_]/g, "_")
    const storedName = `${baseName}_${timestamp}_${randomStr}${ext}`

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(UPLOAD_DIR, storedName)
    await writeFile(filePath, buffer)

    // Return the public URL
    const fileUrl = `/uploads/materials/${storedName}`

    return {
      success: true,
      fileUrl,
      fileName: storedName,
      fileSize: file.size,
      fileType: getFileTypeCategory(file.type),
      storageType: "local",
    }
  } catch (error) {
    console.error("File upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    }
  }
}

export async function deleteFile(fileUrl: string, storageType: string = "local"): Promise<boolean> {
  try {
    if (storageType === "s3") {
      const s3Config = getS3Config()
      if (!s3Config) return false

      // Extract key from URL
      const key = fileUrl.replace(
        `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/`,
        ""
      ).replace(`${s3Config.endpoint}/${s3Config.bucket}/`, "")

      const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3")

      const client = new S3Client({
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
      })

      await client.send(new DeleteObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
      }))

      return true
    }

    // Local storage deletion
    const urlParts = fileUrl.split("/")
    const fileName = urlParts[urlParts.length - 1]

    if (!fileName) {
      return false
    }

    const filePath = path.join(UPLOAD_DIR, fileName)

    if (existsSync(filePath)) {
      await unlink(filePath)
      return true
    }

    return false
  } catch (error) {
    console.error("File deletion error:", error)
    return false
  }
}

// Scan local storage directory for files
export async function scanLocalStorage(): Promise<{
  files: { name: string; path: string; size: number; modified: Date }[]
  totalSize: number
}> {
  await ensureUploadDir()

  const files: { name: string; path: string; size: number; modified: Date }[] = []
  let totalSize = 0

  async function scanDir(dirPath: string) {
    const entries = await readdir(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      
      if (entry.isDirectory()) {
        await scanDir(fullPath)
      } else if (entry.isFile()) {
        const stats = await stat(fullPath)
        files.push({
          name: entry.name,
          path: fullPath.replace(process.cwd() + "/public", ""),
          size: stats.size,
          modified: stats.mtime,
        })
        totalSize += stats.size
      }
    }
  }

  await scanDir(UPLOAD_DIR)
  
  return { files, totalSize }
}

export function getFileInfoFromUrl(fileUrl: string): FileInfo | null {
  try {
    const urlParts = fileUrl.split("/")
    const fileName = urlParts[urlParts.length - 1]
    const ext = path.extname(fileName).toLowerCase()

    const extToMime: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".txt": "text/plain",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
    }

    return {
      originalName: fileName,
      storedName: fileName,
      fileUrl,
      fileSize: 0,
      fileType: ext.replace(".", "").toUpperCase(),
      mimeType: extToMime[ext] || "application/octet-stream",
    }
  } catch {
    return null
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}