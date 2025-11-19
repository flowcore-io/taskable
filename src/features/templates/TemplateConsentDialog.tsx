'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';

interface TemplateConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export function TemplateConsentDialog({
  open,
  onAccept,
  onDecline,
  isLoading,
}: TemplateConsentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enhance your Taskable experience with AI</DialogTitle>
          <DialogDescription>
            Taskable can create two fragments in your Usable workspace to enable AI-powered todo management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div>
            <h3 className="font-medium mb-2">What will be created:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Todo Template</strong> - Standard structure for new tasks
              </li>
              <li>
                <strong>Instruction Set</strong> - Enables Usable chat to manage your todos
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">These fragments are:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Static (won't change unless app updates)</li>
              <li>Versioned (v1.0.0)</li>
              <li>Tagged (app:taskable, type:todoable-template/instruction-set)</li>
              <li>Discoverable (searchable in Usable)</li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> If you skip this, you can manually delete these fragments later
              in your Usable workspace by searching for the tag "app:taskable"
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isLoading}
          >
            Skip for Now
          </Button>
          <Button
            onClick={onAccept}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Templates'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
