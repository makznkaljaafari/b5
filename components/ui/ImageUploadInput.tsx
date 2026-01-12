
import React, { useRef, useState, useEffect } from 'react';
import { supabaseStorageService } from '../../services/supabaseStorageService';
import { useUI } from '../../context/UIContext';
import { logger } from '../../services/loggerService';
import { dataService } from '../../services/dataService'; // Import dataService for base64ToBytes
import { useIsMounted } from '../../hooks/useIsMounted'; // Import useIsMounted

interface ImageUploadInputProps {
  userId: string;
  recordType: 'sales' | 'purchases' | 'expenses';
  recordId: string; // This could be a temporary ID for new records
  currentImageUrl?: string; // Actual URL from DB for existing records or after online upload
  currentImageBase64?: string; // Base64 data for offline pending records
  currentImageMimeType?: string; // Mime type for offline pending records
  onImageUploadSuccess: (url: string | { base64: string, mimeType: string, fileName: string }) => void;
  onImageDelete: () => void;
  isDisabled?: boolean;
  label?: string;
  signal?: AbortSignal; // Add AbortSignal prop
}

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  userId,
  recordType,
  recordId,
  currentImageUrl,
  currentImageBase64,
  currentImageMimeType,
  onImageUploadSuccess,
  onImageDelete,
  isDisabled = false,
  label = 'صورة مرفقة (اختياري)',
  signal // Destructure signal
}) => {
  const { addNotification, theme, isOnline } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
  const isComponentMounted = useIsMounted(); // Initialize useIsMounted hook

  // Update previewUrl when currentImageUrl/currentImageBase64 props change
  useEffect(() => {
    // Revoke previous blob URL if exists
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(undefined);
    }

    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    } else if (currentImageBase64 && currentImageMimeType) {
      // Create a local blob URL for preview if Base64 data is present
      const bytes = dataService.base64ToBytes(currentImageBase64);
      const blob = new Blob([bytes], { type: currentImageMimeType });
      const newBlobUrl = URL.createObjectURL(blob);
      setBlobUrl(newBlobUrl);
      setPreviewUrl(newBlobUrl);
    } else {
      setPreviewUrl(undefined);
    }

    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [currentImageUrl, currentImageBase64, currentImageMimeType]); 

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Create a local preview URL immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setBlobUrl(localPreviewUrl); // Store this to revoke later if it's a blob

    try {
      if (isOnline) {
        // Online: Upload directly to Supabase Storage
        const imageUrl = await supabaseStorageService.uploadImage(userId, recordType, recordId, file, signal); // Pass signal
        if (!isComponentMounted()) return;
        onImageUploadSuccess(imageUrl);
        addNotification('تم الرفع ✅', 'تم رفع الصورة بنجاح.', 'success');
      } else {
        // Offline: Convert to Base64 and pass to parent to be part of OfflineOperation
        const base64Data = await fileToBase64(file);
        if (!isComponentMounted()) return;
        onImageUploadSuccess({ base64: base64Data, mimeType: file.type, fileName: file.name });
        addNotification('رفع غير متصل 💾', 'تم حفظ الصورة محلياً للمزامنة لاحقاً.', 'info');
      }
    } catch (e: any) {
      if (!isComponentMounted() || e.name === 'AbortError') return; // Ignore if unmounted or aborted
      logger.error('فشل في رفع الصورة:', e);
      addNotification('خطأ في الرفع ❌', e.message || 'فشل رفع الصورة.', 'warning');
      
      // Rollback UI changes
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (localPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localPreviewUrl);
      }
      setPreviewUrl(undefined);
      setBlobUrl(undefined);
      onImageDelete(); // Clear the image_url/data in parent form data
    } finally {
      if (!isComponentMounted()) return;
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    // If we have a public URL, try to delete from Supabase Storage
    if (currentImageUrl) {
      setIsUploading(true); // Treat deletion as an uploading state for UI feedback
      try {
        await supabaseStorageService.deleteImage(currentImageUrl, signal); // Pass signal
        if (!isComponentMounted()) return;
        onImageDelete();
        setPreviewUrl(undefined);
        if (blobUrl && blobUrl.startsWith('blob:')) { URL.revokeObjectURL(blobUrl); setBlobUrl(undefined); }
        addNotification('تم الحذف 🗑️', 'تم حذف الصورة بنجاح.', 'success');
        // Clear the file input if deletion was successful
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (e: any) {
        if (!isComponentMounted() || e.name === 'AbortError') return; // Ignore if unmounted or aborted
        logger.error('فشل في حذف الصورة:', e);
        addNotification('خطأ في الحذف ❌', e.message || 'فشل حذف الصورة.', 'warning');
      } finally {
        if (!isComponentMounted()) return;
        setIsUploading(false);
      }
    } else if (currentImageBase64) {
      // If only Base64 data exists (offline pending upload), just clear from parent
      onImageDelete();
      setPreviewUrl(undefined);
      if (blobUrl && blobUrl.startsWith('blob:')) { URL.revokeObjectURL(blobUrl); setBlobUrl(undefined); }
      addNotification('تم مسح الصورة ✅', 'تم إزالة الصورة المحفوظة محلياً.', 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`p-4 lg:p-8 rounded-3xl border-2 shadow-xl space-y-4 ${theme === 'dark' ? 'bg-[var(--color-background-secondary)] border-[var(--color-border-primary)]' : 'bg-[var(--color-background-secondary)] border-[var(--color-border-primary)]'}`}>
      <label className="text-[9px] lg:text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-widest px-1 block">{label}</label>
      
      {previewUrl ? (
        <div className="flex flex-col items-center gap-4">
          <img 
            src={previewUrl} 
            alt="صورة مرفقة" 
            className="max-h-48 max-w-full rounded-2xl shadow-md border border-[var(--color-border-primary)]" 
            style={{ objectFit: 'contain' }}
          />
          <div className="flex gap-2 w-full max-w-[200px]">
            <button 
              type="button"
              onClick={handleDeleteImage}
              disabled={isDisabled || isUploading}
              aria-label="حذف الصورة المرفقة"
              className={`flex-1 bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)] px-4 py-2 rounded-xl font-black text-sm border border-[var(--color-accent-rose)]/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${isDisabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-accent-rose)] hover:text-white'}`}
            >
              {isUploading ? 'جاري الحذف...' : 'حذف الصورة 🗑️'}
            </button>
            {currentImageUrl && (
                <a 
                    href={currentImageUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex-1 bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] px-4 py-2 rounded-xl font-black text-sm border border-[var(--color-border-primary)] active:scale-95 transition-all flex items-center justify-center gap-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-background-tertiary)]/80'}`}
                    aria-label="عرض الصورة بالحجم الكامل"
                >
                    عرض 🖼️
                </a>
            )}
            {/* If only Base64 is available (offline), provide a simple indicator */}
            {!currentImageUrl && currentImageBase64 && (
                 <span className={`flex-1 bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] px-4 py-2 rounded-xl font-black text-sm border border-[var(--color-border-primary)] flex items-center justify-center gap-2 opacity-70`}>
                     معاينة 📝
                 </span>
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex items-center justify-center p-6 border-2 border-dashed border-[var(--color-border-primary)] rounded-2xl cursor-pointer hover:bg-[var(--color-background-tertiary)]/30 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isDisabled || isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="اختر صورة للرفع"
          />
          {isUploading ? (
            <div className="flex items-center gap-3 py-4 text-[var(--color-text-secondary)]">
              <div className="w-5 h-5 border-2 border-[var(--color-accent-sky)] border-t-transparent rounded-full animate-spin"></div>
              <span className="font-bold">جاري الرفع...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[var(--color-text-secondary)]">
              <span className="text-4xl">📎</span>
              <p className="font-bold text-sm">اضغط هنا لرفع صورة</p>
              <p className="text-[10px] opacity-70">JPEG, PNG, GIF</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadInput;
