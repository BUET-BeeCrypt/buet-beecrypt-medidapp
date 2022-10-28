import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import "./App.css";
import axios from "axios";
import { aesGcmDecrypt, aesGcmEncrypt } from "./aes-gcm";
import {
  decryptPassword,
  encryptPassword,
  generateKeys,
} from "./public-private-encryption";
import { save } from "./download";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FileUploader } from "react-drag-drop-files";
import { getHash } from "./sha256";

const generateRandomPassword = () => {
  let chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let passwordLength = 12;
  let password = "";
  for (let i = 0; i <= passwordLength; i++) {
    let randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  console.log(`Password: ${password}`);
  return password;
};

function App() {
    const [fileDocument, setFileDocument] = useState(null);
    const sendFileToIPFS = async (e) => {
        if (fileDocument) {
        try {
            const password = generateRandomPassword();

            const encryptedPassword = encryptPassword(password);
            console.log(`Encrypted Password: ${encryptedPassword}`);
            const decryptedPassword = decryptPassword(encryptedPassword);
            console.log(`Decrypted Password: ${decryptedPassword}`);

            let reader = new FileReader();
            reader.readAsArrayBuffer(fileDocument);
            reader.onloadend = async () => {
            console.log(reader.result);
            const encrypted = await aesGcmEncrypt(reader.result, password);
            console.log(encrypted);
            const decrypted = await aesGcmDecrypt(encrypted, password);
            console.log(decrypted);

            const decryptedFile = new File([decrypted], fileDocument.name, {
                type: fileDocument.type,
            });
            console.log(decryptedFile);

            save(fileDocument.name, decryptedFile);
            };

            const formData = new FormData();
            formData.append("file", fileDocument);

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
            console.log("Error sending File to IPFS: ");
            console.log(error);
        }
        }
    };

    const [userType, setUserType] = useState("user");

    const [selectedTab, setSelectedTab] = useState("home");
    const changeTab = e => {
        e.preventDefault();
        setSelectedTab(e.target.dataset.tab || "home");
    }

    const fileVerificationFileSelected = file => {
        getHash(file).then(hash => {
            console.log(hash);
        })
    }

    return (
        <>
        <Navbar bg="dark" variant="dark">
            <Container>
            <Navbar.Brand
                href="#"
                onClick={(e) => {
                e.preventDefault();
                window.location.reload();
                }}
            >
                MediDapp
            </Navbar.Brand>
            <Nav className="me-auto">
                {userType === "user" &&
                <>
                    <Nav.Link href="#" onClick={changeTab} data-tab='home'>My Documents</Nav.Link>
                    {/* <Nav.Link href="#">Shared Documents</Nav.Link> */}
                </>
                }

                {userType === "unregistered" &&
                    <Nav.Link href="#" onClick={changeTab} data-tab='home'>Register</Nav.Link>
                }

                {userType === "doctor" &&
                <>
                    <Nav.Link href="#" onClick={changeTab} data-tab='home'>Issue Document</Nav.Link>
                    <Nav.Link href="#"onClick={changeTab} data-tab='shared'>View Shared</Nav.Link>
                </>
                }

                <Nav.Link href="#" onClick={changeTab} data-tab='verify'>
                    Verify Document
                </Nav.Link>
            </Nav>
            </Container>
        </Navbar>

        <Container className='p-4 my-4'>

            {userType === "user" && <>
                {selectedTab === "home" && <>

                </>}
                {selectedTab === "shared" && <>

                </>}
            </>}

            {userType === "unregistered" && <>
                {selectedTab === "home" && <>

                </>}
            </>}

            {userType === "doctor" && <>
                {selectedTab === "home" && <>

                </>}
                {selectedTab === "shared" && <>

                </>}
            </>}

            {selectedTab === "verify" &&
                <>
                    <FileUploader handleChange={fileVerificationFileSelected} name="file" types={['pdf']} />
                </>
            }

        </Container>

        <form
            onSubmit={(e) => {
            e.preventDefault();
            sendFileToIPFS();
            }}
        >
            <input
            type="file"
            onChange={(e) => setFileDocument(e.target.files[0])}
            required
            />
            <button type="submit">Mint NFT</button>
            <br />
            <button
            onClick={(e) => {
                e.preventDefault();
                const keys = generateKeys();
                console.log(keys.public);
                save("private.pem", keys.private, "text/plain");
            }}
            >
            Generate Keys
            </button>
        </form>
        </>
    );
}

export default App;
