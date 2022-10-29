const { expect } = require("chai");
const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// get self key
describe("UserContract", function () {
    it("self public key", async function () {
        const pkey = "-----BEGIN PUBLIC KEY-----\n\
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgH / KhpKxSdAAQWv5L0zaO52VmH5O\n\
CYum5yiazb7YyfSBo9nhzE74H2uqU76tG3eIsj1hnG//XP7HFvrTSiI0NhnqsbvQ\n\
plQjDJ0UkQou93z / rWTNDiqgYEE5bJ5 / VkySZp0IMBnS5bbjl5CvhOu0p61SJou3\n\
nrJJOdeAtOZ8jtiVAgMBAAE =\n\
----- END PUBLIC KEY----- ";

        // deploy a lock contract where funds can be withdrawn
        // one year in the future
        const UserContract = await hre.ethers.getContractFactory("UserContract");
        const userContract = await UserContract.deploy();
        await userContract.add("doctor", pkey);

        // assert that the value is correct
        const user = await userContract.getSelf();
        expect(user.userType).to.equal("doctor");
        expect(user.pkey).to.equal(pkey);
    }); 
});

// get other user keys
describe("UserContract", function () {
    it("get others public key", async function () {
        const pkey = "-----BEGIN PUBLIC KEY-----\n\
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgH / KhpKxSdAAQWv5L0zaO52VmH5O\n\
CYum5yiazb7YyfSBo9nhzE74H2uqU76tG3eIsj1hnG//XP7HFvrTSiI0NhnqsbvQ\n\
plQjDJ0UkQou93z / rWTNDiqgYEE5bJ5 / VkySZp0IMBnS5bbjl5CvhOu0p61SJou3\n\
nrJJOdeAtOZ8jtiVAgMBAAE =\n\
----- END PUBLIC KEY----- ";

        // deploy a lock contract where funds can be withdrawn
        // one year in the future
        const UserContract = await hre.ethers.getContractFactory("UserContract");
        const userContract = await UserContract.deploy();
        await userContract.add("doctor", pkey);

        const [owner, otherAccount] = await ethers.getSigners();

        //console.table([owner ,otherAccount]);
        const user = await userContract.connect(otherAccount).get(owner.address);
        expect(user.userType).to.equal("doctor");
        expect(user.pkey).to.equal(pkey);

    });
});

// user existance test: exists
describe("UserContract", function () {
    it("user exists", async function () {
        const pkey = "-----BEGIN PUBLIC KEY-----\n\
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgH / KhpKxSdAAQWv5L0zaO52VmH5O\n\
CYum5yiazb7YyfSBo9nhzE74H2uqU76tG3eIsj1hnG//XP7HFvrTSiI0NhnqsbvQ\n\
plQjDJ0UkQou93z / rWTNDiqgYEE5bJ5 / VkySZp0IMBnS5bbjl5CvhOu0p61SJou3\n\
nrJJOdeAtOZ8jtiVAgMBAAE =\n\
----- END PUBLIC KEY----- ";

        // deploy a lock contract where funds can be withdrawn
        // one year in the future
        const UserContract = await hre.ethers.getContractFactory("UserContract");
        const userContract = await UserContract.deploy();
        await userContract.add("doctor", pkey);

        // assert that the value is correct
        expect(await userContract.exists()).to.equal(true);
    });
});


// user existance test: doesn't exist
describe("UserContract", function () {
    it("return true if user exist", async function () {
        // deploy a lock contract where funds can be withdrawn
        // one year in the future
        const UserContract = await hre.ethers.getContractFactory("UserContract");
        const userContract = await UserContract.deploy();

        // assert that the value is correct
        expect(await userContract.exists()).to.equal(false);
    });
});