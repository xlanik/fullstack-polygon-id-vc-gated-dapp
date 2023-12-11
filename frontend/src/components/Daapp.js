import React from "react";
import { ethers } from "ethers";
import CarListingArtifact from "../contracts/CarListing.json";
import RentalAgreementArtifact from "../contracts/RentalAgreement.json";
import contractAddress from "../contracts/contract-address.json";
import { Container, Box, Input, Button, Text, VStack, HStack } from "@chakra-ui/react";
// ... other imports like components for UI

class Dapp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: [],
      selectedAddress: undefined,
      // ... other state variables as needed
    };
  }

  componentDidMount() {
    this._connectWallet();
  }

  async _connectWallet() {
    if (window.ethereum) {
      this._provider = new ethers.providers.Web3Provider(window.ethereum);
      // ... existing contract setup code ...
  
      // Check if any accounts are already connected
      const accounts = await this._provider.listAccounts();
      if (accounts.length > 0) {
        // Account is already connected
        this.setState({ selectedAddress: accounts[0] });
        this._loadCars();
      } else {
        // Listen for account changes
        window.ethereum.on('accountsChanged', this.handleAccountsChanged);
        
        // Request account connection
        try {
          const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
          this.setState({ selectedAddress });
          this._loadCars();
        } catch (error) {
          console.error("Error during account request:", error);
        }
      }
    } else {
      console.error("Please install MetaMask!");
    }
  }
  
  handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
    } else {
      this.setState({ selectedAddress: accounts[0] });
      this._loadCars();
    }
  }

  async _listNewCar(model, pricePerDay) {
    try {
      const transaction = await this._carListing.listCar(model, ethers.utils.parseUnits(pricePerDay, "ether"));
      await transaction.wait();
      this._loadCars(); // Reload cars after listing
    } catch (error) {
      console.error("Error listing new car:", error);
    }
  }
  async _loadCars() {
    if (!this._carListing) {
      console.error("CarListing contract is not initialized.");
      return;
    }
  
    try {
      const carCount = await this._carListing.getCarsCount();
      const carPromises = [];
      for (let i = 0; i < carCount; i++) {
        carPromises.push(this._carListing.getCar(i));
      }
      const cars = await Promise.all(carPromises);
      this.setState({ cars });
    } catch (error) {
      console.error("Error loading cars:", error);
    }
  }
  
  async _toggleCarAvailability(carId) {
    try {
      const transaction = await this._carListing.toggleAvailability(carId);
      await transaction.wait();
      this._loadCars(); // Reload cars to update the list
    } catch (error) {
      console.error("Error toggling car availability:", error);
    }
  }

  async _rentCar(carId) {
    try {
      // Assuming rentCar is a payable function requiring ETH
      const transaction = await this._carListing.rentCar(carId, { value: ethers.utils.parseUnits("1", "ether") });
      await transaction.wait();
      alert("Car rented successfully!");
      // You might want to update car's availability or refresh the cars list
    } catch (error) {
      console.error("Error renting car:", error);
    }
  }

  async _stopRent(rentalId) {
    try {
      const transaction = await this._rentalAgreement.stopRent(rentalId);
      await transaction.wait();
      this._loadCars(); // Reload cars to update the list
    } catch (error) {
      console.error("Error stopping rent:", error);
    }
  }
  

  render() {
    return (
      <Container maxW="container.md" centerContent>
        <Text mb={5}>Connected Address: {this.state.selectedAddress}</Text> {/* Display connected address */}
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <VStack spacing={4}>
            {/* Form for listing a new car */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              this._listNewCar(formData.get("model"), formData.get("pricePerDay"));
            }}>
              <HStack spacing={4}>
                <Input type="text" name="model" placeholder="Car Model" required />
                <Input type="number" name="pricePerDay" placeholder="Price Per Day (MATIC)" step="0.01" required />
                <Button colorScheme="purple" type="submit">List Car</Button>
              </HStack>
            </form>

            {/* Displaying cars with rent and toggle availability buttons */}
            {this.state.cars.length > 0 ? (
              this.state.cars.map((car, index) => (
                <Box key={index} p={5} shadow="md" borderWidth="1px" borderRadius="md">
                  <Text fontSize="xl">Car ID: {index}</Text> {/* Display car ID */}
                  <Text fontSize="xl">Model: {car.model}</Text>
                  <Text>Price Per Day: {ethers.utils.formatUnits(car.pricePerDay, 'ether')} Matic</Text>
                  <Text>Availability: {car.isAvailable ? 'Available' : 'Unavailable'}</Text>
                  <Text>Owner: {car.owner && car.owner.toLowerCase()}</Text> 
                  {car.owner && this.state.selectedAddress && car.owner.toLowerCase() === this.state.selectedAddress.toLowerCase() && (
                    <Button colorScheme="blue" onClick={() => this._toggleCarAvailability(index)}>Toggle Availability</Button>
                  )}
                  {car.isAvailable ? (
                  <Button colorScheme="green" onClick={() => this._rentCar(index)}>Rent Car</Button>
                  ) : (
                    // Check if the current user is the renter
                    this.state.rentals[index]?.renter === this.state.selectedAddress.toLowerCase() && (
                      <Button onClick={() => this._stopRent(index)}>Stop Rent</Button>
                    )
                  )}
                </Box>
              ))
            ) : (
              <Text>No cars listed yet.</Text>
            )}
          </VStack>
        </Box>
      </Container>
    );
  }

  // ... other methods as needed
}

export default Dapp;
