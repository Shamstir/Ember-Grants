const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy GovernanceToken
  console.log("\n1. Deploying GovernanceToken...");
  const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy(deployer.address);
  await governanceToken.waitForDeployment();
  const governanceTokenAddress = await governanceToken.getAddress();
  console.log("GovernanceToken deployed to:", governanceTokenAddress);

  // Deploy ProposalNFT
  console.log("\n2. Deploying ProposalNFT...");
  const ProposalNFT = await hre.ethers.getContractFactory("ProposalNFT");
  const proposalNFT = await ProposalNFT.deploy(deployer.address);
  await proposalNFT.waitForDeployment();
  const proposalNFTAddress = await proposalNFT.getAddress();
  console.log("ProposalNFT deployed to:", proposalNFTAddress);

  // Deploy GrantManager
  console.log("\n3. Deploying GrantManager...");
  const GrantManager = await hre.ethers.getContractFactory("GrantManager");
  const grantManager = await GrantManager.deploy(
    governanceTokenAddress,
    proposalNFTAddress,
    deployer.address,
    deployer.address // Using deployer as trusted signer for now
  );
  await grantManager.waitForDeployment();
  const grantManagerAddress = await grantManager.getAddress();
  console.log("GrantManager deployed to:", grantManagerAddress);

  // Transfer ownership of ProposalNFT to GrantManager
  console.log("\n4. Transferring ProposalNFT ownership to GrantManager...");
  const transferTx = await proposalNFT.transferOwnership(grantManagerAddress);
  await transferTx.wait();
  console.log("ProposalNFT ownership transferred to GrantManager");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("GovernanceToken:", governanceTokenAddress);
  console.log("ProposalNFT:", proposalNFTAddress);
  console.log("GrantManager:", grantManagerAddress);
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(60));

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      GovernanceToken: governanceTokenAddress,
      ProposalNFT: proposalNFTAddress,
      GrantManager: grantManagerAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\nDeployment info saved to ${deploymentsDir}/${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
