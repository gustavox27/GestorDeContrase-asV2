import { useState, useEffect } from 'react';
import { Search, LogOut, Shield, Bell, Star, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { EncryptionService } from '../lib/encryption';
import { LogoService } from '../lib/logoService';
import { DecryptedVaultItem } from '../types/vault';
import { Sidebar } from './layout/Sidebar';
import { AllItemsTab } from './tabs/AllItemsTab';
import { PasswordsTab } from './tabs/PasswordsTab';
import { WifiTab } from './tabs/WifiTab';
import { PasswordModal } from './modals/PasswordModal';
import { WifiModal } from './modals/WifiModal';
import { GeneratorSection } from './sections/GeneratorSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { ShareSection } from './sections/ShareSection';
import { AnalysisSection } from './sections/AnalysisSection';
import { SettingsSection } from './sections/SettingsSection';

type Tab = 'all' | 'passwords' | 'wifi';
type Section = 'home' | 'notifications' | 'generator' | 'share' | 'analysis' | 'settings';

export const MainDashboard = () => {
  const { user, encryptionKey, signOut } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DecryptedVaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<Tab>('all');
  const [currentSection, setCurrentSection] = useState<Section>('home');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | undefined>();
  const [defaultWebsite, setDefaultWebsite] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (user && encryptionKey && mounted) {
        await loadVaultItems();
        await loadUnreadNotifications();
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [user?.id, encryptionKey]);

  useEffect(() => {
    filterItems();
  }, [searchQuery, items, filterFavorites]);

  const loadUnreadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('id')
        .eq('user_id', user!.id)
        .eq('resolved', false);

      if (error) throw error;
      setUnreadNotifications(data?.length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadVaultItems = async () => {
    if (!encryptionKey || !user) return;

    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('favorite', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const decrypted = await Promise.all(
        (data || []).map(async (item) => {
          const decryptedData = await EncryptionService.decrypt(item.encrypted_data, encryptionKey);
          const parsed = JSON.parse(decryptedData);
          return {
            id: item.id,
            title: item.title,
            item_type: item.item_type,
            website_url: item.website_url || undefined,
            logo_url: item.logo_url || undefined,
            category: item.category || undefined,
            favorite: item.favorite,
            last_used: item.last_used || undefined,
            ...parsed,
          };
        })
      );

      setItems(decrypted);
    } catch (error) {
      console.error('Failed to load vault items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    if (filterFavorites) {
      filtered = filtered.filter((item) => item.favorite);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.username?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.website_url?.toLowerCase().includes(query) ||
          item.ssid?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleSavePassword = async (itemData: Partial<DecryptedVaultItem>) => {
    if (!encryptionKey || !user) return;

    const { title, username, password, website_url, category, notes } = itemData;

    if (!title) throw new Error('Title is required');

    let logoUrl = itemData.logo_url;
    let domain = null;

    if (website_url) {
      domain = LogoService.extractDomain(website_url);
      logoUrl = await LogoService.detectLogo({
        title,
        websiteUrl: website_url,
        username,
      });
    } else if (username?.includes('@')) {
      logoUrl = await LogoService.detectLogo({
        title,
        username,
      });
    }

    if (!logoUrl) {
      logoUrl = LogoService.getFallbackIcon(title);
    }

    const dataToEncrypt = JSON.stringify({
      username,
      password,
      notes,
    });

    const encryptedData = await EncryptionService.encrypt(dataToEncrypt, encryptionKey);

    if (editingItem?.id) {
      const { error } = await supabase
        .from('vault_items')
        .update({
          title,
          encrypted_data: encryptedData,
          website_url: website_url || null,
          website_domain: domain,
          logo_url: logoUrl,
          category: category || null,
        })
        .eq('id', editingItem.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('vault_items').insert({
        user_id: user.id,
        item_type: 'password',
        title,
        encrypted_data: encryptedData,
        website_url: website_url || null,
        website_domain: domain,
        logo_url: logoUrl,
        category: category || null,
        favorite: false,
      });

      if (error) throw error;
    }

    await loadVaultItems();
    setShowPasswordModal(false);
    setEditingItem(undefined);
    setDefaultWebsite(undefined);
  };

  const handleSaveWifi = async (itemData: Partial<DecryptedVaultItem>) => {
    if (!encryptionKey || !user) return;

    const { title, ssid, password, notes } = itemData;

    if (!title) throw new Error('Title is required');

    const dataToEncrypt = JSON.stringify({
      ssid,
      password,
      notes,
    });

    const encryptedData = await EncryptionService.encrypt(dataToEncrypt, encryptionKey);

    if (editingItem?.id) {
      const { error } = await supabase
        .from('vault_items')
        .update({
          title,
          encrypted_data: encryptedData,
        })
        .eq('id', editingItem.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('vault_items').insert({
        user_id: user.id,
        item_type: 'wifi',
        title,
        encrypted_data: encryptedData,
        favorite: false,
      });

      if (error) throw error;
    }

    await loadVaultItems();
    setShowWifiModal(false);
    setEditingItem(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('vault.deleteConfirm'))) return;

    const { error } = await supabase.from('vault_items').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete item:', error);
      return;
    }

    await loadVaultItems();
  };

  const handleToggleFavorite = async (id: string, favorite: boolean) => {
    const { error } = await supabase.from('vault_items').update({ favorite }).eq('id', id);

    if (error) {
      console.error('Failed to update favorite:', error);
      return;
    }

    await loadVaultItems();
  };

  const handleEdit = (item: DecryptedVaultItem) => {
    setEditingItem(item);
    if (item.item_type === 'wifi') {
      setShowWifiModal(true);
    } else {
      setShowPasswordModal(true);
    }
  };

  const handleAddPassword = (website?: string) => {
    setEditingItem(undefined);
    setDefaultWebsite(website);
    setShowPasswordModal(true);
  };

  const handleAddWifi = () => {
    setEditingItem(undefined);
    setShowWifiModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentSection={currentSection}
        onSectionChange={(section) => setCurrentSection(section as Section)}
        userEmail={user?.email || ''}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0 lg:ml-20' : 'ml-0 lg:ml-64'
        }`}
      >
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-8 h-8 sm:w-10 sm:h-10 theme-bg-gradient rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">{t('app.title')}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setCurrentSection('notifications');
                    loadUnreadNotifications();
                  }}
                  className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{t('auth.signOut')}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {currentSection === 'home' && (
            <>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('vault.searchPlaceholder')}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base bg-white border border-gray-300 rounded-xl focus:ring-2 theme-border-primary focus:border-transparent outline-none transition"
                  />
                </div>
                <button
                  onClick={() => setFilterFavorites(!filterFavorites)}
                  className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-xl font-medium transition flex items-center gap-1 sm:gap-2 ${
                    filterFavorites
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${filterFavorites ? 'fill-white' : ''}`} />
                  <span className="hidden md:inline">{t('vault.favorites')}</span>
                </button>
              </div>

              <div className="flex gap-1 sm:gap-2 lg:gap-4 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => setCurrentTab('all')}
                  className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base font-medium transition border-b-2 whitespace-nowrap ${
                    currentTab === 'all'
                      ? 'theme-border-primary theme-text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('vault.allItems')} ({items.length})
                </button>
                <button
                  onClick={() => setCurrentTab('passwords')}
                  className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base font-medium transition border-b-2 whitespace-nowrap ${
                    currentTab === 'passwords'
                      ? 'theme-border-primary theme-text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('vault.passwords')} ({items.filter((i) => i.item_type === 'password').length})
                </button>
                <button
                  onClick={() => setCurrentTab('wifi')}
                  className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base font-medium transition border-b-2 whitespace-nowrap ${
                    currentTab === 'wifi'
                      ? 'theme-border-primary theme-text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('vault.wifi')} ({items.filter((i) => i.item_type === 'wifi').length})
                </button>
              </div>

              {currentTab === 'all' && (
                <AllItemsTab
                  items={filteredItems}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onAdd={() => handleAddPassword()}
                />
              )}

              {currentTab === 'passwords' && (
                <PasswordsTab
                  items={filteredItems}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onAddPassword={handleAddPassword}
                />
              )}

              {currentTab === 'wifi' && (
                <WifiTab
                  items={filteredItems}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onAddWifi={handleAddWifi}
                />
              )}
            </>
          )}

          {currentSection === 'generator' && <GeneratorSection />}
          {currentSection === 'notifications' && <NotificationsSection />}
          {currentSection === 'share' && <ShareSection />}
          {currentSection === 'analysis' && <AnalysisSection />}
          {currentSection === 'settings' && <SettingsSection />}
        </main>
      </div>

      {showPasswordModal && (
        <PasswordModal
          item={editingItem}
          onClose={() => {
            setShowPasswordModal(false);
            setEditingItem(undefined);
            setDefaultWebsite(undefined);
          }}
          onSave={handleSavePassword}
          defaultWebsite={defaultWebsite}
        />
      )}

      {showWifiModal && (
        <WifiModal
          item={editingItem}
          onClose={() => {
            setShowWifiModal(false);
            setEditingItem(undefined);
          }}
          onSave={handleSaveWifi}
        />
      )}
    </div>
  );
};
