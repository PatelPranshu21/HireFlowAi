import React, { useState } from 'react';
import { ExternalLink, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { JobRecommendation } from '../types';

interface MarkAsAppliedModalProps {
  isOpen: boolean;
  job: JobRecommendation | null;
  onClose: () => void;
  onConfirm: (job: JobRecommendation) => Promise<{ success: boolean; isDuplicate?: boolean; currentStatus?: string }>;
}

export const MarkAsAppliedModal: React.FC<MarkAsAppliedModalProps> = ({
  isOpen,
  job,
  onClose,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isDuplicate?: boolean; currentStatus?: string } | null>(null);

  if (!isOpen || !job) return null;

  const handleMarkApplied = async () => {
    setLoading(true);
    setFeedback(null);
    const result = await onConfirm(job);
    setLoading(false);

    if (result.isDuplicate) {
      setFeedback({ isDuplicate: true, currentStatus: result.currentStatus || 'Applied' });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 2500);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#191b25] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-geist text-white">Did you apply?</h3>
            <p className="text-xs font-mono text-white/60 mt-0.5">
              We opened the application link for <span className="text-white font-semibold">{job.title}</span> at <span className="text-blue-400 font-semibold">{job.company}</span>.
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback?.isDuplicate && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Application already tracked (Status: <strong>{feedback.currentStatus}</strong>).</span>
          </div>
        )}

        <p className="text-xs text-white/70 bg-[#11131c] border border-white/5 p-3 rounded-xl">
          Tracking your applications helps calculate your conversion rates, interview velocity, and skill match insights in your Analytics dashboard.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-mono font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            Not yet
          </button>
          
          <button
            onClick={handleMarkApplied}
            disabled={loading}
            className="px-5 py-2 text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 text-white" />
            )}
            Mark as Applied
          </button>
        </div>

      </div>
    </div>
  );
};
