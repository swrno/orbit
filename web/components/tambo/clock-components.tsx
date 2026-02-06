"use client";

import { useState, useEffect, useRef } from "react";
import { Clock as ClockIcon, Play, Pause, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Digital Clock ---

interface ClockProps {
  timezone?: string;
  format24h?: boolean;
  showSeconds?: boolean;
  showDate?: boolean;
}

export function Clock({ 
  timezone = "Asia/Kolkata", 
  format24h = true, 
  showSeconds = true,
  showDate = true 
}: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: !format24h,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <ClockIcon className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Digital Clock</h3>
            <p className="text-xs text-muted-foreground">{timezone}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="font-mono text-4xl font-bold text-foreground tracking-wider">
            {formatTime(time)}
          </div>
          {showDate && (
            <div className="mt-3 text-xs text-muted-foreground text-center">
              {formatDate(time)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="text-center">
            <div className="font-medium">Format</div>
            <div className="text-[10px]">{format24h ? '24h' : '12h'}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Seconds</div>
            <div className="text-[10px]">{showSeconds ? 'On' : 'Off'}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Date</div>
            <div className="text-[10px]">{showDate ? 'On' : 'Off'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Stopwatch ---

interface StopwatchProps {
  autoStart?: boolean;
}

export function Stopwatch({ autoStart = false }: StopwatchProps) {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime;
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps([...laps, elapsedTime]);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      milliseconds: String(milliseconds).padStart(2, '0'),
    };
  };

  const time = formatTime(elapsedTime);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <Timer className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Stopwatch</h3>
            <p className="text-xs text-muted-foreground">
              {isRunning ? 'Running' : elapsedTime > 0 ? 'Paused' : 'Ready'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6">
          <div className="font-mono text-5xl font-bold text-foreground tracking-wider">
            {time.minutes}:{time.seconds}
            <span className="text-2xl text-muted-foreground">.{time.milliseconds}</span>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={handleStartPause}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium px-4 h-9 transition-colors",
              isRunning 
                ? "bg-orange-500 text-white hover:bg-orange-600" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                {elapsedTime > 0 ? 'Resume' : 'Start'}
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={elapsedTime === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 px-4 h-9 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            onClick={handleLap}
            disabled={!isRunning}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 h-9 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lap
          </button>
        </div>

        {laps.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Lap Times</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {laps.map((lap, index) => {
                const lapTime = formatTime(lap);
                const previousLap = index > 0 ? laps[index - 1] : 0;
                const splitTime = formatTime(lap - previousLap);
                return (
                  <div 
                    key={index} 
                    className="flex justify-between items-center text-xs bg-muted/50 rounded px-2 py-1.5"
                  >
                    <span className="font-mono text-muted-foreground">
                      Lap {laps.length - index}
                    </span>
                    <div className="flex gap-3">
                      <span className="font-mono text-foreground">
                        {lapTime.minutes}:{lapTime.seconds}.{lapTime.milliseconds}
                      </span>
                      <span className="font-mono text-muted-foreground text-[10px] self-center">
                        +{splitTime.minutes}:{splitTime.seconds}.{splitTime.milliseconds}
                      </span>
                    </div>
                  </div>
                );
              }).reverse()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Countdown Timer ---

interface CountdownTimerProps {
  initialMinutes?: number;
  initialSeconds?: number;
}

export function CountdownTimer({ initialMinutes = 5, initialSeconds = 0 }: CountdownTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState((initialMinutes * 60 + initialSeconds) * 1000);
  const [inputMinutes, setInputMinutes] = useState(initialMinutes);
  const [inputSeconds, setInputSeconds] = useState(initialSeconds);
  const [isEditing, setIsEditing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingRef = useRef<number>(timeLeft);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      startTimeRef.current = Date.now();
      remainingRef.current = timeLeft;
      
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newTimeLeft = Math.max(0, remainingRef.current - elapsed);
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft === 0) {
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStartPause = () => {
    if (!isRunning && timeLeft === 0) {
      // Reset to initial time
      const newTime = (inputMinutes * 60 + inputSeconds) * 1000;
      setTimeLeft(newTime);
      remainingRef.current = newTime;
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    const newTime = (inputMinutes * 60 + inputSeconds) * 1000;
    setTimeLeft(newTime);
    remainingRef.current = newTime;
  };

  const handleSetTime = () => {
    const newTime = (inputMinutes * 60 + inputSeconds) * 1000;
    setTimeLeft(newTime);
    remainingRef.current = newTime;
    setIsEditing(false);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      milliseconds: String(milliseconds).padStart(2, '0'),
    };
  };

  const time = formatTime(timeLeft);
  const progress = ((initialMinutes * 60 + initialSeconds) * 1000 - timeLeft) / ((initialMinutes * 60 + initialSeconds) * 1000) * 100;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <ClockIcon className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Countdown Timer</h3>
            <p className="text-xs text-muted-foreground">
              {isRunning ? 'Running' : timeLeft === 0 ? 'Complete!' : 'Ready'}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isRunning}
            className="text-xs text-primary underline hover:text-primary/80 disabled:opacity-50 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Set'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputSeconds}
                  onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <button
              onClick={handleSetTime}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors"
            >
              Set Time
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center py-6">
              <div className={cn(
                "font-mono text-5xl font-bold tracking-wider transition-colors",
                timeLeft === 0 ? "text-destructive" : "text-foreground"
              )}>
                {time.minutes}:{time.seconds}
                <span className="text-2xl text-muted-foreground">.{time.milliseconds}</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100 ease-linear"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={handleStartPause}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium px-4 h-9 transition-colors",
                  isRunning 
                    ? "bg-orange-500 text-white hover:bg-orange-600" 
                    : timeLeft === 0
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    Pause
                  </>
                ) : timeLeft === 0 ? (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Restart
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Start
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={timeLeft === (inputMinutes * 60 + inputSeconds) * 1000 && !isRunning}
                className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 px-4 h-9 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
