import React, { useState } from 'react';
import { X, CheckSquare, Trash2, Check } from 'lucide-react';
import { ProductivityTask } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<ProductivityTask, 'id'> | ProductivityTask) => void;
  onDelete?: (id: string) => void;
  initialTask?: ProductivityTask | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [category, setCategory] = useState<ProductivityTask['category']>(initialTask?.category || 'Interview');
  const [priority, setPriority] = useState<ProductivityTask['priority']>(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || 'Today');
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialTask?.estimatedMinutes || 30);
  const [notes, setNotes] = useState(initialTask?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: any = {
      title,
      description: description || undefined,
      category,
      priority,
      status: initialTask?.status || 'todo',
      dueDate,
      estimatedMinutes,
      notes: notes || undefined,
      completed: initialTask?.completed || false
    };

    if (initialTask?.id) {
      payload.id = initialTask.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#434656]/30 flex justify-between items-center bg-[#13151f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#10b981]/10 text-[#10b981]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-geist text-white">
                {initialTask ? 'Edit Task' : 'Create Task'}
              </h3>
              <p className="text-xs text-[#c3c5d9] font-mono">Categorized Task Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#c3c5d9] hover:text-white hover:bg-[#252836] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Practice 3 System Design Scenarios"
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#10b981]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
              >
                <option value="Resume">Resume Suite</option>
                <option value="Interview">Interview Hub</option>
                <option value="Learning">Learning & DSA</option>
                <option value="Certification">Certification</option>
                <option value="Applications">Job Applications</option>
                <option value="Personal">Personal Career Goal</option>
                <option value="Support">Support & Recruiter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                placeholder="Today, Tomorrow, YYYY-MM-DD"
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Estimated Time (mins)</label>
              <input
                type="number"
                min={5}
                max={480}
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value))}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Description & Key Steps</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed instructions or reference links..."
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#10b981]"
            />
          </div>

          <div className="pt-4 border-t border-[#434656]/30 flex justify-between items-center">
            {initialTask && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete task?')) {
                    onDelete(initialTask.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-mono cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Task
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
                className="px-5 py-2 rounded-lg bg-[#10b981] hover:bg-[#10b981]/90 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> Save Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
