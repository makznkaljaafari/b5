
import { indexedDbService } from './indexedDbService';
import { supabaseStorageService } from './supabaseStorageService';
import { logger } from './loggerService';
import { dataService } from './dataService';

export const syncService = {
  async processQueue(userId: string, apiActions: any, signal?: AbortSignal) {
    if (!navigator.onLine) return;
    const operations = await indexedDbService.getAllOperations();
    if (operations.length === 0) return;

    logger.info(`🔄 Syncing ${operations.length} operations...`);

    for (const op of operations) {
      if (signal?.aborted) {
        logger.warn("Sync process aborted by signal.");
        break; // Stop processing if aborted
      }

      try {
        let currentPayload = { ...op.payload };
        
        // معالجة الصور المعلقة باستخدام الوظيفة المركزية في dataService
        if (op.payload.image_base64_data && op.payload.record_type_for_image) {
          const bytes = dataService.base64ToBytes(op.payload.image_base64_data);
          const imageFile = new File([bytes], op.payload.image_file_name || 'upload.jpg', { type: op.payload.image_mime_type });
          const imageUrl = await supabaseStorageService.uploadImage(
            userId, op.payload.record_type_for_image, op.tempId || op.originalId || 'offline', imageFile, signal
          );
          currentPayload.image_url = imageUrl;
          // Clear base64 data after successful upload to prevent re-upload attempts
          delete currentPayload.image_base64_data;
          delete currentPayload.image_mime_type;
          delete currentPayload.image_file_name;
        }

        // The apiActions are already bound to dataService, which now accept signal.
        // We pass the signal to ensure consistency.
        await apiActions[op.action](currentPayload, true, signal); // Pass signal here
        await indexedDbService.removeOperation(op.id);
      } catch (e: any) {
        if (e.name === 'AbortError') {
          logger.warn(`Sync operation ${op.action} aborted.`);
          break; // Stop processing if aborted
        }
        logger.error(`Sync error for ${op.action} (ID: ${op.id}):`, e);
      }
    }
  }
};
