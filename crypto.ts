// crypto.ts

const SECRET_KEY = "unsaid-private-key-v1";

// ✅ Encrypt text using AES-GCM (real encryption)
export async function encryptText(text: string): Promise<string> {
  const enc = new TextEncoder();

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("unsaid-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  // return as: iv:data
  return `${Array.from(iv).join(",")}:${btoa(
    String.fromCharCode(...new Uint8Array(encrypted))
  )}`;
}

// ✅ Decrypt text back
export async function decryptText(cipher: string): Promise<string> {
  const [ivStr, data] = cipher.split(":");

  if (!ivStr || !data) return "";

  const iv = new Uint8Array(ivStr.split(",").map(Number));
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("unsaid-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
  );

  return dec.decode(decrypted);
}
