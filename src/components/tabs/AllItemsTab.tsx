import { DecryptedVaultItem } from '../../types/vault';
import { VaultItem } from '../vault/VaultItem';
import { Shield, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AllItemsTabProps {
  items: DecryptedVaultItem[];
  onEdit: (item: DecryptedVaultItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onAdd: () => void;
}

export const AllItemsTab = ({ items, onEdit, onDelete, onToggleFavorite, onAdd }: AllItemsTabProps) => {
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Tu bóveda está vacía</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">Comienza agregando tu primera contraseña</p>
        <button
          onClick={onAdd}
          className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Agregar primer elemento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item) => (
        <VaultItem
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
