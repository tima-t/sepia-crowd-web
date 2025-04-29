
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
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LaunchCampaignDialogProps {
  onSuccess: () => void;
}

const LaunchCampaignDialog = ({ onSuccess }: LaunchCampaignDialogProps) => {
  const { contract, connected } = useWeb3();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 30));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !contract) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!goal || parseFloat(goal) <= 0) {
      toast.error("Please enter a valid goal amount");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select valid dates");
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      toast.error("End date must be after start date");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert dates to Unix timestamps (seconds)
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);
      
      await launchCampaign(contract, goal, startTimestamp, endTimestamp);
      
      toast.success("Campaign launched successfully!");
      setOpen(false);
      onSuccess();
      
      // Reset form
      setGoal("");
      setStartDate(new Date());
      setEndDate(addDays(new Date(), 30));
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
                type="number"
                step="0.01"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="col-span-3"
                placeholder="5.00"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                      disabled={(date) => date <= startDate || date > addDays(startDate, 90)}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum campaign duration is 90 days from start date
                </p>
              </div>
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
