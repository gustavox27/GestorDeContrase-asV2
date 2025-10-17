import { useState } from 'react';
import { Lock, Mail, Key, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { PasswordGenerator } from '../../lib/passwordGenerator';

interface SignUpProps {
  onToggle: () => void;
}

export const SignUp = ({ onToggle }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { t } = useLanguage();

  const masterPasswordStrength = PasswordGenerator.calculateStrength(masterPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (masterPassword !== confirmMasterPassword) {
      setError('Las contraseñas maestras no coinciden');
      return;
    }

    if (masterPassword.length < 8) {
      setError('La contraseña maestra debe tener al menos 8 caracteres');
      return;
    }

    if (masterPasswordStrength.score < 4) {
      setError('Por favor elige una contraseña maestra más fuerte');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, masterPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-xl">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 theme-bg-gradient rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
          <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('auth.createAccount')}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2 text-center">{t('auth.createAccountTagline')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 theme-border-primary focus:border-transparent outline-none transition"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.accountPassword')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 theme-border-primary focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('auth.accountPasswordHelp')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.masterPassword')}</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type={showMasterPassword ? 'text' : 'password'}
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 theme-border-primary focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowMasterPassword(!showMasterPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showMasterPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
          {masterPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 bg-${masterPasswordStrength.color}-500`}
                    style={{ width: `${(masterPasswordStrength.score / 7) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium text-${masterPasswordStrength.color}-600`}>
                  {masterPasswordStrength.label}
                </span>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">{t('auth.masterPasswordEncryptHelp')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.confirmMasterPassword')}</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type={showMasterPassword ? 'text' : 'password'}
              value={confirmMasterPassword}
              onChange={(e) => setConfirmMasterPassword(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 theme-border-primary focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 sm:py-3 theme-btn-primary text-white rounded-lg font-medium text-sm sm:text-base focus:outline-none focus:ring-2 theme-border-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('auth.createAccount')}
            </>
          )}
        </button>
      </form>

      <div className="mt-5 sm:mt-6 text-center">
        <p className="text-sm sm:text-base text-gray-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <button onClick={onToggle} className="theme-text-primary font-medium hover:opacity-80">
            {t('auth.signInLink')}
          </button>
        </p>
      </div>
    </div>
  );
};
