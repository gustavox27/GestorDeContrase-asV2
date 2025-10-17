import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, RefreshCw, Wifi } from 'lucide-react';
import { DecryptedVaultItem } from '../../types/vault';
import { generatePassword } from '../../lib/passwordGenerator';

interface WifiModalProps {
  item?: DecryptedVaultItem;
  onClose: () => void;
  onSave: (data: Partial<DecryptedVaultItem>) => Promise<void>;
}

export const WifiModal = ({ item, onClose, onSave }: WifiModalProps) => {
  const [ssid, setSsid] = useState(item?.ssid || '');
  const [password, setPassword] = useState(item?.password || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGeneratePassword = () => {
    const newPassword = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
    });
    setPassword(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid.trim()) {
      alert('El nombre de red es requerido');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: ssid,
        ssid,
        password,
        notes,
        item_type: 'wifi',
      });
      onClose();
    } catch (error) {
      console.error('Error saving wifi:', error);
      alert('Error al guardar la red Wi-Fi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {item ? 'Editar Wi-Fi' : 'Agregar Wi-Fi'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de red (SSID) *
            </label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Mi Red Wi-Fi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Contraseña de la red"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Generar contraseña"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={3}
              placeholder="Información adicional..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
