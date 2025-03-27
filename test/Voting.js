const { expect } = require("chai");
require("@nomicfoundation/hardhat-chai-matchers"); // Ensure solidity matchers are available
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting, voting;
  let accounts, deployer, voters;
  const voterNames = [
    "John", "Emma", "Liam", "Olivia", "Noah", "Ava", "Elijah", "Sophia",
    "William", "Isabella", "James", "Mia", "Benjamin", "Charlotte",
    "Lucas", "Amelia", "Henry", "Harper", "Alexander", "Evelyn"
  ];

  beforeEach(async function () {
    // Retrieve at least 20 accounts from Hardhat
    accounts = await ethers.getSigners();
    if (accounts.length < 20) {
      throw new Error("Not enough accounts available for testing.");
    }
    // Use all 20 accounts as voters (including deployer)
    voters = accounts.slice(0, 20);
    deployer = voters[0];

    // Deploy the contract with the 20 voter addresses and names
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(
      voters.map(account => account.address),
      voterNames
    );
    await voting.deployed();
  });

  it("should deploy the contract and set the correct owner", async function () {
    expect(await voting.owner()).to.equal(deployer.address);
  });

  it("should allow a registered voter to vote", async function () {
    // Let voter[1] vote for candidate 0 (Alice)
    await voting.connect(voters[1]).vote(0);
    const candidate = await voting.getCandidate(0);
    // Convert voteCount from BigNumber to number before comparing
    expect(candidate[1].toNumber()).to.equal(1);

    // Check that the voter status is updated
    const voterStatus = await voting.getVoterStatus(voters[1].address);
    expect(voterStatus[1]).to.be.true;
  });

  it("should not allow a voter to vote twice", async function () {
    // Let voter[2] vote once
    await voting.connect(voters[2]).vote(1);
    // Attempting to vote again should be reverted with "Already voted"
    await expect(voting.connect(voters[2]).vote(2))
      .to.be.revertedWith("Already voted");
  });

  it("should return the correct winner", async function () {
    // Multiple votes:
    // voter[1] and voter[2] vote for candidate 0 (Alice)
    // voter[3] votes for candidate 1 (Bob)
    await voting.connect(voters[1]).vote(0);
    await voting.connect(voters[2]).vote(0);
    await voting.connect(voters[3]).vote(1);

    const winner = await voting.getWinner();
    // Check that candidate "Alice" is the winner with 2 votes.
    expect(winner[0]).to.equal("Alice");
    expect(winner[1].toNumber()).to.equal(2);
  });

  it("should return the correct voter status", async function () {
    // Check that voter[4] has not voted yet
    const initialStatus = await voting.getVoterStatus(voters[4].address);
    expect(initialStatus[1]).to.be.false;

    // Let voter[4] vote for candidate 2 (Charlie)
    await voting.connect(voters[4]).vote(2);
    const updatedStatus = await voting.getVoterStatus(voters[4].address);
    expect(updatedStatus[1]).to.be.true;
  });
});
