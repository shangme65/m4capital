/**
 * Client-side image compression utility
 * Compresses images to reduce file size while maintaining acceptable quality
 * for document uploads (KYC, etc.)
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  maxSizeKB: 500, // Target max size per image
};

/**
 * Compress an image file using Canvas API
 * Automatically adjusts quality to meet target size
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Skip non-image files (like PDFs)
  if (!file.type.startsWith('image/')) {
    return file;
  }
  
  // Skip files already under target size
  if (file.size <= (opts.maxSizeKB! * 1024)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const maxW = opts.maxWidth!;
        const maxH = opts.maxHeight!;
        
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try to compress to target size by adjusting quality
        let quality = opts.quality!;
        const targetSize = opts.maxSizeKB! * 1024;
        const mimeType = 'image/jpeg'; // Always output JPEG for better compression
        
        const tryCompress = (q: number): Promise<Blob> => {
          return new Promise((res) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  res(blob);
                } else {
                  reject(new Error('Failed to compress image'));
                }
              },
              mimeType,
              q
            );
          });
        };
        
        // Iteratively reduce quality until we hit target size
        const compressToTarget = async () => {
          let blob = await tryCompress(quality);
          let attempts = 0;
          
          while (blob.size > targetSize && quality > 0.1 && attempts < 10) {
            quality -= 0.1;
            blob = await tryCompress(quality);
            attempts++;
          }
          
          // Create new file from blob
          const compressedFile = new File(
            [blob],
            // Change extension to .jpg since we're converting to JPEG
            file.name.replace(/\.[^.]+$/, '.jpg'),
            { type: mimeType }
          );
          
          console.log(
            `Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (quality: ${quality.toFixed(2)})`
          );
          
          resolve(compressedFile);
        };
        
        compressToTarget();
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: (File | null)[],
  options?: CompressionOptions
): Promise<(File | null)[]> {
  return Promise.all(
    files.map((file) => (file ? compressImage(file, options) : null))
  );
}

/**
 * Check if a file needs compression (over target size)
 */
export function needsCompression(file: File, maxSizeKB: number = 500): boolean {
  return file.type.startsWith('image/') && file.size > maxSizeKB * 1024;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
