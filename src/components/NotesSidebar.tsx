import { useState, useEffect } from 'react';
import { Bold, Heading1, Heading2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function NotesSidebar() {
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
    const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

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
      <div className="flex-1 p-4">
        <textarea
          id="notes-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Suas anotações..."
          className="w-full h-full bg-transparent text-zinc-300 resize-none outline-none placeholder-zinc-600 font-mono text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
