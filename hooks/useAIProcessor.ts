
import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { financeService } from '../services/financeService';
import { shareToWhatsApp, formatCustomerStatement, formatSupplierStatement } from '../services/shareService';
import { FunctionCall } from '@google/genai';
import { logger } from '../services/loggerService';

export const useAIProcessor = () => {
  const { 
    sales, customers, purchases, vouchers, suppliers, expenses,
    addSale, addPurchase, addVoucher, addExpense,
    addCustomer, addSupplier, deleteSale, deletePurchase, deleteVoucher, deleteExpense,
    addNotification
  } = useApp();

  const [pendingAction, setPendingAction] = useState<FunctionCall | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const validateToolCall = useCallback((name: string, args: any) => {
    // التحقق من وجود الأشخاص للعمليات التي تتطلب ذلك
    if (['recordSale', 'recordVoucher', 'shareStatement', 'deleteTransaction', 'updateTransaction'].includes(name)) {
      const searchName = (args.customer_name || args.person_name || args.supplier_name || "").trim();
      if (!searchName) return true;

      const list = [...customers, ...suppliers];
      const match = list.find(p => p.name.includes(searchName));
      
      if (!match && name !== 'managePerson') {
        addNotification("تنبيه ⚠️", `الاسم "${searchName}" غير موجود في السجلات.`, "warning");
        return false;
      }
    }
    return true;
  }, [customers, suppliers, addNotification]);

  const executeAction = useCallback(async () => {
    if (!pendingAction || isExecuting) return;
    
    const { name, args } = pendingAction;
    setIsExecuting(true);
    const abortController = new AbortController(); // Create AbortController for the execution

    try {
      switch (name) {
        case 'recordSale': {
          const target = customers.find(c => c.name.includes(args.customer_name));
          await addSale({ ...args, customer_id: target!.id, customer_name: target!.name, total: (Number(args.quantity) || 0) * (Number(args.unit_price) || 0), date: new Date().toISOString() }, abortController.signal);
          break;
        }
        case 'recordPurchase': {
          const target = suppliers.find(s => s.name.includes(args.supplier_name));
          await addPurchase({ ...args, supplier_id: target!.id, supplier_name: target!.name, total: (Number(args.quantity) || 0) * (Number(args.unit_price) || 0), date: new Date().toISOString() }, abortController.signal);
          break;
        }
        case 'recordVoucher': {
          const list = args.type === 'قبض' ? customers : suppliers;
          const target = list.find(p => p.name.includes(args.person_name));
          await addVoucher({ ...args, person_id: target!.id, person_name: target!.name, person_type: args.type === 'قبض' ? 'عميل' : 'مورد', date: new Date().toISOString() }, abortController.signal);
          break;
        }
        case 'recordExpense': {
          await addExpense({ ...args, date: new Date().toISOString() }, abortController.signal);
          break;
        }
        case 'managePerson': {
          if (args.type === 'عميل') await addCustomer({ name: args.name, phone: args.phone || '' }, abortController.signal);
          else await addSupplier({ name: args.name, phone: args.phone || '' }, abortController.signal);
          break;
        }
        case 'deleteTransaction': {
          const searchName = args.person_name;
          let targetRecord: any = null;
          
          if (args.record_type === 'sale') targetRecord = sales.find(s => s.customer_name.includes(searchName));
          else if (args.record_type === 'purchase') targetRecord = purchases.find(p => p.supplier_name.includes(searchName));
          else if (args.record_type === 'voucher') targetRecord = vouchers.find(v => v.person_name.includes(searchName));
          else if (args.record_type === 'expense') targetRecord = expenses.find(e => e.title.includes(searchName));

          if (targetRecord) {
             if (args.record_type === 'sale') await deleteSale(targetRecord.id, abortController.signal);
             else if (args.record_type === 'purchase') await deletePurchase(targetRecord.id, abortController.signal);
             else if (args.record_type === 'voucher') await deleteVoucher(targetRecord.id, abortController.signal);
             else if (args.record_type === 'expense') await deleteExpense(targetRecord.id, abortController.signal);
             addNotification("تم الحذف 🗑️", "تم حذف العملية بنجاح.", "success");
          } else {
             addNotification("خطأ ⚠️", "لم أجد العملية المطلوبة لحذفها.", "warning");
          }
          break;
        }
        case 'updateTransaction': {
          const searchName = args.person_name;
          let targetRecord: any = null;
          
          if (args.record_type === 'sale') targetRecord = sales.find(s => s.customer_name.includes(searchName));
          else if (args.record_type === 'purchase') targetRecord = purchases.find(p => p.supplier_name.includes(searchName));
          else if (args.record_type === 'voucher') targetRecord = vouchers.find(v => v.person_name.includes(searchName));

          if (targetRecord) {
             const updated = { 
               ...targetRecord, 
               amount: args.new_amount || targetRecord.amount || targetRecord.total,
               unit_price: args.new_amount ? (args.new_amount / (args.new_quantity || targetRecord.quantity)) : targetRecord.unit_price,
               quantity: args.new_quantity || targetRecord.quantity,
               notes: args.new_notes || targetRecord.notes
             };
             if (args.record_type === 'sale') await addSale(updated, abortController.signal);
             else if (args.record_type === 'purchase') await addPurchase(updated, abortController.signal);
             else if (args.record_type === 'voucher') await addVoucher(updated, abortController.signal);
             addNotification("تم التعديل ✅", "تم تحديث البيانات بنجاح.", "success");
          }
          break;
        }
        case 'shareStatement': {
          const list = args.person_type === 'عميل' ? customers : suppliers;
          const person = list.find(p => p.name.includes(args.person_name));
          if (person) {
             const balances = args.person_type === 'عميل' 
                ? financeService.getCustomerBalances(person.id, sales, vouchers)
                : financeService.getSupplierBalances(person.id, purchases, vouchers);
             const text = args.person_type === 'عميل' 
                ? formatCustomerStatement(person, sales, vouchers, balances)
                : formatSupplierStatement(person, purchases, vouchers, balances);
             shareToWhatsApp(text, person.phone);
          }
          break;
        }
      }

      setPendingAction(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.warn("AI action execution aborted:", err.message);
        // Do not show a notification for expected aborts
      } else {
        addNotification("فشل التنفيذ ⚠️", err.message || "حدث خطأ غير متوقع.", "warning");
      }
    } finally {
      setIsExecuting(false);
      if (!abortController.signal.aborted) {
        abortController.abort("Action execution finished."); // Clean up controller
      }
    }
  }, [pendingAction, isExecuting, customers, suppliers, sales, purchases, vouchers, expenses, addSale, addPurchase, addVoucher, addExpense, addCustomer, addSupplier, deleteSale, deletePurchase, deleteVoucher, deleteExpense, addNotification]);

  return { pendingAction, setPendingAction, isExecuting, validateToolCall, executeAction };
};
