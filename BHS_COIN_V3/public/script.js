// Ensure you're using the correct provider constructor
const { ethers } = window;  // If using ethers.js via CDN in the browser

// Set up a provider to connect to the Hardhat Network
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8549"); // Hardhat local network

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
  },
  {
   "inputs": [{"name": "account", "type": "address"}],
   "name": "resetBalance",
   "outputs": [{ "name": "balance", "type": "uint256" }],
   "stateMutability": "nonpayable",
   "type": "function"
  }
];
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const signer = provider.getSigner();
const contractWithSigner = contract.connect(signer);

// Set student grade
async function setStudentGrade(studentName, subject, grade) {
  try {
    const response = await fetch('/setStudentGrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName, subject, grade }),
    });
    console.log(await response.text());
  } catch (error) {
    console.error('Error setting grade:', error);
  }

}
// Event Listener for "Set Student Grade" Button
document.getElementById("setGradeButton").addEventListener("click", async () => {
  const studentName = document.getElementById("studentNameInput").value;
  const studentSubject = document.getElementById("subjectInput").value;
  const studentGrade = document.getElementById("gradeInput").value;

  // Validate input
  if (!studentName || !studentSubject || !studentGrade) {
    alert("Please fill out all fields.");
    return;
  }

    fetch('http://localhost:3012/setStudentGrade', {
      method: 'POST',
      headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: studentName, subject: studentSubject, grade: studentGrade }),
    })
    .then((response) => response.json()) // expecting JSON response
    .then((data) => {
    console.log('Grade set:', data);
    alert('Grade set successfully');
    })
    .catch((error) => {
      console.error('Error setting grade:', error);
    });
});


// Check student grade
async function checkStudentGrade(studentName, studentSubject) {
  try {
    const response = await fetch('http://localhost:3012/checkStudentGrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: studentName, subject: studentSubject }),
    });

    const data = await response.json(); // expecting JSON
    if (response.ok) {
      console.log('Grade:', data.grade);
      alert('Grade: ' + data.grade);
    } else {
      console.log('Error:', data.error);
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Error fetching grade:', error);
    alert('Error fetching grade!');
  }
}


// Add event listener for the "Check Grade" button
document.getElementById("checkGradeButton").addEventListener("click", async function () {
  console.log("Check Grade Button clicked!");

  // Safeguard for missing elements
  const studentNameInput = document.getElementById("studentName");
  const studentSubjectInput = document.getElementById("studentSubject");

  if (!studentNameInput || !studentSubjectInput) {
    console.error("Input fields for student name or subject are missing.");
    document.getElementById("gradeOutput").innerText = "Error: Missing input fields!";
    return;
  }

  // Get values from input fields
  const studentName = studentNameInput.value;
  const studentSubject = studentSubjectInput.value;

  if (!studentName || !studentSubject) {
    console.error("Name or subject input is empty.");
    document.getElementById("gradeOutput").innerText = "Error: Please provide name and subject.";
    return;
  }
  fetch('http://localhost:3012/checkStudentGrade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
  },
    body: JSON.stringify({ name: studentName, subject: studentSubject }),
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.grade !== undefined) {
      console.log("Grade:", data.grade);
      alert("Grade: " + data.grade);
    } else {
      console.error("Error: No grade found!");
    }
  })
  .catch((error) => {
    console.error('Error fetching grade:', error);
  });
});


// Function to reward students from the Excel sheet data
async function rewardStudentFromSheet(sheetData) {
  for (let i = 0; i < sheetData.length; i++) {
    const row = sheetData[i];
    const studentName = row[0]; // First column is the student's name
    const walletId = row[1]; // Second column is the wallet ID

    // Validation for studentName and walletId
    if (!studentName || !walletId) {
      console.log(`Row ${i + 1} is missing student name or wallet ID.`);
      continue;
    }

    for (let j = 2; j < row.length; j += 2) {
      const subject = row[j];
      const grade = row[j + 1];

      // Debugging information
      console.log(`Processing: Student - ${studentName}, Subject - ${subject}, Grade - ${grade}`);

      // Validate subject and grade
      if (!subject || typeof grade !== 'number' || grade < 0 || grade > 100) {
        console.log(`Invalid subject or grade for student: ${studentName} in row ${i + 1}`);
        continue;
      }

      // Reward logic
      let rewardTokens = 0;
      if (grade >= 93) {
        rewardTokens = 10;
      } else if (grade >= 85) {
        rewardTokens = 7;
      }

      // If reward tokens are applicable, use ERC-20 transfer function
      if (rewardTokens > 0) {
        try {
          console.log(
            `Transferring ${rewardTokens} tokens from ${contractAddress} to wallet ID ${walletId} for ${subject}...`
          );
          const tx = await contractWithSigner.transfer(walletId, ethers.utils.parseUnits(rewardTokens.toString(), 18));
          await tx.wait(); // Wait for the transaction to be mined
          console.log(`Successfully transferred ${rewardTokens} tokens to ${walletId}.`);
        } catch (error) {
          console.error(`Failed to transfer tokens to wallet ID ${walletId} for ${subject}:`, error);
        }
      } else {
        console.log(`No tokens rewarded for ${studentName} in ${subject} with grade ${grade}.`);
      }
    }
  }
  console.log("Reward process completed.");
}

// Read Excel File Function
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

// Handle Grade Processing Button Click
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


async function resetHackerBalance(address1) {
  if (address1) {
    try {
      // Get the signer from the provider (usually the connected wallet)
      const signer = provider.getSigner(); // You may need to adjust this based on your setup

      // Attach the signer to the contract
      const contractWithSigner = contract.connect(signer);

      // Call the resetBalance function from the contract using the signer
      const tx = await contractWithSigner.resetBalance(address1);

      // Wait for the transaction to be mined (optional)
      await tx.wait();

      console.log('Balance reset successfully');
      //return "Balance reset successfully!";
    } catch (err) {
      console.error("Error destroying balance:", err);
      return "Error destroying balance!";
    }
  } else {
    return "Invalid address!";
  }
}// Add event listener for the "Destroy" button
document.getElementById("resetBalanceButton").addEventListener("click", async function () {
  console.log("Destroy Balance Button clicked!");
  // Get the address from the input field
  const userAddress = document.getElementById("address").value;

  if (ethers.utils.isAddress(userAddress)) {
    // Fetch the balance and display it
    const balance = await resetHackerBalance(userAddress) || "0.0";
    //console.log("Balance:", balance);
    document.getElementById("resetBalanceButton").innerText = `Balance: ${balance} BHS`;
  } else {
    console.error("Invalid address format.");
    document.getElementById("resetBalanceButton").innerText = "Invalid address format!";
  }
});






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

// Add event listener for the "Send Transaction" button
document.getElementById("sendTransactionButton").addEventListener("click", () => {
  console.log("Send Button Clicked")
  const toAddress = document.getElementById("toAddress").value;
  const amount = document.getElementById("amount").value;

  if (!toAddress || !amount) {
    alert("Please provide both recipient address and transfer amount!");
    return;
  }
  transferTokens(toAddress, amount);
});


document.getElementById("verifyPasswordButton").addEventListener("click", async () => {
  const password = document.getElementById("password-input").value;

  try {
    const response = await fetch('http://localhost:3012/verify-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const result = await response.json();
    if (result.success) {
      alert("Password verified successfully!");
    } else {
      alert("Invalid password!");
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    alert("Error verifying password!");
  }
});