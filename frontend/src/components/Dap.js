import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CarListingArtifact from '../contracts/CarListing.json';
import RentalAgreementArtifact from '../contracts/RentalAgreement.json';
import contractAddress from '../contracts/contract-address.json';
import { Container, Box, Input, Button, Text, VStack, HStack } from '@chakra-ui/react';

const Dapp = () => {
  const [cars, setCars] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState();
  const [carListing, setCarListing] = useState(null);
  const [rentalAgreement, setRentalAgreement] = useState(null);

  // Convert _connectWallet to a function within useEffect
  useEffect(() => {
    const connectWallet = async () => {
        console.log("CarListing Address:", contractAddress.CarListing);
        console.log("RentalAgreement Address:", contractAddress.RentalAgreement);

      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setCarListing(new ethers.Contract(
            contractAddress.CarListing,
            CarListingArtifact.abi,
            provider.getSigner(0)
          ));
        setRentalAgreement(new ethers.Contract(
           contractAddress.RentalAgreement,
           RentalAgreementArtifact.abi,
           provider.getSigner(0)
          ));

        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            console.log('Please connect to MetaMask.');
          } else {
            setSelectedAddress(accounts[0]);
            loadCars(carListing);
          }
        });

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setSelectedAddress(accounts[0]);
        loadCars(carListing);
      } else {
        console.error('Please install MetaMask!');
      }
    };

    connectWallet();
  }, []);

  useEffect(() => {
    // Load cars once carListing is set
    if (carListing) {
      loadCars();
    }
  }, [carListing]);


  const loadCars = async () => {
    if (carListing) {
    try {
      const carCount = await carListing.getCarsCount();
      const carPromises = [];
      for (let i = 0; i < carCount; i++) {
        carPromises.push(carListing.getCar(i));
      }
      const cars = await Promise.all(carPromises);
      setCars(cars);
    } catch (error) {
      console.error("Error loading cars:", error);
    }}
  };

  const listNewCar = async (model, pricePerDay) => {
    try {
      const transaction = await carListing.listCar(model, ethers.utils.parseUnits(pricePerDay, "ether"));
      await transaction.wait();
      loadCars(); // Reload cars after listing
    } catch (error) {
      console.error("Error listing new car:", error);
    }
  };

  const toggleCarAvailability = async (carId) => {
    try {
      const transaction = await carListing.toggleAvailability(carId);
      await transaction.wait();
      alert("Availability change successfull")
      loadCars(); // Reload cars to update the list
    } catch (error) {
      console.error("Error toggling car availability:", error);
    }
  };

  const rentCar = async (carId) => {
    try {
      const transaction = await rentalAgreement.rentCar(carId, 1);
      await transaction.wait();
      alert("Car rented successfully!");
      loadCars(); // Update cars list
    } catch (error) {
      console.error("Error renting car:", error);
    }
  };

  const stopRent = async (rentalId) => {
    try {
      const transaction = await rentalAgreement.stopRent(rentalId);
      await transaction.wait();
      loadCars(); // Update cars list
    } catch (error) {
      console.error("Error stopping rent:", error);
    }
  };

return (
  <Container maxW="container.md" centerContent>
    <Text mb={5}>Connected Address: {selectedAddress}</Text> {/* Display connected address */}
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <VStack spacing={4}>
        {/* Form for listing a new car */}
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          listNewCar(formData.get("model"), formData.get("pricePerDay"));
        }}>
          <HStack spacing={4}>
            <Input type="text" name="model" placeholder="Car Model" required />
            <Input type="number" name="pricePerDay" placeholder="Price Per Day (MATIC)" step="0.01" required />
            <Button colorScheme="purple" type="submit">List Car</Button>
          </HStack>
        </form>

        {/* Displaying cars with rent and toggle availability buttons */}
        {cars.length > 0 ? (
          cars.map((car, index) => (
            <Box key={index} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Text fontSize="xl">Car ID: {index}</Text> {/* Display car ID */}
              <Text fontSize="xl">Model: {car.model}</Text>
              <Text>Price Per Day: {ethers.utils.formatUnits(car.pricePerDay, 'ether')} Matic</Text>
              <Text>Availability: {car.isAvailable ? 'Available' : 'Unavailable'}</Text>
              <Text>Owner: {car.owner && car.owner.toLowerCase()}</Text>
              {car.owner && selectedAddress && car.owner.toLowerCase() === selectedAddress.toLowerCase() && (
                    <Button colorScheme="blue" onClick={() => toggleCarAvailability(index)}>Toggle Availability</Button>
                )} 
              {/* Display "Rent Car" button only if the car is available and the user is not the owner */}
            {car.isAvailable && selectedAddress && car.owner.toLowerCase() !== selectedAddress.toLowerCase() && (
                <Button colorScheme="green" onClick={() => rentCar(index)}>Rent Car</Button>
            )}
            {/* Display "Stop Rent" button only if the car is not available and the user is the owner */}
            {!car.isAvailable && selectedAddress && car.owner.toLowerCase() === selectedAddress.toLowerCase() && (
                <Button colorScheme="blue" onClick={() => stopRent(index)}>Stop Rent</Button>
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
export default Dapp;