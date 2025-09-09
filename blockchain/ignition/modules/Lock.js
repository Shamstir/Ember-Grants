const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DmcgpModule = buildModule("DmcgpModule", (m) => {
  const initialOwner = m.getAccount(0);

  const governanceToken = m.contract("GovernanceToken", [initialOwner]);

  const proposalNFT = m.contract("ProposalNFT", [initialOwner]);

  return { governanceToken, proposalNFT };
});

module.exports = DmcgpModule;