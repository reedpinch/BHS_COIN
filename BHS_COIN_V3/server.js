const xlsx = require('xlsx');
const ethers = require('ethers');
const express = require("express");
const cors = require('cors');  // Import cors
const app = express();
const bodyParser = require("body-parser");
const path = require('path');  // Add this line to import the path module
const fs = require('fs');

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3012', // replace with your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
}));



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
   "outputs": [],
   "stateMutability": "nonpayable",
   "type": "function"
  }
];


// Replace with your contract ABI
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed contract address

// Provider and signer setup (use your deployer's private key or wallet)
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const signer = provider.getSigner(); // This will be the deployer's wallet

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// File path for the Excel sheet
const filePath = path.join(__dirname, 'student_grades.xlsx');

// Helper to read the Excel file
function readExcel() {
  const workbook = xlsx.readFile(filePath);
  return workbook.Sheets[workbook.SheetNames[0]];
}

// Helper to write to the Excel file
function writeExcel(data) {
  const workbook = xlsx.utils.book_new();
  const sheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, sheet, 'Grades');
  xlsx.writeFile(workbook, filePath);
}

// Endpoint to set grades
app.post("/setStudentGrade", (req, res) => {
  const { name, subject, grade } = req.body;

  if (!name || !subject || grade === undefined) {
    res.status(400).json({ error: "Invalid input data!" });
    return;
  }

  try {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Ensure the header row exists
    let header = data[0] || ["Name", "Wallet ID"];
    data[0] = header;

    // Add subject if not present
    let subjectIndex = header.indexOf(subject);
    if (subjectIndex === -1) {
      header.push(subject, `${subject} Grade`);
      subjectIndex = header.indexOf(subject);
    }

    // Find or create the student row
    let studentRow = data.find((row) => row[0] === name);
    if (!studentRow) {
      studentRow = [name, ""];
      data.push(studentRow);
    }

    // Expand student row to match header length
    while (studentRow.length < header.length) {
      studentRow.push("");
    }

    // Update the grade
    studentRow[subjectIndex + 1] = grade;

    // Save the updated Excel sheet
    const newWorksheet = xlsx.utils.aoa_to_sheet(data);
    workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
    xlsx.writeFile(workbook, filePath);

    res.json({ success: "Grade successfully set!" });
  } catch (error) {
    console.error("Error updating Excel file:", error);
    res.status(500).json({ error: "Failed to set grade!" });
  }
});

// Endpoint to check grades
app.post("/checkStudentGrade", (req, res) => {
  const { name, subject } = req.body;

  if (!name || !subject) {
    res.status(400).json({ error: "Invalid input data!" });
    return;
  }

  try {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Ensure the header row exists
    const header = data[0];
    if (!header) {
      res.status(404).json({ error: "No data found in the sheet!" });
      return;
    }

    // Find the column index for the subject grade
    const subjectIndex = header.indexOf(subject);
    if (subjectIndex === -1 || subjectIndex + 1 >= header.length) {
      res.status(404).json({ error: `Subject '${subject}' not found!` });
      return;
    }

    // Search for the student's record
    const studentRow = data.find((row) => row[0] === name);
    if (!studentRow) {
      res.status(404).json({ error: `Student '${name}' not found!` });
      return;
    }

    // Get the grade for the subject
    const grade = studentRow[subjectIndex + 1];
    if (grade === undefined) {
      res.status(404).json({ error: `No grade found for subject '${subject}'!` });
      return;
    }

    res.json({ name, subject, grade });
  } catch (error) {
    console.error("Error reading Excel file:", error);
    res.status(500).json({ error: "Failed to check grade!" });
  }
});


// Passwords stored in the backend
const TEACHER_PASSWORD = "StaticShock";
const FULLRESET_PASSWORD = "FULLRESET";

// Endpoint to verify password
app.post("/verify-password", async (req, res) => {
    const { password } = req.body;

    if (password === FULLRESET_PASSWORD) {
        try {
            console.log('Full reset password verified, attempting to reset tokens...');
            
            // Call the fullReset function in the smart contract
            const tx = await contract.fullReset();
            console.log('Transaction sent, waiting for confirmation...');
            
            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Respond back with success
            return res.json({
                success: true,
                role: "full",
                message: "Tokens reset to deployer!"
            });
        } catch (error) {
            console.error('Error during full reset:', error);
            return res.json({
                success: false,
                message: 'Error resetting tokens',
                error: error.message
            });
        }
    } else if (password === TEACHER_PASSWORD) {
        // Teacher password allows limited access (no full reset)
        return res.json({ success: true, role: "teacher" });
    } else {
        // Incorrect password
        return res.json({ success: false });
    }
});


const filePath1 = 'student_grades.xlsx';

// Check if the file is accessible
fs.access(filePath1, fs.constants.R_OK | fs.constants.W_OK, (err) => {
  if (err) {
    console.log('File is not accessible:', err);
  } else {
    console.log('File is accessible for reading and writing');
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    console.log(`Request method: ${req.method}, Request URL: ${req.url}`);
    next();
});
app.get('/test', (req, res) => {
    res.send('Server is working!');
});

// Start the server
app.listen(3012, () => {
    console.log("Server running on port 3012");
});