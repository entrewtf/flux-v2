import { useState, useEffect, useRef, useCallback } from 'react';
import { Archive, BarChart3, RotateCcw, Pause, Play } from 'lucide-react';
import { supabase, Thought } from '../lib/supabase';
import { ThoughtCard } from './ThoughtCard';
import { NotesSidebar } from './NotesSidebar';

export function Dashboard() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newThoughtText, setNewThoughtText] = useState('');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [showBackup, setShowBackup] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [globalCounter, setGlobalCounter] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const isDragging = useRef(false);

  useEffect(() => {
    loadThoughts();
    loadCounter();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !showInput) {
        e.preventDefault();
        setShowSidebar(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showInput]);

  useEffect(() => {
    startAnimation();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showSidebar]);

  async function loadThoughts() {
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar pensamentos:', error);
        setError('Erro ao conectar ao banco de dados. Verifique as variáveis de ambiente.');
        return;
      }

      if (data) {
        setThoughts(data as Thought[]);
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao conectar ao banco de dados.');
    }
  }

  async function loadCounter() {
    try {
      const { data, error } = await supabase
        .from('global_counter')
        .select('thought_count')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar contador:', error);
        return;
      }

      if (data) {
        setGlobalCounter(data.thought_count);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  }

  function startAnimation() {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = () => {
      if (isDragging.current || focusedId || isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      setThoughts((prevThoughts) => {
        const canvas = canvasRef.current;
        if (!canvas) return prevThoughts;

        const sidebarWidth = showSidebar ? 320 : 0;
        const canvasWidth = canvas.offsetWidth - sidebarWidth;
        const canvasHeight = canvas.offsetHeight;

        return prevThoughts.map((thought) => {
          if (thought.is_backup) return thought;

          let newX = thought.position_x + thought.velocity_x * 0.3;
          let newY = thought.position_y + thought.velocity_y * 0.3;
          let newVelX = thought.velocity_x;
          let newVelY = thought.velocity_y;

          const cardWidth = 200;
          const cardHeight = 40;

          if (newX - cardWidth / 2 < 0 || newX + cardWidth / 2 > canvasWidth) {
            newVelX = -newVelX;
            newX = Math.max(cardWidth / 2, Math.min(canvasWidth - cardWidth / 2, newX));
          }

          if (newY - cardHeight / 2 < 0 || newY + cardHeight / 2 > canvasHeight) {
            newVelY = -newVelY;
            newY = Math.max(cardHeight / 2, Math.min(canvasHeight - cardHeight / 2, newY));
          }

          return {
            ...thought,
            position_x: newX,
            position_y: newY,
            velocity_x: newVelX,
            velocity_y: newVelY,
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }

  async function createThought() {
    if (!newThoughtText.trim() || !canvasRef.current) return;

    const maxLength = 40;
    const trimmedText = newThoughtText.length > maxLength
      ? newThoughtText.substring(0, maxLength)
      : newThoughtText;

    const newCounter = globalCounter + 1;
    const canvasWidth = canvasRef.current.offsetWidth - 320;
    const canvasHeight = canvasRef.current.offsetHeight;

    const newThought = {
      job_number: newCounter,
      text: trimmedText,
      size: 1,
      position_x: Math.random() * (canvasWidth - 400) + 200,
      position_y: Math.random() * (canvasHeight - 200) + 100,
      velocity_x: (Math.random() - 0.5) * 1,
      velocity_y: (Math.random() - 0.5) * 1,
      is_backup: false,
    };

    const { data } = await supabase.from('thoughts').insert([newThought]).select().single();

    if (data) {
      await supabase
        .from('global_counter')
        .update({ thought_count: newCounter, updated_at: new Date().toISOString() })
        .eq('id', 1);

      setGlobalCounter(newCounter);
      setThoughts([...thoughts, data as Thought]);
      setNewThoughtText('');
      setShowInput(false);
    }
  }

  async function updateThought(id: string, updates: Partial<Thought>) {
    await supabase.from('thoughts').update(updates).eq('id', id);
    setThoughts(thoughts.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }

  async function deleteThought(id: string) {
    await supabase.from('thoughts').delete().eq('id', id);
    setThoughts(thoughts.filter((t) => t.id !== id));
    if (focusedId === id) setFocusedId(null);
  }

  function handleDoubleClick(id: string) {
    setFocusedId(focusedId === id ? null : id);
  }

  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
    isDragging.current = true;
  }, []);

  const handleDragMove = useCallback((id: string, x: number, y: number) => {
    setThoughts((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, position_x: x, position_y: y } : t
      )
    );
  }, []);

  const handleDragEnd = useCallback(async (id: string) => {
    isDragging.current = false;
    setDraggingId(null);
    const thought = thoughts.find((t) => t.id === id);
    if (thought) {
      await supabase
        .from('thoughts')
        .update({
          position_x: thought.position_x,
          position_y: thought.position_y,
        })
        .eq('id', id);
    }
  }, [thoughts]);

  const activeThoughts = thoughts.filter((t) => !t.is_backup);
  const backupThoughts = thoughts.filter((t) => t.is_backup);

  const todayThoughts = thoughts.filter((t) => {
    const created = new Date(t.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  return (
    <div className="h-screen bg-black flex">
      <div ref={canvasRef} className="flex-1 relative overflow-hidden">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
            <div className="bg-zinc-900 border border-red-500 rounded-lg p-6 max-w-md">
              <h2 className="text-red-500 text-xl font-medium mb-2">Erro de Conexão</h2>
              <p className="text-white mb-4">{error}</p>
              <p className="text-zinc-400 text-sm mb-4">
                Certifique-se de que as variáveis de ambiente VITE_BOLT_BASE_URL e VITE_BOLT_BASE_ANON_KEY estão configuradas corretamente.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
              >
                Recarregar
              </button>
            </div>
          </div>
        )}

        <div className="absolute top-6 left-8 z-20">
          <h1 className="text-white text-2xl font-light tracking-wide">
            <span className="text-yellow-500">&gt;_</span> Flux
          </h1>
        </div>

        <div className="absolute top-6 right-8 z-20 flex gap-1.5">
          <button
            onClick={async () => {
              if (confirm('Tem certeza que deseja limpar todos os pensamentos?')) {
                await supabase.from('thoughts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                setThoughts([]);
              }
            }}
            className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors flex items-center gap-1.5"
            title="Limpar todos os pensamentos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowBackup(!showBackup)}
            className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors flex items-center gap-1.5"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="text-xs">{backupThoughts.length}</span>
          </button>
          <button
            onClick={async () => {
              if (confirm('Tem certeza que deseja resetar o contador?')) {
                await supabase
                  .from('global_counter')
                  .update({ thought_count: 0, updated_at: new Date().toISOString() })
                  .eq('id', 1);
                setGlobalCounter(0);
              }
            }}
            className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors flex items-center gap-1.5"
            title="Resetar contador"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-xs">{globalCounter}</span>
          </button>
        </div>

        {showAnalytics && (
          <div className="absolute top-20 right-8 z-20 bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-64">
            <h3 className="text-white font-medium mb-3">Estatísticas de Hoje</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>Total de pensamentos:</span>
                <span className="text-white font-medium">{todayThoughts.length}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 mt-2">
                <p className="text-zinc-400 text-xs">Pensamentos criados hoje:</p>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {todayThoughts.slice(0, 5).map((t) => (
                    <div key={t.id} className="text-zinc-400 text-xs truncate">
                      • {t.text}
                    </div>
                  ))}
                  {todayThoughts.length > 5 && (
                    <div className="text-zinc-500 text-xs">
                      +{todayThoughts.length - 5} mais
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {(showBackup ? backupThoughts : activeThoughts).map((thought) => (
          <ThoughtCard
            key={thought.id}
            thought={thought}
            isFocused={focusedId === thought.id}
            isBlurred={focusedId !== null && focusedId !== thought.id}
            onGrow={() => updateThought(thought.id, { size: Math.min(10, thought.size + 1) })}
            onShrink={() => updateThought(thought.id, { size: Math.max(1, thought.size - 1) })}
            onDelete={() => deleteThought(thought.id)}
            onDoubleClick={() => handleDoubleClick(thought.id)}
            onDragStart={() => handleDragStart(thought.id)}
            onDragMove={(x, y) => handleDragMove(thought.id, x, y)}
            onDragEnd={() => handleDragEnd(thought.id)}
          />
        ))}

        <div className="absolute bottom-8 left-8 z-20">
          <button
            onClick={() => setShowInput(true)}
            className="text-2xl text-yellow-500 hover:text-yellow-400 transition-colors font-light"
          >
            &gt;_
          </button>
        </div>

        {showInput && (
          <>
            <div
              className="absolute inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => {
                setShowInput(false);
                setNewThoughtText('');
              }}
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newThoughtText}
                  onChange={(e) => setNewThoughtText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createThought();
                    if (e.key === 'Escape') {
                      setShowInput(false);
                      setNewThoughtText('');
                    }
                  }}
                  placeholder="Digite seu pensamento..."
                  className="px-6 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg w-96 outline-none focus:border-zinc-500 transition-colors"
                  autoFocus
                />
                <button
                  onClick={createThought}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors font-medium"
                >
                  Criar
                </button>
                <button
                  onClick={() => {
                    setShowInput(false);
                    setNewThoughtText('');
                  }}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </>
        )}

        {focusedId && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setFocusedId(null)}
          />
        )}
      </div>

      {showSidebar && <NotesSidebar />}
    </div>
  );
}
