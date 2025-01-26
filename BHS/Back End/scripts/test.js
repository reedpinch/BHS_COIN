const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Interacting with the contract using account:", deployer.address);

  // Replace this with your contract's deployed address
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  // Replace 'BHS_Coin' with your contract name
  const BHS_Coin = await ethers.getContractFactory("BHS_Coin");
  const contract = BHS_Coin.attach(contractAddress);

  // Example: Get total supply
  const totalSupply = await contract.totalSupply();
  console.log("Total Supply:", totalSupply.toString());

  // Example: Transfer tokens
  const recipient = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // Replace with an address
  const transferTx = await contract.transfer(recipient, ethers.utils.parseUnits("10", 18));
  await transferTx.wait();
  console.log(`10 tokens transferred to ${recipient}`);
  const recipientBalance = await contract.balanceOf(recipient);
  console.log("Recipient's Balance:", ethers.utils.formatUnits(recipientBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });