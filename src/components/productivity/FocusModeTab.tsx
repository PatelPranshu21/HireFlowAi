import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles
} from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';
import { FocusSessionLog } from '../../types';

export const FocusModeTab: React.FC = () => {
  const {
    focusSessions,
    recordFocusSession,
    streaks,
    prodSettings
  } = useEcosystem();

  const [selectedMode, setSelectedMode] = useState<FocusSessionLog['mode']>('Interview Practice');
  const [timerMinutes, setTimerMinutes] = useState(prodSettings.defaultFocusLength || 25);
  const [secondsLeft, setSecondsLeft] = useState(timerMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeAmbient, setActiveAmbient] = useState<string>('Rain');

  // Sync initial seconds when preset changes while paused
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(timerMinutes * 60);
    }
  }, [timerMinutes]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      recordFocusSession(selectedMode, timerMinutes);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, selectedMode, timerMinutes, recordFocusSession]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(timerMinutes * 60);
  };

  const minsDisplay = Math.floor(secondsLeft / 60);
  const secsDisplay = secondsLeft % 60;
  const formattedTime = `${String(minsDisplay).padStart(2, '0')}:${String(secsDisplay).padStart(2, '0')}`;
  const totalSeconds = timerMinutes * 60;
  const progressPercent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-[#191b25] border border-[#434656]/30 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-geist text-white flex items-center gap-2">
              Focus Mode & Pomodoro Timer
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {streaks.totalFocusHours} Total Focus Hours
              </span>
            </h2>
            <p className="text-xs text-[#c3c5d9] font-mono mt-0.5">
              Distraction-free environment for deep interview prep, DSA problem solving and resume tailoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              soundEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-[#252836] text-[#c3c5d9]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? `Ambient: ${activeAmbient}` : 'Mute Ambient'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Display */}
        <div className="lg:col-span-2 bg-gradient-to-b from-[#191b25] to-[#13151f] border border-[#434656]/30 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden shadow-2xl">
          {/* Ambient Background Glow */}
          <div className={`absolute -inset-1 rounded-3xl opacity-20 blur-xl transition-all ${
            isRunning ? 'bg-[#0052ff]' : 'bg-purple-600'
          }`} />

          {/* Mode Selector */}
          <div className="relative z-10 flex flex-wrap justify-center gap-2 bg-[#13151f] p-1.5 rounded-2xl border border-[#434656]/30">
            {(['Interview Practice', 'Coding', 'Study', 'Resume Editing', 'Job Applications'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setSelectedMode(mode);
                  handleReset();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                  selectedMode === mode ? 'bg-[#571bc1] text-white font-bold shadow-md' : 'text-[#c3c5d9] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Big Timer Circle */}
          <div className="relative z-10 flex flex-col items-center my-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#252836" strokeWidth="6" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={isRunning ? '#0052ff' : '#571bc1'}
                  strokeWidth="6"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-mono font-bold text-white tracking-wider font-geist">
                  {formattedTime}
                </span>
                <span className="text-xs font-mono text-[#4cd7f6] mt-2 font-bold uppercase tracking-widest">
                  {selectedMode}
                </span>
              </div>
            </div>
          </div>

          {/* Preset Minute Options */}
          <div className="relative z-10 flex items-center gap-2">
            {[15, 25, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => {
                  setTimerMinutes(mins);
                  setIsRunning(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-colors ${
                  timerMinutes === mins ? 'bg-[#0052ff] text-white font-bold' : 'bg-[#252836] text-[#c3c5d9] hover:text-white'
                }`}
              >
                {mins} mins
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="relative z-10 flex items-center gap-4 pt-2">
            <button
              onClick={handleStartPause}
              className={`px-8 py-3.5 rounded-2xl text-sm font-mono font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#0052ff] hover:bg-[#0052ff]/90'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              {isRunning ? 'Pause Session' : 'Start Focus Session'}
            </button>

            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-[#252836] text-[#c3c5d9] hover:text-white hover:bg-[#32364a] cursor-pointer transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Focus Stats & Logs */}
        <div className="space-y-5">
          {/* Streak Stat */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-[#c3c5d9] uppercase">Learning Streak</span>
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400" /> {streaks.learningStreakDays} Days
              </span>
            </div>
            <div className="text-2xl font-bold font-geist text-white">
              {streaks.totalFocusHours} Focus Hours Completed
            </div>
          </div>

          {/* Ambient Sounds Picker */}
          {soundEnabled && (
            <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-mono text-[#c3c5d9] uppercase">Select Ambient Sound</span>
              <div className="grid grid-cols-2 gap-2">
                {['Rain', 'Lofi Beats', 'Deep Focus', 'White Noise'].map(sound => (
                  <button
                    key={sound}
                    onClick={() => setActiveAmbient(sound)}
                    className={`p-2.5 rounded-xl text-xs font-mono cursor-pointer transition-colors text-left ${
                      activeAmbient === sound ? 'bg-[#0052ff] text-white font-bold' : 'bg-[#13151f] text-[#c3c5d9] hover:text-white'
                    }`}
                  >
                    🎵 {sound}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session Logs */}
          <div className="bg-[#191b25] border border-[#434656]/30 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold font-geist text-white flex items-center justify-between">
              Recent Focus Logs
              <span className="text-xs font-mono text-[#c3c5d9]">{focusSessions.length} sessions</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {focusSessions.map(sess => (
                <div key={sess.id} className="p-3 bg-[#13151f] rounded-xl border border-[#434656]/20 flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-white font-bold block">{sess.mode}</span>
                      <span className="text-[10px] text-[#c3c5d9]">{sess.timestamp}</span>
                    </div>
                  </div>
                  <span className="text-[#4cd7f6] font-bold">{sess.durationMinutes} mins</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
