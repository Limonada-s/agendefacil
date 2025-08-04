
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://febxxhtiussbpzenpyro.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlYnh4aHRpdXNzYnB6ZW5weXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTU0NDIsImV4cCI6MjA2NTA5MTQ0Mn0.uksheAgXL8uglpYM0F3flOM5NyF_94_hrqqDkJMjLME';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
