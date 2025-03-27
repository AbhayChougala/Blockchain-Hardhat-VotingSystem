const hre = require("hardhat");

async function main() {
    // Retrieve all accounts provided by Hardhat (should be 20 by default)
    const accounts = await hre.ethers.getSigners();

    // Ensure we have exactly 20 accounts available
    if (accounts.length !== 20) {
        console.error(`Error: Expected exactly 20 accounts, but got ${accounts.length}.`);
        process.exit(1);
    }

    // Map all accounts to addresses (all 20)
    const voterAddresses = accounts.map(account => account.address);

    const voterNames = [
        "John", "Emma", "Liam", "Olivia", "Noah", "Ava", "Elijah", "Sophia",
        "William", "Isabella", "James", "Mia", "Benjamin", "Charlotte",
        "Lucas", "Amelia", "Henry", "Harper", "Alexander", "Evelyn"
    ];

    console.log("Deploying contract...");

    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(voterAddresses, voterNames);

    await voting.deployed();

    console.log("Voting contract deployed at:", voting.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
