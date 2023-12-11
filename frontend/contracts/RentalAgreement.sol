pragma solidity ^0.8.0;

import "./CarListing.sol";

contract RentalAgreement {
    CarListing carListing;

    struct Rental {
        address renter;
        uint carId;
        uint startDate;
        uint endDate;
        bool isActive;
    }

    Rental[] public rentals;

    constructor(address _carListingAddress) {
        carListing = CarListing(_carListingAddress);
    }

    function rentCar(uint _carId, uint _days) public payable {
        CarListing.Car memory car = carListing.getCar(_carId);


        require(car.isAvailable, "Car is not available.");
        require(msg.value == car.pricePerDay * _days, "Incorrect payment.");

        rentals.push(Rental(msg.sender, _carId, block.timestamp, block.timestamp + _days * 1 days, true));
        carListing.toggleAvailability(_carId); // Mark car as unavailable
    }

    function stopRent(uint _rentalId) public {
    Rental storage rental = rentals[_rentalId];
    require(msg.sender == rental.renter, "Only the renter can stop the rent.");
    require(rental.isActive, "Rent is already stopped.");

    rental.isActive = false;
    carListing.toggleAvailability(rental.carId); // Mark car as available
}
}
