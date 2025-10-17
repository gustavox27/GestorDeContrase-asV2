import { useState, useEffect } from 'react';
import { Share2, Mail, X, Check, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DecryptedVaultItem } from '../../types/vault';

export const ShareSection = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedPasswords, setCopiedPasswords] = useState(false);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('id, title, item_type, website_url, logo_url')
        .eq('user_id', user!.id)
        .order('title');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleShare = async () => {
    if (!shareEmail || selectedItems.size === 0) return;

    setLoading(true);
    try {
      const { data: recipientData, error: userError } = await supabase
        .from('users_profile')
        .select('id')
        .eq('id', shareEmail)
        .maybeSingle();

      if (userError || !recipientData) {
        alert('Usuario no encontrado');
        return;
      }

      const sharePromises = Array.from(selectedItems).map((itemId) =>
        supabase.from('shared_items').insert({
          vault_item_id: itemId,
          owner_id: user!.id,
          shared_with_id: recipientData.id,
          can_edit: false,
        })
      );

      await Promise.all(sharePromises);
      alert('Contraseñas compartidas exitosamente');
      setShowModal(false);
      setShareEmail('');
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Error al compartir contraseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPasswords = async () => {
    if (selectedItems.size === 0) return;

    const selectedItemsList = items.filter((item) => selectedItems.has(item.id));
    const passwordsText = selectedItemsList
      .map((item) => `${item.title}\nURL: ${item.website_url || 'N/A'}`)
      .join('\n\n');

    await navigator.clipboard.writeText(passwordsText);
    setCopiedPasswords(true);
    setTimeout(() => setCopiedPasswords(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Share2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Centro para Compartir</h2>
            <p className="text-sm text-gray-600">
              {selectedItems.size} elemento{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {selectedItems.size > 0 && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Compartir con
            </button>
            <button
              onClick={handleCopyPasswords}
              className="flex-1 px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              {copiedPasswords ? (
                <>
                  <Check className="w-5 h-5" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar Contraseñas
                </>
              )}
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No tienes elementos para compartir</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => handleToggleItem(item.id)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                {item.logo_url ? (
                  <img
                    src={item.logo_url}
                    alt={item.title}
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/32/3B82F6/FFFFFF?text=' + item.title[0];
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{item.title[0]}</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  {item.website_url && (
                    <p className="text-sm text-gray-500">{item.website_url}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Compartir con</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico del destinatario
              </label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="usuario@ejemplo.com"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleShare}
                  disabled={loading || !shareEmail}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Compartiendo...' : 'Compartir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
