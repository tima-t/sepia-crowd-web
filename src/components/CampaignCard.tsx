
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWeb3 } from "@/contexts/Web3Context";
import { Campaign, formatAddress, formatDate } from "@/lib/contract";
import { ethers } from "ethers";

interface CampaignCardProps {
  campaign: Campaign;
  onCancel: (id: number) => Promise<void>;
  onRefund: (id: number) => Promise<void>;
}

const CampaignCard = ({ campaign, onCancel, onRefund }: CampaignCardProps) => {
  const { address } = useWeb3();
  const now = Math.floor(Date.now() / 1000);
  
  const isCreator = address?.toLowerCase() === campaign.creator.toLowerCase();
  const hasStarted = campaign.startAt <= now;
  const hasEnded = campaign.endAt <= now;
  const goalReached = campaign.pledged >= campaign.goal;
  
  const progress = campaign.goal > 0
    ? Number((campaign.pledged * BigInt(100)) / campaign.goal)
    : 0;
  
  const canCancel = isCreator && !hasStarted;
  const canRefund = hasEnded && !goalReached;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Campaign #{campaign.id}</CardTitle>
            <CardDescription>
              Created by {isCreator ? "You" : formatAddress(campaign.creator)}
            </CardDescription>
          </div>
          <div className="px-2 py-1 text-xs rounded-full bg-crowd-light-purple text-crowd-dark-purple font-medium">
            {hasEnded
              ? goalReached
                ? "Successful"
                : "Failed"
              : hasStarted
              ? "Active"
              : "Upcoming"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-medium">
              {ethers.formatEther(campaign.pledged)} ETH raised
            </span>
            <span>
              Goal: {ethers.formatEther(campaign.goal)} ETH
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Start Date</p>
            <p className="font-medium">{formatDate(campaign.startAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End Date</p>
            <p className="font-medium">{formatDate(campaign.endAt)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          {canCancel && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onCancel(campaign.id)}
              className="w-full"
            >
              Cancel Campaign
            </Button>
          )}
          {canRefund && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRefund(campaign.id)}
              className="w-full"
            >
              Claim Refund
            </Button>
          )}
          {!canCancel && !canRefund && (
            <div className="text-sm text-muted-foreground w-full text-center">
              {campaign.claimed ? "Funds claimed by creator" : hasEnded ? "Campaign ended" : "Campaign in progress"}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
