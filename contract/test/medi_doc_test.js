const { expect } = require("chai");
const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");


// addDocument() and getDocument() test
describe("MediDoc", function () {
    it("test getDocument() function -> case-1: document found", async function () {
        const MediDoc = await hre.ethers.getContractFactory("MediDocContract");
        const mediDoc = await MediDoc.deploy();

        // get 2 test accounts
        const [account1, account2] = await ethers.getSigners(); 
        
        // string memory fileName, 
        // string memory fileCID,
        // string memory fileKey,
        // string memory fileHash, 
        // address ownerAddress
        await mediDoc.connect(account1).addDocument(
            "pakpak.pdf",
            "bugichugi",
            "keynai",
            "pakpak",
            account2.address
        );

        const doc = await mediDoc.connect(account2).getDocument("pakpak");
        //console.table(doc);
        console.log(doc)

        expect(doc.fileName).to.equal("pakpak.pdf");
        expect(doc.fileCID).to.equal("bugichugi");
        expect(doc.fileKey).to.equal("keynai");
        expect(doc.fileHash).to.equal("pakpak");
        expect(doc.issuer).to.equal(account1.address);
        expect(doc.owner).to.equal(account2.address);
        expect(doc.state).to.equal(0);        
    });
});

// getDocument negative test
describe("MediDoc", function () {
    it("test getDocument() function -> case-1: document not found", async function () {
        const MediDoc = await hre.ethers.getContractFactory("MediDocContract");
        const mediDoc = await MediDoc.deploy();

        await expect(mediDoc.getDocument("pakpak")).to.be.revertedWith("Not found");
    });
});


describe("MediDoc", function () {
    it("test getDocument() function -> case-1: document not found", async function () {
        const MediDoc = await hre.ethers.getContractFactory("MediDocContract");
        const mediDoc = await MediDoc.deploy();

        const [account1, account2] = await ethers.getSigners(); 

        await mediDoc.connect(account1).addDocument(
            "pakpak.pdf",
            "bugichugi",
            "keynai",
            "pakpak",
            account2.address
        );

        await mediDoc.connect(account1).addDocument(
            "pakpak1.pdf",
            "bugichugi1",
            "keynai1",
            "pakpak1",
            account2.address
        );

        var docs = await mediDoc.connect(account2).getDocuments();
        //console.log(docs);
        expect(docs.length).to.equal(2);

        docs = await mediDoc.connect(account1).getDocuments();
        console.log(docs);
        expect(docs.length).to.equal(0);
    });
});


// isVerified(str: fileHash) test
// describe("MediDoc", function () {
//     it("test isVerified(fileHash) function -> case-1: document not verified", async function () {
//         const MediDoc = await hre.ethers.getContractFactory("MediDocContract");
//         const mediDoc = await MediDoc.deploy();

//         // get 2 test accounts
//         const [account1, account2] = await ethers.getSigners(); 

//         await mediDoc.addDocument(
//             "pakpak.pdf",
//             "bugichugi",
//             "keynai",
//             "pakpak",
//             account2.address
//         );

//         expect(await mediDoc.isVerified("pakpak")).to.equal(false);
//         expect(await mediDoc.verify("pakpak")).to.be.revertedWith('Only owner can verify a document');
//         await mediDoc.connect(account2).verify("pakpak");
//         expect(await mediDoc.connect(account1).isVerified("pakpak")).to.equal(true);
//     });
// });

// 