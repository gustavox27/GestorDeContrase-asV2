import { useState } from 'react';
import { Settings, Download, Upload, Palette, User, Mail, Info, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, supportedLanguages, getLanguageName } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { EncryptionService } from '../../lib/encryption';

export const SettingsSection = () => {
  const { user, encryptionKey } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { currentTheme, setTheme, themes } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExportJSON = async () => {
    if (!encryptionKey) return;

    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;

      const decryptedData = await Promise.all(
        (data || []).map(async (item) => {
          const decrypted = await EncryptionService.decrypt(item.encrypted_data, encryptionKey);
          return {
            title: item.title,
            type: item.item_type,
            website_url: item.website_url,
            data: JSON.parse(decrypted),
            created_at: item.created_at,
          };
        })
      );

      const blob = new Blob([JSON.stringify(decryptedData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert(t('common.error'));
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!encryptionKey) return;

    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;

      const decryptedData = await Promise.all(
        (data || []).map(async (item) => {
          const decrypted = await EncryptionService.decrypt(item.encrypted_data, encryptionKey);
          const parsed = JSON.parse(decrypted);
          return {
            [t('vault.title')]: item.title,
            [t('vault.type')]: item.item_type,
            [t('vault.website')]: item.website_url || '',
            [t('vault.username')]: parsed.username || parsed.ssid || '',
            [t('auth.password')]: parsed.password || '',
            [t('vault.notes')]: parsed.notes || '',
            [t('vault.created')]: new Date(item.created_at).toLocaleString(),
          };
        })
      );

      const headers = Object.keys(decryptedData[0] || {}).join(',');
      const rows = decryptedData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(',')
      );
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `securevault-backup-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert(t('common.error'));
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !encryptionKey) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      for (const item of data) {
        const dataToEncrypt = JSON.stringify(item.data);
        const encryptedData = await EncryptionService.encrypt(dataToEncrypt, encryptionKey);

        await supabase.from('vault_items').insert({
          user_id: user!.id,
          item_type: item.type,
          title: item.title,
          encrypted_data: encryptedData,
          website_url: item.website_url || null,
          favorite: false,
        });
      }

      alert(t('common.success'));
    } catch (error) {
      console.error('Error importing:', error);
      alert(t('common.error'));
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              {t('settings.language')}
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <label className="block text-sm text-gray-700 mb-2">{t('settings.selectLanguage')}</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {getLanguageName(lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              {t('settings.userInfo')}
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 break-all">{user?.email}</span>
              </div>
              <div className="text-xs text-gray-500">
                {t('settings.registeredUser')}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              {t('settings.export')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportJSON}
                disabled={exporting}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium disabled:opacity-50"
              >
                {t('settings.exportJSON')}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition font-medium disabled:opacity-50"
              >
                {t('settings.exportCSV')}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('settings.exportHelp')}
            </p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              {t('settings.import')}
            </h3>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
              />
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium text-center cursor-pointer">
                {importing ? t('settings.importing') : t('settings.selectFile')}
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              {t('settings.importHelp')}
            </p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              {t('settings.theme')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setTheme(theme)}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition ${
                    currentTheme.name === theme.name
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-full h-6 sm:h-8 bg-gradient-to-r ${theme.gradient} rounded mb-2`}
                  />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{theme.name}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              El tema seleccionado se aplicará en toda la aplicación
            </p>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              {t('settings.about')}
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{t('settings.version')}</span>
                <span className="text-gray-900">1.0.0</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm">
                <span className="font-medium text-gray-700">{t('settings.contact')}</span>
                <a
                  href="mailto:support@securevault.com"
                  className="text-blue-600 hover:underline break-all"
                >
                  gustavo18n@Hotmail.com
                </a>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {t('settings.aboutText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
