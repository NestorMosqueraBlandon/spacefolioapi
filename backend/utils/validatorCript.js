import CryptoJS from 'crypto-js';

export const encryptData = (data) => {
  try {
    const cript = CryptoJS.AES.encrypt(data, 'ourapisecret').toString();
    return cript;
  } catch (err) {
    throw new Error(901);
  }
};

export const decrypt = (data) => {
  try {
    const bytes = CryptoJS.AES.decrypt(data, 'ourapisecret');
    const originalData = bytes.toString(CryptoJS.enc.Utf8);

    return originalData;
  } catch (err) {
    throw new Error(901);
  }
};
