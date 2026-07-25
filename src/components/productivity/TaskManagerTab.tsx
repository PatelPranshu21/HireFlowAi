import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Kanban,
  List,
  Sparkles,
  Search,
  Tag
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { ProductivityTask } from '../../types';
import { TaskModal } from './TaskModal';

export const TaskManagerTab: React.FC = () => {
  const {
    prodTasks,
    addProdTask,
    updateProdTask,
    deleteProdTask,
    toggleProdTask
  } = useEcosystem();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProductivityTask | null>(null);

  const filteredTasks = prodTasks.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getPriorityBadge = (priority: ProductivityTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getCategoryColor = (category: ProductivityTask['category']) => {
    switch (category) {
      case 'Resume': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Interview': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Learning': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Certification': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Applications': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-[#c3c5d9] bg-[#252836] border-[#434656]/30';
    }
  };

  const todoTasks = filteredTasks.filter(t => t.status === 'todo' && !t.completed);
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress' && !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed || t.status === 'completed');

  const totalEstMins = (filteredTasks || [])
    .filter(t => !t.completed)
    .reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#191b25] border border-[#434656]/30 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              Career Task Manager
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                {prodTasks.filter(t => t.completed).length} / {prodTasks.length} Done
              </span>
            </h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Est. Remaining Workload: <span className="text-[#4cd7f6] font-bold">{Math.round(totalEstMins / 60 * 10) / 10} hours</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-[#13151f] p-1 rounded-xl border border-[#434656]/30 flex gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer ${
                viewMode === 'kanban' ? 'bg-[#0052ff] text-white font-bold' : 'text-[#c3c5d9] hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer ${
                viewMode === 'list' ? 'bg-[#0052ff] text-white font-bold' : 'text-[#c3c5d9] hover:text-white'
              }`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
            className="bg-[#10b981] hover:bg-[#10b981]/90 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
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
              placeholder="Search tasks..."
              className="bg-[#191b25] border border-[#434656]/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#0052ff] w-48"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#c3c5d9]">
            <Tag className="w-4 h-4 text-[#0052ff]" /> Category:
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#191b25] border border-[#434656]/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#0052ff]"
            >
              <option value="all">All Categories</option>
              <option value="Resume">Resume Suite</option>
              <option value="Interview">Interview Hub</option>
              <option value="Learning">Learning & DSA</option>
              <option value="Certification">Certification</option>
              <option value="Applications">Applications</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#c3c5d9]">
            <Filter className="w-4 h-4 text-[#0052ff]" /> Priority:
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="bg-[#191b25] border border-[#434656]/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#0052ff]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: To Do */}
          <div className="bg-[#13151f] border border-[#434656]/30 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#434656]/20">
              <h3 className="text-sm font-bold font-geist text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                To Do ({todoTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {todoTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-[#191b25] border border-[#434656]/30 hover:border-[#0052ff]/50 rounded-xl p-4 space-y-2 cursor-pointer transition-all"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-geist text-white hover:text-[#4cd7f6] transition-colors">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-xs text-[#c3c5d9] font-mono line-clamp-2">{task.description}</p>
                  )}

                  <div className="pt-2 border-t border-[#434656]/20 flex justify-between items-center text-[11px] font-mono text-[#c3c5d9]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#0052ff]" /> {task.estimatedMinutes}m</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleProdTask(task.id);
                      }}
                      className="text-xs text-[#10b981] hover:underline cursor-pointer font-bold"
                    >
                      Complete →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-[#13151f] border border-[#434656]/30 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#434656]/20">
              <h3 className="text-sm font-bold font-geist text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                In Progress ({inProgressTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {inProgressTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-[#191b25] border border-[#0052ff]/40 hover:border-[#0052ff] rounded-xl p-4 space-y-2 cursor-pointer transition-all"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-geist text-white hover:text-[#4cd7f6] transition-colors">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-xs text-[#c3c5d9] font-mono line-clamp-2">{task.description}</p>
                  )}

                  <div className="pt-2 border-t border-[#434656]/20 flex justify-between items-center text-[11px] font-mono text-[#c3c5d9]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#0052ff]" /> {task.estimatedMinutes}m</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleProdTask(task.id);
                      }}
                      className="text-xs text-[#10b981] hover:underline cursor-pointer font-bold"
                    >
                      Complete →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-[#13151f] border border-[#434656]/30 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#434656]/20">
              <h3 className="text-sm font-bold font-geist text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Completed ({completedTasks.length})
              </h3>
            </div>

            <div className="space-y-3 opacity-75">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-[#191b25] border border-emerald-500/20 rounded-xl p-4 space-y-2 cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <h4 className="text-sm font-bold font-geist text-white line-through">
                    {task.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3 bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border border-[#434656]/20 hover:border-[#0052ff]/40 flex items-center justify-between gap-4 transition-all ${
                task.completed ? 'opacity-60 bg-[#13151f]' : 'bg-[#13151f]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleProdTask(task.id)}
                  className={`p-1 rounded cursor-pointer ${task.completed ? 'text-emerald-400' : 'text-[#434656] hover:text-white'}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className={`text-sm font-bold font-geist text-white ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-[#c3c5d9]">
                <span>{task.dueDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#0052ff]" /> {task.estimatedMinutes}m</span>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#252836] text-white hover:bg-[#0052ff] cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTask={selectedTask}
        onSave={task => {
          if ('id' in task) {
            updateProdTask(task as ProductivityTask);
          } else {
            addProdTask(task);
          }
        }}
        onDelete={id => deleteProdTask(id)}
      />
    </div>
  );
};
