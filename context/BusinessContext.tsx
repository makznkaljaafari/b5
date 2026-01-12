
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Customer, Supplier, Sale, Purchase } from '../types';
import { dataService } from '../services/dataService';
import { useUI } from './UIContext';
import { useInventory } from './InventoryContext';
import { useAuth } from './AuthContext';
import { logger } from '../services/loggerService'; // Import logger

const BusinessContext = createContext<any>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, triggerFeedback, isOnline } = useUI();
  const { setCategories, categories } = useInventory();
  const { user } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const formatValue = useCallback((val: number | string) => {
    const precision = user?.accounting_settings?.decimal_precision ?? 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : parseFloat(num.toFixed(precision));
  }, [user?.accounting_settings?.decimal_precision]);

  const addSale = useCallback(async (s: any, signal?: AbortSignal) => {
    if (!user?.id) throw new Error("Unauthenticated");
    
    const allowNegative = user?.accounting_settings?.allow_negative_stock ?? false;
    const category = categories.find((c: any) => c.name === s.qat_type);
    
    if (!allowNegative && category && category.stock < s.quantity) {
      addNotification("عذراً يا مدير ✋", `المخزون غير كافٍ. المتوفر من ${s.qat_type} هو ${category.stock} فقط.`, "warning");
      throw new Error("Insufficient stock");
    }

    const tempId = s.id || crypto.randomUUID();
    const isEditing = !!s.id;
    const formattedSale = {
      ...s,
      quantity: formatValue(s.quantity),
      unit_price: formatValue(s.unit_price),
      total: formatValue(Number(s.quantity) * Number(s.unit_price))
    };
    
    setSales(prev => {
        const existingIdx = prev.findIndex(item => item.id === tempId);
        if (existingIdx > -1) {
            const updated = [...prev];
            updated[existingIdx] = { ...formattedSale, updated_at: new Date().toISOString() };
            return updated;
        }
        return [{ ...formattedSale, id: tempId, created_at: new Date().toISOString() }, ...prev];
    });

    setCategories((prev: any[]) => prev.map((cat: any) => {
      // Calculate stock change more carefully, considering editing vs new sale
      const oldSale = isEditing ? sales.find(sale => sale.id === s.id) : undefined;
      let stockChange = Number(s.quantity);
      if (oldSale && cat.name === s.qat_type) {
        // If editing, adjust stock by the difference
        stockChange = Number(s.quantity) - Number(oldSale.quantity);
      }
      return cat.name === s.qat_type ? { ...cat, stock: formatValue(Number(cat.stock) - stockChange) } : cat;
    }));


    try {
      const saved = await dataService.saveSale(formattedSale, false, signal); // Pass signal
      setSales(prev => prev.map(item => item.id === tempId ? saved : item));
      triggerFeedback(s.status === 'نقدي' ? 'celebration' : 'debt');
      
      if (saved._offline) {
        addNotification("تم الحفظ محلياً 💾", `تم حفظ الفاتورة في وضع عدم الاتصال. ستتم المزامنة لاحقاً.`, "info");
      } else {
        // Log activity for sale
        dataService.logActivity(user.id, isEditing ? "تعديل فاتورة بيع" : "إضافة فاتورة بيع", `العميل: ${saved.customer_name}, الصنف: ${saved.qat_type}, الكمية: ${saved.quantity}, الإجمالي: ${saved.total} ${saved.currency}`, 'sale', signal); // Pass signal
      }
      return saved;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add sale aborted:", e.message);
        setSales(prev => prev.filter(item => item.id !== tempId)); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add sale:", e); 
      addNotification("خطأ في حفظ الفاتورة ❌", e.message || "حدث خطأ غير متوقع في الحفظ.", "warning");
      setSales(prev => prev.filter(item => item.id !== tempId)); 
      throw e;
    }
  }, [addNotification, triggerFeedback, setCategories, categories, user, formatValue, sales]); // Added sales to dependency

  const addPurchase = useCallback(async (p: any, signal?: AbortSignal) => {
    if (!user?.id) throw new Error("Unauthenticated");
    const tempId = p.id || crypto.randomUUID();
    const isEditing = !!p.id;
    
    const formattedPurchase = {
      ...p,
      quantity: formatValue(p.quantity),
      unit_price: formatValue(p.unit_price),
      total: formatValue(Number(p.quantity) * Number(p.unit_price))
    };
    
    setPurchases(prev => {
        const existingIdx = prev.findIndex(item => item.id === tempId);
        if (existingIdx > -1) {
            const updated = [...prev];
            updated[existingIdx] = { ...formattedPurchase, updated_at: new Date().toISOString() };
            return updated;
        }
        return [{ ...formattedPurchase, id: tempId, created_at: new Date().toISOString() }, ...prev];
    });

    setCategories((prev: any[]) => prev.map((cat: any) => {
      // Calculate stock change for purchase
      const oldPurchase = isEditing ? purchases.find(purchase => purchase.id === p.id) : undefined;
      let stockChange = Number(p.quantity);
      if (oldPurchase && cat.name === p.qat_type) {
        stockChange = Number(p.quantity) - Number(oldPurchase.quantity);
      }
      return cat.name === p.qat_type ? { ...cat, stock: formatValue(Number(cat.stock) + stockChange) } : cat;
    }));

    try {
      const saved = await dataService.savePurchase(formattedPurchase, false, signal); // Pass signal
      setPurchases(prev => prev.map(item => item.id === tempId ? saved : item));
      
      if (saved._offline) {
        addNotification("تم الحفظ محلياً 💾", "تم حفظ المشتريات في وضع عدم الاتصال. ستتم المزامنة لاحقاً.", "info");
      } else {
        addNotification("تمت إضافة المشتريات ✅", "تم تحديث المخازن بنجاح", "success");
        // Log activity for purchase
        dataService.logActivity(user.id, isEditing ? "تعديل فاتورة شراء" : "إضافة فاتورة شراء", `المورد: ${saved.supplier_name}, الصنف: ${saved.qat_type}, الكمية: ${saved.quantity}, الإجمالي: ${saved.total} ${saved.currency}`, 'purchase', signal); // Pass signal
      }
      return saved;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add purchase aborted:", e.message);
        setPurchases(prev => prev.filter(item => item.id !== tempId)); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add purchase:", e); 
      addNotification("خطأ في حفظ المشتريات ❌", e.message || "حدث خطأ غير متوقع في الحفظ.", "warning");
      setPurchases(prev => prev.filter(item => item.id !== tempId)); 
      throw e;
    }
  }, [addNotification, setCategories, user, formatValue, purchases]); // Added purchases to dependency

  const returnSale = useCallback(async (id: string, signal?: AbortSignal) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;

    try {
      await dataService.returnSale(id, false, signal); // Pass signal
      
      setSales(prev => prev.map(s => s.id === id ? { ...s, is_returned: true, returned_at: new Date().toISOString() } : s));
      
      setCategories((prev: any[]) => prev.map((cat: any) =>
        cat.name === sale.qat_type ? { ...cat, stock: formatValue(Number(cat.stock) + Number(sale.quantity)) } : cat
      ));
      
      addNotification("تم الإرجاع 🔄", "تمت إعادة الكمية للمخازن وتسوية الحساب.", "info");
      dataService.logActivity(user.id, "إرجاع فاتورة بيع", `تم إرجاع فاتورة العميل: ${sale.customer_name}, الصنف: ${sale.qat_type}, الكمية: ${sale.quantity}`, 'sale', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Return sale aborted:", e.message);
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to return sale:", e);
      addNotification("خطأ ⚠️", e.message || "فشل إرجاع الفاتورة. حدث خطأ غير متوقع.", "warning");
    }
  }, [addNotification, sales, setCategories, formatValue, user]);

  const returnPurchase = useCallback(async (id: string, signal?: AbortSignal) => {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;

    try {
      await dataService.returnPurchase(id, false, signal); // Pass signal
      
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, is_returned: true, returned_at: new Date().toISOString() } : p));
      
      setCategories((prev: any[]) => prev.map((cat: any) =>
        cat.name === purchase.qat_type ? { ...cat, stock: formatValue(Number(cat.stock) - Number(purchase.quantity)) } : cat
      ));
      
      addNotification("تم إرجاع المشتريات 🔄", "تم خصم الكمية من المخازن وتسوية حساب المورد.", "info");
      dataService.logActivity(user.id, "إرجاع فاتورة شراء", `تم إرجاع فاتورة المورد: ${purchase.supplier_name}, الصنف: ${purchase.qat_type}, الكمية: ${purchase.quantity}`, 'purchase', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Return purchase aborted:", e.message);
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to return purchase:", e);
      addNotification("خطأ ⚠️", e.message || "فشل إرجاع المشتريات. حدث خطأ غير متوقع.", "warning");
    }
  }, [addNotification, purchases, setCategories, formatValue, user]);

  const addCustomer = useCallback(async (c: any, signal?: AbortSignal) => {
    if (!user?.id) throw new Error("Unauthenticated");
    const isEditing = !!c.id;

    try {
      const saved = await dataService.saveCustomer(c, false, signal); // Pass signal
      setCustomers(prev => {
          const exists = prev.find(item => item.id === saved.id);
          return exists ? prev.map(item => item.id === saved.id ? saved : item) : [saved, ...prev];
      });
      dataService.logActivity(user.id, isEditing ? "تعديل عميل" : "إضافة عميل", `العميل: ${saved.name}, الهاتف: ${saved.phone}`, 'general', signal); // Pass signal
      return saved;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add customer aborted:", e.message);
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add customer:", e);
      throw e;
    }
  }, [user]);

  const addSupplier = useCallback(async (s: any, signal?: AbortSignal) => {
    if (!user?.id) throw new Error("Unauthenticated");
    const isEditing = !!s.id;

    try {
      const saved = await dataService.saveSupplier(s, false, signal); // Pass signal
      setSuppliers(prev => {
          const exists = prev.find(item => item.id === saved.id);
          return exists ? prev.map(item => item.id === saved.id ? saved : item) : [saved, ...prev];
      });
      dataService.logActivity(user.id, isEditing ? "تعديل مورد" : "إضافة مورد", `المورد: ${saved.name}, الهاتف: ${saved.phone}`, 'general', signal); // Pass signal
      return saved;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Add supplier aborted:", e.message);
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to add supplier:", e);
      throw e;
    }
  }, [user]);

  const deleteSale = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) throw new Error("Unauthenticated");
    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) {
      addNotification("خطأ", "الفاتورة غير موجودة.", "warning");
      return;
    }

    setSales(prev => prev.filter(s => s.id !== id));
    try {
      await dataService.deleteRecord('sales', id, undefined, undefined, false, signal); // Pass signal
      addNotification("تم الحذف 🗑️", "تم إزالة سجل المبيعات.", "success");
      dataService.logActivity(user.id, "حذف فاتورة بيع", `تم حذف فاتورة العميل: ${saleToDelete.customer_name}, الإجمالي: ${saleToDelete.total} ${saleToDelete.currency}`, 'sale', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete sale aborted:", e.message);
        setSales(prev => [...prev, saleToDelete]); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete sale:", e);
      addNotification("خطأ ⚠️", e.message || "فشل حذف فاتورة البيع.", "warning");
    }
  }, [addNotification, sales, user]);

  const deletePurchase = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) throw new Error("Unauthenticated");
    const purchaseToDelete = purchases.find(p => p.id === id);
    if (!purchaseToDelete) {
      addNotification("خطأ", "فاتورة الشراء غير موجودة.", "warning");
      return;
    }

    setPurchases(prev => prev.filter(p => p.id !== id));
    try {
      await dataService.deleteRecord('purchases', id, undefined, undefined, false, signal); // Pass signal
      addNotification("تم الحذف 🗑️", "تم إزالة سجل المشتريات.", "success");
      dataService.logActivity(user.id, "حذف فاتورة شراء", `تم حذف فاتورة المورد: ${purchaseToDelete.supplier_name}, الإجمالي: ${purchaseToDelete.total} ${purchaseToDelete.currency}`, 'purchase', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete purchase aborted:", e.message);
        setPurchases(prev => [...prev, purchaseToDelete]); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete purchase:", e);
      addNotification("خطأ ⚠️", e.message || "فشل حذف فاتورة الشراء.", "warning");
    }
  }, [addNotification, purchases, user]);

  const deleteCustomer = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) throw new Error("Unauthenticated");
    const customerToDelete = customers.find(c => c.id === id);
    if (!customerToDelete) {
      addNotification("خطأ", "العميل غير موجود.", "warning");
      return;
    }

    setCustomers(prev => prev.filter(c => c.id !== id));
    try {
      await dataService.deleteRecord('customers', id, undefined, undefined, false, signal); // Pass signal
      addNotification("تم الحذف 🗑️", `تم حذف العميل ${customerToDelete.name}.`, "success");
      dataService.logActivity(user.id, "حذف عميل", `تم حذف العميل: ${customerToDelete.name}`, 'general', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete customer aborted:", e.message);
        setCustomers(prev => [...prev, customerToDelete]); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete customer:", e);
      addNotification("عذراً ⚠️", e.message || "لا يمكن حذف العميل لوجود عمليات مالية مرتبطة به.", "warning");
    }
  }, [addNotification, customers, user]);

  const deleteSupplier = useCallback(async (id: string, signal?: AbortSignal) => {
    if (!user?.id) throw new Error("Unauthenticated");
    const supplierToDelete = suppliers.find(s => s.id === id);
    if (!supplierToDelete) {
      addNotification("خطأ", "المورد غير موجود.", "warning");
      return;
    }

    setSuppliers(prev => prev.filter(s => s.id !== id));
    try {
      await dataService.deleteRecord('suppliers', id, undefined, undefined, false, signal); // Pass signal
      addNotification("تم الحذف 🗑️", `تم حذف المورد ${supplierToDelete.name}.`, "success");
      dataService.logActivity(user.id, "حذف مورد", `تم حذف المورد: ${supplierToDelete.name}`, 'general', signal); // Pass signal
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete supplier aborted:", e.message);
        setSuppliers(prev => [...prev, supplierToDelete]); // Revert optimistic update
        throw e; // Re-throw AbortError
      }
      logger.error("Failed to delete supplier:", e);
      addNotification("عذراً ⚠️", e.message || "لا يمكن حذف المورد لوجود عمليات مالية مرتبطة به.", "warning");
    }
  }, [addNotification, suppliers, user]);


  const value = useMemo(() => ({
    customers, setCustomers, suppliers, setSuppliers, sales, setSales, purchases, setPurchases,
    addSale, addPurchase, addCustomer, addSupplier, 
    deleteSale, deletePurchase, deleteCustomer, deleteSupplier, 
    returnSale, returnPurchase, formatValue
  }), [customers, suppliers, sales, purchases, addSale, addPurchase, addCustomer, addSupplier, deleteSale, deletePurchase, deleteCustomer, deleteSupplier, returnSale, returnPurchase, formatValue]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};

export const useBusiness = () => {
    const context = useContext(BusinessContext);
    if (!context) throw new Error("useBusiness must be used within BusinessProvider");
    return context;
};
