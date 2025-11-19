'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/src/components/ui/button';
import { Select } from '@/src/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/src/components/ui/dropdown-menu';
import { usableApi } from '@/src/lib/usable-api/client';
import { configStorage } from '@/src/lib/storage/config';

interface OnboardingPageProps {
  onComplete: () => void;
  userEmail?: string;
}

export function OnboardingPage({ onComplete, userEmail }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedFragmentType, setSelectedFragmentType] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch workspaces
  const { data: workspaces, isLoading: workspacesLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => usableApi.listWorkspaces(),
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
      // Add a slight delay for the animation to be visible
      await new Promise((resolve) => setTimeout(resolve, 800));
      configStorage.set({
        workspaceId: selectedWorkspace,
        fragmentTypeId: selectedFragmentType,
      });
      onComplete();
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-4xl mx-auto">
        {/* Header with centered title and profile dropdown */}
        <motion.div
          className="flex justify-between items-center mb-12 pt-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex-1" />
          <h1 className="text-3xl font-bold text-foreground">Taskable</h1>
          <div className="flex-1 flex justify-end items-center">
            <DropdownMenu
              trigger={
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-200 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              }
            >
              <DropdownMenuLabel>
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-medium text-foreground mt-1 truncate">
                  {userEmail || 'User'}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => signOut()}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          className="bg-card border border-border rounded-lg p-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 100 }}
        >
          {/* Success/Connecting overlay */}
          <AnimatePresence>
            {isConnecting && (
              <motion.div
                className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-7xl mb-4"
                >
                  ✨
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-semibold text-foreground"
                >
                  Connecting your workspace...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.div
              className="text-6xl mb-4 inline-block"
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
              }}
            >
              🔗
            </motion.div>
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">
              Connect Your Workspace
            </h2>
            <p className="text-muted-foreground">
              Connect to an existing Usable workspace to get started
            </p>
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="h-2 w-16 rounded-full bg-primary overflow-hidden"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
              style={{ originX: 0 }}
            >
              <motion.div
                className="h-full w-full bg-gradient-to-r from-primary to-accent"
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
            </motion.div>
            <motion.div
              className={`h-2 w-16 rounded-full overflow-hidden ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
              style={{ originX: 0 }}
            >
              {step >= 2 && (
                <motion.div
                  className="h-full w-full bg-gradient-to-r from-primary to-accent"
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                className="space-y-6"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
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
                <motion.div
                  className="flex justify-end"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => setStep(2)} disabled={!selectedWorkspace} size="lg">
                      Next
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                className="space-y-6"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
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
                <motion.div
                  className="flex justify-between"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      size="lg"
                      disabled={isConnecting}
                    >
                      Back
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleComplete}
                      disabled={!selectedFragmentType || isConnecting}
                      size="lg"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Workspace'}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
