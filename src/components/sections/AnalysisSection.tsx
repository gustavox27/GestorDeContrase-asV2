import { useState, useEffect } from 'react';
import { BarChart3, Shield, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { EncryptionService } from '../../lib/encryption';

interface PasswordStrength {
  weak: number;
  medium: number;
  strong: number;
}

export const AnalysisSection = () => {
  const { user, encryptionKey } = useAuth();
  const [strength, setStrength] = useState<PasswordStrength>({ weak: 0, medium: 0, strong: 0 });
  const [reusedCount, setReusedCount] = useState(0);
  const [compromisedCount, setCompromisedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAnalysis = async () => {
      if (user && encryptionKey && mounted) {
        await analyzePasswords();
      }
    };

    fetchAnalysis();

    return () => {
      mounted = false;
    };
  }, [user?.id, encryptionKey]);

  const analyzePasswords = async () => {
    if (!encryptionKey) return;

    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('encrypted_data, item_type')
        .eq('user_id', user!.id)
        .eq('item_type', 'password');

      if (error) throw error;

      const passwords: string[] = [];
      let weak = 0;
      let medium = 0;
      let strong = 0;

      for (const item of data || []) {
        try {
          const decrypted = await EncryptionService.decrypt(item.encrypted_data, encryptionKey);
          const parsed = JSON.parse(decrypted);
          const password = parsed.password;

          if (password) {
            passwords.push(password);

            let strengthScore = 0;
            if (password.length >= 12) strengthScore++;
            if (password.length >= 16) strengthScore++;
            if (/[a-z]/.test(password)) strengthScore++;
            if (/[A-Z]/.test(password)) strengthScore++;
            if (/[0-9]/.test(password)) strengthScore++;
            if (/[^a-zA-Z0-9]/.test(password)) strengthScore++;

            if (strengthScore <= 2) weak++;
            else if (strengthScore <= 4) medium++;
            else strong++;
          }
        } catch (e) {
          console.error('Error decrypting item:', e);
        }
      }

      const passwordCounts = new Map<string, number>();
      passwords.forEach((pwd) => {
        passwordCounts.set(pwd, (passwordCounts.get(pwd) || 0) + 1);
      });

      const reused = Array.from(passwordCounts.values()).filter((count) => count > 1).length;

      setStrength({ weak, medium, strong });
      setReusedCount(reused);
      setCompromisedCount(0);
    } catch (error) {
      console.error('Error analyzing passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = strength.weak + strength.medium + strength.strong;
  const securityScore = total > 0 ? Math.round((strength.strong / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Análisis de Contraseñas</h2>
          </div>
          <button
            onClick={analyzePasswords}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Actualizar análisis"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={securityScore >= 80 ? '#10B981' : securityScore >= 50 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(securityScore / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{securityScore}%</p>
                  <p className="text-xs text-gray-600">Seguridad</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Puntuación general de seguridad</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Contraseñas fuertes</span>
                <span className="text-sm font-semibold text-green-600">{strength.strong}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: total > 0 ? `${(strength.strong / total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Contraseñas medias</span>
                <span className="text-sm font-semibold text-yellow-600">{strength.medium}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: total > 0 ? `${(strength.medium / total) * 100}%` : '0%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Contraseñas débiles</span>
                <span className="text-sm font-semibold text-red-600">{strength.weak}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: total > 0 ? `${(strength.weak / total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Contraseñas almacenadas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reusedCount}</p>
              <p className="text-sm text-gray-600">Reutilizadas</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Contraseñas usadas múltiples veces</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{compromisedCount}</p>
              <p className="text-sm text-gray-600">Comprometidas</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Contraseñas en riesgo</p>
        </div>
      </div>

      {(strength.weak > 0 || reusedCount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Recomendaciones de seguridad</h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                {strength.weak > 0 && (
                  <li>• Actualiza {strength.weak} contraseña{strength.weak !== 1 ? 's' : ''} débil{strength.weak !== 1 ? 'es' : ''} usando el generador de contraseñas</li>
                )}
                {reusedCount > 0 && (
                  <li>• Cambia {reusedCount} contraseña{reusedCount !== 1 ? 's' : ''} reutilizada{reusedCount !== 1 ? 's' : ''} por contraseñas únicas</li>
                )}
                <li>• Activa la autenticación de dos factores cuando sea posible</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
