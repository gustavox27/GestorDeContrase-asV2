export class LogoService {
  static extractDomain(url: string): string | null {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  static extractEmailDomain(email: string): string | null {
    const match = email.match(/@([^@]+)$/);
    return match ? match[1].toLowerCase() : null;
  }

  static getLogoUrl(domain: string): string {
    return `https://logo.clearbit.com/${domain}`;
  }

  static getEmailProviderLogo(email: string): string | null {
    const domain = this.extractEmailDomain(email);
    if (!domain) return null;

    const providers: Record<string, string> = {
      'gmail.com': 'https://logo.clearbit.com/google.com',
      'outlook.com': 'https://logo.clearbit.com/microsoft.com',
      'hotmail.com': 'https://logo.clearbit.com/microsoft.com',
      'yahoo.com': 'https://logo.clearbit.com/yahoo.com',
      'icloud.com': 'https://logo.clearbit.com/apple.com',
      'protonmail.com': 'https://logo.clearbit.com/proton.me',
      'aol.com': 'https://logo.clearbit.com/aol.com',
    };

    return providers[domain] || this.getLogoUrl(domain);
  }

  static async verifyLogoExists(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  static getFallbackIcon(title: string): string {
    const initial = title.charAt(0).toUpperCase();
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
    ];
    const colorIndex = title.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <rect width="48" height="48" rx="8" fill="${color}"/>
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="white">
          ${initial}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  static async detectLogo(input: {
    title: string;
    websiteUrl?: string;
    username?: string;
  }): Promise<string> {
    if (input.username && input.username.includes('@')) {
      const emailLogo = this.getEmailProviderLogo(input.username);
      if (emailLogo && await this.verifyLogoExists(emailLogo)) {
        return emailLogo;
      }
    }

    if (input.websiteUrl) {
      const domain = this.extractDomain(input.websiteUrl);
      if (domain) {
        const logoUrl = this.getLogoUrl(domain);
        if (await this.verifyLogoExists(logoUrl)) {
          return logoUrl;
        }
      }
    }

    return this.getFallbackIcon(input.title);
  }
}
