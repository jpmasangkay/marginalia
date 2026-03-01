/** @file src/components/notes-editor.tsx
 * Main note editor panel for title, content, task progress, and note metadata.
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Share2, MoreVertical, CheckCircle2, Circle } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  preview: string;
  date: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
}

interface NotesEditorProps {
  note: Note;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onCategoryChange: (category: string) => void;
}

export function NotesEditor({ note, onTitleChange, onContentChange, onCategoryChange }: NotesEditorProps) {
  const [content, setContent] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [tasks, setTasks] = useState<{id: string, text: string, completed: boolean}[]>([]);

  const handleShare = () => {
    setIsSharing(true);
    setTimeout(() => setIsSharing(false), 2000);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = () => {
    setTasks([...tasks, { id: Date.now().toString(), text: '', completed: false }]);
  };

  const updateTask = (id: string, text: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const categories = ['Work', 'Personal', 'Ideas', 'Learning'];

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              defaultValue={note.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-2xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 w-full text-foreground placeholder-muted-foreground"
              placeholder="Note title"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className={isSharing ? 'bg-primary text-primary-foreground' : ''}
            >
              <Share2 className="w-4 h-4" />
              {isSharing ? 'Copied!' : 'Share'}
            </Button>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Created: </span>
            <span className="text-foreground">{note.createdAt}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Category: </span>
            <select
              value={note.category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          title="Bold"
          className="hover:bg-accent hover:text-accent-foreground"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Italic"
          className="hover:bg-accent hover:text-accent-foreground"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Underline"
          className="hover:bg-accent hover:text-accent-foreground"
        >
          <Underline className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 overflow-hidden flex gap-6 p-6">
        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onContentChange(e.target.value);
            }}
            className="flex-1 bg-background text-foreground border border-border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed placeholder-muted-foreground"
            placeholder="Start typing..."
            spellCheck="true"
          />
        </div>

        {/* Progress Panel */}
        <div className="w-64 border border-border rounded-lg bg-card p-4 flex flex-col">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground mb-2">Progress</h3>
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {completedCount} of {tasks.length} tasks
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            <h4 className="text-sm font-medium text-foreground">Tasks</h4>
            {tasks.map(task => (
              <div key={task.id} className="flex items-start gap-2 group">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => updateTask(task.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground focus:outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors"
                  placeholder="Add task..."
                />
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-destructive text-sm hover:underline"
                >
                  Ã—
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={addTask}
            variant="outline"
            className="w-full text-sm"
            size="sm"
          >
            + Add Task
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-border bg-card px-6 py-3 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span className="mx-2">â€¢</span>
          <span>{content.length} characters</span>
        </div>
        <div className="text-xs">Last saved just now</div>
      </div>
    </div>
  );
}



