pragma solidity ^0.8.0;
// TO DO : add mapping car id to customer id
contract CarListing {
    struct Car {
        address owner;
        string model;
        uint pricePerDay;
        bool isAvailable;
    }

    Car[] public cars;

    function listCar(string memory _model, uint _pricePerDay) public {
        cars.push(Car(msg.sender, _model, _pricePerDay, true));
    }

    function toggleAvailability(uint _carId) public {
        Car storage car = cars[_carId];
        require(msg.sender == car.owner, "Only the owner can change availability.");
        car.isAvailable = !car.isAvailable;
    }

    // Function to get a car's details by its ID
    function getCar(uint _carId) public view returns (Car memory) {
    require(_carId < cars.length, "Car does not exist.");
    return cars[_carId];
    }

    function getCarsCount() public view returns (uint) {
        return cars.length;
    }

}
