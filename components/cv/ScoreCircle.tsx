"use client";

import { useThemeStore } from "@/lib/stores/theme";

const ScoreCircle = ({ score = 75 }: { score?: number }) => {
  const { theme } = useThemeStore();
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const isDark = theme === 'dark';
  const gradientId = isDark ? 'scoreGradDark' : 'scoreGradLight';

  return (
    <div className="relative w-[100px] h-[100px]">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke={isDark ? "#475569" : "#e2e8f0"}
          strokeWidth={stroke}
          fill="transparent"
          className="transition-colors duration-300"
        />
        {/* Partial circle with gradient */}
        <defs>
          <linearGradient id="scoreGradLight" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF97AD" />
            <stop offset="100%" stopColor="#5171FF" />
          </linearGradient>
          <linearGradient id="scoreGradDark" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>

      {/* Score and issues */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-semibold text-sm text-gray-900 dark:text-white">{`${score}/100`}</span>
      </div>
    </div>
  );
};

export default ScoreCircle;

