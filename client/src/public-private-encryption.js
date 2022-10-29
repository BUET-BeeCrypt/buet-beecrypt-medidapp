const JSEncrypt = window.JSEncrypt

// Start our encryptor.
// var encrypt = new JSEncrypt();

// Copied from https://github.com/travist/jsencrypt

// Copied from https://github.com/travist/jsencrypt

// Assign our encryptor to utilize the public key.

// Encrypt a message.
export function encryptPassword(plain, key) {
    // Start our encryptor.
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(key);
    return encrypt.encrypt(plain);
}

export function decryptPassword(encrypted, key) {
    // Start our encryptor.
    var encrypt = new JSEncrypt();
    encrypt.setPrivateKey(key);
    return encrypt.decrypt(encrypted);
}

export function generateKeys() {
    var keySize = 1024;
    var crypt = new JSEncrypt({default_key_size: keySize});
    crypt.getKey();
    return {'private': crypt.getPrivateKey(), 'public': crypt.getPublicKey()};
};

window.encryptPassword = encryptPassword
window.decryptPassword = decryptPassword

// export async function rsaEncrypt(plain, publicKey = `0x46C951b65b8B08Bcb4e31a51FEFa56BA203123fd`) {
//     let enc = new TextEncoder();
//     let encoded = enc.encode(plain);

//     let ciphertext = await window.crypto.subtle.encrypt(
//         {
//           name: "RSA-OAEP"
//         },
//         publicKey,
//         encoded
//       );

//     let decoder = new TextDecoder();
//     return decoder.decode(ciphertext);
// }

// export async function rsaDecrypt(encrypted, privateKey = `ed0c1951c403b1dea96ae85831d29af93e7879b70c5a10a2feae206e40863c67`) {
//     let enc = new TextEncoder();
//     let encoded = enc.encode(encrypted);

//     let plain = await window.crypto.subtle.decrypt(
//         {
//           name: "RSA-OAEP"
//         },
//         privateKey,
//         encoded
//       );
    
//     let decoder = new TextDecoder();
//     return decoder.decode(plain);
// }