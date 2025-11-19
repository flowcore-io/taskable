'use client';

import { TodoCardComponent } from './TodoCard';
import type { TodoCard } from '@/src/types';

interface TodoGridProps {
  cards: TodoCard[];
  onCardClick: (card: TodoCard, position: DOMRect) => void;
}

export function TodoGrid({ cards, onCardClick }: TodoGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-muted-foreground">No cards yet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Click the + button to create your first card
        </p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {cards.map((card) => (
        <TodoCardComponent key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  );
}
