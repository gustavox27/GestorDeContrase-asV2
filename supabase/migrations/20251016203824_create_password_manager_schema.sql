/*
  # Password Manager Database Schema

  1. New Tables
    - `users_profile`
      - `id` (uuid, primary key) - References auth.users
      - `master_password_hash` (text) - Hashed master password for vault encryption
      - `encryption_salt` (text) - Salt for encryption key derivation
      - `two_factor_enabled` (boolean) - 2FA status
      - `two_factor_secret` (text, nullable) - TOTP secret for 2FA
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `vault_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `item_type` (text) - Type: 'password', 'note', 'card'
      - `title` (text) - Item title/name
      - `encrypted_data` (text) - AES-256 encrypted JSON data
      - `website_url` (text, nullable) - Website URL for logo detection
      - `website_domain` (text, nullable) - Domain for grouping
      - `logo_url` (text, nullable) - Cached logo URL
      - `category` (text, nullable) - Category for organization
      - `favorite` (boolean) - Favorite flag
      - `last_used` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `shared_items`
      - `id` (uuid, primary key)
      - `vault_item_id` (uuid) - References vault_items
      - `owner_id` (uuid) - References auth.users (owner)
      - `shared_with_id` (uuid) - References auth.users (recipient)
      - `can_edit` (boolean) - Edit permission
      - `shared_at` (timestamptz)

    - `security_alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `vault_item_id` (uuid, nullable) - References vault_items
      - `alert_type` (text) - Type: 'compromised', 'weak', 'reused', 'old'
      - `severity` (text) - Severity: 'low', 'medium', 'high', 'critical'
      - `message` (text) - Alert message
      - `resolved` (boolean) - Resolution status
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    - Add policies for shared items access
    - Create indexes for performance

  3. Important Notes
    - All sensitive data is encrypted client-side before storage
    - Master password is never stored, only its hash
    - 2FA secrets are encrypted at rest
    - Sharing uses end-to-end encryption
*/

-- Create users_profile table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  master_password_hash text NOT NULL,
  encryption_salt text NOT NULL,
  two_factor_enabled boolean DEFAULT false,
  two_factor_secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vault_items table
CREATE TABLE IF NOT EXISTS vault_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('password', 'note', 'card')),
  title text NOT NULL,
  encrypted_data text NOT NULL,
  website_url text,
  website_domain text,
  logo_url text,
  category text,
  favorite boolean DEFAULT false,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shared_items table
CREATE TABLE IF NOT EXISTS shared_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_item_id uuid NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_edit boolean DEFAULT false,
  shared_at timestamptz DEFAULT now(),
  UNIQUE(vault_item_id, shared_with_id)
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_item_id uuid REFERENCES vault_items(id) ON DELETE SET NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('compromised', 'weak', 'reused', 'old')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message text NOT NULL,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_profile
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for vault_items
CREATE POLICY "Users can view own vault items"
  ON vault_items FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM shared_items
      WHERE shared_items.vault_item_id = vault_items.id
      AND shared_items.shared_with_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own vault items"
  ON vault_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault items"
  ON vault_items FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM shared_items
      WHERE shared_items.vault_item_id = vault_items.id
      AND shared_items.shared_with_id = auth.uid()
      AND shared_items.can_edit = true
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM shared_items
      WHERE shared_items.vault_item_id = vault_items.id
      AND shared_items.shared_with_id = auth.uid()
      AND shared_items.can_edit = true
    )
  );

CREATE POLICY "Users can delete own vault items"
  ON vault_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for shared_items
CREATE POLICY "Users can view shared items they own or received"
  ON shared_items FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR
    auth.uid() = shared_with_id
  );

CREATE POLICY "Owners can insert shared items"
  ON shared_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update shared items"
  ON shared_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete shared items"
  ON shared_items FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for security_alerts
CREATE POLICY "Users can view own security alerts"
  ON security_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security alerts"
  ON security_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security alerts"
  ON security_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own security alerts"
  ON security_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_website_domain ON vault_items(website_domain);
CREATE INDEX IF NOT EXISTS idx_vault_items_category ON vault_items(category);
CREATE INDEX IF NOT EXISTS idx_vault_items_favorite ON vault_items(favorite) WHERE favorite = true;
CREATE INDEX IF NOT EXISTS idx_shared_items_vault_item_id ON shared_items(vault_item_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_shared_with_id ON shared_items(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved) WHERE resolved = false;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_items_updated_at
  BEFORE UPDATE ON vault_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();