import React, { useState } from 'react';
import { ResumeVersion } from '../../types';
import { 
  Layers, 
  Check, 
  Download, 
  Copy, 
  Edit3, 
  Trash2, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Briefcase 
} from 'lucide-react';

interface ResumeVersionManagerTabProps {
  versions: ResumeVersion[];
  activeVersionId: string;
  onSetActiveVersion: (id: string) => void;
  onDuplicateVersion: (version: ResumeVersion) => void;
  onRenameVersion: (id: string, newName: string) => void;
  onDeleteVersion: (id: string) => void;
  onDownloadVersion: (version: ResumeVersion, format: 'PDF' | 'DOCX' | 'TXT') => void;
  onOpenUploadModal: () => void;
}

export const ResumeVersionManagerTab: React.FC<ResumeVersionManagerTabProps> = ({
  versions,
  activeVersionId,
  onSetActiveVersion,
  onDuplicateVersion,
  onRenameVersion,
  onDeleteVersion,
  onDownloadVersion,
  onOpenUploadModal
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const startRename = (v: ResumeVersion) => {
    setEditingId(v.id);
    setEditingName(v.versionName);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameVersion(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052ff]/15 text-[#b7c4ff] text-xs font-mono mb-2">
              <Layers className="w-3.5 h-3.5 text-[#4cd7f6]" /> Multi-Version Control
            </div>
            <h2 className="text-2xl font-bold font-geist text-white">
              Resume Version Manager
            </h2>
            <p className="text-xs text-[#c3c5d9] mt-0.5">
              Organize, switch, duplicate, and download targeted versions tailored for specific roles or companies.
            </p>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="px-4 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/25"
          >
            <Plus className="w-4 h-4" /> Upload New Version
          </button>
        </div>
      </div>

      {/* Version Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {versions.map(v => {
          const isActive = v.id === activeVersionId;

          return (
            <div 
              key={v.id}
              className={`bg-[#191b25] border rounded-2xl p-6 transition-all flex flex-col justify-between shadow-xl relative ${
                isActive 
                  ? 'border-[#0052ff] bg-gradient-to-b from-[#1d1f29] to-[#141620] ring-2 ring-[#0052ff]/30' 
                  : 'border-[#434656]/30 hover:border-[#b7c4ff]/40'
              }`}
            >
              <div>
                {/* Top status bar */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#282934] rounded-xl text-[#4cd7f6] border border-[#434656]/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      {editingId === v.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-[#11131c] border border-[#0052ff] rounded px-2 py-1 text-xs text-white font-bold"
                            autoFocus
                          />
                          <button 
                            onClick={() => saveRename(v.id)} 
                            className="text-xs text-green-400 font-mono underline"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-base font-bold font-geist text-white flex items-center gap-2">
                          {v.versionName}
                          <button 
                            onClick={() => startRename(v)} 
                            className="text-[#8d90a2] hover:text-white p-0.5 rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </h3>
                      )}
                      <p className="text-[10px] font-mono text-[#8d90a2]">
                        {v.fileName} • {v.uploadedAt}
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 font-mono text-xs rounded-full font-bold flex items-center gap-1 border border-green-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Master
                    </span>
                  ) : (
                    <button
                      onClick={() => onSetActiveVersion(v.id)}
                      className="px-3 py-1 bg-[#282934] hover:bg-[#0052ff] text-[#c3c5d9] hover:text-white font-mono text-xs rounded-full font-medium transition-colors cursor-pointer"
                    >
                      Make Active
                    </button>
                  )}
                </div>

                {/* Badges & Stats */}
                <div className="grid grid-cols-3 gap-2 bg-[#11131c] p-3 rounded-xl border border-[#434656]/20 mb-4">
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-[#8d90a2] block">ATS Score</span>
                    <span className="text-lg font-bold font-mono text-[#4cd7f6]">{v.score !== undefined && v.score > 0 ? `${v.score}%` : '0%'}</span>
                  </div>
                  <div className="text-center border-x border-[#434656]/20">
                    <span className="text-[10px] font-mono text-[#8d90a2] block">Matched Jobs</span>
                    <span className="text-lg font-bold font-mono text-white">{v.jobsMatchedCount ?? 0}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-[#8d90a2] block">Template</span>
                    <span className="text-xs font-mono text-[#b7c4ff] uppercase font-semibold mt-1 block">
                      {v.template || 'Modern'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#434656]/30">
                <div className="flex gap-2">
                  <button
                    onClick={() => onDownloadVersion(v, 'PDF')}
                    className="px-3 py-1.5 bg-[#282934] hover:bg-[#32343f] text-[#e1e1ef] rounded-lg text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer border border-[#434656]/30"
                  >
                    <Download className="w-3.5 h-3.5 text-[#4cd7f6]" /> PDF
                  </button>
                  <button
                    onClick={() => onDownloadVersion(v, 'DOCX')}
                    className="px-3 py-1.5 bg-[#282934] hover:bg-[#32343f] text-[#e1e1ef] rounded-lg text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer border border-[#434656]/30"
                  >
                    <Download className="w-3.5 h-3.5 text-[#b7c4ff]" /> DOCX
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onDuplicateVersion(v)}
                    className="p-2 text-[#c3c5d9] hover:text-white hover:bg-[#282934] rounded-lg transition-colors cursor-pointer"
                    title="Duplicate Version"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {versions.length > 1 && (
                    <button
                      onClick={() => onDeleteVersion(v.id)}
                      className="p-2 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Version"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
