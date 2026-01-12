
import { z } from 'zod';

const currencySchema = z.enum(['YER', 'SAR', 'OMR']);
const statusSchema = z.enum(['نقدي', 'آجل']);

export const customerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين").max(100),
  phone: z.string().min(7, "رقم الهاتف يجب أن يكون 7 أرقام على الأقل"),
  address: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2, "اسم المورد مطلوب"),
  phone: z.string().min(7, "رقم الهاتف غير صحيح"),
  region: z.string().optional(),
});

export const saleSchema = z.object({
  customer_id: z.string().uuid("معرف العميل غير صحيح"),
  customer_name: z.string(),
  qat_type: z.string().min(1, "يجب اختيار نوع القات"),
  quantity: z.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  unit_price: z.number().nonnegative("السعر لا يمكن أن يكون سالباً"),
  total: z.number(),
  status: statusSchema,
  currency: currencySchema,
  notes: z.string().optional(),
  date: z.string(),
  image_url: z.string().url().optional(), // New: image_url
});

export const purchaseSchema = z.object({
  supplier_id: z.string().uuid("معرف المورد غير صحيح"),
  supplier_name: z.string(),
  qat_type: z.string().min(1, "يجب اختيار نوع القات"),
  quantity: z.number().positive("الكمية المشتراة يجب أن تكون أكبر من صفر"),
  unit_price: z.number().nonnegative("السعر لا يمكن أن يكون سالباً"),
  total: z.number(),
  status: statusSchema,
  currency: currencySchema,
  notes: z.string().optional(),
  date: z.string(),
  image_url: z.string().url().optional(), // New: image_url
});

export const voucherSchema = z.object({
  type: z.enum(['قبض', 'دفع']),
  person_id: z.string().uuid(),
  person_name: z.string(),
  person_type: z.enum(['عميل', 'مورد']),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  currency: currencySchema,
  notes: z.string().optional(),
  date: z.string(),
});

export const expenseSchema = z.object({
  title: z.string().min(2, "بيان المصروف قصير جداً"),
  category: z.string().min(1, "يجب اختيار فئة المصروف"),
  amount: z.number().positive("مبلغ المصروف يجب أن يكون أكبر من صفر"),
  currency: currencySchema,
  notes: z.string().optional(),
  date: z.string(),
  image_url: z.string().url().optional(), // New: image_url
});

export const categorySchema = z.object({
  name: z.string().min(1, "اسم الصنف مطلوب"),
  stock: z.number().nonnegative(),
  price: z.number().nonnegative(),
  currency: currencySchema,
  low_stock_threshold: z.number().optional().default(5),
});

export const wasteSchema = z.object({
  qat_type: z.string().min(1),
  quantity: z.number().positive(),
  estimated_loss: z.number().nonnegative(),
  reason: z.string().min(5, "يرجى كتابة سبب التلف بالتفصيل"),
  date: z.string(),
});