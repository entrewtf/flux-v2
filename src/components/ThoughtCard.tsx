import { useEffect, useRef } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Thought } from '../lib/supabase';

interface ThoughtCardProps {
  thought: Thought;
  isFocused: boolean;
  isBlurred: boolean;
  onGrow: () => void;
  onShrink: () => void;
  onDelete: () => void;
  onDoubleClick: () => void;
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
}

export function ThoughtCard({
  thought,
  isFocused,
  isBlurred,
  onGrow,
  onShrink,
  onDelete,
  onDoubleClick,
  onDragStart,
  onDragMove,
  onDragEnd,
}: ThoughtCardProps) {
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const sizeMultiplier = 1 + (thought.size - 1) * 0.4;
  const fontSize = 0.875 * sizeMultiplier;
  const verticalPadding = fontSize * 0.3;
  const horizontalPadding = fontSize * 1.2;

  const isYellow = thought.job_number % 3 === 0;
  const bgColor = isYellow ? 'bg-yellow-500/20' : 'bg-zinc-800/60';
  const borderColor = isYellow ? 'border-yellow-500/40' : 'border-zinc-700';
  const textColor = isYellow ? 'text-yellow-500' : 'text-white';

  function handleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return;

    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - thought.position_x,
      y: e.clientY - thought.position_y,
    };
    onDragStart();
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isDraggingRef.current) return;
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;
      onDragMove(newX, newY);
    }

    function handleMouseUp() {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        onDragEnd();
      }
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onDragMove, onDragEnd]);

  return (
    <div
      className={`absolute rounded-lg ${bgColor} border ${borderColor} cursor-grab select-none group ${
        isBlurred ? 'opacity-30 blur-sm' : 'opacity-100'
      } ${isFocused ? 'ring-2 ring-zinc-500 z-50' : 'z-10'} active:cursor-grabbing`}
      style={{
        left: `${thought.position_x}px`,
        top: `${thought.position_y}px`,
        padding: `${verticalPadding}rem ${horizontalPadding}rem`,
        transform: 'translate(-50%, -50%)',
      }}
      onDoubleClick={onDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-2">
        <p
          className={`${textColor} whitespace-nowrap font-light`}
          style={{
            fontSize: `${fontSize}rem`,
            letterSpacing: '-0.01em'
          }}
        >
          {thought.text}
        </p>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGrow();
            }}
            className="w-5 h-5 rounded bg-zinc-600 hover:bg-zinc-500 flex items-center justify-center transition-colors"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShrink();
            }}
            className="w-5 h-5 rounded bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center transition-colors"
            disabled={thought.size <= 1}
          >
            <Minus className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-5 h-5 rounded bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
