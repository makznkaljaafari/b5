
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xaolczjmsrksqqihnlus.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhb2xjemptc3Jrc3FxaWhubHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODQwNTMsImV4cCI6MjA4MzI2MDA1M30.ougfFYFORr4XNsnGvzxbq9KygpllLxGzv2e6n5OdpIo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'alshwaia_auth_session',
  },
  global: {
    // تم إزالة الترويسات المخصصة لتقليل تعقيد طلبات CORS ومنع أخطاء Failed to fetch
    // No custom headers are added globally, rely on default fetch behavior
  }
});
