export class EncryptionService {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  static async generateSalt(): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return this.arrayBufferToBase64(salt);
  }

  static async deriveKey(masterPassword: string, salt: string): Promise<CryptoKey> {
    const saltBuffer = this.base64ToArrayBuffer(salt);
    const passwordBuffer = this.encoder.encode(masterPassword);

    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async hashMasterPassword(masterPassword: string, salt: string): Promise<string> {
    const key = await this.deriveKey(masterPassword, salt);
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = this.encoder.encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return this.arrayBufferToBase64(combined);
  }

  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = this.base64ToArrayBuffer(encryptedData);
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return this.decoder.decode(decryptedData);
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
