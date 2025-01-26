# BHS_COIN

Prerequisites
Make sure you have the following installed on your system:

Node.js (latest LTS version)
npm (comes with Node.js)
Hardhat (for deploying and testing the smart contract)
MetaMask (browser extension for interacting with the blockchain)
lite-server (for running the frontend)

Installation Steps
Clone the repository:

git clone https://github.com/reedpinch/BHS_Coin.git
cd BHS_Coin

Install dependencies:

npm install

Install Hardhat globally (if not already installed):

npm install --save-dev hardhat

Running the Project
1. Compile the Smart Contract
Navigate to the root directory of the project and compile the contract:

npx hardhat compile

2. Start the Local Blockchain

Run the local blockchain network:

npx hardhat node

3. Deploy the Contract
In a separate terminal window, deploy the contract to the local network:

npx hardhat run scripts/deploy.js --network localhost

Note down the contract address displayed in the console.

4. Configure MetaMask
Open MetaMask and connect it to the localhost:8545 network.
Import an account using one of the private keys from the local blockchain (provided in the Hardhat node terminal).

5. Run Tests
Run the test script to ensure everything is working correctly:

npx hardhat test
6. Launch the Frontend
Start the lite-server to view the frontend:

npm run start
This will launch the application in your default browser.

7. Interact with the Application
Use the application to simulate BHS COIN transactions and features.

Project Structure
Back End/
contracts/: Contains the Solidity contract (BHS_COIN.sol).
scripts/: Contains the deployment script (deploy.js) and test script (test.js).

FrontEnd/: Contains the frontend files (index.html, script.js).
hardhat.config.js: Hardhat configuration file.

Custom Features
BHS COIN Total Supply: The contract enforces a total supply of 2015 coins. That's the year I graduated High school

Ensure your MetaMask wallet is funded with ETH from the Hardhat local node to pay for gas fees. These wallets are prefunded and it's not actual ETH it's test ETH

Update the contract address in the frontend script (script.js) after deployment.
License
This project is licensed under the MIT License.


