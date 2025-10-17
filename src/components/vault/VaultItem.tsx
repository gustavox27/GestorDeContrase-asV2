import { useState } from 'react';
import { Eye, EyeOff, Copy, Edit2, Trash2, Star, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface VaultItemData {
  id: string;
  title: string;
  username?: string;
  password?: string;
  website_url?: string;
  logo_url?: string;
  category?: string;
  favorite: boolean;
  last_used?: string;
}

interface VaultItemProps {
  item: VaultItemData;
  onEdit: (item: VaultItemData) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
}

export const VaultItem = ({ item, onEdit, onDelete, onToggleFavorite }: VaultItemProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          {item.logo_url ? (
            <img src={item.logo_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg sm:text-xl font-bold">
              {item.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{item.title}</h3>
              {item.username && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{item.username}</p>
              )}
            </div>
            <button
              onClick={() => onToggleFavorite(item.id, !item.favorite)}
              className="text-gray-400 hover:text-yellow-500 transition flex-shrink-0"
            >
              <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${item.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
          </div>

          {item.password && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 bg-gray-50 rounded-lg px-2 sm:px-3 py-2 font-mono text-xs sm:text-sm overflow-hidden">
                <span className="block truncate">{showPassword ? item.password : '••••••••••••'}</span>
              </div>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                title={showPassword ? t('vault.hidePassword') : t('vault.showPassword')}
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />}
              </button>
              <button
                onClick={() => item.password && copyToClipboard(item.password)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                title={copied ? t('vault.copied') : t('vault.copy')}
              >
                <Copy className={`w-4 h-4 sm:w-5 sm:h-5 ${copied ? 'text-green-500' : 'text-gray-600'}`} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
            {item.website_url && (
              <a
                href={item.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate max-w-[150px]">Visitar sitio</span>
              </a>
            )}
            {item.category && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                {item.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto sm:flex-col justify-end">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 sm:flex-none p-1.5 sm:p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
            title={t('vault.edit')}
          >
            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 sm:flex-none p-1.5 sm:p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
            title={t('vault.delete')}
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
