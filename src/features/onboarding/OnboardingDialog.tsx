'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Select } from '@/src/components/ui/select';
import { usableApi } from '@/src/lib/usable-api/client';
import { configStorage } from '@/src/lib/storage/config';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedFragmentType, setSelectedFragmentType] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch workspaces
  const { data: workspaces, isLoading: workspacesLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => usableApi.listWorkspaces(),
    enabled: open,
  });

  // Ensure workspaces is always an array
  const workspacesArray = Array.isArray(workspaces) ? workspaces : [];

  // Fetch fragment types for selected workspace
  const { data: fragmentTypes, isLoading: fragmentTypesLoading } = useQuery({
    queryKey: ['fragmentTypes', selectedWorkspace],
    queryFn: () => usableApi.getFragmentTypes(selectedWorkspace),
    enabled: !!selectedWorkspace && step === 2,
  });

  const handleComplete = async () => {
    if (selectedWorkspace && selectedFragmentType) {
      setIsConnecting(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      configStorage.set({
        workspaceId: selectedWorkspace,
        fragmentTypeId: selectedFragmentType,
      });
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <AnimatePresence>
          {isConnecting && (
            <motion.div
              className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 0.6 }}
                className="text-6xl mb-3"
              >
                ✨
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-semibold"
              >
                Connecting...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogHeader>
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle>Welcome to Taskable!</DialogTitle>
          </motion.div>
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <DialogDescription>
              Let's set up your workspace to get started
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        {/* Progress dots */}
        <motion.div 
          className="flex items-center justify-center gap-2 my-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}
            animate={{ scale: step === 1 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5, repeat: step === 1 ? Number.POSITIVE_INFINITY : 0, repeatDelay: 1 }}
          />
          <motion.div
            className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
            animate={{ scale: step === 2 ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.5, repeat: step === 2 ? Number.POSITIVE_INFINITY : 0, repeatDelay: 1 }}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              className="space-y-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="workspace" className="text-sm font-medium block mb-2">
                  Select a Workspace
                </label>
                <Select
                  id="workspace"
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  disabled={workspacesLoading}
                >
                  <option value="">
                    {workspacesLoading ? 'Loading...' : 'Choose a workspace'}
                  </option>
                  {workspacesArray.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Your todos will be stored in this workspace
                </p>
              </motion.div>
              <DialogFooter>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedWorkspace}
                  >
                    Next
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              className="space-y-4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="fragmentType" className="text-sm font-medium block mb-2">
                  Select a Fragment Type
                </label>
                <Select
                  id="fragmentType"
                  value={selectedFragmentType}
                  onChange={(e) => setSelectedFragmentType(e.target.value)}
                  disabled={fragmentTypesLoading}
                >
                  <option value="">
                    {fragmentTypesLoading ? 'Loading...' : 'Choose a fragment type'}
                  </option>
                  {fragmentTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Each todo will be stored as this type of fragment
                </p>
              </motion.div>
              <DialogFooter>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isConnecting}
                  >
                    Back
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleComplete}
                    disabled={!selectedFragmentType || isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Complete Setup'}
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
