pragma solidity ^0.8.0;

contract UserRegistration {
    struct User {
        address walletAddress;
        string name;
        bool isRegistered;
    }

    mapping(address => User) public users;

    event UserRegistered(address userAddress, string name);

    function registerUser(string memory _name) public {
        require(!users[msg.sender].isRegistered, "User already registered.");

        users[msg.sender] = User(msg.sender, _name, true);
        emit UserRegistered(msg.sender, _name);
    }
}
