You must have .sol file in contracts folder and server in main folder and must have index.html, script.js, and style.js all in a public folder

1. Install node.js --> nodejs.org
2. Set Up Your Project Directory
Create a new directory for your project and navigate into it:

Do these in windows powershell
mkdir MySolidityProject
cd MySolidityProject

Initialize a new Node.js project:

npm init -y

3. Install Hardhat:

npm install --save-dev hardhat 

Run Hardhat's initialization wizard:

npx hardhat


When prompted:

Select "Create an empty hardhat.config.js".

4. Install Necessary Libraries
Install the following additional dependencies for Solidity development:


npm install --save-dev @nomicfoundation/hardhat-toolbox

This installs Hardhat's toolbox, which includes testing, Ethers.js, and other useful utilities.

Compile the contract:

npm install @openzeppelin/contracts
npx hardhat compile

If there are no errors, Hardhat will compile your contract and generate artifacts in the artifacts folder.

Deploy the contract to a local Hardhat network:

npx hardhat node

KEEP THIS TERMINAL OPEN 

Open a new Powershell window and run:

npm install ethers@5
npm install @nomiclabs/hardhat-ethers@2.2.3 --force
npm install --save-dev hardhat --force

npx hardhat run scripts/deploy.js --network localhost

Once you are deployed jot down or save in a text file the 
BHS_Coin deployed to: "Address"

it deploys from wallet 0 in the node terminal

now paste that address in script.js in the public folder for the variable contractAddress

if you want you can change script.js to a text file with

mv script.js script.txt

then

mv script.txt script.js 

to change it back

Next

change the address in server.js to server.txt and update the contractAddress there.
Note, server has the passwords StaticShock and FULLRESET you will need these later.

Now change server back to a .js file

Next

npm install express --force
npm install cors --force

Now run
	
node server.js 

in the project folder

You should get a message telling you "Server running on port 3012"

Now open your browser and navigate to localhost:3012

Now here are the functions you can call

Check student balance,
Check student grades,
If you enter the teacher password "StaticShock"
you can
Set Student Grades
Transfer tokens to student wallets, I used the wallet addresses in the hardhat node
Input an excel file that contains student grades, see the sample excel file for the format, if the format is not correct it wont work.
Or Reset the balance of a single wallet, which you would do if a student hacked the program to give themselves a ton of coins.

Finally if you enter admin password "FULLRESET"
all the coins return to the deployers wallet which I will call every year on July first, my birthday, the coins are meaningless and just a way to reward students for their hard work with coins

Ideally at the end of the year the top 3 students with the most COINS would each get $1000
in scholarship money but I have yet to fund that. 

Enjoy playing with it, email me if you have questions reedpinch@gmail.com


