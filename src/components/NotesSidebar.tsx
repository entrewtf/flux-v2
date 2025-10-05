import { useState, useEffect } from 'react';
import { Bold, Heading1, Heading2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Thought } from '../lib/supabase';

interface NotesSidebarProps {
  thoughts?: Thought[];
}

export function NotesSidebar({ thoughts = [] }: NotesSidebarProps) {
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (noteId) {
      const timer = setTimeout(() => {
        saveNotes();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content, noteId]);

  async function loadNotes() {
    const { data } = await supabase.from('notes').select('*').limit(1).maybeSingle();
    if (data) {
      setContent(data.content || '');
      setNoteId(data.id);
    }
  }

  async function saveNotes() {
    if (!noteId) return;
    await supabase
      .from('notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', noteId);
  }

  function insertFormat(format: string) {
    const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selectedText = content.substring(start, end);
    let newText = content;

    switch (format) {
      case 'h1':
        newText = content.substring(0, start) + '# ' + selectedText + content.substring(end);
        break;
      case 'h2':
        newText = content.substring(0, start) + '## ' + selectedText + content.substring(end);
        break;
      case 'bold':
        newText = content.substring(0, start) + '**' + selectedText + '**' + content.substring(end);
        break;
    }

    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
    }, 0);
  }

  const sortedThoughts = [...thoughts]
    .filter(t => !t.is_backup && t.text?.trim())
    .sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));

  return (
    <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col h-screen">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-zinc-400 font-mono text-sm">// NT</h2>
          <div className="flex gap-1">
            <button
              onClick={() => insertFormat('h1')}
              className="p-2 hover:bg-zinc-800 rounded transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4 text-zinc-400" />
            </button>
            <button
              onClick={() => insertFormat('h2')}
              className="p-2 hover:bg-zinc-800 rounded transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4 text-zinc-400" />
            </button>
            <button
              onClick={() => insertFormat('bold')}
              className="p-2 hover:bg-zinc-800 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          <textarea
            id="notes-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Suas anotações..."
            className="w-full h-32 bg-transparent text-zinc-300 resize-none outline-none placeholder-zinc-600 font-mono text-sm leading-relaxed"
          />
        </div>

        {sortedThoughts.length > 0 && (
          <div className="border-t border-zinc-800 p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
            <h3 className="text-zinc-500 font-mono text-xs mb-3 uppercase tracking-wider">
              Pensamentos
            </h3>
            <div className="space-y-1">
              {sortedThoughts.map((thought) => (
                <div
                  key={thought.id}
                  className="text-zinc-400 text-xs font-mono py-1 px-2 hover:bg-zinc-900 rounded transition-colors cursor-default"
                  title={thought.text}
                >
                  {thought.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
