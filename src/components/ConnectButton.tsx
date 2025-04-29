
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { formatAddress } from "@/lib/contract";
import { Loader2 } from "lucide-react";

const ConnectButton = () => {
  const { connect, connected, address, isConnecting } = useWeb3();

  return (
    <Button
      onClick={connect}
      disabled={connected || isConnecting}
      variant={connected ? "outline" : "default"}
      className={connected ? "bg-crowd-light-purple text-crowd-dark-purple hover:bg-crowd-light-purple/90" : "bg-crowd-purple hover:bg-crowd-dark-purple"}
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : connected && address ? (
        `Connected: ${formatAddress(address)}`
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
};

export default ConnectButton;
