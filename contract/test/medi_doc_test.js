const { expect } = require("chai");
const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("MediDoc", function () {
    it("test getDocument() function", async function () {
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
        expect(doc.owner).to.equal(account2.address);
        expect(doc.state).to.equal(1);        
    });
});