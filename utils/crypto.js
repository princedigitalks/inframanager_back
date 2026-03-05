const CryptoJS = require("crypto-js");

const getSecretKey = () => {
  const key = process.env.CRYPTO_SECRET_KEY;
  if (!key) {
    throw new Error("CRYPTO_SECRET_KEY is not defined in environment variables");
  }
  return key;
};

/**
 * Encrypt any data (string / object)
 */
const encryptData = (data) => {
  if (!data) return null;

  const text = typeof data === "string" ? data : JSON.stringify(data);
  const SECRET_KEY = getSecretKey();

  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * Decrypt encrypted string
 */
const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  
  const SECRET_KEY = getSecretKey();
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) return null;
    
    try {
      return JSON.parse(decrypted); // if JSON
    } catch (err) {
      return decrypted; // if normal string
    }
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return null;
  }
};

module.exports = {
  encryptData,
  decryptData,
};
