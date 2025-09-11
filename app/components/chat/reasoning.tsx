import { Markdown } from '@/components/prompt-kit/markdown';
import { cn } from '@/lib/utils';
import { CaretDownIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

type ReasoningProps = {
  reasoning: string;
  isStreaming?: boolean;
};

const TRANSITION = {
  type: 'spring',
  duration: 0.2,
  bounce: 0,
};

// Animated thinking indicator component
function ThinkingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-2 text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="font-medium"
      >
        Thinking
      </motion.span>
      <motion.div
        className="flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-muted-foreground rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function Reasoning({ reasoning, isStreaming }: ReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(() => false);

  // Collapse when streaming finishes. Avoid state updates during render to
  // prevent React warnings and frozen UI.
  useEffect(() => {
    if (isStreaming === false) {
      setIsExpanded(false);
    }
  }, [isStreaming]);

  return (
    <div>
      {isStreaming ? (
        <div>
          <button
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors mb-2"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            aria-expanded={isExpanded}
            aria-controls="reasoning-panel"
          >
            <ThinkingIndicator />
            <CaretDownIcon
              className={cn(
                'size-3 transition-transform ml-1',
                isExpanded ? 'rotate-180' : ''
              )}
            />
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="mt-2 overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={TRANSITION}
              >
                <div
                  id="reasoning-panel"
                  className="text-muted-foreground border-muted-foreground/20 flex flex-col border-l pl-4 text-sm"
                >
                  <Markdown>{reasoning}</Markdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
        >
          <span>Thought</span>
          <CaretDownIcon
            className={cn(
              'size-3 transition-transform',
              isExpanded ? 'rotate-180' : ''
            )}
          />
        </button>
      )}

      <AnimatePresence>
        {isExpanded && !isStreaming && (
          <motion.div
            className="mt-2 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={TRANSITION}
          >
            <div className="text-muted-foreground border-muted-foreground/20 flex flex-col border-l pl-4 text-sm">
              <Markdown>{reasoning}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
