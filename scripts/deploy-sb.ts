import { ethers } from "hardhat";

async function main() {
  
  const SimpleBankBonus = await ethers.getContractFactory("SimpleBankBonus2");

  const simpleBank = await SimpleBankBonus.deploy();

  await simpleBank.deployed();

  
  console.log("RooftopCoin deployed address:", simpleBank.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
