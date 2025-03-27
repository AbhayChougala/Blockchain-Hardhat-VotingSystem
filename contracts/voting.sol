// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        bytes32 name;  // Storing as bytes32 for gas savings.
        uint256 voteCount;
    }

    struct Voter {
        string name;
        bool hasVoted;
    }

    address public immutable owner;
    uint256 public totalVotes;

    // Mapping for candidates keyed by candidate index (0 to 3).
    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    event Voted(address indexed voter, uint256 indexed candidateIndex);

    constructor(address[20] memory _voterAddresses, string[20] memory _voterNames) {
        owner = msg.sender;

        // Initialize candidates with bytes32 names.
        candidates[0] = Candidate(bytes32("Alice"), 0);
        candidates[1] = Candidate(bytes32("Bob"), 0);
        candidates[2] = Candidate(bytes32("Charlie"), 0);
        candidates[3] = Candidate(bytes32("David"), 0);

        // Register voters with names and default voting status.
        unchecked {
            for (uint256 i = 0; i < 20; i++) {
                voters[_voterAddresses[i]] = Voter(_voterNames[i], false);
            }
        }
    }

    modifier onlyRegisteredVoter() {
        require(bytes(voters[msg.sender].name).length != 0, "Not a registered voter");
        require(!voters[msg.sender].hasVoted, "Already voted");
        _;
    }

    function vote(uint256 candidateIndex) external onlyRegisteredVoter {
        require(candidateIndex < 4, "Invalid candidate");

        // Mark voter as having voted.
        voters[msg.sender].hasVoted = true;

        unchecked {
            candidates[candidateIndex].voteCount++;
            totalVotes++;
        }

        emit Voted(msg.sender, candidateIndex);
    }

    // Helper function to convert bytes32 to string by trimming trailing zeros.
    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (uint8 j = 0; j < i; j++) {
            bytesArray[j] = _bytes32[j];
        }
        return string(bytesArray);
    }

    // Returns the candidate's name (trimmed) and vote count.
    function getCandidate(uint256 index) external view returns (string memory, uint256) {
        require(index < 4, "Invalid candidate");
        return (bytes32ToString(candidates[index].name), candidates[index].voteCount);
    }

    // Determines the winner by iterating through candidates.
    function getWinner() external view returns (string memory winnerName, uint256 winnerVotes) {
        uint256 maxVotes = 0;
        uint256 winnerIndex = 0;
        unchecked {
            for (uint256 i = 0; i < 4; i++) {
                if (candidates[i].voteCount > maxVotes) {
                    maxVotes = candidates[i].voteCount;
                    winnerIndex = i;
                }
            }
        }
        return (bytes32ToString(candidates[winnerIndex].name), maxVotes);
    }

    // Returns a voter's name and whether they've voted.
    function getVoterStatus(address voterAddress) external view returns (string memory, bool) {
        require(bytes(voters[voterAddress].name).length != 0, "Not a registered voter");
        return (voters[voterAddress].name, voters[voterAddress].hasVoted);
    }
}