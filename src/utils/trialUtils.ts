export interface TrialRemainingTime {
  days: number;
  hours: number;
  totalHours: number;
  isExpired: boolean;
  displayText: string;
}

export const TRIAL_DURATION_HOURS = 72;
export const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;

export function calculateTrialRemaining(trialStartDate?: string, trialExpiryDate?: string): TrialRemainingTime {
  if (!trialExpiryDate) {
    return {
      days: 0,
      hours: 0,
      totalHours: 0,
      isExpired: true,
      displayText: 'Trial Expired'
    };
  }

  const now = Date.now();
  const expiryTime = new Date(trialExpiryDate).getTime();
  const startTime = trialStartDate ? new Date(trialStartDate).getTime() : expiryTime - TRIAL_DURATION_MS;

  const diffMs = expiryTime - now;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      totalHours: 0,
      isExpired: true,
      displayText: 'Trial Expired'
    };
  }

  // Calculate elapsed time in full hours since trial start
  const elapsedMs = Math.max(0, now - startTime);
  const hoursElapsed = Math.floor(elapsedMs / (1000 * 60 * 60));

  // Remaining hours from the original 72-hour period (max 72)
  const totalHoursRemaining = Math.max(1, TRIAL_DURATION_HOURS - hoursElapsed);

  const days = Math.floor(totalHoursRemaining / 24);
  const hours = totalHoursRemaining % 24;

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
    totalHours: totalHoursRemaining,
    isExpired: false,
    displayText
  };
}
