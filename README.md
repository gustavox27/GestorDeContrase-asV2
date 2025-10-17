# SecureVault - Professional Password Manager

A modern, secure password manager inspired by Dashlane, built with React, TypeScript, and Supabase.

## Features

### Core Security
- **AES-256 Encryption**: All passwords encrypted client-side before storage
- **Zero-Knowledge Architecture**: Master password never stored or transmitted
- **End-to-End Encryption**: Your data is encrypted on your device before syncing
- **2FA Ready**: Infrastructure for two-factor authentication built-in

### Password Management
- **Secure Vault**: Store unlimited passwords, notes, and secure information
- **Password Generator**: Create strong, random passwords with customizable options
- **Password Strength Analysis**: Real-time feedback on password security
- **Search & Filter**: Quickly find passwords by name, category, or website
- **Favorites**: Mark frequently used items for quick access
- **Categories**: Organize passwords into custom categories

### Smart Features
- **Automatic Logo Detection**: Recognizes website and email provider logos
  - Gmail, Outlook, Yahoo, iCloud, and more
  - Automatic website favicon detection
  - Fallback to beautiful generated icons
- **One-Click Copy**: Copy passwords to clipboard with a single click
- **Website Links**: Quick access to login pages
- **Last Used Tracking**: See when you last accessed each item

### User Experience
- **Modern UI**: Clean, professional interface with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Ready**: Theme infrastructure in place
- **PWA Support**: Install as a native app on Android and desktop
- **Offline Capable**: Service worker for offline functionality

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth)
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Build Tool**: Vite

## Security Architecture

### Encryption Flow
1. User creates account with master password
2. Master password derives encryption key using PBKDF2 (100,000 iterations)
3. All vault data encrypted with AES-256-GCM before storage
4. Master password hash stored for authentication
5. Encryption key never leaves the client

### Database Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Encrypted data at rest
- Secure sharing with granular permissions

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## PWA Installation

### Android
1. Open the app in Chrome
2. Tap the menu (⋮) and select "Install app" or "Add to Home screen"
3. Follow the prompts to install

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install"
3. The app will open in its own window

## Usage

### First Time Setup
1. Create an account with email and password
2. Set a strong master password (used for encryption)
3. Start adding your passwords

### Adding a Password
1. Click "Add Item" button
2. Fill in the details (title, website, username, password)
3. Use the password generator for secure passwords
4. Save the item

### Security Best Practices
- Use a strong, unique master password
- Enable 2FA when available
- Use generated passwords for maximum security
- Review security alerts regularly
- Don't share your master password

## Database Schema

### Tables
- `users_profile`: User settings and encryption keys
- `vault_items`: Encrypted password vault items
- `shared_items`: Shared password permissions
- `security_alerts`: Security warnings and notifications

## Future Enhancements

- [ ] Browser extension (Chrome, Firefox, Edge)
- [ ] Autofill functionality
- [ ] Password breach detection (HaveIBeenPwned API)
- [ ] Secure password sharing
- [ ] Export/Import functionality
- [ ] Multiple vault support
- [ ] Biometric authentication
- [ ] Dark mode
- [ ] Multi-language support

## License

This project is for educational and portfolio purposes.

## Security Note

This is a demonstration application. For production use:
- Enable email confirmation in Supabase
- Implement 2FA
- Add rate limiting
- Regular security audits
- Backup strategies
- Recovery mechanisms
