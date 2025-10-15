// backend/utils/cryptoUtils.js
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();

const secret = process.env.QR_SECRET;

if (!secret) {
    throw new Error('QR_SECRET is not defined in the environment variables');
}

// Encrypt data
exports.encryptData = (data) => {
    const dataString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(dataString, secret).toString();
};

// Decrypt data
exports.decryptData = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
};