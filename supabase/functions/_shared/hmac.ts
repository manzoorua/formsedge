/**
 * HMAC signature generation for webhook security
 */

/**
 * Generates an HMAC-SHA256 signature for webhook payloads
 * @param secret - Webhook secret key
 * @param payload - JSON string payload
 * @returns Signature in format "sha256=<hex>"
 */
export async function generateHmacSignature(
  secret: string,
  payload: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `sha256=${hashHex}`;
}

/**
 * Verifies an HMAC signature
 */
export async function verifyHmacSignature(
  secret: string,
  payload: string,
  signature: string
): Promise<boolean> {
  const expectedSignature = await generateHmacSignature(secret, payload);
  return signature === expectedSignature;
}
