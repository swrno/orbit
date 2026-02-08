"use client";

import { Clock as ClockIcon } from "lucide-react";
import React from "react";

interface ClockProps {
  time?: string;
}

export default function Clock({ time }: ClockProps) {
  // If time is provided, try to format it if it looks like a full date string
  const formattedTime = React.useMemo(() => {
    if (!time) return new Date().toLocaleTimeString();
    try {
      // Check if it's a full date string (contains timezone info or long format)
      if (time.length > 10 && !time.includes('AM') && !time.includes('PM')) {
        const date = new Date(time);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
      return time;
    } catch {
      return time;
    }
  }, [time]);

  return (
    <div className="bg-white dark:bg-zinc-950 max-w-sm rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 flex items-center gap-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
        <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Current Time</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formattedTime}</p>
      </div>
    </div>
  );
}
