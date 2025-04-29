
import { useEffect, useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Campaign, cancelCampaign, fetchCampaigns, refundCampaign } from "@/lib/contract";
import { toast } from "sonner";
import CampaignCard from "./CampaignCard";
import LaunchCampaignDialog from "./LaunchCampaignDialog";
import ConnectButton from "./ConnectButton";
import { List, Loader2 } from "lucide-react";

const CrowdfundingApp = () => {
  const { contract, connected } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCampaigns = async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      const fetchedCampaigns = await fetchCampaigns(contract);
      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && contract) {
      loadCampaigns();
    }
  }, [connected, contract]);

  const handleCancelCampaign = async (id: number) => {
    if (!contract) return;
    
    try {
      toast.info("Cancelling campaign...");
      await cancelCampaign(contract, id);
      toast.success("Campaign cancelled successfully");
      loadCampaigns();
    } catch (error) {
      console.error("Error cancelling campaign:", error);
      toast.error("Failed to cancel campaign");
    }
  };

  const handleRefundCampaign = async (id: number) => {
    if (!contract) return;
    
    try {
      toast.info("Processing refund...");
      await refundCampaign(contract, id);
      toast.success("Refund claimed successfully");
      loadCampaigns();
    } catch (error) {
      console.error("Error refunding campaign:", error);
      toast.error("Failed to process refund");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-crowd-dark-purple">CrowdFund dApp</h1>
          <p className="text-muted-foreground">Launch and manage crowdfunding campaigns on Sepolia Testnet</p>
        </div>
        <div className="flex items-center gap-2">
          {connected && <LaunchCampaignDialog onSuccess={loadCampaigns} />}
          <ConnectButton />
        </div>
      </header>

      {!connected ? (
        <div className="text-center p-12 bg-crowd-light-purple/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Connect your MetaMask wallet to start creating and managing campaigns</p>
          <ConnectButton />
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-crowd-purple" />
          <span className="ml-2">Loading campaigns...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center p-12 bg-crowd-light-purple/50 rounded-lg">
          <List className="mx-auto h-12 w-12 text-crowd-purple mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Campaigns Yet</h2>
          <p className="text-muted-foreground mb-6">Be the first to launch a crowdfunding campaign</p>
          <LaunchCampaignDialog onSuccess={loadCampaigns} />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <List className="mr-2 h-5 w-5" />
              All Campaigns
            </h2>
            <button 
              onClick={loadCampaigns} 
              className="text-sm text-crowd-purple hover:text-crowd-dark-purple"
            >
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onCancel={handleCancelCampaign}
                onRefund={handleRefundCampaign}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrowdfundingApp;
