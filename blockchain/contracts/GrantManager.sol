// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GovernanceToken.sol";
import "./ProposalNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract GrantManager is Ownable {
    
    struct GrantProposal {
        uint256 nftId;         
        uint256 endTime;        
        uint256 totalVotes;   
        bool executed;        
        address creator;        
    }

    mapping(uint256 => GrantProposal) public grantProposals;

   
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    GovernanceToken public immutable governanceToken;
    ProposalNFT public immutable proposalNFT;

    address public trustedSigner;

    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant VOTING_THRESHOLD = 1000 * 10**18; 


    event VoteStarted(uint256 indexed nftId, address indexed creator, uint256 endTime);
    event Donated(uint256 indexed nftId, address indexed donor, uint256 amount);
    event VoteCast(uint256 indexed nftId, address indexed voter, uint256 totalPower);
    event GrantExecuted(uint256 indexed nftId, bool passed);


    constructor(address _governanceToken, address _proposalNFT, address _initialOwner, address _signer) Ownable(_initialOwner) {
        governanceToken = GovernanceToken(_governanceToken);
        proposalNFT = ProposalNFT(_proposalNFT);
        trustedSigner = _signer;
    }

    // Mint a new proposal NFT
    function mintProposal(address creator, string memory uri) public onlyOwner {
        proposalNFT.safeMint(creator, uri);
    }

   
    function startVote(uint256 _nftId) public onlyOwner {
        address creator = proposalNFT.ownerOf(_nftId);
        require(creator != address(0), "Proposal NFT does not exist.");
        require(grantProposals[_nftId].endTime == 0, "Vote has already started for this proposal.");

        uint256 endTime = block.timestamp + VOTING_PERIOD;
        grantProposals[_nftId] = GrantProposal({
            nftId: _nftId,
            endTime: endTime,
            totalVotes: 0,
            executed: false,
            creator: creator
        });

        emit VoteStarted(_nftId, creator, endTime);
    }

    
    function donateToProposal(uint256 _nftId) public payable {
        require(msg.value > 0, "Donation must be greater than zero.");
   
        emit Donated(_nftId, msg.sender, msg.value);
    }

   
    function castVote(
        uint256 _nftId,
        uint256 _baseVoteAmount,
        uint256 _contributionWeight,
        bytes memory _signature
    ) public {
        GrantProposal storage proposal = grantProposals[_nftId];
        require(proposal.endTime != 0, "Voting for this proposal has not started.");
        require(block.timestamp < proposal.endTime, "Voting has ended.");
        require(!hasVoted[_nftId][msg.sender], "You have already voted on this proposal.");

        bytes32 messageHash = _getVoteMessageHash(_nftId, msg.sender, _contributionWeight);
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, _signature);
        require(signer == trustedSigner, "Invalid signature: voting weight is not certified.");

        require(governanceToken.balanceOf(msg.sender) >= _baseVoteAmount, "Insufficient token balance.");
        if (_baseVoteAmount > 0) {
            governanceToken.transferFrom(msg.sender, address(this), _baseVoteAmount);
        }

        uint256 totalPower = _baseVoteAmount + _contributionWeight;
        proposal.totalVotes += totalPower;
        hasVoted[_nftId][msg.sender] = true;

        emit VoteCast(_nftId, msg.sender, totalPower);
    }
    
  
    function executeGrant(uint256 _nftId) public {
        GrantProposal storage proposal = grantProposals[_nftId];
        require(block.timestamp >= proposal.endTime, "Voting period has not ended yet.");
        require(!proposal.executed, "Grant has already been processed.");

        proposal.executed = true;
        bool passed = proposal.totalVotes >= VOTING_THRESHOLD;

        if (passed) {
            // Transfer funds to project creator
            uint256 grantAmount = address(this).balance;
            if (grantAmount > 0) {
                (bool success, ) = proposal.creator.call{value: grantAmount}("");
                require(success, "Fund transfer failed");
            }
        }

        emit GrantExecuted(_nftId, passed);
    }

    
    function _getVoteMessageHash(uint256 _nftId, address _voter, uint256 _weight) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(_nftId, _voter, _weight));
    }
}
