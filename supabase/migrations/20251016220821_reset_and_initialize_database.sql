/*
  # Reset and Initialize Password Manager Database

  1. Description
    - Complete database reset and initialization
    - Creates all tables with proper structure
    - Enables Row Level Security
    - Sets up all necessary policies

  2. Tables
    - users_profile: User profiles with encryption data
    - vault_items: Encrypted vault items (passwords, wifi, etc.)
    - shared_items: Shared vault items between users
    - security_alerts: Security notifications and alerts

  3. Security
    - RLS enabled on all tables
    - Comprehensive policies for data access
    - User isolation enforced
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
  item_type text NOT NULL CHECK (item_type IN ('password', 'note', 'card', 'wifi')),
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON users_profile;
  DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;
  DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
  DROP POLICY IF EXISTS "Users can view own vault items" ON vault_items;
  DROP POLICY IF EXISTS "Users can insert own vault items" ON vault_items;
  DROP POLICY IF EXISTS "Users can update own vault items" ON vault_items;
  DROP POLICY IF EXISTS "Users can delete own vault items" ON vault_items;
  DROP POLICY IF EXISTS "Users can view shared items they own or received" ON shared_items;
  DROP POLICY IF EXISTS "Owners can insert shared items" ON shared_items;
  DROP POLICY IF EXISTS "Owners can update shared items" ON shared_items;
  DROP POLICY IF EXISTS "Owners can delete shared items" ON shared_items;
  DROP POLICY IF EXISTS "Users can view own security alerts" ON security_alerts;
  DROP POLICY IF EXISTS "Users can insert own security alerts" ON security_alerts;
  DROP POLICY IF EXISTS "Users can update own security alerts" ON security_alerts;
  DROP POLICY IF EXISTS "Users can delete own security alerts" ON security_alerts;
END $$;

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
DROP TRIGGER IF EXISTS update_users_profile_updated_at ON users_profile;
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vault_items_updated_at ON vault_items;
CREATE TRIGGER update_vault_items_updated_at
  BEFORE UPDATE ON vault_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();