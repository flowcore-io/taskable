'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { TaskableConfig } from '@/src/types';
import { checkTemplateStatus } from '@/src/lib/templates/manager';

interface ChatLinkButtonProps {
  config: TaskableConfig | null;
  onRequestLink: () => void;
  forceRefresh?: number; // Increment this to force a re-check
}

export function ChatLinkButton({ config, onRequestLink, forceRefresh = 0 }: ChatLinkButtonProps) {
  const [isLinked, setIsLinked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check if templates actually exist in Usable (not just in localStorage)
  useEffect(() => {
    if (!config?.workspaceId) {
      setIsLinked(false);
      return;
    }

    const checkTemplates = async () => {
      setIsChecking(true);
      try {
        console.log('[ChatLinkButton] Checking template status...');
        const status = await checkTemplateStatus(config.workspaceId);
        console.log('[ChatLinkButton] Status received:', {
          template: {
            exists: status.template.exists,
            current: status.template.current,
            fragmentId: status.template.fragmentId,
          },
          instructionSet: {
            exists: status.instructionSet.exists,
            current: status.instructionSet.current,
            fragmentId: status.instructionSet.fragmentId,
          },
          needsUpdate: status.needsUpdate,
        });

        // Only show as linked if both templates exist and are current
        const isLinkedNow =
          status.template.exists &&
          status.template.current &&
          status.instructionSet.exists &&
          status.instructionSet.current;
        console.log('[ChatLinkButton] Setting linked state to:', isLinkedNow);
        setIsLinked(isLinkedNow);
      } catch (error) {
        console.error('[ChatLinkButton] Failed to check template status:', error);
        setIsLinked(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkTemplates();
  }, [config?.workspaceId, forceRefresh]);

  const handleClick = () => {
    if (isLinked) {
      // Redirect to chat.usable.dev
      window.open('https://chat.usable.dev', '_blank');
    } else {
      // Request template creation
      onRequestLink();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isChecking}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all
        ${
          isLinked
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
        }
        ${isChecking ? 'opacity-60 cursor-wait' : ''}
      `}
      whileHover={{ scale: isChecking ? 1 : 1.05 }}
      whileTap={{ scale: isChecking ? 1 : 0.95 }}
      title={
        isChecking ? 'Checking templates...' : isLinked ? 'Open Usable Chat' : 'Link to Usable Chat'
      }
    >
      {isChecking ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="hidden sm:inline text-sm font-medium">Checking...</span>
        </>
      ) : isLinked ? (
        <>
          <MessageSquare className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Chat</span>
        </>
      ) : (
        <>
          <LinkIcon className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Link Chat</span>
        </>
      )}
    </motion.button>
  );
}
