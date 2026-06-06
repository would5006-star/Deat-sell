/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Calculates days, hours, minutes, and seconds left until the target ISO string.
 */
export function calculateTimeLeft(expiryDateStr: string | null | undefined): TimeLeft {
  if (!expiryDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  try {
    const difference = +new Date(expiryDateStr) - +new Date();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false,
    };
  } catch (e) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
}

/**
 * Helper to display remaining time as a sleek dynamic string.
 * Example: "3d 14h 25m" or "04:12:09" if less than 24h
 */
export function formatTimeLeft(timeLeft: TimeLeft): string {
  if (timeLeft.isExpired) {
    return 'Expired';
  }

  const { days, hours, minutes, seconds } = timeLeft;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');

  return `${h}:${m}:${s}`;
}
