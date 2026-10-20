import { supabase } from '../utils/supabaseClient';

const BUCKET_NAME = 'oleveci-media';

/**
 * Converts a base64 Data URL to a native Blob object
 */
export function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string; extension: string } | null {
  try {
    const parts = dataUrl.split(';base64,');
    if (parts.length !== 2) return null;
    const mimeType = parts[0].replace('data:', '');
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    let extension = 'jpg';
    if (mimeType.includes('png')) extension = 'png';
    else if (mimeType.includes('webp')) extension = 'webp';
    else if (mimeType.includes('gif')) extension = 'gif';
    else if (mimeType.includes('svg')) extension = 'svg';
    else if (mimeType.includes('mp4')) extension = 'mp4';
    else if (mimeType.includes('webm')) extension = 'webm';
    else if (mimeType.includes('quicktime') || mimeType.includes('mov')) extension = 'mov';

    return {
      blob: new Blob([ab], { type: mimeType }),
      mimeType,
      extension,
    };
  } catch (e) {
    console.warn('Error convirtiendo DataURL a Blob:', e);
    return null;
  }
}

/**
 * Storage Service for uploading images, logos and videos to Supabase Storage
 */
export const storageService = {
  /**
   * Uploads an image or video (File, Blob, or DataURL) to Supabase Storage.
   * If offline or if an error occurs, gracefully falls back to returning the input string.
   */
  async uploadMedia(
    fileOrDataUrl: File | Blob | string,
    folder: 'posts' | 'businesses' | 'itineraries' | 'general' = 'posts'
  ): Promise<string> {
    if (!fileOrDataUrl) return '';

    // If it's already an HTTP URL or local static asset, keep it
    if (typeof fileOrDataUrl === 'string') {
      if (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://')) {
        return fileOrDataUrl;
      }
      if (fileOrDataUrl.startsWith('/uploads/') || fileOrDataUrl.startsWith('/videos/')) {
        return fileOrDataUrl;
      }
      if (!fileOrDataUrl.startsWith('data:')) {
        return fileOrDataUrl;
      }
    }

    try {
      let body: Blob;
      let contentType = 'image/jpeg';
      let ext = 'jpg';

      if (typeof fileOrDataUrl === 'string') {
        const parsed = dataUrlToBlob(fileOrDataUrl);
        if (!parsed) return fileOrDataUrl; // Return original if conversion fails
        body = parsed.blob;
        contentType = parsed.mimeType;
        ext = parsed.extension;
      } else if (fileOrDataUrl instanceof File) {
        body = fileOrDataUrl;
        contentType = fileOrDataUrl.type || 'image/jpeg';
        const nameParts = fileOrDataUrl.name.split('.');
        if (nameParts.length > 1) {
          ext = nameParts[nameParts.length - 1].toLowerCase();
        }
      } else {
        body = fileOrDataUrl;
        contentType = fileOrDataUrl.type || 'image/jpeg';
      }

      const timestamp = Date.now();
      const randomSalt = Math.random().toString(36).substring(2, 8);
      const filePath = `${folder}/${timestamp}_${randomSalt}.${ext}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, body, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.warn(`[Supabase Storage] Error subiendo archivo a ${filePath}:`, error.message);
        return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }

      return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
    } catch (err: any) {
      console.warn('[Supabase Storage] Fallback offline tras error:', err?.message);
      return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
    }
  },

  /**
   * Helper that checks if a post or business has base64 data and uploads it to Supabase Storage
   */
  async optimizeMediaUrl(url: string | undefined, folder: 'posts' | 'businesses' | 'itineraries' = 'posts'): Promise<string | undefined> {
    if (!url) return undefined;
    if (url.startsWith('data:')) {
      return await this.uploadMedia(url, folder);
    }
    return url;
  },
};
