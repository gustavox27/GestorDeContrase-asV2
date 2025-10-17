import {
  Home,
  Bell,
  KeyRound,
  Share2,
  BarChart3,
  Settings,
  User,
  X
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
  userEmail: string;
}

export const Sidebar = ({ isCollapsed, onToggle, currentSection, onSectionChange, userEmail }: SidebarProps) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'notifications', label: t('nav.notifications'), icon: Bell },
    { id: 'generator', label: t('nav.generator'), icon: KeyRound },
    { id: 'share', label: t('nav.share'), icon: Share2 },
    { id: 'analysis', label: t('nav.analysis'), icon: BarChart3 },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onSectionChange(id);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 theme-bg-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                    <p className="text-xs text-gray-500">{t('nav.registeredUser')}</p>
                  </div>
                </div>
              )}
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition ml-auto lg:ml-0"
                aria-label={isCollapsed ? 'Abrir menú' : 'Cerrar menú'}
              >
                <X className="w-5 h-5 text-gray-600 lg:hidden" />
                <span className="hidden lg:block w-5 h-5"></span>
              </button>
            </div>
          </div>

          <nav className="flex-1 p-2 sm:p-3 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg transition ${
                        isActive
                          ? 'theme-hover-bg theme-text-primary'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'theme-text-primary' : 'text-gray-600'}`} />
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-3 sm:p-4 border-t border-gray-200">
            {!isCollapsed && (
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium">SecureVault v1.0.0</p>
                <p className="break-all">support@securevault.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
