import logo from './logo.svg';
import { useState } from 'react';
import './App.css';
import axios from 'axios'
import { AES } from 'crypto-js';
import { aesGcmDecrypt, aesGcmEncrypt } from './aes-gcm';

const generateRandomPassword = () => {
    let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let passwordLength = 12;
    let password = "";
    for (let i = 0; i <= passwordLength; i++) {
        let randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber +1);
    }
    console.log(`Password: ${password}`);
    return password;
 }

function App() {
  const [fileImg, setFileImg] = useState(null);

  const sendFileToIPFS = async (e) => {
    if (fileImg) {
        try {

            const password = generateRandomPassword();
            let reader = new FileReader();
            reader.readAsArrayBuffer(fileImg);
            reader.onloadend = async () => {
                console.log(reader.result);
                const encrypted = await aesGcmEncrypt(reader.result, password)
                console.log(encrypted);
                const decrypted = await aesGcmDecrypt(encrypted, password);
                console.log(decrypted);

                const decryptedFile = new File([decrypted], fileImg.name, {type: fileImg.type});
                console.log(decryptedFile);
            }

            // const encryptedBuffer = aes256.encrypt(password, buffer);
            
            // AES.encrypt(buffer, password).toString();
            // console.log(encryptedBuffer);

            const formData = new FormData();
            formData.append("file", fileImg); 

            /*const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    'pinata_api_key': `81852fb3d69cda1abf17`, // ${process.env.REACT_APP_PINATA_API_KEY}
                    'pinata_secret_api_key': `d0621cab7ea068f42c4c150be07b14a99a91be4f4de700fe82746704e12acbf6`, // ${process.env.REACT_APP_PINATA_API_SECRET}
                    "Content-Type": "multipart/form-data"
                },
            });

            const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
        console.log(ImgHash); 
    //Take a look at your Pinata Pinned section, you will see a new file added to you list.   
            */


        } catch (error) {
            console.log("Error sending File to IPFS: ")
            console.log(error)
        }
    }
  }

  return(
    <form onSubmit={e => { e.preventDefault(); sendFileToIPFS() } }>
    <input type="file" onChange={(e) =>setFileImg(e.target.files[0])} required />
    <button type='submit' >Mint NFT</button>            
    </form>
    )
}

export default App;
