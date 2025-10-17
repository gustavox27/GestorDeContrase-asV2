import { Plus, Wifi } from 'lucide-react';
import { DecryptedVaultItem } from '../../types/vault';
import { VaultItem } from '../vault/VaultItem';

interface WifiTabProps {
  items: DecryptedVaultItem[];
  onEdit: (item: DecryptedVaultItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onAddWifi: () => void;
}

export const WifiTab = ({ items, onEdit, onDelete, onToggleFavorite, onAddWifi }: WifiTabProps) => {
  const wifiItems = items.filter(item => item.item_type === 'wifi');

  return (
    <div className="space-y-6">
      <button
        onClick={onAddWifi}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Agregar Nueva Wi-Fi
      </button>

      {wifiItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Wifi className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No tienes redes Wi-Fi guardadas aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wifiItems.map((item) => (
            <VaultItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
