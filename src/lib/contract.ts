
import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x0B06fDF056D642d9FF1297102a1227c7B2c7ca57"; // User's deployed contract address on Sepolia

export const TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual token address on Sepolia

export const CONTRACT_ABI = [
  "event Launch(uint256 id, address indexed creator, uint256 goal, uint32 startAt, uint32 endAt)",
  "event Cancel(uint256 id)",
  "event Pledge(uint256 indexed id, address indexed caller, uint256 amount)",
  "event Unpledge(uint256 indexed id, address indexed caller, uint256 amount)",
  "event Claim(uint256 id)",
  "event Refund(uint256 id, address indexed caller, uint256 amount)",
  "function launch(uint256 _goal, uint32 _startAt, uint32 _endAt) external",
  "function cancel(uint256 _id) external",
  "function pledge(uint256 _id, uint256 _amount) external",
  "function unpledge(uint256 _id, uint256 _amount) external",
  "function claim(uint256 _id) external",
  "function refund(uint256 _id) external",
  "function count() external view returns (uint256)",
  "function campaigns(uint256) external view returns (address creator, uint256 goal, uint256 pledged, uint32 startAt, uint32 endAt, bool claimed)",
  "function pledgedAmount(uint256, address) external view returns (uint256)"
];

export const TOKEN_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint amount) returns (bool)",
  "function approve(address spender, uint amount) returns (bool)",
  "function balanceOf(address account) view returns (uint)",
  "function allowance(address owner, address spender) view returns (uint)"
];

export type Campaign = {
  id: number;
  creator: string;
  goal: bigint;
  pledged: bigint;
  startAt: number;
  endAt: number;
  claimed: boolean;
};

export type Web3State = {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  connected: boolean;
  address: string | null;
  chainId: string | null;
};

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Sepolia testnet chain ID in hex

export const connectWallet = async (): Promise<Web3State> => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed");
  }
  
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    
    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }
    
    const signer = await provider.getSigner();
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const address = await signer.getAddress();
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
    
    const tokenContract = new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_ABI,
      signer
    );
    
    return {
      provider,
      signer,
      contract,
      tokenContract,
      connected: true,
      address,
      chainId,
    };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

export const fetchCampaigns = async (contract: ethers.Contract): Promise<Campaign[]> => {
  try {
    const campaignCount = await contract.count();
    const campaigns: Campaign[] = [];
    
    for (let i = 1; i <= campaignCount; i++) {
      const campaignData = await contract.campaigns(i);
      
      if (campaignData.creator !== ethers.ZeroAddress) {
        campaigns.push({
          id: i,
          creator: campaignData.creator,
          goal: campaignData.goal,
          pledged: campaignData.pledged,
          startAt: Number(campaignData.startAt),
          endAt: Number(campaignData.endAt),
          claimed: campaignData.claimed
        });
      }
    }
    
    return campaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

export const launchCampaign = async (
  contract: ethers.Contract,
  goal: string,
  startAt: number,
  endAt: number
) => {
  try {
    const tx = await contract.launch(
      ethers.parseEther(goal),
      startAt,
      endAt
    );
    return await tx.wait();
  } catch (error) {
    console.error("Error launching campaign:", error);
    throw error;
  }
};

export const cancelCampaign = async (
  contract: ethers.Contract,
  id: number
) => {
  try {
    const tx = await contract.cancel(id);
    return await tx.wait();
  } catch (error) {
    console.error("Error canceling campaign:", error);
    throw error;
  }
};

export const refundCampaign = async (
  contract: ethers.Contract,
  id: number
) => {
  try {
    const tx = await contract.refund(id);
    return await tx.wait();
  } catch (error) {
    console.error("Error refunding campaign:", error);
    throw error;
  }
};

export const approveTokens = async (
  tokenContract: ethers.Contract,
  spender: string,
  amount: string
) => {
  try {
    const tx = await tokenContract.approve(
      spender,
      ethers.parseEther(amount)
    );
    return await tx.wait();
  } catch (error) {
    console.error("Error approving tokens:", error);
    throw error;
  }
};

export const getPledgedAmount = async (
  contract: ethers.Contract,
  campaignId: number,
  address: string
) => {
  try {
    const amount = await contract.pledgedAmount(campaignId, address);
    return amount;
  } catch (error) {
    console.error("Error getting pledged amount:", error);
    throw error;
  }
};

// Utility to format addresses
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Utility to format dates
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};
