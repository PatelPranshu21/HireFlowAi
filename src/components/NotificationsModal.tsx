import React from 'react';
import { NotificationItem } from '../types';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllRead
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-[#1d1f29] border-l border-[#434656]/30 w-full max-w-md h-full p-6 flex flex-col gap-4 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center border-b border-[#434656]/30 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#4cd7f6]" />
            <h3 className="text-lg font-bold text-white font-geist">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onMarkAllRead}
              className="text-xs font-mono text-[#b7c4ff] hover:underline cursor-pointer"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="text-[#c3c5d9] hover:text-white cursor-pointer ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#11131c] border border-[#434656]/30 flex items-center justify-center text-[#8d90a2]">
                <Bell className="w-6 h-6 text-[#8d90a2]" />
              </div>
              <h4 className="text-sm font-bold text-white font-geist">No Notifications Yet</h4>
              <p className="text-xs text-[#8d90a2] max-w-xs leading-relaxed">
                Notifications generate automatically from your real career activities (analyzing resumes, submitting job applications, scheduling interviews, and managing subscriptions).
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div 
                key={item.id}
                className={`p-4 rounded-xl border transition-colors ${
                  item.read 
                    ? 'bg-[#191b25]/60 border-[#434656]/20' 
                    : 'bg-[#191b25] border-[#0052ff]/40 ai-gradient-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  {(item.type === 'alert' || item.type === 'warning') && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                  {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />}
                  {item.type === 'info' && <Info className="w-5 h-5 text-[#4cd7f6] shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[#e1e1ef] font-geist">{item.title}</h4>
                    <p className="text-xs text-[#c3c5d9] mt-1 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] font-mono text-[#8d90a2] mt-2 block">{item.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
