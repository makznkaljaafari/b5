
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { QatCategory } from '../types';
import { dataService } from '../services/dataService';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { logger } from '../services/loggerService';

const InventoryContext = createContext<any>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, isOnline } = useUI();
  const { user } = useAuth();
  const [categories, setCategories] = useState<QatCategory[]>([]);

  const addCategory = useCallback(async (cat: any, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const tempId = !isOnline ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
    const optimisticCategory = { ...cat, id: tempId, created_at: new Date().toISOString(), stock: Number(cat.stock) } as QatCategory;
    
    setCategories(prev => {
      const idx = prev.findIndex(p => p.id === optimisticCategory.id);
      return idx > -1 ? prev.map(p => p.id === optimisticCategory.id ? optimisticCategory : p) : [optimisticCategory, ...prev];
    });
    
    if (!isOnline) addNotification("صنف محلي 💾", "تم إضافة الصنف في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      const saved = await dataService.saveCategory(cat, false, signal);
      setCategories(prev => prev.map(item => item.id === tempId ? saved : item));
      addNotification("تم الحفظ بنجاح ✅", `تمت إضافة صنف ${saved.name} للمخزون.`, "success");
      dataService.logActivity(user.id, cat.id ? "تعديل صنف مخزون" : "إضافة صنف مخزون", `الصنف: ${saved.name}, الكمية: ${saved.stock}`, 'general', signal);
      return saved;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add category aborted:", e.message);
        // Revert optimistic update only if online, otherwise keep it in offline queue
        if (isOnline) setCategories(prev => prev.filter(item => item.id !== tempId));
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add category:", e);
      addNotification("خطأ ⚠️", e.message || "فشل حفظ الصنف. حدث خطأ غير متوقع.", "warning");
      if (isOnline) setCategories(prev => prev.filter(item => item.id !== tempId));
      throw e;
    }
  }, [addNotification, isOnline, user]);

  const deleteCategory = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete) {
      addNotification("خطأ", "الصنف غير موجود.", "warning");
      return;
    }

    const original = [...categories];
    setCategories(prev => prev.filter(c => c.id !== id));
    
    if (!isOnline) addNotification("حذف محلي 🗑️", "تم حذف الصنف في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      await dataService.deleteRecord('categories', id, undefined, undefined, false, signal);
      addNotification("تم الحذف 🗑️", "تم حذف الصنف بنجاح.", "success");
      dataService.logActivity(user.id, "حذف صنف مخزون", `تم حذف الصنف: ${categoryToDelete.name}`, 'general', signal);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete category aborted:", e.message);
        setCategories(original); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete category:", e);
      setCategories(original);
      addNotification("عذراً ⚠️", e.message || "لا يمكن الحذف لوجود عمليات مرتبطة به. حدث خطأ غير متوقع.", "warning");
      throw e;
    }
  }, [addNotification, categories, isOnline, user]);

  const value = useMemo(() => ({
    categories, setCategories, addCategory, deleteCategory
  }), [categories, addCategory, deleteCategory]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};
