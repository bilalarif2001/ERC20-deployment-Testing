const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // retrieving contract by contract name
  const erc20Contract = await ethers.getContractFactory("ERC20");
  // deploying contract with constructor arguments.
  const contract = await erc20Contract.deploy(
    "SoloCoin",
    "SOLX",
    "10000",
    "100"
  );
  contract.deployed();
  // if deployed on hardhat local node, contract can be externally interacted. contract functions will be available.
  return contract;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
