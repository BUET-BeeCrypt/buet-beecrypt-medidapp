// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const UserContract = await hre.ethers.getContractFactory("UserContract");
  const uc = await UserContract.deploy();
  await uc.deployed();

  console.log(
    `UserContract deployed to ${uc.address}`
  );

  const MediDoc = await hre.ethers.getContractFactory("MediDocContract");
  const mediDoc = await MediDoc.deploy();
  await mediDoc.deployed();

  console.log(
    `MediDocContract deployed to ${mediDoc.address}`
  );

  const ShareContract = await hre.ethers.getContractFactory("ShareContract");
  const sc = await ShareContract.deploy();
  await sc.deployed();

  console.log(
    `ShareContract deployed to ${sc.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
