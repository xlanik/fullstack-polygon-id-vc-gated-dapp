const path = require("path");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contractAddressPath = path.join(__dirname, "..", "src", "contracts", "contract-address.json");
  const contractAddresses = JSON.parse(fs.readFileSync(contractAddressPath, "utf8"));
  const carListingAddress = contractAddresses.CarListing; // Use the actual contract name used in your contract-address.json

  // Make sure the carListingAddress is not undefined
  if (!carListingAddress) {
    throw new Error("CarListing address not found in contract-address.json");
  }

  // Proceed to deploy RentalAgreement with the carListingAddress
  const RentalAgreement = await ethers.getContractFactory("RentalAgreement");
  const rentalAgreement = await RentalAgreement.deploy(carListingAddress);
  await rentalAgreement.deployed();
  console.log("RentalAgreement contract deployed to:", rentalAgreement.address);

  saveFrontendFiles(rentalAgreement, "RentalAgreement");
}

function saveFrontendFiles(contract, contractName) {
  const contractsDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const contractAddressPath = path.join(contractsDir, "contract-address.json");
  const addresses = fs.existsSync(contractAddressPath)
    ? JSON.parse(fs.readFileSync(contractAddressPath))
    : {};

  // Append the new contract's address without overwriting existing ones
  addresses[contractName] = contract.address;
  fs.writeFileSync(contractAddressPath, JSON.stringify(addresses, undefined, 2));

  const ContractArtifact = artifacts.readArtifactSync(contractName);
  fs.writeFileSync(
    path.join(contractsDir, `${contractName}.json`),
    JSON.stringify(ContractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
