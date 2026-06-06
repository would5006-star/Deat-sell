/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { calculateTimeLeft, TimeLeft } from '../utils/timerUtils';

interface TimerProps {
  expiryDateStr: string;
  onExpired?: () => void;
  className?: string;
  showIcon?: boolean;
}

export default function Timer({ expiryDateStr, onExpired, className = '', showIcon = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(expiryDateStr));

  useEffect(() => {
    // Immediate calculation to prevent sync delays
    const initial = calculateTimeLeft(expiryDateStr);
    setTimeLeft(initial);
    if (initial.isExpired && onExpired) {
      onExpired();
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(expiryDateStr);
      setTimeLeft(remaining);
      
      if (remaining.isExpired) {
        clearInterval(timer);
        if (onExpired) {
          onExpired();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDateStr, onExpired]);

  if (timeLeft.isExpired) {
    return (
      <div className={`inline-flex items-center space-x-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent ${className}`} id="timer-expired">
        <span>Offer Expired</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className={`inline-flex items-center space-x-2 rounded-md bg-white/5 py-1 px-2 text-xs font-semibold tabular-nums border border-white/5 ${className}`} id="timer-active">
      {showIcon && <Clock className="h-3 w-3 text-[#FFD700] animate-pulse" />}
      <span className="text-[#FFD700]">Offer Ends in:</span>
      <div className="flex space-x-1">
        {days > 0 && (
          <span>
            <span className="text-white">{days}</span>
            <span className="text-white/40 ml-0.5 mr-1 font-sans">d</span>
          </span>
        )}
        <span>
          <span className="text-white">{String(hours).padStart(2, '0')}</span>
          <span className="text-white/40 ml-0.5 mr-1 font-sans">h</span>
        </span>
        <span>
          <span className="text-white">{String(minutes).padStart(2, '0')}</span>
          <span className="text-white/40 ml-0.5 mr-1 font-sans">m</span>
        </span>
        <span>
          <span className="text-white font-mono">{String(seconds).padStart(2, '0')}</span>
          <span className="text-white/40 ml-0.5 font-sans">s</span>
        </span>
      </div>
    </div>
  );
}
