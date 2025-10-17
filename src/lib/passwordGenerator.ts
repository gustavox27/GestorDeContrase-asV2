export interface PasswordOptions {
  length: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
}

export function generatePassword(options: PasswordOptions): string {
  return PasswordGenerator.generate({
    length: options.length,
    includeUppercase: options.includeUppercase ?? options.uppercase ?? true,
    includeLowercase: options.includeLowercase ?? options.lowercase ?? true,
    includeNumbers: options.includeNumbers ?? options.numbers ?? true,
    includeSymbols: options.includeSymbols ?? options.symbols ?? false,
    excludeAmbiguous: options.excludeAmbiguous ?? false,
  });
}

export class PasswordGenerator {
  private static readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static readonly NUMBERS = '0123456789';
  private static readonly SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  private static readonly AMBIGUOUS = 'il1Lo0O';

  static generate(options: Required<Pick<PasswordOptions, 'length' | 'includeUppercase' | 'includeLowercase' | 'includeNumbers' | 'includeSymbols' | 'excludeAmbiguous'>>): string {
    let charset = '';
    const required: string[] = [];

    if (options.includeUppercase) {
      const upper = options.excludeAmbiguous
        ? this.removeAmbiguous(this.UPPERCASE)
        : this.UPPERCASE;
      charset += upper;
      required.push(this.getRandomChar(upper));
    }

    if (options.includeLowercase) {
      const lower = options.excludeAmbiguous
        ? this.removeAmbiguous(this.LOWERCASE)
        : this.LOWERCASE;
      charset += lower;
      required.push(this.getRandomChar(lower));
    }

    if (options.includeNumbers) {
      const numbers = options.excludeAmbiguous
        ? this.removeAmbiguous(this.NUMBERS)
        : this.NUMBERS;
      charset += numbers;
      required.push(this.getRandomChar(numbers));
    }

    if (options.includeSymbols) {
      charset += this.SYMBOLS;
      required.push(this.getRandomChar(this.SYMBOLS));
    }

    if (!charset) {
      throw new Error('At least one character type must be selected');
    }

    const length = Math.max(options.length, required.length);
    let password = [...required];

    for (let i = required.length; i < length; i++) {
      password.push(this.getRandomChar(charset));
    }

    return this.shuffleArray(password).join('');
  }

  static calculateStrength(password: string): {
    score: number;
    label: string;
    color: string;
  } {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return { score, label: 'Weak', color: 'red' };
    } else if (score <= 4) {
      return { score, label: 'Fair', color: 'orange' };
    } else if (score <= 6) {
      return { score, label: 'Good', color: 'yellow' };
    } else {
      return { score, label: 'Strong', color: 'green' };
    }
  }

  static checkCommonPatterns(password: string): boolean {
    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'sunshine'
    ];

    const lower = password.toLowerCase();
    return commonPasswords.some(common => lower.includes(common));
  }

  private static getRandomChar(charset: string): string {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    return charset[randomValues[0] % charset.length];
  }

  private static removeAmbiguous(charset: string): string {
    return charset.split('').filter(char => !this.AMBIGUOUS.includes(char)).join('');
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomValues = new Uint32Array(1);
      crypto.getRandomValues(randomValues);
      const j = randomValues[0] % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
