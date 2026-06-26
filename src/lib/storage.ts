import { writeFile, mkdir, unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { randomBytes } from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "materials")
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

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

export async function uploadFile(
  file: File,
  customName?: string
): Promise<UploadResult> {
  try {
    await ensureUploadDir()

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
      fileType: ext.replace(".", "").toUpperCase(),
    }
  } catch (error) {
    console.error("File upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    }
  }
}

export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    // Extract filename from URL
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