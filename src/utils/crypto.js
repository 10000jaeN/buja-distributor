import crypto from "crypto";

// 환경 변수에서 Base64로 인코딩된 키와 IV 문자열을 가져옵니다.
const ENCRYPTION_KEY_B64 = process.env.TOKEN_ENCRYPTION_KEY;
const IV_B64 = process.env.TOKEN_ENCRYPTION_IV;
const ALGORITHM = "aes-256-cbc";

// 💡 Base64 문자열을 AES-256 암호화에 필요한 32바이트 Buffer로 변환합니다.
// Base64 디코딩으로 32바이트 이진 데이터를 얻습니다.
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_B64, "base64");
const IV = Buffer.from(IV_B64, "base64");

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(
    "TOKEN_ENCRYPTION_KEY must be a 32-byte Buffer after Base64 decoding."
  );
}
if (IV.length !== 16) {
  throw new Error(
    "TOKEN_ENCRYPTION_IV must be a 16-byte Buffer after Base64 decoding."
  );
}

/**
 * 토큰을 암호화하여 DB에 저장할 문자열로 반환합니다.
 * @param {string} token - 암호화할 원본 토큰
 * @returns {string} - 암호화된 토큰 문자열
 */
export const encryptToken = (token) => {
  // ... (나머지 로직은 그대로 유지됩니다. cipher.update에 Buffer를 직접 전달할 필요 없이,
  // createCipheriv가 Buffer를 자동으로 처리합니다.)
  if (!token) return token;
  try {
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted; // 암호화된 문자열 반환
  } catch (error) {
    console.error("Token encryption failed:", error);
    throw new Error("Encryption failed during save.");
  }
};

/**
 * DB에서 가져온 암호화된 문자열을 복호화하여 원본 토큰으로 반환합니다.
 * @param {string} encryptedToken - DB에 저장된 암호화된 토큰
 * @returns {string} - 원본 토큰 문자열
 */
export const decryptToken = (encryptedToken) => {
  if (!encryptedToken) return encryptedToken;
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(encryptedToken, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted; // 복호화된 원본 토큰 반환
  } catch (error) {
    console.error("Token decryption failed:", error);
    // 복호화 실패는 보통 토큰이 변조되었거나 키가 잘못되었음을 의미합니다.
    return null;
  }
};
