// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

contract SimpleBank {
    //
    // State variables
    //
    struct structUser {
        bool enrolled;
        uint balance;
    }

    mapping(address => structUser) private users;

    address public owner;

    modifier alreadyEnroll() {
        require(users[msg.sender].enrolled, "User not enrolled");
        _;
    }

    modifier amountGreaterZero(uint amount) {
        require(amount>0, "Amount not greater than zero");
        _;
    }
    //
    // Events 
    //

    event LogEnrolled(address indexed accountAddress);

    event LogDepositMade(address indexed accountAddress, uint256 amount);

    event LogWithdrawals(address indexed accountAddress, uint256 amount, uint256 newBalance);



    //
    // Functions
    //

    constructor() {
        owner = msg.sender; 
    }

    
    receive() external payable {

    }

    function getBalance() public view returns(uint) {
        return users[msg.sender].balance;
    }

    function isEnroll() public view returns(bool){
        return users[msg.sender].enrolled;
    }

    function enroll() public {
        require(!users[msg.sender].enrolled, "User already enrolled");
        users[msg.sender].enrolled = true;

        emit LogEnrolled(msg.sender);
    }

    function deposit() public payable alreadyEnroll amountGreaterZero(msg.value) returns (uint) {
        
        users[msg.sender].balance = users[msg.sender].balance + msg.value;

        emit LogDepositMade(msg.sender,msg.value);

        return users[msg.sender].balance;
    }

    function withdraw(uint withdrawAmount) public payable alreadyEnroll amountGreaterZero(withdrawAmount) returns (uint) {
        
        require(users[msg.sender].balance>=withdrawAmount, "Not enough funds");

        users[msg.sender].balance = users[msg.sender].balance - withdrawAmount;

        (bool sent, ) = msg.sender.call{value: msg.value, gas: 20317}("");
        
        require(sent, "Failed to send Ether");

        emit LogWithdrawals(msg.sender,withdrawAmount,users[msg.sender].balance);
        
        return users[msg.sender].balance;
    }

    function withdrawAll() public returns (bool) {
        require(msg.sender==owner, "User not owner");

        uint withdrawAmount = users[msg.sender].balance;

        users[msg.sender].balance = users[msg.sender].balance - withdrawAmount;

        (bool sent, ) = msg.sender.call{value: withdrawAmount, gas: 20317}("");
        require(sent, "Failed to send Ether");

        emit LogWithdrawals(msg.sender,withdrawAmount,users[msg.sender].balance);

        return sent;
    }



}
