const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DMCGP Platform", function () {
  let governanceToken;
  let proposalNFT;
  let grantManager;
  let owner;
  let creator;
  let voter;

  beforeEach(async function () {
    [owner, creator, voter] = await ethers.getSigners();

    // Deploy GovernanceToken
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy(owner.address);
    await governanceToken.waitForDeployment();

    // Deploy ProposalNFT
    const ProposalNFT = await ethers.getContractFactory("ProposalNFT");
    proposalNFT = await ProposalNFT.deploy(owner.address);
    await proposalNFT.waitForDeployment();

    // Deploy GrantManager
    const GrantManager = await ethers.getContractFactory("GrantManager");
    grantManager = await GrantManager.deploy(
      await governanceToken.getAddress(),
      await proposalNFT.getAddress(),
      owner.address,
      owner.address
    );
    await grantManager.waitForDeployment();

    // Transfer ProposalNFT ownership to GrantManager
    await proposalNFT.transferOwnership(await grantManager.getAddress());
  });

  describe("GovernanceToken", function () {
    it("Should deploy with correct initial supply", async function () {
      const totalSupply = await governanceToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    });

    it("Should have correct name and symbol", async function () {
      expect(await governanceToken.name()).to.equal("DMCGP Governance Token");
      expect(await governanceToken.symbol()).to.equal("DMCG");
    });

    it("Should assign initial supply to owner", async function () {
      const ownerBalance = await governanceToken.balanceOf(owner.address);
      const totalSupply = await governanceToken.totalSupply();
      expect(ownerBalance).to.equal(totalSupply);
    });
  });

  describe("ProposalNFT", function () {
    it("Should have correct name and symbol", async function () {
      expect(await proposalNFT.name()).to.equal("DMCGP Proposal");
      expect(await proposalNFT.symbol()).to.equal("DMCP");
    });

    it("Should mint NFT through GrantManager", async function () {
      const uri = "ipfs://QmTest123";
      await grantManager.connect(owner).mintProposal(creator.address, uri);
      
      expect(await proposalNFT.ownerOf(0)).to.equal(creator.address);
      expect(await proposalNFT.tokenURI(0)).to.equal(uri);
    });
  });

  describe("GrantManager", function () {
    it("Should start voting for a proposal", async function () {
      const uri = "ipfs://QmTest123";
      await grantManager.connect(owner).mintProposal(creator.address, uri);
      
      const tx = await grantManager.startVote(0);
      const receipt = await tx.wait();
      
      // Check that VoteStarted event was emitted
      expect(receipt.logs.length).to.be.greaterThan(0);
      
      // Verify proposal was created
      const proposal = await grantManager.grantProposals(0);
      expect(proposal.creator).to.equal(creator.address);
      expect(proposal.nftId).to.equal(0);
    });

    it("Should accept donations to proposal", async function () {
      const uri = "ipfs://QmTest123";
      await grantManager.connect(owner).mintProposal(creator.address, uri);
      await grantManager.startVote(0);
      
      const donationAmount = ethers.parseEther("1");
      await expect(
        grantManager.connect(voter).donateToProposal(0, { value: donationAmount })
      ).to.emit(grantManager, "Donated")
        .withArgs(0, voter.address, donationAmount);
    });

    it("Should allow voting with governance tokens", async function () {
      const uri = "ipfs://QmTest123";
      await grantManager.connect(owner).mintProposal(creator.address, uri);
      await grantManager.startVote(0);
      
      // Transfer tokens to voter
      const voteAmount = ethers.parseEther("100");
      await governanceToken.transfer(voter.address, voteAmount);
      
      // Approve GrantManager to spend tokens
      await governanceToken.connect(voter).approve(await grantManager.getAddress(), voteAmount);
      
      // Generate valid signature
      const nftId = 0;
      const contributionWeight = ethers.parseEther("0");
      const messageHash = ethers.solidityPackedKeccak256(
        ["uint256", "address", "uint256"],
        [nftId, voter.address, contributionWeight]
      );
      const signature = await owner.signMessage(ethers.getBytes(messageHash));
      
      // Cast vote
      await expect(
        grantManager.connect(voter).castVote(0, voteAmount, contributionWeight, signature)
      ).to.emit(grantManager, "VoteCast")
        .withArgs(0, voter.address, voteAmount);
    });

    it("Should not allow voting twice", async function () {
      const uri = "ipfs://QmTest123";
      await grantManager.connect(owner).mintProposal(creator.address, uri);
      await grantManager.startVote(0);
      
      const voteAmount = ethers.parseEther("100");
      await governanceToken.transfer(voter.address, voteAmount * 2n);
      await governanceToken.connect(voter).approve(await grantManager.getAddress(), voteAmount * 2n);
      
      // Generate valid signature
      const nftId = 0;
      const contributionWeight = ethers.parseEther("0");
      const messageHash = ethers.solidityPackedKeccak256(
        ["uint256", "address", "uint256"],
        [nftId, voter.address, contributionWeight]
      );
      const signature = await owner.signMessage(ethers.getBytes(messageHash));
      
      // First vote should succeed
      await grantManager.connect(voter).castVote(0, voteAmount, contributionWeight, signature);
      
      // Second vote should fail
      await expect(
        grantManager.connect(voter).castVote(0, voteAmount, contributionWeight, signature)
      ).to.be.revertedWith("You have already voted on this proposal");
    });
  });
});
