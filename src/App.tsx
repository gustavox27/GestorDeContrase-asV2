import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { UnlockVault } from './components/auth/UnlockVault';
import { MainDashboard } from './components/MainDashboard';

function AppContent() {
  const [showSignIn, setShowSignIn] = useState(true);
  const { user, loading, needsMasterPassword } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && needsMasterPassword) {
    return <UnlockVault />;
  }

  if (user) {
    return <MainDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0yLTJ2LTJoLTJ2Mmgyem0wLTRoMnYyaC0ydi0yem0yIDJ2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItNHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tMiAydjJoMnYtMmgtMnptLTIgMnYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0tMiAydjJoMnYtMmgtMnptLTIgMnYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0tMiAydjJoMnYtMmgtMnptLTIgMnYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0yLTJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yek0yIDM0djJoMnYtMkgyem0wIDR2Mmgydi0ySDJ6bS0yIDJ2Mmgydi0ySDB6bTAgLTR2Mmgydi0ySDB6bTItMnYtMkgydjJoMnptMC00aDJ2Mkgydi0yem0yIDJ2Mmgydi0ySDR6bTAgNHYyaDJ2LTJINHptLTItMnYyaDJ2LTJIMnptLTItNHYyaDJ2LTJIMHptMCA0djJoMnYtMkgwem0wLTh2Mmgydi0ySDB6bTAtMnYyaDJ2LTJIMHptMC0ydjJoMnYtMkgwem0wLTJ2Mmgydi0ySDB6bTAtMnYyaDJ2LTJIMHptMC0ydjJoMnYtMkgwem0wLTJ2Mmgydi0ySDB6bTAtMnYyaDJ2LTJIMHptMi0ydjJoMnYtMkgyem0yIDJ2Mmgydi0ySDR6bTIgMnYyaDJ2LTJINnptMiAydjJoMnYtMkg4em0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yIDJ2Mmgydi0yaC0yem0yLTJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptLTItMnYyaDJ2LTJoLTJ6bS0yLTJ2Mmgydi0yaC0yem0yIDB2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      <div className="relative z-10">
        {showSignIn ? (
          <SignIn onToggle={() => setShowSignIn(false)} />
        ) : (
          <SignUp onToggle={() => setShowSignIn(true)} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
