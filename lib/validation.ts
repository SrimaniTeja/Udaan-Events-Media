import type { FileType } from "@/lib/types";

// Allowed MIME types for RAW uploads (Cameraman)
const ALLOWED_RAW_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "video/mp4",
  "video/quicktime",
] as const;

// Allowed MIME types for FINAL uploads (Editor)
const ALLOWED_FINAL_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "video/mp4",
] as const;

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File, fileType: FileType): ValidationResult {
  // Check MIME type
  const allowedMimeTypes =
    fileType === "RAW" ? ALLOWED_RAW_MIME_TYPES : ALLOWED_FINAL_MIME_TYPES;

  if (!allowedMimeTypes.includes(file.type as any)) {
    const allowedList = allowedMimeTypes.join(", ");
    return {
      valid: false,
      error: `Invalid file type. Allowed types for ${fileType} uploads: ${allowedList}`,
    };
  }

  // Check file size
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const maxSize = isImage ? MAX_IMAGE_SIZE : isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    return {
      valid: false,
      error: `File size (${fileSizeMB} MB) exceeds maximum allowed size (${maxSizeMB} MB) for ${isImage ? "images" : "videos"}`,
    };
  }

  return { valid: true };
}

export function getAllowedMimeTypes(fileType: FileType): readonly string[] {
  return fileType === "RAW" ? ALLOWED_RAW_MIME_TYPES : ALLOWED_FINAL_MIME_TYPES;
}

