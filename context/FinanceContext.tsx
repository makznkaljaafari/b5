
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Voucher, Expense, Waste, ExchangeRates, ExpenseTemplate } from '../types';
import { dataService } from '../services/dataService';
import { useUI } from './UIContext';
import { useInventory } from './InventoryContext';
import { useAuth } from './AuthContext';
import { logger } from '../services/loggerService';

const FinanceContext = createContext<any>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, triggerFeedback, isOnline } = useUI();
  const { setCategories } = useInventory();
  const { user } = useAuth();
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseTemplates, setExpenseTemplates] = useState<ExpenseTemplate[]>([]);
  const [wasteRecords, setWasteRecords] = useState<Waste[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ SAR_TO_YER: 430, OMR_TO_YER: 425 });
  const [expenseCategories, setExpenseCategories] = useState<string[]>(['نثرية', 'كهرباء', 'إيجار', 'غداء', 'حوافز']);

  const addVoucher = useCallback(async (v: any, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const tempId = v.id || crypto.randomUUID();
    const isEditing = !!v.id;
    const optimisticVoucher = { ...v, id: tempId, created_at: new Date().toISOString() };
    
    setVouchers(prev => {
        const existingIdx = prev.findIndex(item => item.id === tempId);
        if (existingIdx > -1) {
            const updated = [...prev];
            updated[existingIdx] = { ...optimisticVoucher, updated_at: new Date().toISOString() };
            return updated;
        }
        return [optimisticVoucher, ...prev];
    });

    if (!isOnline) {
      addNotification("سند محلي 💾", "تم التوثيق في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");
    } else {
      addNotification("سند جديد ✅", "تم التوثيق لحظياً وجاري الحفظ...", "success");
    }
    if (v.type === 'قبض') triggerFeedback('celebration');

    try {
      const saved = await dataService.saveVoucher(v, false, signal); // Pass signal
      setVouchers(prev => prev.map(item => item.id === tempId ? saved : item));
      dataService.logActivity(user.id, isEditing ? "تعديل سند مالي" : "إضافة سند مالي", `الطرف: ${saved.person_name}, النوع: ${saved.type}, المبلغ: ${saved.amount} ${saved.currency}`, 'voucher', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add voucher aborted:", e.message);
        setVouchers(prev => prev.filter(item => item.id !== tempId)); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add voucher:", e);
      setVouchers(prev => prev.filter(item => item.id !== tempId));
      addNotification("خطأ مزامنة السند ⚠️", e.message || "تعذر الحفظ السحابي. حدث خطأ غير متوقع.", "warning");
    }
  }, [addNotification, triggerFeedback, isOnline, user]);

  const addExpense = useCallback(async (e: any, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const tempId = e.id || (e.temp_record_id || crypto.randomUUID());
    const isEditing = !!e.id;
    const optimisticExpense = { 
      ...e, 
      id: tempId, 
      created_at: new Date().toISOString(),
      image_url: e.image_url || (e.image_base64_data ? `data:${e.image_mime_type};base64,${e.image_base64_data.split(',')[1]}` : undefined)
    } as Expense;
    setExpenses(prev => [optimisticExpense, ...prev.filter(item => item.id !== tempId)]);
    
    if (!isOnline) {
      addNotification("مصروف محلي 💾", "تم الخصم من الصندوق في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");
    } else {
      addNotification("مصروف جديد ✅", "تم الخصم من الصندوق لحظياً.", "success");
    }

    try {
      const saved = await dataService.saveExpense(e, false, signal); // Pass signal
      const finalSaved = { ...saved, image_base64_data: undefined, image_mime_type: undefined };
      setExpenses(prev => prev.map(item => item.id === tempId ? finalSaved : item));
      dataService.logActivity(user.id, isEditing ? "تعديل مصروف" : "إضافة مصروف", `العنوان: ${saved.title}, الفئة: ${saved.category}, المبلغ: ${saved.amount} ${saved.currency}`, 'expense', signal); // Pass signal
    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.warn("Add expense aborted:", err.message);
        setExpenses(prev => prev.filter(item => item.id !== tempId)); // Revert optimistic update
        throw err; // Re-throw AbortError
      }
      logger.error("Failed to add expense:", err);
      setExpenses(prev => prev.filter(item => item.id !== tempId));
      addNotification("خطأ ⚠️", err.message || "فشل حفظ المصروف سحابياً. حدث خطأ غير متوقع.", "warning");
    }
  }, [addNotification, isOnline, user]);

  const addWaste = useCallback(async (w: any, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const tempId = w.id || crypto.randomUUID();
    const isEditing = !!w.id;
    const optimisticWaste = { ...w, id: tempId, date: new Date().toISOString() } as Waste;
    setWasteRecords(prev => {
        const existingIdx = prev.findIndex(item => item.id === tempId);
        if (existingIdx > -1) {
            const updated = [...prev];
            updated[existingIdx] = { ...optimisticWaste, updated_at: new Date().toISOString() };
            return updated;
        }
        return [optimisticWaste, ...prev];
    });

    setCategories((prev: any[]) => prev.map(cat => {
      const oldWaste = isEditing ? wasteRecords.find(waste => waste.id === w.id) : undefined;
      let quantityChange = Number(w.quantity);
      if (oldWaste && cat.name === w.qat_type) {
        quantityChange = Number(w.quantity) - Number(oldWaste.quantity);
      }
      return cat.name === w.qat_type ? { ...cat, stock: Math.max(0, Number(cat.stock) - quantityChange) } : cat;
    }));

    if (!isOnline) addNotification("تسجيل تالف محلي 🥀", "تم خصم الكمية في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      const saved = await dataService.saveWaste(w, false, signal); // Pass signal
      setWasteRecords(prev => prev.map(item => item.id === tempId ? saved : item));
      addNotification("تسجيل تالف 🥀", "تم خصم الكمية بنجاح.", "warning");
      dataService.logActivity(user.id, isEditing ? "تعديل سجل تالف" : "إضافة سجل تالف", `الصنف: ${saved.qat_type}, الكمية: ${saved.quantity}, السبب: ${saved.reason}`, 'waste', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add waste aborted:", e.message);
        setWasteRecords(prev => prev.filter(item => item.id !== tempId)); // Revert optimistic update
        setCategories(prev => prev.map(cat => 
          cat.name === w.qat_type ? { ...cat, stock: Number(cat.stock) + Number(w.quantity) } : cat
        )); // Revert stock change
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add waste:", e);
      setWasteRecords(prev => prev.filter(item => item.id !== tempId));
      addNotification("خطأ ⚠️", e.message || "تعذر تسجيل التالف. حدث خطأ غير متوقع.", "warning");
    }
  }, [addNotification, setCategories, isOnline, user, wasteRecords]); // Added wasteRecords to dependency

  const updateExchangeRates = useCallback(async (rates: ExchangeRates, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }
    const userId = user.id;

    setExchangeRates(rates);
    
    if (!isOnline) addNotification("تحديث صرف محلي 💱", "تم تحديث الأسعار في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      await dataService.updateSettings(userId, { exchange_rates: rates }, false, signal); // Pass signal
      addNotification("تم التحديث 💱", "تم تحديث أسعار الصرف سحابياً.", "success");
      dataService.logActivity(user.id, "تحديث أسعار الصرف", `SAR: ${rates.SAR_TO_YER}, OMR: ${rates.OMR_TO_YER}`, 'settings', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Update exchange rates aborted:", e.message);
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to update exchange rates:", e);
      addNotification("خطأ ⚠️", e.message || "فشل تحديث أسعار الصرف سحابياً. حدث خطأ غير متوقع.", "warning");
    }
  }, [addNotification, isOnline, user]);

  const addOpeningBalance = useCallback(async (b: any, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    if (!isOnline) addNotification("قيد افتتاحي محلي 💾", "تم حفظ الرصيد في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      const res = await dataService.saveOpeningBalance(b, false, signal); // Pass signal
      addNotification("تم القيد ✅", "تم حفظ الرصيد السابق.", "success");
      dataService.logActivity(user.id, "إضافة رصيد افتتاحي", `الطرف: ${b.person_name}, النوع: ${b.balance_type}, المبلغ: ${b.amount} ${b.currency}`, 'general', signal); // Pass signal
      return res;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add opening balance aborted:", e.message);
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add opening balance:", e);
      addNotification("خطأ ⚠️", e.message || "فشل تسجيل الرصيد. حدث خطأ غير متوقع.", "warning");
    }
  }, [addNotification, isOnline, user]);

  const addExpenseTemplate = useCallback(async (template: Partial<ExpenseTemplate>, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const tempId = template.id || crypto.randomUUID();
    const isEditing = !!template.id;
    const optimisticTemplate = { ...template, id: tempId, created_at: new Date().toISOString() } as ExpenseTemplate;
    setExpenseTemplates(prev => {
        const existingIdx = prev.findIndex(item => item.id === tempId);
        return existingIdx > -1 ? prev.map(item => item.id === tempId ? optimisticTemplate : item) : [optimisticTemplate, ...prev];
    });

    if (!isOnline) addNotification("قالب مصروف محلي 💾", "تم حفظ القالب في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      const saved = await dataService.saveExpenseTemplate(template, false, signal); // Pass signal
      setExpenseTemplates(prev => prev.map(item => item.id === tempId ? saved : item));
      addNotification("تم حفظ القالب ✅", "تم حفظ المصروف كقالب متكرر.", "info");
      dataService.logActivity(user.id, isEditing ? "تعديل قالب مصروف" : "إضافة قالب مصروف", `القالب: ${saved.title}, المبلغ: ${saved.amount} ${saved.currency}`, 'expense', signal); // Pass signal
      return saved;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add expense template aborted:", e.message);
        setExpenseTemplates(prev => prev.filter(item => item.id !== tempId)); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add expense template:", e);
      setExpenseTemplates(prev => prev.filter(item => item.id !== tempId));
      addNotification("خطأ ⚠️", e.message || "فشل حفظ القالب سحابياً. حدث خطأ غير متوقع.", "warning");
      throw e;
    }
  }, [addNotification, isOnline, user]);

  const deleteVoucher = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const voucherToDelete = vouchers.find(v => v.id === id);
    if (!voucherToDelete) {
      addNotification("خطأ", "السند غير موجود.", "warning");
      return;
    }

    const original = [...vouchers];
    setVouchers(prev => prev.filter(v => v.id !== id));

    if (!isOnline) addNotification("حذف محلي 🗑️", "تم حذف السند في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      await dataService.deleteRecord('vouchers', id, undefined, undefined, false, signal); // Pass signal
      addNotification("تم الحذف 🗑️", "تم حذف السند بنجاح.", "success");
      dataService.logActivity(user.id, "حذف سند مالي", `تم حذف سند ${voucherToDelete.type} لـ ${voucherToDelete.person_name}, المبلغ: ${voucherToDelete.amount} ${voucherToDelete.currency}`, 'voucher', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete voucher aborted:", e.message);
        setVouchers(original); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete voucher:", e);
      setVouchers(original);
      addNotification("خطأ ❌", e.message || "فشل في عملية الحذف. حدث خطأ غير متوقع.", "warning");
      throw e;
    }
  }, [vouchers, addNotification, isOnline, user]);

  const deleteExpense = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const expenseToDelete = expenses.find(e => e.id === id);
    if (!expenseToDelete) {
      addNotification("خطأ", "المصروف غير موجود.", "warning");
      return;
    }

    const original = [...expenses];
    setExpenses(prev => prev.filter(e => e.id !== id));

    if (!isOnline) addNotification("حذف محلي 🗑️", "تم حذف المصروف في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      await dataService.deleteRecord('expenses', id, undefined, undefined, false, signal); // Pass signal
      addNotification("تم الحذف 🗑️", "تم حذف المصروف بنجاح.", "success");
      dataService.logActivity(user.id, "حذف مصروف", `تم حذف المصروف: ${expenseToDelete.title}, المبلغ: ${expenseToDelete.amount} ${expenseToDelete.currency}`, 'expense', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete expense aborted:", e.message);
        setExpenses(original); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete expense:", e);
      setExpenses(original);
      addNotification("خطأ ❌", e.message || "فشل حذف المصروف. حدث خطأ غير متوقع.", "warning");
      throw e;
    }
  }, [expenses, addNotification, isOnline, user]);

  const deleteWaste = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const wasteToDelete = wasteRecords.find(w => w.id === id);
    if (!wasteToDelete) {
      addNotification("خطأ", "سجل التالف غير موجود.", "warning");
      return;
    }

    setWasteRecords(prev => prev.filter(w => w.id !== id));
    // Revert stock change optimistically
    setCategories(prev => prev.map(cat => 
        cat.name === wasteToDelete.qat_type ? { ...cat, stock: Number(cat.stock) + Number(wasteToDelete.quantity) } : cat
    ));

    if (!isOnline) addNotification("حذف محلي 🗑️", "تم حذف سجل التالف في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      await dataService.deleteRecord('waste', id, undefined, undefined, false, signal); // Pass signal
      addNotification("تم الحذف 🗑️", "تم حذف سجل التالف بنجاح.", "success");
      dataService.logActivity(user.id, "حذف سجل تالف", `تم حذف سجل التالف للصنف: ${wasteToDelete.qat_type}, الكمية: ${wasteToDelete.quantity}`, 'waste', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete waste aborted:", e.message);
        setWasteRecords(prev => [...prev, wasteToDelete]); // Revert optimistic update
        setCategories(prev => prev.map(cat => 
          cat.name === wasteToDelete.qat_type ? { ...cat, stock: Number(cat.stock) - Number(wasteToDelete.quantity) } : cat
        )); // Revert stock change
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete waste record:", e);
      setWasteRecords(prev => [...prev, wasteToDelete]); // Revert optimistic update
      setCategories(prev => prev.map(cat => 
          cat.name === wasteToDelete.qat_type ? { ...cat, stock: Number(cat.stock) - Number(wasteToDelete.quantity) } : cat
      ));
      addNotification("خطأ ❌", e.message || "فشل حذف سجل التالف. حدث خطأ غير متوقع.", "warning");
      throw e;
    }
  }, [wasteRecords, addNotification, isOnline, user, setCategories]);

  const deleteExpenseTemplate = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) {
      addNotification("خطأ", "يجب تسجيل الدخول لإجراء العملية.", "warning");
      throw new Error("No user ID available for operation.");
    }

    const templateToDelete = expenseTemplates.find(t => t.id === id);
    if (!templateToDelete) {
      addNotification("خطأ", "القالب غير موجود.", "warning");
      return;
    }

    setExpenseTemplates(prev => prev.filter(t => t.id !== id));

    if (!isOnline) addNotification("حذف محلي 🗑️", "تم حذف القالب في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "warning");

    try {
      await dataService.deleteRecord('expense_templates', id, undefined, undefined, false, signal); // Pass signal
      addNotification("تم الحذف 🗑️", "تم حذف قالب المصروف بنجاح.", "success");
      dataService.logActivity(user.id, "حذف قالب مصروف", `تم حذف قالب المصروف: ${templateToDelete.title}`, 'expense', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete expense template aborted:", e.message);
        setExpenseTemplates(prev => [...prev, templateToDelete]); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete expense template:", e);
      setExpenseTemplates(prev => [...prev, templateToDelete]); // Revert optimistic update
      addNotification("خطأ ❌", e.message || "فشل حذف قالب المصروف. حدث خطأ غير متوقع.", "warning");
      throw e;
    }
  }, [expenseTemplates, addNotification, isOnline, user]);

  const value = useMemo(() => ({
    vouchers, setVouchers, expenses, setExpenses, expenseTemplates, setExpenseTemplates,
    wasteRecords, setWasteRecords, exchangeRates, setExchangeRates, expenseCategories, setExpenseCategories,
    addVoucher, addExpense, addWaste, updateExchangeRates, addOpeningBalance, addExpenseTemplate,
    deleteVoucher, deleteExpense, deleteWaste, deleteExpenseTemplate, // Added delete functions
    addExpenseCategory: (n: string) => setExpenseCategories(prev => [...prev, n])
  }), [vouchers, expenses, expenseTemplates, wasteRecords, exchangeRates, expenseCategories, addVoucher, addExpense, addWaste, updateExchangeRates, addOpeningBalance, addExpenseTemplate, deleteVoucher, deleteExpense, deleteWaste, deleteExpenseTemplate]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => useContext(FinanceContext);
