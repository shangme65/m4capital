/**
 * Cloudinary Upload Helper
 * Handles client-side compression and direct upload to Cloudinary CDN
 * Bypasses Vercel's 4.5MB limit since files go directly to CDN
 */

import { compressImage } from "./compress-image";

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

interface UploadOptions {
  folder?: string;
  compress?: boolean;
  maxSizeKB?: number;
  maxWidth?: number;
  maxHeight?: number;
  onProgress?: (percent: number) => void;
}

/**
 * Get upload signature from our API
 */
async function getUploadSignature(folder: string, publicId: string): Promise<UploadSignature> {
  const response = await fetch("/api/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, publicId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get upload signature");
  }

  return response.json();
}

/**
 * Generate a unique public ID for the file
 */
function generatePublicId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Upload a single file to Cloudinary
 * Compresses images before upload for faster transfers
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = "kyc-documents",
    compress = true,
    maxSizeKB = 800,
    maxWidth = 2048,
    maxHeight = 2048,
    onProgress,
  } = options;

  // Compress image if needed (skip PDFs)
  let fileToUpload = file;
  if (compress && file.type.startsWith("image/")) {
    try {
      fileToUpload = await compressImage(file, {
        maxSizeKB,
        maxWidth,
        maxHeight,
        quality: 0.85,
      });
      console.log(
        `Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(fileToUpload.size / 1024).toFixed(1)}KB`
      );
    } catch (compressError) {
      console.warn("Compression failed, uploading original:", compressError);
      fileToUpload = file;
    }
  }

  // Generate unique public ID
  const publicId = generatePublicId(folder.replace("/", "_"));

  // Get signed upload credentials
  const { signature, timestamp, cloudName, apiKey } = await getUploadSignature(
    folder,
    publicId
  );

  // Prepare form data for direct upload
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  // Upload directly to Cloudinary (bypasses Vercel limits!)
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  });
}

/**
 * Upload multiple files to Cloudinary in parallel
 * Returns a record of { fieldName: secureUrl }
 */
export async function uploadMultipleToCloudinary(
  files: { file: File; name: string }[],
  folder: string = "kyc-documents",
  onOverallProgress?: (percent: number) => void
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const progressMap = new Map<string, number>();
  const totalFiles = files.length;

  const updateOverallProgress = () => {
    if (onOverallProgress) {
      let totalProgress = 0;
      progressMap.forEach((value) => {
        totalProgress += value;
      });
      onOverallProgress(Math.round(totalProgress / totalFiles));
    }
  };

  // Upload all files in parallel
  const uploadPromises = files.map(async ({ file, name }) => {
    progressMap.set(name, 0);

    const result = await uploadToCloudinary(file, {
      folder: `${folder}/${name}`,
      onProgress: (percent) => {
        progressMap.set(name, percent);
        updateOverallProgress();
      },
    });

    results[name] = result.secureUrl;
    return result;
  });

  await Promise.all(uploadPromises);
  return results;
}

/**
 * Check if Cloudinary is configured
 */
export async function isCloudinaryConfigured(): Promise<boolean> {
  try {
    const response = await fetch("/api/upload/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "test", publicId: "test" }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
