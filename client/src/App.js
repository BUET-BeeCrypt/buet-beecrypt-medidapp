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
import { ethers } from "ethers";
import { useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

// import apis
import userContractJson from "./abi/UserContract.json"
import mediDocContractJson from "./abi/MediDocContract.json"
import shareContractJson from "./abi/ShareContract.json"

const userContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const mediDocContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const shareContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

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
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const userContractSol = new ethers.Contract(userContractAddress, userContractJson.abi, signer);
    const mediDocContractSol = new ethers.Contract(mediDocContractAddress, mediDocContractJson.abi, signer);
    const shareContractSol = new ethers.Contract(shareContractAddress, shareContractJson.abi, signer);

    const [userType, setUserType] = useState("unregistered");

    const getAccount = async () => {
        const user = await userContractSol.getSelf()
        if (user.userType === '')
            setUserType('unregistered')
        else
            setUserType(user.userType)

        console.log(user);
    }


    useEffect(() => {
        const requestAccounts = async () => {
            await provider.send("eth_requestAccounts", []);
        }

        const getBlockNumber = async () => {
            // Look up the current block number
            const num = await provider.getBlockNumber();
            console.log("block number", num);
            // 15785491
        }

        const getBalance = async () => {
            // Get the balance of an account (by address or ENS name, if supported by network)
            const walletAddress = await signer.getAddress();
            console.log("wallet", walletAddress)
            const balance = await provider.getBalance(walletAddress);
            console.log("balance", ethers.utils.formatEther(balance));
            // 15785491
        }

        requestAccounts()
            .catch(console.error)
            .then(() => {
                getAccount().catch(console.error);
            })

        getBalance()
            .catch(console.error)
        // getGreeting()
        //   .catch(console.error)
    }, [])

    const [selectedTab, setSelectedTab] = useState("home");
    const changeTab = e => {
        e.preventDefault();
        setSelectedTab(e.target.dataset.tab || "home");
    }

    const [userPrivateKey, setUserPrivateKey] = useState(null);
    const [userDocuments, setUserDocuments] = useState([]);

    const downloadFileDecrypted = async (fileCID, fileName, encryptedPassword) => {
        let loadId = toast.loading("Downloading file...");
        try {
            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${fileCID}`,
                // {responseType: 'arraybuffer', headers: {
                //     'Content-Type': 'application/pdf'
                // }}
            );
            toast.dismiss(loadId);
            loadId = toast.loading("Decrypting file...");
            const decryptedPassword = decryptPassword(encryptedPassword, userPrivateKey);
            const decryptedFile = await aesGcmDecrypt(response.data, decryptedPassword);
            toast.dismiss(loadId);
            toast.success("File downloaded successfully!");
            // const decryptedFile = response.data;
            save(fileName, decryptedFile);
        } catch (error) {
            toast.dismiss(loadId);
            toast.error("Error downloading or decrypting file: " + error.message);
            console.log(error);
        }
    }

    const getPublicKey = async (user) => {
        return `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFO7F4SAYvt12HO3SgwR+/y7nl
SYrTZU/gwvnN44euwjghqOAsYHWezlTM7XIF4p5ONdgXHdwdjkZp0u/lsQXHFbyJ
mYTYLVgTJlbPY1wdrsFEmkIJsDaZDe+Xzsf+MyEGaewC+OZqgNaRzOJUx+FJvTpB
XQESrMJsmxE7tQ4bDQIDAQAB
-----END PUBLIC KEY-----`;
    }

    const shareFile = async (fileCID, fileName, encryptedPassword, sharedWith) => {
        let loadId = toast.loading("Sharing file...");
        try {
            const decryptedPassword = decryptPassword(encryptedPassword, userPrivateKey);
            const doctorEncryptedPassword = encryptPassword(decryptedPassword, await getPublicKey(sharedWith));
            toast.dismiss(loadId);
            console.log({ fileCID, fileName, doctorEncryptedPassword, sharedWith });
        } catch (error) {
            toast.dismiss(loadId);
            toast.error("Error sharing file: " + error.message);
            console.log(error);
        }

        // Call to Ethereum to store the fileCID, fileName, doctorEncryptedPassword, sharedWith
    }

    let selectedFile = null;

    const issueDocument = async e => {
        const ownerAddress = document.getElementById("owner-address").value;
        const fileDocument = selectedFile;
        if (!fileDocument || !ownerAddress) {
            toast.error("Please select a file and enter an owner address");
            return;
        }

        const password = generateRandomPassword();
        const encryptedPassword = encryptPassword(password, await getPublicKey(ownerAddress));

        let reader = new FileReader();

        reader.onloadend = async () => {
            let loadId = toast.loading("Encrypting file...");
            try {
                const encrypted = await aesGcmEncrypt(reader.result, password);

                const encryptedFile = new File([new Blob([encrypted], { type: 'text/plain' })], fileDocument.name, {
                    type: fileDocument.type,
                });

                const hash = await getHash(fileDocument);

                toast.dismiss(loadId);
                loadId = toast.loading("Uploading file...");

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
                toast.dismiss(loadId);

                loadId = toast.loading("Adding to chain...");

                await mediDocContractSol.addDocument(fileDocument.name, CID, encryptedPassword, hash, ownerAddress);
                console.log({ CID, fileName: fileDocument.name, encryptedPassword, hash, ownerAddress });

                toast.dismiss(loadId);

            } catch (error) {
                toast.dismiss(loadId);
                toast.error("Error issuing file: " + error.message);
            }

            // Call to Ethereum to store the CID, fileName, encryptedPassword, ownerAddress
        };

        reader.readAsArrayBuffer(selectedFile);
    }

    // REGISTER USER
    const registerUser = async e => {
        const role = e.target.dataset.role || "user";
        const keys = generateKeys();
        console.log(keys.public);
        toast.success("Downloading your private key...");
        save(`private-key-medidapp-${role}.pem`, keys.private, "text/plain");
        let loadId = toast.loading("Registering...");
        console.log({ role, publicKey: keys.public });
        await userContractSol.add(role, keys.public)
        toast.dismiss(loadId);
        setTimeout(() => { window.location.reload() }, 5000);
    }

    const [fileVerificationInfo, setFileVerificationInfo] = useState(null);
    // VERIFY FILE
    const fileVerificationFileSelected = file => {
        setFileVerificationInfo(null)
        toast.success("Calculating file hash...");
        getHash(file).then(hash => {
            console.log(hash);
            mediDocContractSol.getDocument(hash)
                .then(res => { setFileVerificationInfo([res]); console.log(res) })
                .catch(err => { setFileVerificationInfo([]) });
            // setFileVerificationInfo(response);
        })
    }

    useEffect(() => {
        if (userType === "user" && selectedTab === "home") {
            mediDocContractSol.getDocuments().then(e => {setUserDocuments(e); console.log(e)});
        }
    }, [selectedTab, userType])

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
                                <Nav.Link href="#" onClick={changeTab} data-tab='shared'>View Shared</Nav.Link>
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
                                <FileUploader label='Open Private Key' handleChange={file => {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        setUserPrivateKey(reader.result);
                                    }
                                    reader.readAsText(file);
                                }} name="file" types={['pem']} />
                            </Col>
                        </Row>

                        <Row>
                            {userDocuments.map((doc) => (<div className="col-6 p-3">
                                <Card className="text-center">
                                    <Card.Header>Issuer: {doc.issuer}</Card.Header>
                                    <Card.Body>
                                        <Card.Title>{doc.fileName}</Card.Title>
                                        <Card.Text>
                                            CID: {doc.fileCID}
                                        </Card.Text>

                                        <Button variant="primary" className={`mx-2`} disabled={!userPrivateKey} onClick={e => {
                                            e.target.disabled = true;
                                            downloadFileDecrypted(doc.fileCID, doc.fileName, doc.fileKey).then(b => {
                                                e.target.disabled = false;
                                            }).catch(b => {
                                                e.target.disabled = false;
                                            })
                                        }}>Download</Button>

                                        <Button variant='outline-primary' className={`mx-2`} disabled={!userPrivateKey} onClick={e => {
                                            const doctorId = prompt("Enter Doctor's Address");
                                            if (doctorId == null || doctorId === "")
                                                return;

                                            e.target.disabled = true;
                                            shareFile(doc.fileCID, doc.fileName, doc.fileKey, doctorId).then(b => {
                                                e.target.disabled = false;
                                            }).catch(b => {
                                                e.target.disabled = false;
                                            })
                                        }}>Share</Button>

                                    </Card.Body>
                                    <Card.Footer className="text-muted">Created: {new Date(Number.parseInt(doc.timestamp._hex) * 1000).toDateString()}</Card.Footer>
                                </Card>
                            </div>))}
                        </Row>
                    </>}
                    {selectedTab === "shared" && <>

                    </>}
                </>}

                {userType === "unregistered" && <>
                    {selectedTab === "home" && <>
                        <h1 className="mb-5">Create an account to start using MediDapp</h1>

                        <Alert variant={'warning'}>
                            You will be provided with a private key, please keep it safe. You will need it to access your account files.
                        </Alert>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-5">
                            <Button variant="outline-primary" onClick={registerUser} data-role="doctor">Register as Doctor</Button>
                            <Button variant="primary" onClick={registerUser} data-role="user">Register as Patient</Button>
                        </div>

                    </>}
                </>}

                {userType === "doctor" && <>
                    {selectedTab === "home" && <>
                        <h1 className="mb-5">Issue Document</h1>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text" id="basic-addon1">Owner Address</span>
                            </div>
                            <input type="text" className="form-control" placeholder="Owner Address" aria-label="Username" id='owner-address' aria-describedby="basic-addon1" />
                        </div>

                        <Row className={'mt-5'}>
                            <Col className={'col-6'}>
                                <FileUploader handleChange={(f) => { selectedFile = f; }} name="file" types={['pdf']}
                                    label='Select File to Issue' />
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
                                <FileUploader label='Open Private Key' handleChange={file => {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        setUserPrivateKey(reader.result);
                                    }
                                    reader.readAsText(file);
                                }} name="file" types={['pem']} />
                            </Col>
                        </Row>

                        <Row>
                            {userDocuments.map((doc) => (<div className="col-6 p-3">
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
                            </div>))}
                        </Row>
                    </>}
                </>}

                {selectedTab === "verify" &&
                    <>
                        <FileUploader handleChange={fileVerificationFileSelected} name="file" types={['pdf']}
                            label='Upload File to Verify' />

                        {fileVerificationInfo && <>
                            <Card className='mt-5'>
                                <Card.Header>File Verification Info</Card.Header>
                                <Card.Body>
                                    {fileVerificationInfo.length === 0 ?
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
                                                    Owner: {fileVerificationInfo[0].owner}
                                                    <br />
                                                    Issuer: {fileVerificationInfo[0].issuer}
                                                    {' '}
                                                </p>
                                                <footer className="blockquote-footer">
                                                    {/* {new Date(Number.parseInt(fileVerificationInfo[0].timestamp._hex)).toDateString()} */}
                                                    Created: <cite title="Creation Time">{new Date(Number.parseInt(fileVerificationInfo[0].timestamp._hex) * 1000).toDateString()}</cite>
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
            <Toaster position="bottom-left" />
        </>
    );
}

export default App;
