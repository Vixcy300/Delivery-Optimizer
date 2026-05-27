"use client";

import { useState, useEffect } from "react";

interface LocationTagProps {
  city?: string;
  country?: string;
  timezone?: string;
}

export function LocationTag({ city = "San Francisco", country = "USA", timezone = "PST" }: LocationTagProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timezoneMap: Record<string, string> = {
      IST: "Asia/Kolkata",
      PST: "America/Los_Angeles",
      PDT: "America/Los_Angeles",
      EST: "America/New_York",
      EDT: "America/New_York",
      GMT: "Europe/London",
      BST: "Europe/London",
      UTC: "UTC",
    };

    const ianaTimezone = timezoneMap[timezone] || "America/Los_Angeles";

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: ianaTimezone,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 transition-all duration-500 ease-out hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-[0_0_20px_rgba(0,0,0,0.04)]"
    >
      {/* Live pulse indicator */}
      <div className="relative flex items-center justify-center">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      </div>

      {/* Location text */}
      <div className="flex items-center gap-2 overflow-hidden min-w-[140px] relative h-5">
        <span
          className="absolute left-0 text-sm font-medium text-zinc-200 transition-all duration-500 select-none"
          style={{
            transform: isHovered ? "translateY(-100%)" : "translateY(0)",
            opacity: isHovered ? 0 : 1,
          }}
        >
          {city}, {country}
        </span>

        <span
          className="absolute left-0 text-sm font-medium text-zinc-200 transition-all duration-500 select-none"
          style={{
            transform: isHovered ? "translateY(0)" : "translateY(100%)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          {currentTime} {timezone}
        </span>
      </div>

      {/* Arrow indicator */}
      <svg
        className="h-3 w-3 text-zinc-500 transition-all duration-300 group-hover:text-zinc-300"
        style={{
          transform: isHovered ? "translateX(2px) rotate(-45deg)" : "translateX(0) rotate(0)",
          opacity: isHovered ? 1 : 0.5,
        }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    </button>
  );
}
