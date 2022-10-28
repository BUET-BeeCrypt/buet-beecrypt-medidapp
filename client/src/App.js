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
import { Alert, Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";

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

    const [userPrivateKey, setUserPrivateKey] = useState(null);
    const [userDocuments, setUserDocuments] = useState([]);

    const downloadFileDecrypted = async (fileCID, fileName, encryptedPassword) => {
        try {
            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${fileCID}`,
                // {responseType: 'arraybuffer', headers: {
                //     'Content-Type': 'application/pdf'
                // }}
            );
            const decryptedPassword = decryptPassword(encryptedPassword, userPrivateKey);
            const decryptedFile = await aesGcmDecrypt(response.data, decryptedPassword);
            // const decryptedFile = response.data;
            save(fileName, decryptedFile);
        } catch (error) {
            console.log("Error downloading File: ");
            console.log(error);
        }
    }

    const getPublicKey = async (user) => {
        return "";
    }

    const shareFile = async (fileCID, fileName, encryptedPassword, sharedWith) => {
        const decryptedPassword = decryptPassword(encryptedPassword, userPrivateKey);
        const doctorEncryptedPassword = encryptPassword(decryptedPassword, await getPublicKey(sharedWith));

        console.log({ fileCID, fileName, doctorEncryptedPassword, sharedWith });

        // Call to Ethereum to store the fileCID, fileName, doctorEncryptedPassword, sharedWith
    }

    let selectedFile = null;

    const issueDocument = async e => {
        const ownerAddress = document.getElementById("owner-address").value;
        const fileDocument = selectedFile;
        if (!fileDocument || !ownerAddress)
            return;
        
        const password = generateRandomPassword();
        const encryptedPassword = encryptPassword(password, await getPublicKey(ownerAddress));

        let reader = new FileReader();

        reader.onloadend = async () => {
            const encrypted = await aesGcmEncrypt(reader.result, password);
            
            const encryptedFile = new File([new Blob([encrypted], { type: 'text/plain' })], fileDocument.name, {
                type: fileDocument.type,
            });

            const formData = new FormData();
            formData.append("file", encryptedFile);

            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    'pinata_api_key': `81852fb3d69cda1abf17`, // ${process.env.REACT_APP_PINATA_API_KEY}
                    'pinata_secret_api_key': `d0621cab7ea068f42c4c150be07b14a99a91be4f4de700fe82746704e12acbf6`, // ${process.env.REACT_APP_PINATA_API_SECRET}
                    "Content-Type": "multipart/form-data"
                },
            });

            const CID = `${resFile.data.IpfsHash}`;

            console.log({ CID, fileName: fileDocument.name, encryptedPassword, ownerAddress });

            // Call to Ethereum to store the CID, fileName, encryptedPassword, ownerAddress
        };

        reader.readAsArrayBuffer(selectedFile);
        
    }

    // REGISTER USER
    const registerUser = async e => {
        const keys = generateKeys();
        console.log(keys.public);
        save("private-key-medidapp.pem", keys.private, "text/plain");
    }

    const [fileVerificationInfo, setFileVerificationInfo] = useState(null);
    // VERIFY FILE
    const fileVerificationFileSelected = file => {
        setFileVerificationInfo(null)
        getHash(file).then(hash => {
            console.log(hash);
            // setFileVerificationInfo(response);
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
                    <h1 className="mb-5">My Documents</h1>

                    <Row>
                        <Col>
                            <Alert>
                                Provide your private key to download or share a document
                            </Alert>
                        </Col>
                        <Col className={'mt-1'}>
                            <FileUploader label='Open Private Key' handleChange={ file => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    setUserPrivateKey(reader.result);
                                }
                                reader.readAsText(file);
                            }} name="file" types={['pem']}/>
                        </Col>
                    </Row>

                    <Row>
                        { userDocuments.map((document) => ( <d className="col-6 p-3">
                        <Card className="text-center"> 
                        <Card.Header>Verified</Card.Header>
                            <Card.Body>
                                <Card.Title>Document Title</Card.Title>
                                <Card.Text>
                                    Hash: hash
                                </Card.Text>

                                <Button variant="primary" className={`mx-2`} disabled={!userPrivateKey} onClick={e => {
                                    e.target.disabled = true;
                                    downloadFileDecrypted('', '', '').then(b => {
                                        e.target.disabled = false;
                                    }).catch(b => {
                                        e.target.disabled = false;
                                    })
                                }}>Download</Button>

                                <Button variant='outline-primary' className={`mx-2`}  disabled={!userPrivateKey} onClick={e => {
                                    const doctorId = prompt("Enter Doctor's Address");
                                    if (doctorId == null || doctorId === "")
                                        return;
                                    
                                    e.target.disabled = true;
                                    shareFile('', '', '', doctorId).then(b => {
                                        e.target.disabled = false;
                                    }).catch(b => {
                                        e.target.disabled = false;
                                    })
                                }}>Share</Button>

                            </Card.Body>
                            <Card.Footer className="text-muted">Timestamp Vaule</Card.Footer>
                        </Card>
                        </d>)) }
                    </Row>
                </>}
                {selectedTab === "shared" && <>

                </>}
            </>}

            {userType === "unregistered" && <>
                {selectedTab === "home" && <>
                    <h1 className="mb-5">Create an account to start using MediDapp</h1>

                    <Alert variant={'warning'}>
                        You will be provided with a private key, please keep it safe. You will need it to access your account.
                    </Alert>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <Button variant="primary" onClick={registerUser}>Register</Button>
                    </div>
                    
                </>}
            </>}

            {userType === "doctor" && <>
                {selectedTab === "home" && <>
                    <h1 className="mb-5">Issue Document</h1>
                    
                    <InputGroup className="mb-5">
                        <InputGroup.Text id="#owner-address">
                        Owner Address
                        </InputGroup.Text>
                        <Form.Control id="basic-url" aria-describedby="basic-addon3" />
                    </InputGroup>

                    <Row className={'mt-5'}>
                        <Col className={'col-6'}>
                            <FileUploader handleChange={(f) => { selectedFile = f; }} name="file" types={['pdf']}
                                label='Select File to Issue'/>
                        </Col>
                        <Col className={'col-6'}>
                            <div className="d-grid gap-2 d-md-flex justify-content-md-end pt-1">
                                <Button variant="primary" onClick={issueDocument}>Issue Document</Button>
                            </div>
                        </Col>
                    </Row>
                    
                </>}
                {selectedTab === "shared" && <>
                    <h1 className="mb-5">Shared with me</h1>

                    <Row>
                        <Col>
                            <Alert>
                                Provide your private key to download a document
                            </Alert>
                        </Col>
                        <Col className={'mt-1'}>
                            <FileUploader label='Open Private Key' handleChange={ file => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    setUserPrivateKey(reader.result);
                                }
                                reader.readAsText(file);
                            }} name="file" types={['pem']}/>
                        </Col>
                    </Row>

                    <Row>
                        { userDocuments.map((document) => ( <d className="col-6 p-3">
                        <Card className="text-center"> 
                        <Card.Header>Owner</Card.Header>
                            <Card.Body>
                                <Card.Title>Document Title</Card.Title>
                                {/* <Card.Text>
                                    Hash: hash
                                </Card.Text> */}

                                <Button variant="primary" className={`mx-2`} disabled={!userPrivateKey} onClick={e => {
                                    e.target.disabled = true;
                                    downloadFileDecrypted('', '', '').then(b => {
                                        e.target.disabled = false;
                                    }).catch(b => {
                                        e.target.disabled = false;
                                    })
                                }}>Download</Button>

                            </Card.Body>
                            <Card.Footer className="text-muted">Timestamp Vaule</Card.Footer>
                        </Card>
                        </d>)) }
                    </Row>
                </>}
            </>}

            {selectedTab === "verify" &&
                <>
                    <FileUploader handleChange={fileVerificationFileSelected} name="file" types={['pdf']}
                        label='Upload File to Verify'/>

                    {fileVerificationInfo && <>
                        <Card className='mt-5'>
                            <Card.Header>File Verification Info</Card.Header>
                            <Card.Body>
                            { fileVerificationInfo.length === 0 ? 
                                <>
                                    <blockquote className="blockquote mb-0">
                                    <p className="text-danger mb-4">
                                        {' '}
                                        Not found
                                        {' '}
                                    </p>
                                    <footer className="blockquote-footer">
                                        Status: <cite title="">Document not found in the system</cite>
                                    </footer>
                                    </blockquote>
                                </> : 
                                <>
                                    <blockquote className="blockquote mb-0">
                                    <p>
                                        {' '}
                                        File Name: {fileVerificationInfo[0].fileName}
                                        <br />
                                        Owner: {fileVerificationInfo[0].ownerAddress}
                                        <br />
                                        File Hash: {fileVerificationInfo[0].fileHash}
                                        {' '}
                                    </p>
                                    <footer className="blockquote-footer">
                                        Created: <cite title="Creation Time">{fileVerificationInfo[0].timestamp.value}</cite>
                                    </footer>
                                    </blockquote>
                                </>
                            }
                            </Card.Body>
                        </Card>
                    </>}
                </>
            }

        </Container>

        </>
    );
}

export default App;
