const { expect } = require("chai");
const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Share", function () {
    it("Should return list shared infos", async function () {
        // deploy
        const ShareContract = await hre.ethers.getContractFactory("ShareContract");
        const sc = await ShareContract.deploy();

        const [account1, account2] = await ethers.getSigners(); 

        // string memory fileName,
        // string memory fileCid,
        // string memory fileKey,
        // address receiver
        await sc.connect(account1).addSharedInfo(
            "pakpak.pdf","sdkfl", "pakpak",
            account2.address
        );

        await sc.connect(account1).addSharedInfo(
            "pakpak1.pdf", "sdkfl1", "pakpak1",
            account2.address
        );

        infos = await sc.connect(account2).getSharedInfos();

        console.log(infos);
    });
});