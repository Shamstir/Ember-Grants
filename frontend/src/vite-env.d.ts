/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CONTRACT_ADDRESS_GOVERNANCE: string;
  readonly VITE_CONTRACT_ADDRESS_PROPOSAL_NFT: string;
  readonly VITE_CONTRACT_ADDRESS_GRANT_MANAGER: string;
  readonly VITE_CHAIN_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
