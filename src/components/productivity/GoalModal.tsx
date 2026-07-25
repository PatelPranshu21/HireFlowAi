import React, { useState } from 'react';
import { X, Target, Trash2, Check } from 'lucide-react';
import { ProductivityGoal } from '../../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<ProductivityGoal, 'id'> | ProductivityGoal) => void;
  onDelete?: (id: string) => void;
  initialGoal?: ProductivityGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialGoal
}) => {
  const [title, setTitle] = useState(initialGoal?.title || '');
  const [targetMetric, setTargetMetric] = useState(initialGoal?.targetMetric || 'Problems Solved');
  const [currentProgress, setCurrentProgress] = useState(initialGoal?.currentProgress || 0);
  const [targetProgress, setTargetProgress] = useState(initialGoal?.targetProgress || 10);
  const [unit, setUnit] = useState(initialGoal?.unit || 'items');
  const [timeframe, setTimeframe] = useState<ProductivityGoal['timeframe']>(initialGoal?.timeframe || 'weekly');
  const [category, setCategory] = useState(initialGoal?.category || 'Technical Prep');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: any = {
      title,
      targetMetric,
      currentProgress: Number(currentProgress),
      targetProgress: Number(targetProgress),
      unit,
      timeframe,
      category,
      completed: currentProgress >= targetProgress
    };

    if (initialGoal?.id) {
      payload.id = initialGoal.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#191b25] border border-[#434656]/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#434656]/30 flex justify-between items-center bg-[#13151f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-geist text-white">
                {initialGoal ? 'Edit Career Goal' : 'Set New Goal'}
              </h3>
              <p className="text-xs text-[#c3c5d9] font-mono">Measurable Milestones & Tracking</p>
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
            <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Goal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Solve 20 LeetCode Problems"
              className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value as any)}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="daily">Daily Goal</option>
                <option value="weekly">Weekly Goal</option>
                <option value="monthly">Monthly Goal</option>
                <option value="career">Long-term Career Goal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Technical Prep, Applications, Certs"
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Current Progress</label>
              <input
                type="number"
                min={0}
                value={currentProgress}
                onChange={e => setCurrentProgress(Number(e.target.value))}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Target</label>
              <input
                type="number"
                min={1}
                value={targetProgress}
                onChange={e => setTargetProgress(Number(e.target.value))}
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b82f6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c3c5d9] uppercase mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="problems, apps, %"
                className="w-full bg-[#13151f] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#434656]/30 flex justify-between items-center">
            {initialGoal && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete goal?')) {
                    onDelete(initialGoal.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-mono cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Goal
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
                className="px-5 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> Save Goal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
