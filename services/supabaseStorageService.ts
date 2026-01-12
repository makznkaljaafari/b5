
import { supabase } from './supabaseClient';
import { logger } from './loggerService';

export const supabaseStorageService = {
  /**
   * يرفع ملف صورة إلى Supabase Storage.
   * المسار المتوقع: `invoices/<user_id>/<record_type>/<record_id>/<file.name>`
   *
   * @param userId - معرف المستخدم الحالي.
   * @param recordType - نوع السجل (مثال: 'sales', 'purchases', 'expenses').
   * @param recordId - معرف السجل الذي ترتبط به الصورة.
   * @param file - كائن الملف (File object) ليتم رفعه.
   * @param signal - AbortSignal for request cancellation.
   * @returns عنوان URL العام للصورة المرفوعة.
   * @throws خطأ إذا فشل الرفع.
   */
  async uploadImage(userId: string, recordType: 'sales' | 'purchases' | 'expenses', recordId: string, file: File, signal?: AbortSignal): Promise<string> {
    const filePath = `${userId}/${recordType}/${recordId}/${file.name}`; // Path inside 'invoices' bucket
    try {
      const { data, error } = await supabase.storage
        .from('invoices')
        .upload(filePath, file, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: true, // Overwrite existing files if same path (e.g., if re-uploading for same record)
          contentType: file.type, // Ensure correct MIME type is set
          signal // Pass signal to the upload options
        });

      if (error) {
        if (error.name === 'AbortError') {
          logger.warn(`Image upload to ${filePath} aborted.`);
          throw error;
        }
        logger.error(`Error uploading image to Supabase Storage at ${filePath}:`, error);
        throw new Error(`فشل رفع الصورة: ${error.message}`);
      }

      // Get public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('فشل الحصول على الرابط العام للصورة بعد الرفع.');
      }

      logger.info(`Image uploaded and public URL obtained: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;
    } catch (e) {
      if (e.name === 'AbortError') throw e; // Re-throw AbortError
      logger.error(`Failed to upload image ${file.name} for ${recordType} ${recordId}:`, e);
      throw e;
    }
  },

  /**
   * يحذف ملف صورة من Supabase Storage باستخدام عنوان URL العام.
   *
   * @param imageUrl - عنوان URL العام للصورة المراد حذفها.
   * @param signal - AbortSignal for request cancellation.
   * @returns وعد ينتهي عند اكتمال الحذف.
   * @throws خطأ إذا فشل الحذف.
   */
  async deleteImage(imageUrl: string, signal?: AbortSignal): Promise<void> {
    if (!imageUrl) {
      logger.warn('Attempted to delete image with empty URL.');
      return;
    }

    try {
      // Extract file path from public URL
      // Expected format: https://[project_ref].supabase.co/storage/v1/object/public/invoices/<path>
      const urlParts = imageUrl.split('/public/invoices/');
      if (urlParts.length < 2) {
        logger.warn(`Invalid image URL format for deletion: ${imageUrl}`);
        // Instead of throwing, perhaps just log and return if it's not a recognizable Supabase URL
        return; 
      }
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('invoices')
        .remove([filePath], { signal }); // Pass signal to the remove options

      if (error) {
        if (error.name === 'AbortError') {
          logger.warn(`Image deletion for ${filePath} aborted.`);
          throw error;
        }
        // Log error but don't re-throw if it's "not found" to allow main record deletion
        if (error.statusCode === '404' || error.message.includes('not found')) {
            logger.warn(`Image file not found for deletion: ${filePath}. Proceeding with record deletion.`);
            return;
        }
        logger.error(`Error deleting image from Supabase Storage at ${filePath}:`, error);
        throw new Error(`فشل حذف الصورة: ${error.message}`);
      }

      logger.info(`Image successfully deleted from Supabase Storage: ${filePath}`);
    } catch (e) {
      if (e.name === 'AbortError') throw e; // Re-throw AbortError
      logger.error(`Failed to delete image ${imageUrl}:`, e);
      throw e;
    }
  },
};
