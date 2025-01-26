// Ensure you're using the correct provider constructor
const { ethers } = window;  // If using ethers.js via CDN in the browser

// Set up a provider to connect to the Hardhat Network
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); // Hardhat local network

// Your contract ABI and address
const contractABI = [
  {
    "constant": true,
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F"; // Replace with your deployed contract address

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Get Token Balance of a Wallet
async function getBalance(address) {
  if (address) {
    try {
      // Call the balanceOf function from the contract
      const balance = await contract.balanceOf(address);
      // Convert the balance to a human-readable format
      return ethers.utils.formatUnits(balance, 18); // Assuming 18 decimals
    } catch (err) {
      console.error("Error fetching balance:", err);
      return "Error fetching balance!";
    }
  } else {
    return "Invalid address!";
  }
}

// Add event listener for the "Check Balance" button
document.getElementById("getBalanceButton").addEventListener("click", async function () {
  console.log("Button clicked!");
  // Get the address from the input field
  const userAddress = document.getElementById("address").value;

  if (ethers.utils.isAddress(userAddress)) {
    // Fetch the balance and display it
    const balance = await getBalance(userAddress);
    console.log("Balance:", balance);
    document.getElementById("balanceResult").innerText = `Balance: ${balance} BHS`;
  } else {
    console.error("Invalid address format.");
    document.getElementById("balanceResult").innerText = "Invalid address format!";
  }
});

// Transfer Tokens
async function transferTokens(toAddress, amount) {
  // Validate inputs
  if (!ethers.utils.isAddress(toAddress)) {
    alert("Invalid recipient address!");
    return;
  }
  if (!amount || amount <= 0) {
    alert("Invalid transfer amount!");
    return;
  }

  try {
    // Get signer (user's wallet)
    const signer = provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    console.log("Signer address:", await signer.getAddress());
    console.log("Recipient Address:", toAddress);
    console.log("Transfer Amount:", amount);

    // Call the transfer function
    const tx = await contractWithSigner.transfer(toAddress, ethers.utils.parseUnits(amount, 18)); // Assuming 18 decimals
    console.log("Transaction hash:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);

    alert("Transfer Successful!");
  } catch (err) {
    console.error("Error during transfer:", err);
    alert("Error: " + err.message);
  }
}
document.getElementById("sendTransactionButton").addEventListener("click", () => {
  console.log("Send Button Clicked")
  const toAddress = document.getElementById("toAddress").value;
  const amount = document.getElementById("amount").value;
  
  // Call transferTokens with the extracted values
  transferTokens(toAddress, amount);
});