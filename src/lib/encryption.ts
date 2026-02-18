
// Basic encryption utilities using Web Crypto API
// We use PBKDF2 for key derivation and AES-GCM for encryption

export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
}

const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const ALGORITHM = 'AES-GCM';
const DIGEST = 'SHA-256';

// Helper: ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: ITERATIONS,
      hash: DIGEST
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(text: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);
  const encodedData = enc.encode(text);

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv
    },
    key,
    encodedData
  );

  const data: EncryptedData = {
    ciphertext: arrayBufferToBase64(encryptedContent),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer)
  };

  return JSON.stringify(data);
}

export async function decryptData(encryptedJson: string, password: string): Promise<string> {
  try {
    const data: EncryptedData = JSON.parse(encryptedJson);
    const salt = new Uint8Array(base64ToArrayBuffer(data.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(data.iv));
    const ciphertext = base64ToArrayBuffer(data.ciphertext);

    const key = await deriveKey(password, salt);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedContent);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data. Incorrect password or corrupted data.");
  }
}
