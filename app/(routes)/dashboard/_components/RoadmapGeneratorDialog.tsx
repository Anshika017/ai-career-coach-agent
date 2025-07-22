'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 as LoaderIcon, Sparkle as SparkleIcon } from 'lucide-react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface RoadmapGeneratorDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

const RoadmapGeneratorDialog: React.FC<RoadmapGeneratorDialogProps> = ({ openDialog, setOpenDialog }) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {has} = useAuth();

  const generateRoadmap = async () => {
    const roadmapId = uuidv4();
    setLoading(true);
    setError(null);

    try {
      //@ts-ignore
      const hasSub=await has({plan:'free_user'})
      if(!hasSub)
      {
        const res=await axios.get('/api/history');
        const his=res.data;
        const isPre=await his.find((item:any)=>item?.aiAgentType=='/ai-tools/ai-roadmap-agent');
        router.push('/billing')
        if(isPre)
        {
          return null;
        }
      }

      const response = await axios.post('/api/ai-roadmap-agent', {
        roadmapId,
        userInput,
      });

      const { roadmapId: returnedId } = response.data;
      if (!returnedId) {
        throw new Error("Invalid response from server");
      }

      router.push(`/ai-tools/ai-roadmap-agent/${returnedId}`);
      setOpenDialog(false);
    } catch (err: any) {
      console.error("❌ Error generating roadmap:", err);
      setError("Something went wrong while generating the roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Position/Skills to Generate Roadmap</DialogTitle>
          <DialogDescription>
            <div className="mt-2">
              <Input
                placeholder="e.g. Full Stack Developer"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpenDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={generateRoadmap}
            disabled={loading || !userInput.trim()}
          >
            {loading ? (
              <LoaderIcon className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <SparkleIcon className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoadmapGeneratorDialog;
