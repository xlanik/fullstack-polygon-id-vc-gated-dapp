const path = require("path");

async function main() {
  // Checking the network, assuming you want to deploy to polygon_mumbai
  if (network.name === "polygon_mumbai") {
    console.warn(
      "You are deploying to the Polygon Mumbai Testnet"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the CarListing contract
  const CarListing = await ethers.getContractFactory("CarListing");
  const carListing = await CarListing.deploy();
  await carListing.deployed();

  console.log("CarListing contract deployed to:", carListing.address);

  // Save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(carListing, "CarListing");
}

function saveFrontendFiles(contract, contractName) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ [contractName]: contract.address }, undefined, 2)
  );

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
