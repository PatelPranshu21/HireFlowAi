export interface TrialRemainingTime {
  days: number;
  hours: number;
  totalHours: number;
  isExpired: boolean;
  isNotStarted: boolean;
  displayText: string;
}

export const TRIAL_DURATION_HOURS = 72;
export const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;

export function calculateTrialRemaining(trialStartDate?: string | null, trialExpiryDate?: string | null): TrialRemainingTime {
  if (!trialStartDate || !trialExpiryDate) {
    return {
      days: 3,
      hours: 0,
      totalHours: 72,
      isExpired: false,
      isNotStarted: true,
      displayText: '3 Days Remaining'
    };
  }

  const now = Date.now();
  const expiryTime = new Date(trialExpiryDate).getTime();
  const startTime = new Date(trialStartDate).getTime();

  const diffMs = expiryTime - now;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      totalHours: 0,
      isExpired: true,
      isNotStarted: false,
      displayText: 'Trial Expired'
    };
  }

  // Calculate remaining time
  const hoursRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  const days = Math.floor(hoursRemaining / 24);
  const hours = hoursRemaining % 24;

  let displayText = '';
  if (days === 3) {
    displayText = '3 Days Remaining';
  } else if (days > 0) {
    if (hours > 0) {
      displayText = `${days} Day${days > 1 ? 's' : ''} ${hours} Hour${hours > 1 ? 's' : ''} Remaining`;
    } else {
      displayText = `${days} Day${days > 1 ? 's' : ''} Remaining`;
    }
  } else {
    displayText = `${hours} Hour${hours > 1 ? 's' : ''} Remaining`;
  }

  return {
    days,
    hours,
    totalHours: hoursRemaining,
    isExpired: false,
    isNotStarted: false,
    displayText
  };
}
