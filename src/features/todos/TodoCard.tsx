'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { TodoCard } from '@/src/types';
import { getCardStats } from '@/src/lib/utils';

interface TodoCardProps {
  card: TodoCard;
  onClick: (card: TodoCard, position: DOMRect) => void;
}

export function TodoCardComponent({ card, onClick }: TodoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const stats = getCardStats(card);

  const handleClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onClick(card, rect);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      layoutId={card.id}
      onClick={handleClick}
      className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header - Simple and clean */}
      <h3 className="font-medium text-lg text-foreground mb-3">{card.title}</h3>

      {/* Items preview - Google Keep style */}
      {card.items.length > 0 ? (
        <div className="space-y-1.5">
          {card.items.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-start gap-2.5">
              <div
                className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  item.checked ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`}
              >
                {item.checked && (
                  <svg
                    className="w-2.5 h-2.5 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`flex-1 text-sm leading-5 ${
                  item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {item.text.length > 60 ? `${item.text.slice(0, 60)}...` : item.text}
              </span>
            </div>
          ))}
          {card.items.length > 5 && (
            <p className="text-xs text-muted-foreground pl-6.5 pt-1">
              +{card.items.length - 5} more items
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Empty list</p>
      )}

      {/* Simple footer - just completion count */}
      {card.items.length > 0 && (
        <div className="mt-3 pt-2 text-xs text-muted-foreground">
          {stats.completed} / {stats.total} completed
        </div>
      )}
    </motion.div>
  );
}
