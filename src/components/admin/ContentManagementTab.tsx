import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  ThumbsUp, 
  Lock, 
  Globe, 
  X, 
  BookOpen, 
  Sparkles,
  Check
} from 'lucide-react';
import { ContentItemAdmin } from '../../types/admin';

interface ContentManagementTabProps {
  contentItems: ContentItemAdmin[];
  onAddContent: (item: ContentItemAdmin) => void;
  onUpdateContent: (item: ContentItemAdmin) => void;
  onDeleteContent: (id: string) => void;
}

export const ContentManagementTab: React.FC<ContentManagementTabProps> = ({
  contentItems,
  onAddContent,
  onUpdateContent,
  onDeleteContent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingItem, setEditingItem] = useState<ContentItemAdmin | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'Roadmaps' as any,
    tags: 'React, System Design',
    author: 'HireFlow Editorial',
    premiumOnly: false,
    contentBody: ''
  });

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleStartEdit = (item: ContentItemAdmin) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category,
      tags: item.tags.join(', '),
      author: item.author,
      premiumOnly: item.premiumOnly,
      contentBody: item.contentBody || ''
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    if (editingItem) {
      onUpdateContent({
        ...editingItem,
        title: form.title,
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()),
        author: form.author,
        premiumOnly: form.premiumOnly,
        contentBody: form.contentBody,
        updatedAt: new Date().toISOString().split('T')[0]
      });
      setEditingItem(null);
    } else {
      const newItem: ContentItemAdmin = {
        id: `cnt_${Date.now()}`,
        title: form.title,
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()),
        status: 'Published',
        author: form.author,
        views: 1,
        likes: 0,
        updatedAt: new Date().toISOString().split('T')[0],
        premiumOnly: form.premiumOnly,
        contentBody: form.contentBody
      };
      onAddContent(newItem);
      setIsAddModalOpen(false);
    }

    setForm({
      title: '',
      category: 'Roadmaps',
      tags: 'React, System Design',
      author: 'HireFlow Editorial',
      premiumOnly: false,
      contentBody: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d90a2]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search learning materials, roadmaps, cheat sheets..."
            className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0c0e17] border border-[#434656]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#c3c5d9]"
          >
            <option value="ALL">All Categories</option>
            <option value="Roadmaps">Roadmaps</option>
            <option value="Cheat Sheets">Cheat Sheets</option>
            <option value="Interview Questions">Interview Questions</option>
            <option value="Company Specs">Company Specs</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Content Item</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-[#434656]/60 transition-all">
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="px-2.5 py-1 bg-[#0052ff]/10 text-[#0052ff] border border-[#0052ff]/30 rounded-lg text-[10px] font-mono font-bold">
                  {item.category}
                </span>

                <div className="flex items-center gap-1">
                  {item.premiumOnly ? (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Pro Tier
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Free
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-base font-bold font-geist text-white mb-2">{item.title}</h4>
              <p className="text-xs font-mono text-[#c3c5d9] line-clamp-2 mb-3">{item.contentBody}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#0c0e17] text-[#8d90a2] rounded text-[10px] font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#434656]/20 flex items-center justify-between text-xs font-mono text-[#8d90a2]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-[#4cd7f6]" /> {item.views.toLocaleString()}</span>
                <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> {item.likes}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 hover:bg-white/10 text-white rounded-lg transition-all cursor-pointer"
                  title="Edit Content"
                >
                  <Edit3 className="w-4 h-4 text-[#0052ff]" />
                </button>

                <button
                  onClick={() => onDeleteContent(item.id)}
                  className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer"
                  title="Delete Content"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Content Modal */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveSubmit} className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-base font-bold font-geist text-white">
                {editingItem ? 'Edit Learning Content' : 'Publish New Learning Content'}
              </h3>
              <button 
                type="button" 
                onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }} 
                className="text-[#8d90a2] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#c3c5d9] mb-1">Article / Guide Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Master System Design Caching Strategies"
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c3c5d9] mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="Roadmaps">Roadmaps</option>
                    <option value="Cheat Sheets">Cheat Sheets</option>
                    <option value="Interview Questions">Interview Questions</option>
                    <option value="Company Specs">Company Specs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#c3c5d9] mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="React, Microservices"
                    className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="premiumOnly"
                  checked={form.premiumOnly}
                  onChange={(e) => setForm({ ...form, premiumOnly: e.target.checked })}
                  className="rounded text-[#0052ff] bg-[#0c0e17] border-[#434656]/30"
                />
                <label htmlFor="premiumOnly" className="text-[#c3c5d9] cursor-pointer">Restrict to Paid Pro/Premium Subscribers</label>
              </div>

              <div>
                <label className="block text-[#c3c5d9] mb-1">Content Body / Summary</label>
                <textarea
                  rows={5}
                  value={form.contentBody}
                  onChange={(e) => setForm({ ...form, contentBody: e.target.value })}
                  className="w-full bg-[#0c0e17] border border-[#434656]/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#434656]/30">
              <button
                type="button"
                onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }}
                className="px-4 py-2 bg-[#0c0e17] hover:bg-white/10 text-xs font-mono text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052ff] hover:bg-blue-600 text-xs font-semibold text-white rounded-xl cursor-pointer"
              >
                Publish Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
