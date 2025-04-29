
import CrowdfundingApp from "@/components/CrowdfundingApp";
import { Web3Provider } from "@/contexts/Web3Context";

const Index = () => {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-b from-white to-crowd-light-purple/30">
        <CrowdfundingApp />
      </div>
    </Web3Provider>
  );
};

export default Index;
