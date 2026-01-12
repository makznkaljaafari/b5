
import { supabase } from '../supabaseClient';
import { baseService, withRetry } from './base';
import { Voucher, Expense, ExpenseTemplate } from '../../types';

export const financeApiService = {
  async getVouchers(f = false, signal?: AbortSignal) { return withRetry<Voucher[]>(() => supabase.from('vouchers').select('*', { count: 'exact', head: false, signal }).order('date', { ascending: false }), 'vchs', f, 2, signal); },
  async getExpenses(f = false, signal?: AbortSignal) { return withRetry<Expense[]>(() => supabase.from('expenses').select('*', { count: 'exact', head: false, signal }).order('date', { ascending: false }), 'exps', f, 2, signal); },
  async getExpenseTemplates(f = false, signal?: AbortSignal) { return withRetry<ExpenseTemplate[]>(() => supabase.from('expense_templates').select('*', { count: 'exact', head: false, signal }).order('title'), 'exp_templates', f, 2, signal); },

  async saveVoucher(v: any, skipQueue = false, signal?: AbortSignal) { return baseService.safeUpsert('vouchers', v, 'saveVoucher', skipQueue, signal); },
  async saveExpense(e: any, skipQueue = false, signal?: AbortSignal) { return baseService.safeUpsert('expenses', e, 'saveExpense', skipQueue, signal); },
  async saveExpenseTemplate(t: any, skipQueue = false, signal?: AbortSignal) { return baseService.safeUpsert('expense_templates', t, 'saveExpenseTemplate', skipQueue, signal); },
  async saveOpeningBalance(b: any, skipQueue = false, signal?: AbortSignal) { return baseService.safeUpsert('opening_balances', b, 'saveOpeningBalance', skipQueue, signal); }
};
