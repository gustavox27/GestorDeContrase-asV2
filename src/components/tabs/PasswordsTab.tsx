import { useState } from 'react';
import { Plus, Search, Globe } from 'lucide-react';
import { DecryptedVaultItem } from '../../types/vault';
import { VaultItem } from '../vault/VaultItem';

interface PasswordsTabProps {
  items: DecryptedVaultItem[];
  onEdit: (item: DecryptedVaultItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onAddPassword: (website?: string) => void;
}

const popularWebsites = [
  { name: 'Google', url: 'https://google.com', icon: 'https://www.google.com/favicon.ico' },
  { name: 'Facebook', url: 'https://facebook.com', icon: 'https://www.facebook.com/favicon.ico' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'https://abs.twimg.com/favicons/twitter.ico' },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca' },
  { name: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.svg' },
  { name: 'Amazon', url: 'https://amazon.com', icon: 'https://www.amazon.com/favicon.ico' },
  { name: 'Netflix', url: 'https://netflix.com', icon: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png' },
];

export const PasswordsTab = ({ items, onEdit, onDelete, onToggleFavorite, onAddPassword }: PasswordsTabProps) => {
  const [showWebsites, setShowWebsites] = useState(false);
  const [searchWebsite, setSearchWebsite] = useState('');

  const passwordItems = items.filter(item => item.item_type === 'password');
  const filteredWebsites = popularWebsites.filter(site =>
    site.name.toLowerCase().includes(searchWebsite.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button
          onClick={() => setShowWebsites(!showWebsites)}
          className="flex-1 px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Nueva
        </button>
        <button
          onClick={() => onAddPassword()}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
        >
          <Globe className="w-5 h-5" />
          Comenzar sin un sitio web
        </button>
      </div>

      {showWebsites && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sitios web populares</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchWebsite}
              onChange={(e) => setSearchWebsite(e.target.value)}
              placeholder="Buscar sitio web..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredWebsites.map((site) => (
              <button
                key={site.name}
                onClick={() => {
                  onAddPassword(site.url);
                  setShowWebsites(false);
                }}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <img
                  src={site.icon}
                  alt={site.name}
                  className="w-10 h-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${site.url}&sz=64`;
                  }}
                />
                <span className="text-sm font-medium text-gray-900">{site.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {passwordItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No tienes contraseñas guardadas aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {passwordItems.map((item) => (
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
