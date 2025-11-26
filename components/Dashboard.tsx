'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { configStorage } from '@/src/lib/storage/config';
import { OnboardingPage } from '@/src/features/onboarding/OnboardingPage';
import { TodoGrid } from '@/src/features/todos/TodoGrid';
import { TodoCardEditor } from '@/src/features/todos/TodoCardEditor';
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/src/components/ui/dropdown-menu';
import {
  useCards,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
} from '@/src/features/todos/queries';
import { TemplateConsentDialog } from '@/src/features/templates/TemplateConsentDialog';
import { ChatLinkButton } from '@/src/features/templates/ChatLinkButton';
import {
  checkTemplateStatus,
  createOrUpdateTemplates,
  saveTemplateConfig,
  shouldCheckTemplates,
} from '@/src/lib/templates/manager';
import type { TodoCard, TodoItem } from '@/src/types';

export function Dashboard() {
  const { data: session } = useSession();
  const [config, setConfig] = useState(configStorage.get());
  const [selectedCard, setSelectedCard] = useState<TodoCard | null>(null);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [cardPosition, setCardPosition] = useState<DOMRect | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplateConsent, setShowTemplateConsent] = useState(false);
  const [isCreatingTemplates, setIsCreatingTemplates] = useState(false);
  const [templateRefreshCounter, setTemplateRefreshCounter] = useState(0);
  const isCardAnimatingRef = useRef(false);

  // Check if we have a valid session with an access token
  const hasValidSession = session?.accessToken != null;

  // Load config on mount
  useEffect(() => {
    const storedConfig = configStorage.get();
    setConfig(storedConfig);
  }, []);

  // Check template status when config is loaded
  useEffect(() => {
    if (!config?.workspaceId || !hasValidSession) return;

    const checkTemplates = async () => {
      if (!shouldCheckTemplates(config)) return;

      try {
        const status = await checkTemplateStatus(config.workspaceId);

        if (status.needsUpdate) {
          setShowTemplateConsent(true);
        }
      } catch (error) {
        console.error('Failed to check template status:', error);
      }
    };

    checkTemplates();
  }, [config, hasValidSession]);

  const { data: cards = [], isLoading } = useCards(
    config?.workspaceId || '',
    config?.fragmentTypeId || '',
    undefined,
    hasValidSession, // Pass session validity
  );

  const createMutation = useCreateCard(config?.workspaceId || '', config?.fragmentTypeId || '');

  const updateMutation = useUpdateCard(config?.workspaceId || '', config?.fragmentTypeId || '');

  const deleteMutation = useDeleteCard(config?.workspaceId || '', config?.fragmentTypeId || '');

  const handleCardClick = (card: TodoCard, position: DOMRect) => {
    // Prevent opening if a card is currently open or animating
    if (isCardAnimatingRef.current || showCardEditor) return;

    setSelectedCard(card);
    setCardPosition(position);
    setShowCardEditor(true);
  };

  const handleAddNewCard = () => {
    // Prevent opening if a card is currently open or animating
    if (isCardAnimatingRef.current || showCardEditor) return;

    setSelectedCard(null);
    setCardPosition(null);
    setShowCardEditor(true);
  };

  const handleUpdateCard = async (data: {
    id?: string;
    title: string;
    summary?: string;
    items: TodoItem[];
    collection: string;
  }) => {
    try {
      if (data.id) {
        // Update existing card (without closing)
        await updateMutation.mutateAsync({
          id: data.id,
          title: data.title,
          summary: data.summary,
          items: data.items,
          collection: data.collection,
        });
      } else {
        // Create new card and update selectedCard with the created card's ID
        const newCard = await createMutation.mutateAsync({
          title: data.title,
          summary: data.summary,
          items: data.items,
          collection: data.collection,
        });
        // Update selectedCard so subsequent auto-saves will be updates, not creates
        setSelectedCard(newCard);
      }
    } catch (error) {
      console.error('Failed to update card:', error);
    }
  };

  const handleSaveCard = async (data: {
    id?: string;
    title: string;
    summary?: string;
    items: TodoItem[];
    collection: string;
  }) => {
    try {
      if (data.id) {
        // Update existing card
        await updateMutation.mutateAsync({
          id: data.id,
          title: data.title,
          summary: data.summary,
          items: data.items,
          collection: data.collection,
        });
      } else {
        // Create new card
        await createMutation.mutateAsync({
          title: data.title,
          summary: data.summary,
          items: data.items,
          collection: data.collection,
        });
      }
      isCardAnimatingRef.current = true;
      setShowCardEditor(false);
      setSelectedCard(null);
      setCardPosition(null);

      // Fallback timeout in case onExitComplete doesn't fire
      setTimeout(() => {
        isCardAnimatingRef.current = false;
      }, 250);
    } catch (error) {
      console.error('Failed to save card:', error);
      alert('Failed to save card. Please try again.');
    }
  };

  const handleDeleteCard = (id: string) => {
    deleteMutation.mutate(id);
    isCardAnimatingRef.current = true;
    setShowCardEditor(false);
    setSelectedCard(null);
    setCardPosition(null);

    // Fallback timeout in case onExitComplete doesn't fire
    setTimeout(() => {
      isCardAnimatingRef.current = false;
    }, 250);
  };

  const handleCloseEditor = () => {
    isCardAnimatingRef.current = true;
    setShowCardEditor(false);
    setSelectedCard(null);
    setCardPosition(null);

    // Fallback timeout in case onExitComplete doesn't fire
    setTimeout(() => {
      isCardAnimatingRef.current = false;
    }, 250);
  };

  const handleAnimationComplete = () => {
    isCardAnimatingRef.current = false;
  };

  const handleOnboardingComplete = () => {
    setConfig(configStorage.get());
  };

  const handleAcceptTemplates = async () => {
    if (!config?.workspaceId) {
      alert('No workspace configured. Please refresh and try again.');
      return;
    }

    setIsCreatingTemplates(true);
    try {
      console.log('=== STARTING TEMPLATE CREATION ===');
      console.log('Workspace ID:', config.workspaceId);
      console.log('Cards Fragment Type ID:', config.fragmentTypeId);

      const result = await createOrUpdateTemplates(config.workspaceId, config.fragmentTypeId);

      console.log('=== TEMPLATES CREATED SUCCESSFULLY ===');
      console.log('Result:', result);

      const updatedConfig = saveTemplateConfig(config, result.templateId, result.instructionSetId);
      configStorage.set(updatedConfig);
      setConfig(updatedConfig);

      setShowTemplateConsent(false);

      console.log('=== TEMPLATE CREATION COMPLETE ===');

      // Wait a moment for API indexing, then refresh the chat button
      setTimeout(() => {
        console.log('Triggering template status refresh...');
        setTemplateRefreshCounter((prev) => prev + 1);
      }, 1000);

      alert(
        '✅ Templates created successfully!\n\nYou can now use Usable Chat to manage your tasks.',
      );
    } catch (error) {
      console.error('=== TEMPLATE CREATION FAILED ===');
      console.error('Error details:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      console.error('Error message:', errorMessage);
      console.error('Error stack:', errorStack);

      alert(
        `❌ Failed to create templates:\n\n${errorMessage}\n\nPlease check the browser console for details.`,
      );
    } finally {
      setIsCreatingTemplates(false);
      console.log('=== TEMPLATE CREATION HANDLER FINISHED ===');
    }
  };

  const handleDeclineTemplates = () => {
    if (config) {
      const updatedConfig = saveTemplateConfig(config, '', '');
      configStorage.set(updatedConfig);
      setConfig(updatedConfig);
    }
    setShowTemplateConsent(false);
  };

  if (!config) {
    return (
      <OnboardingPage
        onComplete={handleOnboardingComplete}
        userEmail={session?.user?.email || session?.user?.name || undefined}
      />
    );
  }

  // Filter cards by search query
  const filteredCards = cards.filter((card) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(query) ||
      card.items.some((item) => item.text.toLowerCase().includes(query)) ||
      card.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with search bar and profile */}
      <motion.header
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Chat Link Button */}
            <ChatLinkButton
              config={config}
              onRequestLink={() => setShowTemplateConsent(true)}
              forceRefresh={templateRefreshCounter}
            />

            {/* Search bar */}
            <div className="flex-1 max-w-3xl">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Profile section */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => {
                  configStorage.clear();
                  setConfig(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground hidden md:block"
                title="Change workspace"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </motion.button>
              <DropdownMenu
                trigger={
                  <motion.div
                    className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </motion.div>
                }
              >
                <DropdownMenuLabel>
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium text-foreground mt-1 truncate">
                    {session?.user?.email || session?.user?.name || 'User'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => signOut()}>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
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
          </div>
        </div>
      </motion.header>

      <motion.main
        className="container mx-auto px-4 py-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {isLoading ? (
          <motion.div
            className="text-center py-12"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-4xl mb-4 inline-block"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              ⏳
            </motion.div>
            <p className="text-muted-foreground">Loading cards...</p>
          </motion.div>
        ) : (
          <TodoGrid cards={filteredCards} onCardClick={handleCardClick} />
        )}
      </motion.main>

      {/* Floating Action Button */}
      <motion.button
        onClick={handleAddNewCard}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Card Editor */}
      <TodoCardEditor
        card={selectedCard}
        isOpen={showCardEditor}
        onClose={handleCloseEditor}
        onSave={handleSaveCard}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard}
        onAnimationComplete={handleAnimationComplete}
        workspaceId={config?.workspaceId || ''}
        cardPosition={
          cardPosition
            ? {
                top: cardPosition.top,
                left: cardPosition.left,
                width: cardPosition.width,
                height: cardPosition.height,
              }
            : undefined
        }
      />

      <TemplateConsentDialog
        open={showTemplateConsent}
        onAccept={handleAcceptTemplates}
        onDecline={handleDeclineTemplates}
        isLoading={isCreatingTemplates}
      />
    </motion.div>
  );
}
