import { useState, useEffect } from 'react';
import { Plus, Search, LogOut, Shield, AlertTriangle, Star, Grid, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { EncryptionService } from '../../lib/encryption';
import { LogoService } from '../../lib/logoService';
import { VaultItem } from './VaultItem';
import { AddEditModal } from './AddEditModal';

interface DecryptedVaultItem {
  id: string;
  title: string;
  username?: string;
  password?: string;
  website_url?: string;
  logo_url?: string;
  category?: string;
  favorite: boolean;
  last_used?: string;
  notes?: string;
}

export const VaultDashboard = () => {
  const { user, encryptionKey, signOut } = useAuth();
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DecryptedVaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | undefined>();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchItems = async () => {
      if (user && encryptionKey && mounted) {
        await loadVaultItems();
      }
    };

    fetchItems();

    return () => {
      mounted = false;
    };
  }, [user?.id, encryptionKey]);

  useEffect(() => {
    filterItems();
  }, [searchQuery, items, filterFavorites]);

  const loadVaultItems = async () => {
    if (!encryptionKey) return;

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
          item.website_url?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleSave = async (itemData: Partial<DecryptedVaultItem>) => {
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
    setShowModal(false);
    setEditingItem(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

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
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingItem(undefined);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SecureVault</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your vault..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`px-4 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                filterFavorites
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-5 h-5 ${filterFavorites ? 'fill-white' : ''}`} />
              Favorites
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchQuery || filterFavorites ? (
                <AlertTriangle className="w-10 h-10 text-gray-400" />
              ) : (
                <Shield className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filterFavorites ? 'No items found' : 'Your vault is empty'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterFavorites
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first password'}
            </p>
            {!searchQuery && !filterFavorites && (
              <button
                onClick={handleAdd}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredItems.map((item) => (
              <VaultItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddEditModal item={editingItem} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
};
