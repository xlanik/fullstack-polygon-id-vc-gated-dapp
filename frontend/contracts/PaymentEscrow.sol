// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentEscrow {
    address public owner;
    uint public feePercent; // Platform fee percentage

    struct Escrow {
        uint amount;
        address payer;
        address payee;
        bool isReleased;
    }

    mapping(uint => Escrow) public escrows; // Rental ID mapped to escrow
    uint public nextEscrowId;

    event EscrowCreated(uint escrowId, uint amount, address indexed payer, address indexed payee);
    event EscrowReleased(uint escrowId, uint amount, address indexed payee);

    constructor(uint _feePercent) {
        owner = msg.sender;
        feePercent = _feePercent;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Set platform fee percentage
    function setFeePercent(uint _feePercent) external onlyOwner {
        feePercent = _feePercent;
    }

    // Create an escrow for a rental transaction
    function createEscrow(address _payee) external payable returns (uint escrowId) {
        require(msg.value > 0, "Cannot escrow 0 ETH");

        escrowId = nextEscrowId++;
        Escrow storage newEscrow = escrows[escrowId];
        newEscrow.amount = msg.value;
        newEscrow.payer = msg.sender;
        newEscrow.payee = _payee;

        emit EscrowCreated(escrowId, msg.value, msg.sender, _payee);
    }

    // Release funds from escrow to the payee
    function releaseEscrow(uint _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        
        require(msg.sender == escrow.payer, "Only payer can release escrow");
        require(!escrow.isReleased, "Escrow already released");

        uint fee = (escrow.amount * feePercent) / 100;
        uint amountToPayee = escrow.amount - fee;
        escrow.isReleased = true;

        payable(escrow.payee).transfer(amountToPayee);
        payable(owner).transfer(fee); // Transfer platform fee to owner

        emit EscrowReleased(_escrowId, amountToPayee, escrow.payee);
    }
}
