export interface DecryptedVaultItem {
  id: string;
  title: string;
  item_type: 'password' | 'wifi' | 'note' | 'card';
  username?: string;
  password?: string;
  website_url?: string;
  logo_url?: string;
  category?: string;
  favorite: boolean;
  last_used?: string;
  notes?: string;
  ssid?: string;
}
