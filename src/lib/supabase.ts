import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string;
          master_password_hash: string;
          encryption_salt: string;
          two_factor_enabled: boolean;
          two_factor_secret: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users_profile']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users_profile']['Insert']>;
      };
      vault_items: {
        Row: {
          id: string;
          user_id: string;
          item_type: 'password' | 'note' | 'card';
          title: string;
          encrypted_data: string;
          website_url: string | null;
          website_domain: string | null;
          logo_url: string | null;
          category: string | null;
          favorite: boolean;
          last_used: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vault_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['vault_items']['Insert']>;
      };
      security_alerts: {
        Row: {
          id: string;
          user_id: string;
          vault_item_id: string | null;
          alert_type: 'compromised' | 'weak' | 'reused' | 'old';
          severity: 'low' | 'medium' | 'high' | 'critical';
          message: string;
          resolved: boolean;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['security_alerts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['security_alerts']['Insert']>;
      };
    };
  };
}
