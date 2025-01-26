// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BHS_Coin is ERC20, Ownable {
    // Mapping to store grades per subject for each student
    mapping(address => mapping(string => uint256)) public studentGrades;
    
    // Mapping to track token balances for students
    mapping(address => uint256) public studentBalances;
    
    // List of student addresses
    address[] public students;

    // Constructor to mint initial supply
    constructor(uint256 initialSupply) ERC20("BHS_Coin", "BHS") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10 ** decimals()));
    }

    // Function to record grade for a student in a subject
    function setGrade(address student, string memory subject, uint256 grade) public onlyOwner {
        require(grade >= 0 && grade <= 100, "Invalid grade");
        studentGrades[student][subject] = grade;
    }

    // Function to reward student based on their grade in a specific subject
    function rewardStudentForSubject(address student, string memory subject) public onlyOwner {
        uint256 grade = studentGrades[student][subject];
        uint256 rewardAmount;

        // Assign tokens based on grade
        if (grade >= 93) {
            rewardAmount = 10; // A
        } else if (grade >= 85) {
            rewardAmount = 7; // B
        } else {
            rewardAmount = 0; // No reward for grades below 85%
        }

        // Ensure there is a reward to be given
        require(rewardAmount > 0, "No reward for this grade");

        // Transfer reward to student
        _transfer(msg.sender, student, rewardAmount);

        // Update the student's token balance
        studentBalances[student] += rewardAmount;

        // Add student to the list if not already present
        if (studentBalances[student] > 0 && !isStudentListed(student)) {
            students.push(student);
        }
    }

    // Function to check if a student is listed
    function isStudentListed(address student) public view returns (bool) {
        for (uint i = 0; i < students.length; i++) {
            if (students[i] == student) {
                return true;
            }
        }
        return false;
    }

    // Function to distribute $1000 to top three students on June 1st
    function rewardTopStudents() public onlyOwner {
        // Ensure the date is June 1st
        require(block.timestamp >= getNextJuneFirstTime(), "It's not time yet");

        // Identify the top three students with the most tokens
        address[3] memory topStudents = getTopThreeStudents();

        // Distribute $1000 worth of tokens to the top three students
        uint256 rewardAmount = 1000 * (10 ** 18); // 1000 USD worth in tokens (adjust for decimals)

        for (uint i = 0; i < 3; i++) {
            _transfer(msg.sender, topStudents[i], rewardAmount);
        }
    }

    // Helper function to get the timestamp of the next June 1st
    function getNextJuneFirstTime() public view returns (uint256) {
        uint256 currentYear = (block.timestamp / 365 days) * 365 days; // start of the current year
        uint256 nextJuneFirst = currentYear + 5 * 30 days; // June 1st of next year (assuming approx 30 days per month)
        return nextJuneFirst;
    }

    // Function to get the top three students based on their token balance
    function getTopThreeStudents() public view returns (address[3] memory) {
        address[3] memory topStudents;
        uint256[3] memory topBalances = [uint256(0), uint256(0), uint256(0)]; // Array to store top three balances

        for (uint i = 0; i < students.length; i++) {
            uint256 studentBalance = studentBalances[students[i]];
            if (studentBalance > topBalances[0]) {
                topBalances[2] = topBalances[1];
                topStudents[2] = topStudents[1];
                topBalances[1] = topBalances[0];
                topStudents[1] = topStudents[0];
                topBalances[0] = studentBalance;
                topStudents[0] = students[i];
            } else if (studentBalance > topBalances[1]) {
                topBalances[2] = topBalances[1];
                topStudents[2] = topStudents[1];
                topBalances[1] = studentBalance;
                topStudents[1] = students[i];
            } else if (studentBalance > topBalances[2]) {
                topBalances[2] = studentBalance;
                topStudents[2] = students[i];
            }
        }

        return topStudents;
    }
}