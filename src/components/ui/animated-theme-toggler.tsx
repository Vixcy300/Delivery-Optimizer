"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AnimatedThemeToggler() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Play a soft switch click sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(newTheme === 'dark' ? 400 : 600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      aria-label="Toggle theme"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-800 dark:text-zinc-200">
        <motion.g
          initial={false}
          animate={{
            rotate: isDark ? -90 : 0,
            scale: isDark ? 1.5 : 1,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Sun Rays - these shrink and disappear in dark mode */}
          <motion.g
            animate={{
              opacity: isDark ? 0 : 1,
              scale: isDark ? 0.5 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </motion.g>

          {/* Core circle that swells into a moon */}
          <mask id="moon-mask">
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <motion.circle
              cx="12"
              cy="12"
              r="8"
              fill="black"
              initial={false}
              animate={{
                cx: isDark ? 10 : 24,
                cy: isDark ? 10 : 0,
                r: isDark ? 8 : 4
              }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
            />
          </mask>

          <motion.circle
            cx="12"
            cy="12"
            fill="currentColor"
            mask="url(#moon-mask)"
            initial={false}
            animate={{
              r: isDark ? 8 : 5,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </motion.g>
      </svg>
    </button>
  );
}
