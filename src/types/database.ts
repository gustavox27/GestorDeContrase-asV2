export type ItemType = 'password' | 'note' | 'card' | 'wifi';

export type AlertType = 'compromised' | 'weak' | 'reused' | 'old';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface UserProfile {
  id: string;
  master_password_hash: string;
  encryption_salt: string;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  created_at: string;
  updated_at: string;
}

export interface VaultItem {
  id: string;
  user_id: string;
  item_type: ItemType;
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
}

export interface DecryptedPasswordData {
  username: string;
  password: string;
  website: string;
  notes?: string;
}

export interface DecryptedWifiData {
  ssid: string;
  password: string;
  notes?: string;
}

export interface SharedItem {
  id: string;
  vault_item_id: string;
  owner_id: string;
  shared_with_id: string;
  can_edit: boolean;
  shared_at: string;
}

export interface SecurityAlert {
  id: string;
  user_id: string;
  vault_item_id: string | null;
  alert_type: AlertType;
  severity: Severity;
  message: string;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

export interface PasswordAnalysis {
  total: number;
  strong: number;
  weak: number;
  reused: number;
  compromised: number;
}
