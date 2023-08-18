// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IERC20.sol";
// Importing ERC20 Standard Interface and creating and inherting the contract following the ERC20 Interface.
contract ERC20 is IERC20 {
    mapping(address => uint) public balanceOf; // address Balances
    mapping(address => mapping(address => uint)) public allowance; // Address allowing user to spend token
    uint public totalSupply; // 1 billion total supply
    string public name;
    string public symbol;
    uint8 public decimals=18;
    uint  public tokenPrice;
    address owner;

// At the time of deployment, Owner will be giving token details and its total supply.
    constructor(string memory _tokenName, string memory _tokenSymbol, uint _totalSupply, uint _tokenPrice){
        owner=msg.sender;
        name=_tokenName;
        symbol=_tokenSymbol;
        totalSupply= _totalSupply * 10 ** 18;
        tokenPrice= _tokenPrice; // How many tokens to sell per Gwei or 0.000000001 ETH
        owner=msg.sender;
        balanceOf[owner]= totalSupply;
    }

    // Since all the tokens is stored to Owner's address, Implementing the functionality where users can purchase token for ETH.

    function purchaseTokens() public payable  returns (bool) {
        // 1000 tokens for 1 Gwei
        require (msg.value>=1 gwei, "You must put value greater than 0.000000001 ETH or 1 Gwei");
        require (address(msg.sender).balance>=msg.value, "You don't have enough funds in your account balance");
        uint ethToToken=msg.value *tokenPrice/1 gwei; // Tokens per gwei
         balanceOf[owner]-=ethToToken;
         balanceOf[msg.sender]+=ethToToken;
         payable (owner).transfer(msg.value);
        emit Transfer(owner, msg.sender, ethToToken);

         return true;
            }

// Transfer function to send tokens to receiver address
    function transfer(address receiver, uint amount) external returns (bool) {
        require(balanceOf[msg.sender]>=amount,"Insufficient Balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[receiver] += amount;
        emit Transfer(msg.sender, receiver, amount);
        return true;
    }

// Function to allow spender address to spend amount of token owner on his behalf.
    function approve(address spender, uint amount) external returns (bool) {

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
// Spender sending allowed tokens to receiver.
    function transferFrom(
        address sender,
        address receiver,
        uint amount
    ) external returns (bool) {
        require(amount<= allowance[sender][msg.sender],"You have exceeded the amount to spend tokens allowed by token owner");
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[receiver] += amount;
        emit Transfer(sender, receiver, amount);
        return true;
    }
}
