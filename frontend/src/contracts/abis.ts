// Contract ABIs - These should be updated after contract compilation
export const GOVERNANCE_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const PROPOSAL_NFT_ABI = [
  "function safeMint(address creator, string uri) public",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transferOwnership(address newOwner) public",
];

export const GRANT_MANAGER_ABI = [
  "function startVote(uint256 _nftId) public",
  "function donateToProposal(uint256 _nftId) payable public",
  "function castVote(uint256 _nftId, uint256 _baseVoteAmount, uint256 _contributionWeight, bytes memory _signature) public",
  "function executeGrant(uint256 _nftId) public",
  "function grantProposals(uint256) view returns (uint256 nftId, uint256 endTime, uint256 totalVotes, bool executed, address creator)",
  "function hasVoted(uint256, address) view returns (bool)",
  "function VOTING_PERIOD() view returns (uint256)",
  "function VOTING_THRESHOLD() view returns (uint256)",
  "event VoteStarted(uint256 indexed nftId, address indexed creator, uint256 endTime)",
  "event Donated(uint256 indexed nftId, address indexed donor, uint256 amount)",
  "event VoteCast(uint256 indexed nftId, address indexed voter, uint256 totalPower)",
  "event GrantExecuted(uint256 indexed nftId, bool passed)",
];
