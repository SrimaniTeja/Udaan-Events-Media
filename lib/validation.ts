import type { FileType } from "@/lib/types";

// Allowed MIME types for FINAL uploads (Editor)
const ALLOWED_FINAL_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "video/mp4",
] as const;

// File size limits (in bytes)
const MAX_FILE_SIZE = 64 * 1024 * 1024 * 1024; // 64 GB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Blocked executable/system file extensions
const BLOCKED_EXTENSIONS = [
  ".exe", ".dll", ".bat", ".cmd", ".com", ".scr", ".vbs", ".js", ".jar", ".apk",
  ".deb", ".rpm", ".msi", ".app", ".dmg", ".pkg", ".sh", ".bin", ".run", ".elf",
  ".sys", ".drv", ".ocx", ".cpl", ".msp", ".msu", ".bz2", ".xz", ".iso", ".img", ".dmg",
   ".toast", ".vcd",
];

// Blocked MIME types for executables
const BLOCKED_MIME_TYPES = [
  "application/x-msdownload",
  "application/x-ms-installer",
  "application/vnd.android.package-archive",
  "application/x-debian-package",
  "application/x-rpm",
  "application/x-executable",
  "application/x-sharedlib",
  "application/x-elf",
];

export function validateFile(file: File, fileType: FileType): ValidationResult {
  // For RAW uploads (Cameraman), accept any file type except executables
  if (fileType === "RAW") {
    // Check blocked MIME types
    if (BLOCKED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "Executable and system files are not allowed. Please upload media files only.",
      };
    }

    // Check blocked file extensions (case-insensitive)
    const fileName = file.name.toLowerCase();
    const hasBlockedExtension = BLOCKED_EXTENSIONS.some((ext) => fileName.endsWith(ext.toLowerCase()));
    if (hasBlockedExtension) {
      return {
        valid: false,
        error: `File type "${fileName.split('.').pop()}" is not allowed. Please upload media files only.`,
      };
    }

    // Check file size (64GB max for RAW)
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeGB = Math.round(MAX_FILE_SIZE / (1024 * 1024 * 1024));
      const fileSizeGB = (file.size / (1024 * 1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size (${fileSizeGB} GB) exceeds maximum allowed size (${maxSizeGB} GB)`,
      };
    }

    return { valid: true };
  }

  // For FINAL uploads (Editor), keep strict validation
  const allowedMimeTypes = ALLOWED_FINAL_MIME_TYPES;
  if (!allowedMimeTypes.includes(file.type as any)) {
    const allowedList = allowedMimeTypes.join(", ");
    return {
      valid: false,
      error: `Invalid file type. Allowed types for FINAL uploads: ${allowedList}`,
    };
  }

  // Check file size for FINAL (64GB max)
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeGB = Math.round(MAX_FILE_SIZE / (1024 * 1024 * 1024));
    const fileSizeGB = (file.size / (1024 * 1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeGB} GB) exceeds maximum allowed size (${maxSizeGB} GB)`,
    };
  }

  return { valid: true };
}

export function getAllowedMimeTypes(fileType: FileType): readonly string[] {
  // For RAW, return empty array to allow any type (validation is done differently)
  // For FINAL, return strict list
  return fileType === "RAW" ? [] : ALLOWED_FINAL_MIME_TYPES;
}

