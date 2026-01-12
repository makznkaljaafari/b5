
import { FunctionCall } from '@google/genai';

export interface User {
  id: string;
  email: string;
  full_name: string;
  agency_name: string;
  whatsapp_number?: string;
  telegram_username?: string;
  enable_voice_ai?: boolean;
  appearance_settings?: {
    theme: Theme;
    accent_color: string;
  };
  accounting_settings?: {
    allow_negative_stock: boolean;
    auto_share_whatsapp: boolean;
    show_debt_alerts: boolean;
    hide_zero_balances: boolean;
    decimal_precision: number;
    backup_frequency?: 'daily' | '12h'; // New: Backup frequency preference
  };
  last_daily_recap?: string;
  created_at?: string;
}

export type Page = 'login' | 'dashboard' | 'sales' | 'add-sale' | 'purchases' | 'add-purchase' | 'customers' | 'add-customer' | 'suppliers' | 'add-supplier' | 'categories' | 'add-category' | 'vouchers' | 'add-voucher' | 'voucher-details' | 'ai-advisor' | 'notifications' | 'expenses' | 'add-expense' | 'debts' | 'add-opening-balance' | 'reports' | 'settings' | 'scanner' | 'invoice-view' | 'purchase-invoice-view' | 'waste' | 'add-waste' | 'activity-log' | 'returns' | 'account-statement';
export type Theme = 'light' | 'dark' | 'system';

export interface ExchangeRates {
  SAR_TO_YER: number;
  OMR_TO_YER: number;
}

export interface Sale {
  id: string;
  user_id?: string;
  customer_id: string;
  customer_name: string;
  qat_type: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: 'نقدي' | 'آجل';
  currency: 'YER' | 'SAR' | 'OMR';
  notes?: string;
  date: string;
  is_returned?: boolean;
  returned_at?: string;
  created_at?: string;
  image_url?: string;
  image_base64_data?: string;
  image_mime_type?: string;
  image_file_name?: string;
}

export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  address?: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  region?: string;
  created_at?: string;
}

export interface Purchase {
  id: string;
  user_id?: string;
  supplier_id: string;
  supplier_name: string;
  qat_type: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: 'نقدي' | 'آجل';
  currency: 'YER' | 'SAR' | 'OMR';
  notes?: string;
  date: string;
  is_returned?: boolean;
  returned_at?: string;
  created_at?: string;
  image_url?: string;
  image_base64_data?: string;
  image_mime_type?: string;
  image_file_name?: string;
}

export interface VoucherEditEntry {
  date: string;
  previous_amount: number;
  previous_notes: string;
}

export interface Voucher {
  id: string;
  user_id?: string;
  type: 'قبض' | 'دفع';
  person_id: string;
  person_name: string;
  person_type: 'عميل' | 'مورد';
  amount: number;
  currency: 'YER' | 'SAR' | 'OMR';
  notes: string;
  date: string;
  edit_history?: VoucherEditEntry[];
  created_at?: string;
}

export interface QatCategory {
  id: string;
  user_id?: string;
  name: string;
  stock: number;
  price: number;
  currency: 'YER' | 'SAR' | 'OMR';
  low_stock_threshold: number;
  created_at?: string;
}

export type ExpenseFrequency = 'يومياً' | 'أسبوعياً' | 'شهرياً' | 'سنوياً';

export interface Expense {
  id: string;
  user_id?: string;
  title: string;
  category: string;
  amount: number;
  currency: 'YER' | 'SAR' | 'OMR';
  notes?: string;
  date: string;
  created_at?: string;
  image_url?: string;
  image_base64_data?: string;
  image_mime_type?: string;
  image_file_name?: string;
}

export interface ExpenseTemplate {
  id: string;
  user_id?: string;
  title: string;
  category: string;
  amount: number;
  currency: 'YER' | 'SAR' | 'OMR';
  frequency: ExpenseFrequency;
  created_at?: string;
}

export interface Waste {
  id: string;
  user_id?: string;
  qat_type: string;
  quantity: number;
  estimated_loss: number;
  reason: string;
  date: string;
  created_at?: string;
}

// NEW: Interface for OpeningBalance to accurately type initial debt/credit records
export interface OpeningBalance {
  id: string;
  user_id?: string;
  person_id: string;
  person_name: string;
  person_type: 'عميل' | 'مورد';
  amount: number;
  currency: 'YER' | 'SAR' | 'OMR';
  balance_type: 'مدين' | 'دائن'; // مدين (لنا عنده), دائن (له عندنا)
  notes?: string;
  date: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'ai_alert';
  date: string;
  read: boolean;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'sale' | 'purchase' | 'voucher' | 'waste' | 'general' | 'auth' | 'settings' | 'expense' | 'data';
}

export class AppError extends Error {
  code?: string;
  status?: number;
  isNetworkError: boolean;
  constructor(message: string, code?: string, status?: number, isNetworkError: boolean = false) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

export interface OfflineOperation {
  id: string;
  userId: string;
  action: 'saveSale' | 'saveCategory' | 'savePurchase' | 'saveCustomer' | 'saveSupplier' | 'returnSale' | 'returnPurchase' | 'saveVoucher' | 'saveExpense' | 'saveWaste' | 'updateSettings' | 'saveOpeningBalance' | 'saveExpenseTemplate' | 'updateProfile' | 'deleteRecord' | 'saveNotification' | 'markAllNotificationsRead';
  tableName?: string;
  originalId?: string;
  tempId?: string;
  payload: any & { 
    image_base64_data?: string; 
    image_mime_type?: string; 
    image_file_name?: string; 
    record_type_for_image?: 'sales' | 'purchases' | 'expenses';
  };
  timestamp: number;
}
