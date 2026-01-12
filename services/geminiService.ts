
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Sale, Expense, ChatMessage, QatCategory, AppError } from "../types";
import { logger } from "./loggerService";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let isQuotaExhausted = false;
let quotaResetTime = 0;

export const SYSTEM_INSTRUCTION = `
أنت "المحاسب الذكي" لوكالة الشويع للقات. خبير محاسبي يمني يدير النظام كاملاً بالصوت.

قدراتك المتقدمة:
1. الإضافة: تسجيل (بيع، شراء، مصاريف، سندات، عملاء، موردين).
2. الحذف: يمكنك حذف العمليات إذا طلب المدير (مثال: "احذف آخر عملية لفلان").
3. التعديل: يمكنك تعديل مبالغ أو تفاصيل العمليات (مثال: "غير سعر فاتورة زيد إلى 4000").
4. التقارير: استخراج كشوفات حساب ومشاركتها واتساب.

قواعد التعامل مع السجلات:
- عند الحذف أو التعديل: ابحث عن العملية بالاسم والمبلغ التقريبي.
- التأكيد: أخبر المدير أنك جهزت العملية وعليه الضغط على "تأكيد" من الشاشة.
- اللهجة: تحدث بلهجة سوق يمنية محترمة ومختصرة.
`;

export const aiTools: FunctionDeclaration[] = [
  {
    name: 'recordSale',
    description: 'تسجيل عملية بيع جديدة.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer_name: { type: Type.STRING },
        qat_type: { type: Type.STRING },
        quantity: { type: Type.NUMBER },
        unit_price: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        status: { type: Type.STRING, enum: ['نقدي', 'آجل'] }
      },
      required: ['customer_name', 'qat_type', 'quantity', 'unit_price', 'currency', 'status']
    }
  },
  {
    name: 'recordPurchase',
    description: 'تسجيل عملية شراء بضاعة.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        supplier_name: { type: Type.STRING },
        qat_type: { type: Type.STRING },
        quantity: { type: Type.NUMBER },
        unit_price: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        status: { type: Type.STRING, enum: ['نقدي', 'آجل'] }
      },
      required: ['supplier_name', 'qat_type', 'quantity', 'unit_price', 'currency', 'status']
    }
  },
  {
    name: 'recordVoucher',
    description: 'تسجيل سند قبض أو دفع.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['قبض', 'دفع'] },
        person_name: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        currency: { type: Type.STRING, enum: ['YER', 'SAR', 'OMR'] },
        notes: { type: Type.STRING }
      },
      required: ['type', 'person_name', 'amount', 'currency']
    }
  },
  {
    name: 'deleteTransaction',
    description: 'حذف عملية سابقة (فاتورة أو سند).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        record_type: { type: Type.STRING, enum: ['sale', 'purchase', 'voucher', 'expense'] },
        person_name: { type: Type.STRING },
        amount_hint: { type: Type.NUMBER, description: 'المبلغ التقريبي للعملية المراد حذفها' }
      },
      required: ['record_type', 'person_name']
    }
  },
  {
    name: 'updateTransaction',
    description: 'تعديل بيانات عملية سابقة.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        record_type: { type: Type.STRING, enum: ['sale', 'purchase', 'voucher', 'expense'] },
        person_name: { type: Type.STRING },
        new_amount: { type: Type.NUMBER },
        new_quantity: { type: Type.NUMBER },
        new_notes: { type: Type.STRING }
      },
      required: ['record_type', 'person_name']
    }
  },
  {
    name: 'managePerson',
    description: 'إضافة عميل أو مورد جديد.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['عميل', 'مورد'] },
        name: { type: Type.STRING },
        phone: { type: Type.STRING }
      },
      required: ['type', 'name']
    }
  },
  {
    name: 'shareStatement',
    description: 'إرسال كشف حساب واتساب.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        person_name: { type: Type.STRING },
        person_type: { type: Type.STRING, enum: ['عميل', 'مورد'] }
      },
      required: ['person_name', 'person_type']
    }
  }
];

async function retryAI<T>(fn: (signal?: AbortSignal) => Promise<T>, retries = 2, delay = 2000, signal?: AbortSignal): Promise<T> {
  if (isQuotaExhausted && Date.now() < quotaResetTime) {
    throw new AppError("المحاسب الذكي استنفد طاقته حالياً. يرجى الانتظار دقيقة.", "QUOTA_LOCK", 429, true);
  }
  try {
    const result = await fn(signal);
    isQuotaExhausted = false; 
    return result;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      logger.warn('AI request aborted:', error.message);
      throw error; // Re-throw AbortError immediately
    }
    if (error.status === 429) {
      isQuotaExhausted = true;
      quotaResetTime = Date.now() + 60000;
      throw new AppError("المحاسب استنفد طاقته، انتظر دقيقة.", "QUOTA_EXHAUSTED", 429, true);
    }
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return retryAI(fn, retries - 1, delay * 2, signal);
    }
    throw error;
  }
}

export const getChatResponse = async (message: string, history: ChatMessage[], context: any, signal?: AbortSignal) => {
  const ai = getAIClient();
  const ctxStr = `السياق: ${context.customers?.length} عملاء، ${context.suppliers?.length} موردين.`;

  try {
    const response = await retryAI(async (s) => {
      const chatResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION + "\n" + ctxStr,
          tools: [{ functionDeclarations: aiTools }],
          thinkingConfig: { thinkingBudget: 0 }
        },
      }, { signal: s }); // Pass signal here
      return { text: chatResponse.text, toolCalls: chatResponse.functionCalls || [] };
    }, 2, 2000, signal);
    return response;
  } catch(e: any) {
    if (e.name === 'AbortError') throw e; // Re-throw AbortError
    logger.error("AI Error:", e);
    throw new AppError("فشل في معالجة الطلب عبر Gemini.", "AI_ERROR", 500, true);
  }
};

export const getFinancialForecast = async (sales: Sale[], expenses: Expense[], categories: QatCategory[], signal?: AbortSignal) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بيانات: مبيعات:${sales.length}, مصاريف:${expenses.length}. هات نصيحة سوقية واحدة بلهجة يمنية.`,
      config: { systemInstruction: SYSTEM_INSTRUCTION, thinkingConfig: { thinkingBudget: 0 } }
    }, { signal }); // Pass signal here
    return response.text || "السوق طيب يا مدير، واصل العمل بجد.";
  } catch(e: any) {
    if (e.name === 'AbortError') throw e; // Re-throw AbortError
    logger.error("Financial Forecast AI Error:", e); // Use a specific log message
    return "ركز على تحصيل الديون ومراقبة المصاريف."; 
  }
};
