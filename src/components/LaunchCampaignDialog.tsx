
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeb3 } from "@/contexts/Web3Context";
import React, { useState } from "react";
import { toast } from "sonner";
import { launchCampaign } from "@/lib/contract";
import { Rocket } from "lucide-react";

interface LaunchCampaignDialogProps {
  onSuccess: () => void;
}

const LaunchCampaignDialog = ({ onSuccess }: LaunchCampaignDialogProps) => {
  const { contract, connected } = useWeb3();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    goal: "",
    startDays: "0",
    durationDays: "30",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !contract) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!formData.goal || parseFloat(formData.goal) <= 0) {
      toast.error("Please enter a valid goal amount");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = Math.floor(Date.now() / 1000);
      const startAt = now + parseInt(formData.startDays) * 86400;
      const endAt = startAt + parseInt(formData.durationDays) * 86400;
      
      await launchCampaign(contract, formData.goal, startAt, endAt);
      
      toast.success("Campaign launched successfully!");
      setOpen(false);
      onSuccess();
      
      // Reset form
      setFormData({
        goal: "",
        startDays: "0",
        durationDays: "30",
      });
    } catch (error) {
      console.error("Error launching campaign:", error);
      toast.error("Failed to launch campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-crowd-purple hover:bg-crowd-dark-purple">
          <Rocket className="mr-2 h-4 w-4" />
          Launch Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Launch New Campaign</DialogTitle>
            <DialogDescription>
              Create a new crowdfunding campaign. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Goal (ETH)
              </Label>
              <Input
                id="goal"
                name="goal"
                type="number"
                step="0.01"
                value={formData.goal}
                onChange={handleChange}
                className="col-span-3"
                placeholder="5.00"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDays" className="text-right">
                Start in (days)
              </Label>
              <Input
                id="startDays"
                name="startDays"
                type="number"
                min="0"
                value={formData.startDays}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="durationDays" className="text-right">
                Duration (days)
              </Label>
              <Input
                id="durationDays"
                name="durationDays"
                type="number"
                min="1"
                max="90"
                value={formData.durationDays}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting || !connected}
              className="bg-crowd-purple hover:bg-crowd-dark-purple"
            >
              {isSubmitting ? "Launching..." : "Launch Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchCampaignDialog;
