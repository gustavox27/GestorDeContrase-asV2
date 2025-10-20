import { useState } from 'react';
import { Lock, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const UnlockVault = () => {
  const { user, unlockVault, signOut } = useAuth();
  const { t } = useLanguage();
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await unlockVault(masterPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid master password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0yLTJ2LTJoLTJ2Mmgyem0wLTRoMnYyaC0ydi0yem0yIDJ2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItNHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tMiAydjJoMnYtMmgtMnptLTIgMnYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0tMiAydjJoMnYtMmgtMnptLTIgMnYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0tMiAydjJoMnYtMmgtMnptLTIgMnYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0yLTJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yek0yIDM0djJoMnYtMkgyem0wIDR2Mmgydi0ySDJ6bS0yIDJ2Mmgydi0ySDB6bTAgLTR2Mmgydi0ySDB6bTItMnYtMkgydjJoMnptMC00aDJ2Mkgydi0yem0yIDJ2Mmgydi0ySDR6bTAgNHYyaDJ2LTJINHptLTItMnYyaDJ2LTJIMnptLTItNHYyaDJ2LTJIMHptMCA0djJoMnYtMkgwem0wLTh2Mmgydi0ySDB6bTAtMnYyaDJ2LTJIMHptMC0ydjJoMnYtMkgwem0wLTJ2Mmgydi0ySDB6bTAtMnYyaDJ2LTJIMHptMC0ydjJoMnYtMkgwem0wLTJ2Mmgydi0ySDB6bTAtMnYyaDJ2LTJIMHptMi0ydjJoMnYtMkgyem0yIDJ2Mmgydi0ySDR6bTIgMnYyaDJ2LTJINnptMiAydjJoMnYtMkg4em0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yLTJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0yIDB2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 theme-bg-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.unlockVault')}
            </h1>
            <p className="text-gray-600">
              {t('auth.enterMasterPassword')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {user?.email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.masterPassword')}
              </label>
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder={t('auth.masterPasswordPlaceholder')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 theme-border-primary focus:border-transparent outline-none transition"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full theme-bg-gradient text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? t('common.loading') : t('auth.unlock')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
