import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Pin,
  Star,
  Search,
  Tag,
  Copy,
  Check,
  Trash2,
  Edit,
  Sparkles,
  Archive,
  BookOpen
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ProductivityNote } from '../../types';
import { NoteModal } from './NoteModal';

export const NotesSystemTab: React.FC = () => {
  const {
    prodNotes,
    addProdNote,
    updateProdNote,
    deleteProdNote,
    toggleNotePin,
    toggleNoteFav,
    toggleNoteArchive
  } = useEcosystem();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'pinned' | 'favorite' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProductivityNote | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNotes = prodNotes.filter(n => {
    if (filterMode === 'pinned' && !n.pinned) return false;
    if (filterMode === 'favorite' && !n.favorite) return false;
    if (filterMode === 'archived' && !n.archived) return false;
    if (filterMode !== 'archived' && n.archived) return false; // hide archived by default

    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTag = n.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }
    return true;
  });

  const copyNoteContent = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#191b25] border border-[#434656]/30 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              Career Knowledge Base & Notes
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
                {prodNotes.length} Notes Saved
              </span>
            </h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Organize interview talking points, STAR answers, company specs, and learning cheat sheets.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedNote(null);
            setIsModalOpen(true);
          }}
          className="bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> New Career Note
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#13151f] p-3 rounded-xl border border-[#434656]/20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#c3c5d9] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes or tags..."
              className="bg-[#191b25] border border-[#434656]/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#f59e0b] w-56"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#c3c5d9]">
            Category:
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#191b25] border border-[#434656]/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#f59e0b]"
            >
              <option value="all">All Categories</option>
              <option value="Interview Notes">Interview Notes</option>
              <option value="Company Notes">Company Notes</option>
              <option value="Learning Notes">Learning Notes</option>
              <option value="Resume Ideas">Resume Ideas</option>
              <option value="General Notes">General Notes</option>
            </select>
          </div>
        </div>

        <div className="bg-[#191b25] p-1 rounded-xl border border-[#434656]/30 flex gap-1">
          {(['all', 'pinned', 'favorite', 'archived'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-mono capitalize cursor-pointer transition-colors ${
                filterMode === mode ? 'bg-[#f59e0b] text-black font-bold' : 'text-[#c3c5d9] hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#191b25] rounded-2xl border border-[#434656]/20">
            <FileText className="w-10 h-10 text-[#434656] mx-auto mb-3" />
            <p className="text-sm font-geist text-[#c3c5d9]">No notes found matching your criteria.</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className={`bg-[#191b25] border border-[#434656]/30 hover:border-[#f59e0b]/50 rounded-2xl p-5 flex flex-col justify-between transition-all group ${
                note.pinned ? 'ring-1 ring-[#571bc1]/50' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
                      {note.category}
                    </span>
                    {note.pinned && (
                      <span className="text-[10px] font-mono text-[#d0bcff] flex items-center gap-0.5">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleNotePin(note.id)}
                      className={`p-1.5 rounded hover:bg-[#252836] cursor-pointer ${
                        note.pinned ? 'text-[#d0bcff]' : 'text-[#434656]'
                      }`}
                      title="Toggle Pin"
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleNoteFav(note.id)}
                      className={`p-1.5 rounded hover:bg-[#252836] cursor-pointer ${
                        note.favorite ? 'text-amber-400' : 'text-[#434656]'
                      }`}
                      title="Toggle Favorite"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white font-geist mb-2 group-hover:text-[#f59e0b] transition-colors">
                  {note.title}
                </h3>

                <p className="text-xs text-[#c3c5d9] font-mono line-clamp-4 leading-relaxed whitespace-pre-line mb-4 bg-[#13151f] p-3 rounded-xl border border-[#434656]/20">
                  {note.content}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {note.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#252836] text-[#c3c5d9]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#434656]/20 flex justify-between items-center text-xs font-mono text-[#c3c5d9]">
                <span>Updated {note.updatedAt}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyNoteContent(note.id, note.content)}
                    className="p-1.5 rounded-lg bg-[#252836] text-[#c3c5d9] hover:text-white cursor-pointer flex items-center gap-1"
                    title="Copy note text"
                  >
                    {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedNote(note);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#252836] text-white hover:bg-[#f59e0b] hover:text-black font-bold cursor-pointer transition-colors"
                  >
                    Edit Note
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialNote={selectedNote}
        onSave={note => {
          if ('id' in note) {
            updateProdNote(note as ProductivityNote);
          } else {
            addProdNote(note);
          }
        }}
        onDelete={id => deleteProdNote(id)}
      />
    </div>
  );
};
