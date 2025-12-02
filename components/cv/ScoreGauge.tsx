'use client';

import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/lib/stores/theme";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
  const { theme } = useThemeStore();
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  const percentage = score / 100;
  const isDark = theme === 'dark';

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient
              id="gaugeGradientLight"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
            <linearGradient
              id="gaugeGradientDark"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#fbb6ce" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke={isDark ? "#475569" : "#e5e7eb"}
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Foreground arc with rounded ends */}
          <path
            ref={pathRef}
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke={`url(#gaugeGradient${isDark ? 'Dark' : 'Light'})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - percentage)}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="text-xl font-bold pt-4 text-gray-900 dark:text-white">{score}/100</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;

