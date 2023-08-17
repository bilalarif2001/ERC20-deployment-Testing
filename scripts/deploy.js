const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const erc20Contract = await ethers.getContractFactory("ERC20");
  const contract = await erc20Contract.deploy(
    "SoloCoin",
    "SOLX",
    "10000",
    "100"
  );
  contract.deployed();
  return contract;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
