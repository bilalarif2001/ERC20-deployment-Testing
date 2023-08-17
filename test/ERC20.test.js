const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SoloCoin ERC-20 Token Contract Test", function () {
  async function deployContract() {
    try {
      const [owner] = await ethers.getSigners();
      const erc20Contract = await ethers.getContractFactory("ERC20");
      erc20Contract.connect(owner);
      const contract = await erc20Contract.deploy(
        "SoloCoin",
        "SOLX",
        "10000",
        "100"
      );

      return contract;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  describe("Contract deployment Test", async function () {
    it("Should return contract object upon contract deployment", async function () {
      const contract = await deployContract();
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
  });
});
