// Ensure you're using the correct provider constructor
const { ethers } = window;  // If using ethers.js via CDN in the browser

// Set up a provider to connect to the Hardhat Network
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); // Hardhat local network

//Your ABI
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
  },
  {
    "inputs": [
      { "internalType": "address", "name": "student", "type": "address" },
      { "internalType": "string", "name": "subject", "type": "string" },
      { "internalType": "uint256", "name": "grade", "type": "uint256" }
    ],
    "name": "setGrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "student", "type": "address" },
      { "internalType": "string", "name": "subject", "type": "string" }
    ],
    "name": "rewardStudentForSubject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "student", "type": "address" },
      { "internalType": "string", "name": "subject", "type": "string" }
    ],
    "name": "studentGrades",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Add fullReset function ABI
  {
    "inputs": [],
    "name": "fullReset",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const contractAddress = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319"; // Replace with your deployed contract address

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);


const TEACHERPASSWORD = "StaticShock";
const FULLRESET_PASSWORD = "FULLRESET"; // Add the reset password

document.getElementById("verifyPasswordButton").addEventListener("click", async () => {
    const enteredPassword = document.getElementById("password-input").value;

    if (enteredPassword === TEACHERPASSWORD) {
        // Display restricted actions
        document.getElementById("passwordSection").style.display = "none";
        document.getElementById("protectedActions").style.display = "block";
    } else if (enteredPassword === FULLRESET_PASSWORD) {
        // Call the smart contract function for full reset
        try {
            await callFullResetFunction();
            document.getElementById("resetConfirmation").style.display = "block";
            setTimeout(() => {
                document.getElementById("resetConfirmation").style.display = "none";
            }, 5000); // Show success message for 5 seconds
        } catch (error) {
            console.error("Error calling full reset function:", error);
            alert("Failed to reset tokens. Please try again.");
        }
    } else {
        // Handle incorrect password
        const errorElement = document.getElementById("passwordError");
        errorElement.style.display = "block";
        setTimeout(() => {
            errorElement.style.display = "none";
        }, 3000); // Hide error after 3 seconds
    }
});

// Function to call the full reset function on the smart contract
async function callFullResetFunction() {

        // Create a Web3 provider using ethers.js
        const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

        // Get the signer (connected account)
        const signer = provider.getSigner();

        // Define your contract address and ABI
        const contractAddress = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319"; // Replace with your contract address
        const abi = [
            "function fullReset() public"
        ];

        // Create a new contract instance
        const contract = new ethers.Contract(contractAddress, abi, signer);


	const passwordInput = document.getElementById("password-input").value;

    	if (passwordInput === "FULLRESET") {
        	try {
           	 	const tx = await contract.fullReset();
            		console.log("Transaction sent:", tx);

            		// Wait for the transaction to be mined
           	 	const receipt = await tx.wait();
            		console.log("Transaction mined:", receipt);

            		alert("Tokens reset successfully!");
        } catch (error) {
            console.error("Error calling full reset function:", error);
        }
    } else {
        alert("Password incorrect!");
    }
}



async function rewardStudentFromSheet(studentData) {
  try {
    // Ensure the first row contains headers
    if (studentData.length < 2) {
      alert("The Excel file must have at least one row of student data!");
      return;
    }

    for (let i = 1; i < studentData.length; i++) {
      const row = studentData[i];
      const name = row[0]; // Student name (not used directly here but for reference)
      const walletAddress = row[1]; // Wallet address
      const subjectsAndGrades = row.slice(2); // Remaining columns contain subjects and grades

      // Ensure the wallet address is valid
      if (!ethers.utils.isAddress(walletAddress)) {
        console.error(`Invalid wallet address for ${name}: ${walletAddress}`);
        continue; // Skip this student
      }

      for (let j = 0; j < subjectsAndGrades.length; j += 2) {
        const subject = subjectsAndGrades[j];
        const grade = subjectsAndGrades[j + 1];

        if (!subject || typeof subject !== "string") {
          console.error(`Invalid subject for ${name} in row ${i + 1}`);
          continue;
        }
        if (typeof grade !== "number" || grade < 0 || grade > 100) {
          console.error(`Invalid grade for ${name} in subject ${subject} in row ${i + 1}`);
          continue;
        }

        // Calculate tokens based on grade
        let tokens = 0;
        if (grade >= 93) {
          tokens = 10; // 'A' grade
        } else if (grade >= 85) {
          tokens = 7; // 'B' grade
        } else {
          console.log(`No tokens rewarded for ${name} in ${subject} with grade ${grade}`);
          continue; // Skip rewarding for lower grades
        }

        try {
          // Call the smart contract to reward the student
          const signer = provider.getSigner();
          const contractWithSigner = contract.connect(signer);

          console.log(`Rewarding ${tokens} BHS to ${walletAddress} for ${subject}...`);
          const tx = await contractWithSigner.setGrade(walletAddress, subject, grade);
          await tx.wait();

          const rewardTx = await contractWithSigner.rewardStudentForSubject(walletAddress, subject);
          await rewardTx.wait();

          console.log(`Rewarded ${tokens} BHS to ${walletAddress} for ${subject}!`);
        } catch (err) {
          console.error(`Error rewarding ${name} for ${subject}:`, err);
        }
      }
    }

    alert("Rewards processed successfully!");
  } catch (err) {
    console.error("Error processing student data:", err);
    alert("Error processing student data. Check the console for details.");
  }
}



function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      resolve(jsonData);
    };
    reader.onerror = function (err) {
      reject(err);
    };
    reader.readAsArrayBuffer(file);
  });
}

document.getElementById("processGradesButton").addEventListener("click", async () => {
  const fileInput = document.getElementById("excelFileInput");
  
  if (fileInput.files.length === 0) {
    alert("Please upload an Excel file!");
    return;
  }

  const file = fileInput.files[0];
  
  try {
    const studentData = await readExcelFile(file);
    console.log("Student Data:", studentData);
    rewardStudentFromSheet(studentData); // Process and reward students
  } catch (err) {
    console.error("Error reading the file:", err);
  }
});















async function setStudentGrade(studentAddress, subject, grade) {
  if (!ethers.utils.isAddress(studentAddress)) {
    alert("Invalid student address!");
    return;
  }
  if (!subject || typeof subject !== "string") {
    alert("Invalid subject!");
    return;
  }
  if (grade < 0 || grade > 100) {
    alert("Grade must be between 0 and 100!");
    return;
  }

  try {
    const signer = provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    console.log("Setting grade for student...");
    const tx = await contractWithSigner.setGrade(studentAddress, subject, grade);
    await tx.wait();

    console.log("Grade set successfully!");

    // Automatically call rewardStudentForSubject if the grade is high enough
    if (grade >= 85) {
      console.log("Rewarding student based on grade...");
      const rewardTx = await contractWithSigner.rewardStudentForSubject(studentAddress, subject);
      await rewardTx.wait();
      console.log("Student rewarded!");
    }

    alert("Grade set and reward (if applicable) processed successfully!");
  } catch (err) {
    console.error("Error:", err);
    alert("Error: " + err.message);
  }
}
// Add event listener for the "Set Grade" button
document.getElementById("setGradeButton").addEventListener("click", () => {
  const studentAddress = document.getElementById("studentAddress").value;
  const subject = document.getElementById("subject").value;
  const grade = parseInt(document.getElementById("grade").value, 10);

  setStudentGrade(studentAddress, subject, grade);
});



async function getStudentGrade(studentAddress, subject) {
  try {
    const grade = await contract.studentGrades(studentAddress, subject);
    console.log(`Grade for ${subject}:`, grade.toString());
    return grade.toString();
  } catch (err) {
    console.error("Error fetching grade:", err);
    return "Error fetching grade!";
  }
}
document.getElementById("checkGradeButton").addEventListener("click", async () => {
  const studentAddress = document.getElementById("checkStudentAddress").value;
  const subject = document.getElementById("checkSubject").value;

  if (ethers.utils.isAddress(studentAddress) && subject) {
    const grade = await getStudentGrade(studentAddress, subject);
    document.getElementById("gradeResult").innerText = `Grade for ${subject}: ${grade}`;
  } else {
    document.getElementById("gradeResult").innerText = "Invalid input!";
  }
});


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