import React, { useState } from 'react';
import { UserProfile, ParsedResumeData, UploadHistoryItem } from '../../types';
import { checkEntitlement } from '../../data/planConfig';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  User, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  Save, 
  Trash2,
  Plus,
  Loader2,
  Lock,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ResumeUploadParserModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveParsedResume: (parsedData: ParsedResumeData, fileName: string, fileText: string) => void;
  onSyncWithProfilePrompt: (parsedData: ParsedResumeData) => void;
}

const mockUploadHistory: UploadHistoryItem[] = [
  {
    id: 'uh_1',
    fileName: 'master_resume_v2.pdf',
    uploadDate: '2026-07-25 14:45',
    fileSize: '184 KB',
    versionName: 'Software Engineer - Master',
    parsingStatus: 'Parsed ✓',
    fileType: 'PDF'
  },
  {
    id: 'uh_2',
    fileName: 'tailored_stripe_frontend.pdf',
    uploadDate: '2026-07-24 16:15',
    fileSize: '192 KB',
    versionName: 'Tailored Stripe Frontend',
    parsingStatus: 'Parsed ✓',
    fileType: 'PDF'
  },
  {
    id: 'uh_3',
    fileName: 'master_resume_v1.docx',
    uploadDate: '2026-07-22 09:30',
    fileSize: '142 KB',
    versionName: 'master_resume_v1',
    parsingStatus: 'Parsed ✓',
    fileType: 'DOCX'
  }
];

export const ResumeUploadParserModal: React.FC<ResumeUploadParserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveParsedResume,
  onSyncWithProfilePrompt
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileText, setUploadedFileText] = useState<string>('');
  const [history, setHistory] = useState<UploadHistoryItem[]>(mockUploadHistory);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  const entitlement = checkEntitlement(user, 'resumeUploads');
  const isUploadAllowed = entitlement.allowed;

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadAllowed) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setUploadError(null);

    // Verify subscription and plan limits before uploading
    if (!isUploadAllowed) {
      setUploadError(entitlement.message);
      if ((window as any).__showLimitReachedModal) {
        (window as any).__showLimitReachedModal(entitlement);
      }
      return;
    }

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    const validTypes = ['.pdf', '.docx', '.doc', '.txt'];
    if (!validTypes.includes(extension)) {
      setUploadError("Invalid file format! Please upload a PDF, DOCX, DOC, or TXT document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds limit (10MB maximum).");
      return;
    }

    setUploadedFileName(file.name);
    setIsParsing(true);
    setUploadProgress(25);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = (evt.target?.result as string) || '';
      setUploadProgress(50);

      try {
        const res = await fetch('/api/ai/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData: base64Data, fileName: file.name })
        });
        const data = await res.json();
        if (!res.ok || data.extractionSuccess === false || !data.text) {
          if (res.status === 403 && data.details) {
            if ((window as any).__showLimitReachedModal) {
              (window as any).__showLimitReachedModal(data.details);
            }
          }
          throw new Error(data.message || data.error || "Text extraction failed: No selectable text found in uploaded file.");
        }
        const extractedText = data.text || data.extractedText;
        setUploadedFileText(extractedText);
        
        setUploadProgress(100);

        const newParsed: ParsedResumeData = {
          fullName: data.fullName || user.name || "",
          email: data.email || user.email || "",
          phone: data.phone || user.phone || "",
          linkedIn: data.linkedIn || user.linkedInUrl || "",
          gitHub: data.gitHub || user.gitHubUrl || "",
          portfolio: data.portfolio || user.portfolioUrl || "",
          summary: data.summary || "",
          education: data.education || [],
          experience: data.experience || [],
          projects: data.projects || [],
          skills: data.skills || [],
          certifications: data.certifications || [],
          languages: data.languages || [],
          achievements: data.achievements || []
        };

        setParsedData(newParsed);

        // Add to history
        const newHistoryItem: UploadHistoryItem = {
          id: Date.now().toString(),
          fileName: file.name,
          uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          fileSize: `${Math.round(file.size / 1024)} KB`,
          versionName: file.name,
          parsingStatus: 'Parsed ✓',
          fileType: (data.fileType || extension.toUpperCase().replace('.', '')) as any
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      } catch (err: any) {
        console.error("Parsing error:", err);
        setUploadError(err.message || "Failed to extract text from document. Please ensure the file contains selectable text.");
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleSaveAndSync = async () => {
    if (isSubmitting || isParsing || !parsedData) return;
    setIsSubmitting(true);
    try {
      await onSaveParsedResume(parsedData, uploadedFileName, uploadedFileText);
      onSyncWithProfilePrompt(parsedData);
      onClose();
    } catch (err: any) {
      if (err.message === 'LIMIT_REACHED' && err.details) {
        if ((window as any).__showLimitReachedModal) {
          (window as any).__showLimitReachedModal(err.details);
        }
      } else {
        alert(err.message || 'An error occurred while uploading.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-[#191b25] border border-[#434656]/40 rounded-2xl max-w-4xl w-full flex flex-col my-auto max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#434656]/30 bg-[#1d1f29]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0052ff]/20 rounded-lg text-[#b7c4ff]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-geist text-[#e1e1ef]">Resume Upload &amp; AI Parser</h3>
              <p className="text-xs text-[#c3c5d9]">Supported formats: DOCX (Max 10MB)</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 text-[#c3c5d9] hover:text-white rounded-lg hover:bg-[#282934] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex border-b border-[#434656]/30 bg-[#11131c] px-6 pt-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'upload' ? 'text-[#b7c4ff] border-[#b7c4ff]' : 'text-[#8d90a2] border-transparent hover:text-white'
            }`}
          >
            Upload &amp; Edit Extracted Data
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-mono font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'history' ? 'text-[#b7c4ff] border-[#b7c4ff]' : 'text-[#8d90a2] border-transparent hover:text-white'
            }`}
          >
            Upload History ({history.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'upload' && (
            <>
              {/* Drag and Drop Zone */}
              {!parsedData && (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all ${
                    dragActive 
                      ? 'border-[#0052ff] bg-[#0052ff]/10 scale-[1.01]' 
                      : 'border-[#434656]/50 bg-[#11131c]/60 hover:bg-[#11131c] hover:border-[#b7c4ff]/50'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                    id="resume-file-input"
                  />

                  {!isUploadAllowed ? (
                    <div className="space-y-4 py-6 max-w-md mx-auto">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                        {entitlement.reason === 'trial_expired' ? (
                          <Clock className="w-7 h-7" />
                        ) : (
                          <Lock className="w-7 h-7" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-geist">
                          {entitlement.reason === 'trial_expired'
                            ? '3-Day Free Trial Expired'
                            : 'Resume Upload Limit Reached'}
                        </h4>
                        <p className="text-xs text-[#c3c5d9] mt-1.5 leading-relaxed">
                          {entitlement.message}
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if ((window as any).__showLimitReachedModal) {
                              (window as any).__showLimitReachedModal(entitlement);
                            }
                          }}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-blue-500/25 inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-blue-200" />
                          Upgrade Plan to Upload Resumes
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : isParsing ? (
                    <div className="space-y-4 py-6">
                      <RefreshCw className="w-10 h-10 text-[#4cd7f6] animate-spin mx-auto" />
                      <div>
                        <h4 className="text-base font-bold text-white font-geist">
                          {uploadProgress < 35 && "Step 1/3: Resume Uploading..."}
                          {uploadProgress >= 35 && uploadProgress < 70 && "Step 2/3: AI Resume Parsing..."}
                          {uploadProgress >= 70 && "Step 3/3: Running ATS Analysis & Scoring..."}
                        </h4>
                        <p className="text-xs text-[#c3c5d9] mt-1">Extracting structure, calculating compatibility, and generating suggestions...</p>
                      </div>

                      {/* 3 Step Visual Badges */}
                      <div className="grid grid-cols-3 gap-2 w-full max-w-md mx-auto pt-2">
                        <div className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all ${
                          uploadProgress >= 35 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Resume Upload
                        </div>
                        <div className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all ${
                          uploadProgress >= 70 ? 'bg-green-500/10 border-green-500/30 text-green-400' : uploadProgress >= 35 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse' : 'bg-[#282934] border-[#434656]/30 text-[#8d90a2]'
                        }`}>
                          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${uploadProgress >= 35 && uploadProgress < 70 ? 'animate-spin' : ''}`} /> Resume Parsing
                        </div>
                        <div className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all ${
                          uploadProgress >= 100 ? 'bg-green-500/10 border-green-500/30 text-green-400' : uploadProgress >= 70 ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 animate-pulse' : 'bg-[#282934] border-[#434656]/30 text-[#8d90a2]'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Resume Analysis
                        </div>
                      </div>

                      <div className="w-64 mx-auto bg-[#282934] h-2 rounded-full overflow-hidden mt-3">
                        <div className="bg-[#4cd7f6] h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="resume-file-input" className="cursor-pointer space-y-3">
                      <div className="w-14 h-14 rounded-full bg-[#282934] border border-[#434656]/40 flex items-center justify-center mx-auto text-[#b7c4ff]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-white">Drag and drop your resume file here</h4>
                        <p className="text-xs text-[#c3c5d9] mt-1 font-mono">or click to browse your local computer</p>
                      </div>
                      <div className="inline-block px-3 py-1 bg-[#282934] text-[#b7c4ff] rounded-lg text-xs font-mono font-medium border border-[#434656]/30">
                        PDF, DOCX, DOC, TXT (up to 10MB)
                      </div>
                    </label>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-300 text-xs font-mono">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  {uploadError}
                </div>
              )}

              {/* Extracted Data Form / Editor */}
              {parsedData && (
                <div className="space-y-6 bg-[#11131c] border border-[#434656]/30 rounded-2xl p-6">
                  <div className="flex justify-between items-center border-b border-[#434656]/30 pb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <h4 className="text-base font-bold font-geist text-white">Extracted Resume Intelligence</h4>
                    </div>
                    <button
                      onClick={() => setParsedData(null)}
                      className="text-xs font-mono text-[#8d90a2] hover:text-white underline cursor-pointer"
                    >
                      Re-upload File
                    </button>
                  </div>

                  {/* Personal & Contact Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-[#8d90a2] block mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Full Name
                      </label>
                      <input
                        type="text"
                        value={parsedData.fullName}
                        onChange={(e) => setParsedData({ ...parsedData, fullName: e.target.value })}
                        className="w-full bg-[#191b25] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-[#8d90a2] block mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email Address
                      </label>
                      <input
                        type="email"
                        value={parsedData.email}
                        onChange={(e) => setParsedData({ ...parsedData, email: e.target.value })}
                        className="w-full bg-[#191b25] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-[#8d90a2] block mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Phone Number
                      </label>
                      <input
                        type="text"
                        value={parsedData.phone}
                        onChange={(e) => setParsedData({ ...parsedData, phone: e.target.value })}
                        className="w-full bg-[#191b25] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-[#8d90a2] block mb-1 flex items-center gap-1">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn URL
                      </label>
                      <input
                        type="text"
                        value={parsedData.linkedIn}
                        onChange={(e) => setParsedData({ ...parsedData, linkedIn: e.target.value })}
                        className="w-full bg-[#191b25] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
                      />
                    </div>
                  </div>

                  {/* Summary Field */}
                  <div>
                    <label className="text-xs font-mono text-[#8d90a2] block mb-1">
                      Professional Summary
                    </label>
                    <textarea
                      rows={3}
                      value={parsedData.summary}
                      onChange={(e) => setParsedData({ ...parsedData, summary: e.target.value })}
                      className="w-full bg-[#191b25] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-[#0052ff] leading-relaxed"
                    />
                  </div>

                  {/* Skills Field */}
                  <div>
                    <label className="text-xs font-mono text-[#8d90a2] block mb-1 flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" /> Parsed Skills (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={parsedData.skills.join(', ')}
                      onChange={(e) => setParsedData({ ...parsedData, skills: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full bg-[#191b25] border border-[#434656]/40 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#0052ff]"
                    />
                  </div>

                  {/* Experience Section */}
                  <div>
                    <h5 className="text-xs font-mono text-[#b7c4ff] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> Parsed Work Experience
                    </h5>
                    <div className="space-y-3">
                      {parsedData.experience.map((exp, idx) => (
                        <div key={exp.id || idx} className="bg-[#191b25] p-3 rounded-lg border border-[#434656]/30 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => {
                                const copy = [...parsedData.experience];
                                copy[idx].role = e.target.value;
                                setParsedData({ ...parsedData, experience: copy });
                              }}
                              placeholder="Role Title"
                              className="bg-[#11131c] border border-[#434656]/40 rounded px-2 py-1 text-xs text-white font-medium"
                            />
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const copy = [...parsedData.experience];
                                copy[idx].company = e.target.value;
                                setParsedData({ ...parsedData, experience: copy });
                              }}
                              placeholder="Company"
                              className="bg-[#11131c] border border-[#434656]/40 rounded px-2 py-1 text-xs text-white font-medium"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={exp.bullets.join('\n')}
                            onChange={(e) => {
                              const copy = [...parsedData.experience];
                              copy[idx].bullets = e.target.value.split('\n');
                              setParsedData({ ...parsedData, experience: copy });
                            }}
                            placeholder="Bullet points (one per line)"
                            className="w-full bg-[#11131c] border border-[#434656]/40 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={handleSaveAndSync}
                      disabled={isSubmitting || isParsing}
                      className="px-5 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0052ff]/25"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving &amp; Analyzing...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save &amp; Sync to Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold font-geist text-white">Upload History &amp; Parsing Log</h4>
              <div className="bg-[#11131c] border border-[#434656]/30 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#434656]/30 bg-[#191b25] text-[10px] font-mono text-[#8d90a2] uppercase">
                      <th className="p-3">File Name</th>
                      <th className="p-3">Version Name</th>
                      <th className="p-3">Upload Date</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#434656]/20 text-xs font-mono">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-[#1d1f29]/50 transition-colors">
                        <td className="p-3 text-white font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#4cd7f6]" /> {item.fileName}
                        </td>
                        <td className="p-3 text-[#b7c4ff]">{item.versionName}</td>
                        <td className="p-3 text-[#8d90a2]">{item.uploadDate}</td>
                        <td className="p-3 text-[#c3c5d9]">{item.fileSize}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 font-bold text-[10px]">
                            {item.parsingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
