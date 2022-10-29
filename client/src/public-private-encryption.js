const JSEncrypt = window.JSEncrypt

// Start our encryptor.
// var encrypt = new JSEncrypt();

// Copied from https://github.com/travist/jsencrypt
var publicKey = `
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN
FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76
xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4
gwQco1KRMDSmXSMkDwIDAQAB
-----END PUBLIC KEY-----`;

// Copied from https://github.com/travist/jsencrypt
var privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQ
WMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNR
aY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB
AoGAfY9LpnuWK5Bs50UVep5c93SJdUi82u7yMx4iHFMc/Z2hfenfYEzu+57fI4fv
xTQ//5DbzRR/XKb8ulNv6+CHyPF31xk7YOBfkGI8qjLoq06V+FyBfDSwL8KbLyeH
m7KUZnLNQbk8yGLzB3iYKkRHlmUanQGaNMIJziWOkN+N9dECQQD0ONYRNZeuM8zd
8XJTSdcIX4a3gy3GGCJxOzv16XHxD03GW6UNLmfPwenKu+cdrQeaqEixrCejXdAF
z/7+BSMpAkEA8EaSOeP5Xr3ZrbiKzi6TGMwHMvC7HdJxaBJbVRfApFrE0/mPwmP5
rN7QwjrMY+0+AbXcm8mRQyQ1+IGEembsdwJBAN6az8Rv7QnD/YBvi52POIlRSSIM
V7SwWvSK4WSMnGb1ZBbhgdg57DXaspcwHsFV7hByQ5BvMtIduHcT14ECfcECQATe
aTgjFnqE/lQ22Rk0eGaYO80cc643BXVGafNfd9fcvwBMnk0iGX0XRsOozVt5Azil
psLBYuApa66NcVHJpCECQQDTjI2AQhFc1yRnCU/YgDnSpJVm1nASoRUnU8Jfm3Oz
uku7JUXcVpt08DFSceCEX9unCuMcT72rAQlLpdZir876
-----END RSA PRIVATE KEY-----`

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