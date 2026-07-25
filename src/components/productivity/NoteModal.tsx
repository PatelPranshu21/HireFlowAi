import React, { useState } from 'react';
import { X, FileText, Trash2, Check, Pin, Star } from 'lucide-react';
import { ProductivityNote } from '../../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<ProductivityNote, 'id' | 'updatedAt'> | ProductivityNote) => void;
  onDelete?: (id: string) => void;
  initialNote?: ProductivityNote | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialNote
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [category, setCategory] = useState<ProductivityNote['category']>(initialNote?.category || 'Interview Notes');
  const [tags, setTags] = useState<string>(initialNote?.tags?.join(', ') || '');
  const [pinned, setPinned] = useState(initialNote?.pinned || false);
  const [favorite, setFavorite] = useState(initialNote?.favorite || false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);

    const payload: any = {
      title,
      content,
      category,
      tags: parsedTags,
      pinned,
      favorite,
      archived: initialNote?.archived || false
    };

    if (initialNote?.id) {
      payload.id = initialNote.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#434656]/30 flex justify-between items-center bg-[#13151f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-geist text-white">
                {initialNote ? 'Edit Note' : 'New Career Note'}
              </h3>
              <p className="text-xs text-[#c3c5d9] font-mono">Knowledge Base & Interview Prep</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                pinned ? 'bg-[#571bc1]/30 text-[#d0bcff]' : 'bg-[#252836] text-[#c3c5d9]'
              }`}
              title="Pin note"
            >
              <Pin className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFavorite(!favorite)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                favorite ? 'bg-[#f59e0b]/30 text-[#f59e0b]' : 'bg-[#252836] text-[#c3c5d9]'
              }`}
              title="Favorite note"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#c3c5d9] hover:text-white hover:bg-[#252836] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Note Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Apple System Design STAR Scenarios"
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="Interview Notes">Interview Notes</option>
                <option value="Company Notes">Company Notes</option>
                <option value="Learning Notes">Learning Notes</option>
                <option value="Resume Ideas">Resume Ideas</option>
                <option value="General Notes">General Notes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Apple, System Design, STAR, Kafka"
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Content / Markdown Text</label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your study notes, interview responses, architectural diagrams, key formulas..."
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg p-3.5 text-xs font-mono text-white focus:outline-none focus:border-[#f59e0b] leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-[#434656]/30 flex justify-between items-center">
            {initialNote && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete note?')) {
                    onDelete(initialNote.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-mono cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Note
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#252836] text-[#c3c5d9] text-xs font-mono hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> Save Note
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
