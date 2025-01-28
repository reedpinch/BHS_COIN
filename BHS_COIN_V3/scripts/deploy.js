const { ethers } = require("hardhat");

async function main() {
  // Get the deployer's wallet (the first account in the list of accounts)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory for BHS_Coin (use the name of your contract)
  const Token = await ethers.getContractFactory("BHS_Coin");

  // Deploy the contract
  const token = await Token.deploy(1002015);

  // Wait for the deployment to be confirmed
  await token.deployed();

  console.log("BHS_Coin deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });