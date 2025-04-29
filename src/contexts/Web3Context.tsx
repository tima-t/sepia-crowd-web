
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { connectWallet, Web3State, SEPOLIA_CHAIN_ID } from "@/lib/contract";

interface Web3ContextType extends Web3State {
  connect: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

const initialState: Web3State = {
  provider: null,
  signer: null,
  contract: null,
  tokenContract: null,
  connected: false,
  address: null,
  chainId: null,
};

const Web3Context = createContext<Web3ContextType>({
  ...initialState,
  connect: async () => {},
  isConnecting: false,
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<Web3State>(initialState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const web3State = await connectWallet();
      setState(web3State);
      toast.success("Wallet connected successfully!");
    } catch (err) {
      console.error("Connection error:", err);
      let message = "Failed to connect wallet";
      
      if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          
          if (accounts.length > 0 && chainId === SEPOLIA_CHAIN_ID) {
            connect();
          }
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setState(initialState);
        toast.info("Wallet disconnected");
      } else if (state.connected) {
        // Account switched
        connect();
      }
    };

    const handleChainChanged = (chainId: string) => {
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setState(initialState);
        toast.warning("Please connect to Sepolia Testnet");
      } else if (state.connected) {
        connect();
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [state.connected]);

  return (
    <Web3Context.Provider
      value={{
        ...state,
        connect,
        isConnecting,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
