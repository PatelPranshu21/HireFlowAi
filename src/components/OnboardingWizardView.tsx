import React, { useState, useEffect } from 'react';
import { UserProfile, NavigationTab } from '../types';
import { UserService } from '../services/userService';
import { 
  Sparkles, 
  User, 
  Briefcase, 
  Target, 
  Upload, 
  Code2, 
  MapPin, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Building2, 
  DollarSign, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Clock,
  X
} from 'lucide-react';

interface OnboardingWizardViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigate: (tab: NavigationTab) => void;
  onUploadResumeFile?: (file: File) => Promise<void>;
}

export const OnboardingWizardView: React.FC<OnboardingWizardViewProps> = ({
  user,
  onUpdateUser,
  onNavigate,
  onUploadResumeFile
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Basic Profile
  const [name, setName] = useState<string>(user.name || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [title, setTitle] = useState<string>(user.title || 'Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState<string>(user.experienceLevel || 'Mid Level');

  // Step 2: Career Goal
  const [targetRole, setTargetRole] = useState<string>(user.targetRole || 'Senior Full Stack Engineer');
  const [targetIndustry, setTargetIndustry] = useState<string>(
    user.preferences?.preferredIndustries?.[0] || 'Software & Technology'
  );
  const [salaryMin, setSalaryMin] = useState<number>(user.preferences?.expectedSalaryMin || 110000);
  const [salaryMax, setSalaryMax] = useState<number>(user.preferences?.expectedSalaryMax || 160000);

  // Step 3: Upload Resume (Optional)
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>(user.resumeText || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [resumeUploaded, setResumeUploaded] = useState<boolean>(
    Boolean((user.resumeVersions && user.resumeVersions.length > 0) || user.resumeText)
  );

  // Step 4: Skills Review
  const popularSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'System Design', 'GraphQL', 
    'AWS', 'Docker', 'Product Management', 'SQL', 'PostgreSQL', 'Tailwind CSS',
    'CI/CD', 'REST APIs', 'Data Structures', 'Microservices', 'Kubernetes'
  ];
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user.skills && user.skills.length > 0 
      ? user.skills 
      : ['React', 'TypeScript', 'Node.js', 'System Design', 'SQL']
  );
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Step 5: Job Preferences
  const [remotePref, setRemotePref] = useState<'Remote' | 'Hybrid' | 'On-site' | 'Any'>(
    user.preferences?.remotePreference || 'Remote'
  );
  const [locations, setLocations] = useState<string[]>(
    user.preferences?.preferredCities || ['San Francisco, CA', 'New York, NY', 'Remote']
  );
  const [locationInput, setLocationInput] = useState<string>('');
  const [targetCompanies, setTargetCompanies] = useState<string[]>(
    user.preferences?.preferredCompanies || ['Google', 'Stripe', 'OpenAI', 'Meta']
  );
  const [companyInput, setCompanyInput] = useState<string>('');

  // Transition / Loading State
  const [isGeneratingWorkspace, setIsGeneratingWorkspace] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [completedChecklist, setCompletedChecklist] = useState<number[]>([]);

  // File Upload handler for Step 3
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    if (!validExtensions.includes(extension)) {
      alert("Invalid file format! Please upload a PDF, DOCX, or TXT document.");
      return;
    }

    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      if (onUploadResumeFile) {
        await onUploadResumeFile(file);
      } else {
        // Fallback simulation
        await new Promise(resolve => setTimeout(resolve, 800));
        setResumeText(`Extracted text from ${file.name}\n\nExperience: Senior Software Engineer\nSkills: React, TypeScript, Node.js, Cloud Computing`);
      }
      setResumeUploaded(true);
    } catch (err: any) {
      if (err.message === 'LIMIT_REACHED' && err.details) {
        if ((window as any).__showLimitReachedModal) {
          (window as any).__showLimitReachedModal(err.details);
        }
      } else {
        alert(err.message || "Resume upload error. Please try again.");
      }
      console.error("Resume upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    if (!selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
    }
    setCustomSkillInput('');
  };

  const handleAddLocation = () => {
    if (!locationInput.trim()) return;
    if (!locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
    }
    setLocationInput('');
  };

  const handleAddCompany = () => {
    if (!companyInput.trim()) return;
    if (!targetCompanies.includes(companyInput.trim())) {
      setTargetCompanies([...targetCompanies, companyInput.trim()]);
    }
    setCompanyInput('');
  };

  // Trigger AI Workspace Generation
  const handleCompleteSetup = () => {
    const onboardingPayload: Partial<UserProfile> = {
      name,
      phone,
      title,
      experienceLevel,
      targetRole,
      skills: selectedSkills.length > 0 ? selectedSkills : (user.skills || []),
      hasUploadedResume: Boolean(user.hasUploadedResume || resumeUploaded),
      atsScore: user.atsScore || 0,
      hasCompletedOnboarding: true,
      preferences: {
        ...user.preferences,
        preferredRoles: [targetRole],
        preferredIndustries: [targetIndustry],
        expectedSalaryMin: salaryMin,
        expectedSalaryMax: salaryMax,
        remotePreference: remotePref,
        preferredCities: locations,
        preferredCompanies: targetCompanies
      }
    };

    // Save collected profile details to backend/PostgreSQL and local store
    onUpdateUser(onboardingPayload);
    UserService.saveOnboardingApi(onboardingPayload).catch(err => {
      console.error('Failed to sync onboarding to server:', err);
    });

    setIsGeneratingWorkspace(true);
  };

  // Simulate progress when generating workspace
  useEffect(() => {
    if (!isGeneratingWorkspace) return;

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const next = prev + 10;
        if (next >= 20 && !completedChecklist.includes(1)) setCompletedChecklist(c => [...c, 1]);
        if (next >= 45 && !completedChecklist.includes(2)) setCompletedChecklist(c => [...c, 2]);
        if (next >= 70 && !completedChecklist.includes(3)) setCompletedChecklist(c => [...c, 3]);
        if (next >= 90 && !completedChecklist.includes(4)) setCompletedChecklist(c => [...c, 4]);
        
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onUpdateUser({ hasCompletedOnboarding: true });
            onNavigate('dashboard');
          }, 600);
          return 100;
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isGeneratingWorkspace, completedChecklist, onUpdateUser, onNavigate]);

  // Loading Screen: Generating AI Workspace
  if (isGeneratingWorkspace) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F9FAFB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Glowing Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full bg-[#0d0e15] border border-[#2a2d3d] rounded-2xl p-8 shadow-2xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-geist text-white">Generating AI Workspace...</h2>
            <p className="text-xs font-mono text-[#a1a3b8] mt-1">Configuring personalized career intelligence & match algorithms</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-[#a1a3b8]">
              <span>Setting up engine</span>
              <span className="text-blue-400 font-bold">{generationProgress}%</span>
            </div>
            <div className="w-full bg-[#161824] h-2.5 rounded-full overflow-hidden border border-[#2a2d3d]">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>

          {/* Status Checklist */}
          <div className="text-left space-y-2.5 pt-2">
            {[
              { id: 1, label: 'Analyzing profile & career goals' },
              { id: 2, label: 'Configuring AI Career Coach & ATS parser' },
              { id: 3, label: 'Indexing skill vector matrices & job matches' },
              { id: 4, label: 'Preparing personalized dashboard & interview modules' }
            ].map(item => {
              const isDone = completedChecklist.includes(item.id);
              return (
                <div key={item.id} className="flex items-center gap-3 text-xs font-mono">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                  )}
                  <span className={isDone ? 'text-white font-medium' : 'text-[#a1a3b8]'}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9FAFB] flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#2a2d3d]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold font-geist text-white tracking-tight">HireFlow AI</span>
            <p className="text-[11px] font-mono text-[#a1a3b8]">Precision Career Engineering</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#a1a3b8]">Step {step} of {totalSteps}</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(s => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-blue-500' : s < step ? 'w-2.5 bg-emerald-500' : 'w-2.5 bg-[#2a2d3d]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8">
        {/* Step 1: Basic Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold mb-3">
                <User className="w-3.5 h-3.5" /> Step 1: Basic Profile
              </div>
              <h1 className="text-3xl font-light font-geist text-white tracking-tight">
                Welcome to HireFlow AI! 👋
              </h1>
              <p className="text-sm font-mono text-[#a1a3b8] mt-1">
                Let's set up your profile details to customize your AI career workspace.
              </p>
            </div>

            <div className="bg-[#0d0e15] border border-[#2a2d3d] rounded-2xl p-6 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                  Full Name
                </label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input 
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                    Current Professional Headline
                  </label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Management'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(level)}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        experienceLevel === level
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md'
                          : 'bg-[#161824] border-[#2a2d3d] text-[#a1a3b8] hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Career Goal */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold mb-3">
                <Target className="w-3.5 h-3.5" /> Step 2: Career Goal
              </div>
              <h1 className="text-3xl font-light font-geist text-white tracking-tight">
                What is your next career move? 🎯
              </h1>
              <p className="text-sm font-mono text-[#a1a3b8] mt-1">
                Define your target role & compensation to calibrate job matching telemetry.
              </p>
            </div>

            <div className="bg-[#0d0e15] border border-[#2a2d3d] rounded-2xl p-6 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                  Target Job Title / Role
                </label>
                <input 
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer / Tech Lead"
                  className="w-full bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                  Target Industry
                </label>
                <select
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 font-sans"
                >
                  <option value="Software & Technology">Software & Technology</option>
                  <option value="Finance & Fintech">Finance & Fintech</option>
                  <option value="Healthcare & Tech">Healthcare & Tech</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                    Expected Min Salary ($/yr)
                  </label>
                  <input 
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    step="5000"
                    className="w-full bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                    Expected Max Salary ($/yr)
                  </label>
                  <input 
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    step="5000"
                    className="w-full bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Upload Resume (Optional) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold mb-3">
                <FileText className="w-3.5 h-3.5" /> Step 3: Upload Resume (Optional)
              </div>
              <h1 className="text-3xl font-light font-geist text-white tracking-tight">
                Upload your resume 📄
              </h1>
              <p className="text-sm font-mono text-[#a1a3b8] mt-1">
                Uploading your resume enables instant ATS score calculation & AI section analysis. You can also skip this and upload later.
              </p>
            </div>

            <div className="bg-[#0d0e15] border border-[#2a2d3d] rounded-2xl p-6 space-y-6 shadow-xl text-center">
              {resumeUploaded ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold font-geist text-white">Resume Attached Successfully!</h3>
                  <p className="text-xs font-mono text-emerald-300">
                    {uploadedFileName || 'Your resume has been indexed into the AI Career Engine.'}
                  </p>
                  <label className="inline-block text-xs font-mono text-blue-400 underline cursor-pointer hover:text-blue-300 pt-2">
                    Upload a different file
                    <input type="file" accept=".docx" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#2a2d3d] hover:border-blue-500/50 rounded-2xl p-8 transition-all bg-[#11131c]/50 relative">
                  <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-sm font-bold font-geist text-white mb-1">Drag & drop your resume file</h3>
                  <p className="text-xs font-mono text-[#a1a3b8] mb-4">Supports DOCX up to 10MB</p>
                  
                  <label className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all inline-flex items-center gap-2 shadow-lg shadow-blue-500/20">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Browse Computer
                    <input type="file" accept=".docx" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                  </label>
                </div>
              )}

              {/* Paste Text Option */}
              <div className="text-left">
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                  Or Paste Resume Content Below
                </label>
                <textarea 
                  rows={4}
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (e.target.value.trim().length > 20) setResumeUploaded(true);
                  }}
                  placeholder="Paste your resume text here to analyze ATS score..."
                  className="w-full bg-[#161824] border border-[#2a2d3d] rounded-xl p-3 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Explicit Skip Note */}
              <div className="pt-2 border-t border-[#2a2d3d] flex items-center justify-between text-xs font-mono text-[#a1a3b8]">
                <span>Want to skip uploading right now?</span>
                <span className="text-amber-400 text-[11px]">You can upload anytime from the Dashboard!</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Skills Review */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-3">
                <Code2 className="w-3.5 h-3.5" /> Step 4: Skills Review
              </div>
              <h1 className="text-3xl font-light font-geist text-white tracking-tight">
                Confirm your key competencies ⚡
              </h1>
              <p className="text-sm font-mono text-[#a1a3b8] mt-1">
                Select your primary skills and technologies to power job match score rankings.
              </p>
            </div>

            <div className="bg-[#0d0e15] border border-[#2a2d3d] rounded-2xl p-6 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-2">
                  Popular Skills (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {popularSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-sm'
                            : 'bg-[#161824] border border-[#2a2d3d] text-[#a1a3b8] hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                  Add Custom Skill
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill())}
                    placeholder="e.g. Next.js, Redis, Go"
                    className="flex-1 bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="bg-[#161824] hover:bg-[#2a2d3d] text-white border border-[#2a2d3d] px-4 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Skills Summary */}
              <div>
                <span className="text-[11px] font-mono text-[#a1a3b8] uppercase">Selected ({selectedSkills.length}):</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedSkills.map(skill => (
                    <span 
                      key={skill}
                      className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-2.5 py-1 rounded-md flex items-center gap-1"
                    >
                      {skill}
                      <button onClick={() => handleToggleSkill(skill)} className="hover:text-red-400 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Job Preferences */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-3">
                <MapPin className="w-3.5 h-3.5" /> Step 5: Job Preferences
              </div>
              <h1 className="text-3xl font-light font-geist text-white tracking-tight">
                Where do you want to work? 🏢
              </h1>
              <p className="text-sm font-mono text-[#a1a3b8] mt-1">
                Specify work environment & location preferences for targeted job alerts.
              </p>
            </div>

            <div className="bg-[#0d0e15] border border-[#2a2d3d] rounded-2xl p-6 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-2">
                  Workplace Preference
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Remote', 'Hybrid', 'On-site', 'Any'] as const).map(pref => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setRemotePref(pref)}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        remotePref === pref
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-[#161824] border-[#2a2d3d] text-[#a1a3b8] hover:text-white'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                  Preferred Job Locations
                </label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                    placeholder="e.g. Austin, TX or Remote"
                    className="flex-1 bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="bg-[#161824] hover:bg-[#2a2d3d] text-white border border-[#2a2d3d] px-4 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {locations.map(loc => (
                    <span key={loc} className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono px-2.5 py-1 rounded-md flex items-center gap-1">
                      {loc}
                      <button onClick={() => setLocations(locations.filter(l => l !== loc))} className="hover:text-red-400 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#a1a3b8] uppercase mb-1.5">
                  Target Companies (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompany())}
                    placeholder="e.g. Apple, Netflix"
                    className="flex-1 bg-[#161824] border border-[#2a2d3d] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompany}
                    className="bg-[#161824] hover:bg-[#2a2d3d] text-white border border-[#2a2d3d] px-4 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {targetCompanies.map(comp => (
                    <span key={comp} className="bg-white/5 border border-white/10 text-white/80 text-xs font-mono px-2.5 py-1 rounded-md flex items-center gap-1">
                      {comp}
                      <button onClick={() => setTargetCompanies(targetCompanies.filter(c => c !== comp))} className="hover:text-red-400 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Navigation Footer */}
      <div className="max-w-3xl w-full mx-auto pt-6 border-t border-[#2a2d3d]/50 flex items-center justify-between">
        <button
          type="button"
          onClick={() => step > 1 && setStep(step - 1)}
          disabled={step === 1}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            step === 1 
              ? 'opacity-30 cursor-not-allowed text-[#a1a3b8]' 
              : 'bg-[#161824] hover:bg-[#2a2d3d] text-white border border-[#2a2d3d]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3">
          {/* Skip option for Step 3 Resume upload */}
          {step === 3 && !resumeUploaded && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="text-xs font-mono text-[#a1a3b8] hover:text-white px-3 py-2 cursor-pointer underline"
            >
              Skip for now
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2 active:scale-95"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteSetup}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono text-xs font-bold px-8 py-3 rounded-xl transition-all shadow-xl shadow-blue-500/25 cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4" /> Generate AI Workspace
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
