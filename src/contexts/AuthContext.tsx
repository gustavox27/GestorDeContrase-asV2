import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { EncryptionService } from '../lib/encryption';

interface AuthContextType {
  user: User | null;
  encryptionKey: CryptoKey | null;
  loading: boolean;
  signUp: (email: string, password: string, masterPassword: string) => Promise<void>;
  signIn: (email: string, password: string, masterPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateMasterPassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setEncryptionKey(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, masterPassword: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');

    const salt = await EncryptionService.generateSalt();
    const masterPasswordHash = await EncryptionService.hashMasterPassword(masterPassword, salt);

    const { error: profileError } = await supabase
      .from('users_profile')
      .insert({
        id: data.user.id,
        master_password_hash: masterPasswordHash,
        encryption_salt: salt,
        two_factor_enabled: false,
      });

    if (profileError) throw profileError;

    const key = await EncryptionService.deriveKey(masterPassword, salt);
    setEncryptionKey(key);
  };

  const signIn = async (email: string, password: string, masterPassword: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Failed to sign in');

    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('encryption_salt, master_password_hash')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error('User profile not found');

    const masterPasswordHash = await EncryptionService.hashMasterPassword(
      masterPassword,
      profile.encryption_salt
    );

    if (masterPasswordHash !== profile.master_password_hash) {
      await supabase.auth.signOut();
      throw new Error('Invalid master password');
    }

    const key = await EncryptionService.deriveKey(masterPassword, profile.encryption_salt);
    setEncryptionKey(key);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setEncryptionKey(null);
  };

  const updateMasterPassword = async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error('No user logged in');

    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('encryption_salt, master_password_hash')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error('User profile not found');

    const oldPasswordHash = await EncryptionService.hashMasterPassword(
      oldPassword,
      profile.encryption_salt
    );

    if (oldPasswordHash !== profile.master_password_hash) {
      throw new Error('Invalid old master password');
    }

    const newSalt = await EncryptionService.generateSalt();
    const newPasswordHash = await EncryptionService.hashMasterPassword(newPassword, newSalt);

    const oldKey = await EncryptionService.deriveKey(oldPassword, profile.encryption_salt);
    const newKey = await EncryptionService.deriveKey(newPassword, newSalt);

    const { data: vaultItems, error: fetchError } = await supabase
      .from('vault_items')
      .select('id, encrypted_data')
      .eq('user_id', user.id);

    if (fetchError) throw fetchError;

    if (vaultItems && vaultItems.length > 0) {
      for (const item of vaultItems) {
        const decrypted = await EncryptionService.decrypt(item.encrypted_data, oldKey);
        const reEncrypted = await EncryptionService.encrypt(decrypted, newKey);

        const { error: updateError } = await supabase
          .from('vault_items')
          .update({ encrypted_data: reEncrypted })
          .eq('id', item.id);

        if (updateError) throw updateError;
      }
    }

    const { error: updateProfileError } = await supabase
      .from('users_profile')
      .update({
        master_password_hash: newPasswordHash,
        encryption_salt: newSalt,
      })
      .eq('id', user.id);

    if (updateProfileError) throw updateProfileError;

    setEncryptionKey(newKey);
  };

  const value = {
    user,
    encryptionKey,
    loading,
    signUp,
    signIn,
    signOut,
    updateMasterPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
