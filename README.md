# ERC20 Token Smart Contract Deployment and Testing using Hardhat

This repository contains a simple guide and for deploying and testing an ERC20 token SoloCoin smart contract using the Hardhat development environment. ERC20 tokens are a standard for fungible tokens on the Ethereum blockchain. Hardhat enviorment helps in effectively write smart contracts and test their functions in the local enviorment, hence making the testing and deployment fast.

The deploy script deploys the contract to the local hardhat node. The hardhat node is a local ethereum blockchain enviorment to interact with contract and address transactions. It helps to keep track of transactions.

The Test script tests all the cases performed with ERC20 smart contract functions. This will include some additional functions and ERC20 standard functions such as:

- Token details i.e symbol, name, total supply
- Transfer functions
- Approval functions
- Contract events

### Prerequisites

Before you begin, make sure you have the following installed:

- Node.js
- npm (Node Package Manager)

### Technologies used

- Node.js
- Hardhat
- Ethers.js
- Solidity
- Mocha/Chai for testing

### Getting Started

1. **Clone the Repository**

   ```bash
   git@github.com:bilalarif2001/ERC20-deployment-Testing.git
   cd your-erc20-repo 
   ```
   Once you are in the project directory, open the terminal.
   
2. **Install Dependencies**

   ```bash
   npm install
   ```
Now all the required files and dependencies are installed.

### Deploy contract

1. **Compile Contract**

   Before deploying the smart contract, it must be compiled. Compiling process generates the Abi to interact with the contract.
   To compile contract, in terminal, type:
```bash
   npx hardhat compile
   ```

2. **Run hardhat node**
  
   Hardhat node is a local Ethereum blockchain network that will tracks all the transactions performed on the local node. This will be useful to deploy our contract to local node and keep track of ERC20 transactions performed via contract.

   This will expose the JSON RPC interface to hardhat. It will be avaible at url ```http://127.0.0.1:8545```

   To run hardhat node, in terminal, type:
```bash
   npx hardhat node
   ```
3. **Run deployment script**
   
   Although, deployment script automatically compiles the contract and redeploy it to the network. When the contract is deployed, we can call contract functions from the network and interact with the contract.

   To deploy contract to local node, make sure your node is running. Open new terminal and type:
```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   ***Now your contract is deployed to hardhat local node and you can use contract functions.***

   ### Test contract

Testing contract is optional to node since the contract is deployed everytime on each test case to make the changes over transactions and keep track of it during the testing. Contract is not deployed to local network and cannot be interacted externally.

 **Run Test**
 
This automatically compiles the contract and run all the test cases defined in the test.js file located in test folder. To run test case, open new terminal
```bash
   npx hardhat test
   ```

   ***Your Test cases will be executed and their results will be displayed.***

