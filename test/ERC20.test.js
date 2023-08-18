const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SoloCoin ERC-20 Token Contract Test", ()=> {
  async function deployContract() {
    try {
      // getting owner from ethers signers.
      const [owner] = await ethers.getSigners();
      const erc20Contract = await ethers.getContractFactory("ERC20");
      erc20Contract.connect(owner);
      // Deploying contract with constructor arguments
      const contract = await erc20Contract.deploy(
        "SoloCoin",
        "SOLX",
        "10000",
        "100"
      );
      // return contract object in case of successful deployment
      return contract;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  describe("Contract deployment Test", async () => {
    it("Should return contract object upon contract deployment", async function () {
      const contract = await deployContract();
      // if contract is an object, it is sucessfully deployed
      assert.equal(typeof contract, "object");
      assert.notEqual(contract, false);
      assert.notEqual(contract, undefined);
      assert.notEqual(contract, null);
    });
  });
  describe("Token details testing", async () => {
    it("Token name should be SoloCoin", async () => {
      contract = await deployContract();
      assert.equal(await contract.name(), "SoloCoin");
      assert.notEqual(await contract, "");
    });
    it("Token symbol should be SOLX", async () => {
      contract = await deployContract();
      assert.equal(await contract.symbol(), "SOLX");
      assert.notEqual(await contract, "");
    });

    it("Token decimals should be 18", async () => {
      contract = await deployContract();
      assert.equal(await contract.decimals(), 18);
      assert.notEqual(await contract, 0);
      expect(await contract.decimals()).to.not.be.lessThan(18);
      expect(await contract.decimals()).to.not.be.greaterThan(18);
    });

    it("Token supply should be 10000", async () => {
      contract = await deployContract();
      const totalSupply = await contract.totalSupply();
      const formattedTotalSupply = Number(
        ethers.utils.formatEther(totalSupply)
      );
      assert.equal(formattedTotalSupply, 10000);
      assert.notEqual(await contract, 0);
    });

    it("Token price in wei should be 100", async () => {
      contract = await deployContract();
      const tokenPrice = await contract.tokenPrice();
      const formatedTokenPrice = Number(
        ethers.utils.formatUnits(tokenPrice, "wei")
      );
      assert.equal(formatedTokenPrice, 100);
      assert.notEqual(await contract, 0);
    });
  });

  describe("Token transfers and account balance testing", async () => {
    it("Should display token balance of address", async function () {
      const [owner] = await ethers.getSigners();
      const contract = await deployContract();

      expect(await contract.balanceOf(owner.address)).to.above(0);
    });

    it("Transfer from sender to receiver", async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const contract = await deployContract();

      // Transfer tokens from owner to addr1 Since all the supply is stored at owner's address

      // Get address balances before transaction
      const ownerBalance = await contract.balanceOf(owner.address);
      const addr1Balance = await contract.balanceOf(addr1.address);
      const addr2Balance = await contract.balanceOf(addr2.address);

      // Token transfer from owner to address 1
      await contract.transfer(addr1.address, 100, { from: owner.address });

      // Updated balances after transaction
      const updatedOwnerBalance = await contract.balanceOf(owner.address);
      const addr1BalAfterReceiveToken = await contract.balanceOf(addr1.address);

      // Checking if 100 is deducted from owner as Sender
      expect(
        ethers.BigNumber.from(ownerBalance).sub(updatedOwnerBalance)
      ).to.equal(100);

      // Checking if 100 is added to addr1 as receiver.
      expect(
        ethers.BigNumber.from(addr1Balance).add(addr1BalAfterReceiveToken)
      ).to.equal(100);

      // Transfering tokens from address 1 to address 2
      await contract
        .connect(addr1)
        .transfer(addr2.address, 50, { from: addr1.address });

      // updated Balances after second transaction
      const addr1BalAfterSendToken = await contract.balanceOf(addr2.address);
      const updatedaddr2Balance = await contract.balanceOf(addr2.address);

      // Checking if 100 is deducted from address1 as Sender
      expect(
        ethers.BigNumber.from(addr1BalAfterReceiveToken).sub(
          addr1BalAfterSendToken
        )
      ).to.equal(50);
      // Checking if 100 is added to address2 as Sender
      expect(
        ethers.BigNumber.from(addr2Balance).add(updatedaddr2Balance)
      ).to.equal(50);
    });

    it("Transfer Function Failing due to insufficient Balance", async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const contract = await deployContract();
      await expect(
        contract.transfer(
          addr2.address,
          ethers.utils.parseEther("1000000000000"),
          { from: owner.address }
        )
      ).revertedWith("Insufficient Balance");
    });
    it("Should return tokens allowed by token owner to spender", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const contract = await deployContract();

      // owner allowing address 1 to spend his 10000 tokens.
      await contract.approve(addr1.address, 10000, { from: owner.address });

      // Getting number of allowed tokens allowed by owner to address 1
      const allowedTokens = await contract.allowance(
        owner.address,
        addr1.address
      );
      expect(allowedTokens).to.equal(10000);
    });
    it("Should allow spender to spend tokens allowed by token Owner", async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const contract = await deployContract();

      // Getting Address Balances before transaction
      const ownerBalance = await contract.balanceOf(owner.address);
      const addr1Balance = await contract.balanceOf(addr1.address);

      // Owner allowing address 2 to spend his tokens on his behalf. This can be useful in case, when owner is absent to spend tokens.
      await contract.approve(addr2.address, 10000, { from: owner.address });
      // Now connecting address 2 with contract and address 2 is making a transaction from owner's account to address 1.
      await contract
        .connect(addr2)
        .transferFrom(owner.address, addr1.address, 1000);

      // Updated address balances after transaction
      const updatedOwnerBalance = await contract.balanceOf(owner.address);
      const updatedAddr1Balance = await contract.balanceOf(addr1.address);

      // Checking
      expect(
        ethers.BigNumber.from(ownerBalance).sub(updatedOwnerBalance)
      ).to.equal(1000);

      expect(
        ethers.BigNumber.from(addr1Balance).add(updatedAddr1Balance)
      ).to.equal(1000);
    });
    it("Function 'transfer from' should fail due to insufficent balance of tokens allowed to spend by token owner", async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const contract = await deployContract();
       await expect(
         contract
        .connect(addr2)
        .transferFrom(owner.address, addr1.address, 1000)
      ).revertedWith("You have exceeded the amount to spend tokens allowed by token owner");
    });
  });

  describe("Purchasing Tokens by spending Ethereum", async ()=>{
    it("User should receive tokens upon token purchasing and owner should receive Ethereum", async ()=>{
      const [owner,addr1,addr2]= await ethers.getSigners();
      const contract= await deployContract();
      const oneEth= ethers.utils.parseEther("1")
      
      // Account 1 will be purchasing balances from owner.
      // Balances before purchasing token 
      const ownerEthBalance= await ethers.provider.getBalance(owner.address);
      const ownerTokenBalance= await contract.balanceOf(owner.address);
      const addr1EthBalance= await ethers.provider.getBalance(addr1.address);
      const addr1TokenBalance= await contract.balanceOf(addr1.address);

      // As per Contract Function, 100 tokens will be given to user for 1 gwei or 0.0000000001 ETH
      await contract.connect(addr1).purchaseTokens({from:addr1.address, value:oneEth})
      
      // Balances after purchasing token
      const updatedOwnerEthBalance= await ethers.provider.getBalance(owner.address);
      const updatedOwnerTokenBalance= await contract.balanceOf(owner.address);
      const updatedAddr1EthBalance= await ethers.provider.getBalance(addr1.address);
      const updatedAddr1TokenBalance= await contract.balanceOf(addr1.address);

      // Testing Ethereum transfers
      // One eth will be transfered to Owner. So Updated balance is oneETH times greater than Old owner balance.
      expect(ethers.BigNumber.from(updatedOwnerEthBalance).sub(ownerEthBalance)).to.equal(oneEth);
      // One ETH will be dedectued from address 1 account. so Updated balance is (1 ETH + some gas fee) less than previous balance.
      // Due to gas collection. transaction is formated to Ether and rounded with Math.floor to remove decimal places.
      // So the difference will be 1 ETH.
      expect(Math.floor(ethers.utils.formatEther(ethers.BigNumber.from(addr1EthBalance).sub(updatedAddr1EthBalance)))).to.equal(1)

      // Testing Token transfers
      // 100 Tokens for 1 gwei. So User will receive 100 gwei worth of tokens for 1 ETH.
      // tokens deducted from owner balance, since all tokens will be stored at owner's balance
      expect(ethers.BigNumber.from(ownerTokenBalance).sub(updatedOwnerTokenBalance)).to.equal(ethers.utils.parseUnits("100","gwei"));

      // Address 1 receiving 100 gwei tokens purchased for 1 ETH.
      expect(ethers.BigNumber.from(addr1TokenBalance).add(updatedAddr1TokenBalance)).to.equal(ethers.utils.parseUnits("100","gwei"));
    })
    it("Purchase tokens should revert due to insufficient Ethereum balance", async ()=>{
      const [owner,addr1]= await ethers.getSigners();
      const contract= await deployContract();
      
      // Should reject with transaction failure due to insufficient balance.
      await expect( contract.connect(addr1).purchaseTokens({from:addr1.address, value:ethers.utils.parseEther("1000000000")})).rejected;
    })
    it("Purchase tokens should revert if value is less than 1 Gwei. Minimum 1 Gwei is allowed to perform transaction", async()=>{
      const [owner,addr1]= await ethers.getSigners();
      const contract= await deployContract();
      
      await expect( contract.connect(addr1).purchaseTokens({from:addr1.address, value:1})).revertedWith("You must put value greater than 0.000000001 ETH or 1 Gwei")
    })

  })
  
  describe("Testing Contract Events", async ()=>{
    it ("should listen to transfer Events", async()=>{
      const [owner,addr1]= await ethers.getSigners();
      const contract= await deployContract();

     await expect(contract.transfer(addr1.address, 100, { from: owner.address })).to.emit(contract,"Transfer").withArgs(owner.address,addr1.address,100)
    })
    it ("should listen to approve Events", async()=>{
      const [owner,addr1]= await ethers.getSigners();
      const contract= await deployContract();

     await expect(contract.approve(addr1.address, 10000, { from: owner.address })).to.emit(contract,"Approval").withArgs(owner.address,addr1.address,10000)
    })
  })
});
