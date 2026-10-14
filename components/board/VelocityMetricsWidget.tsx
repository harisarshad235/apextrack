'use client';

import React from 'react';
import { TrendingUp, Flame, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface VelocityMetricsWidgetProps {
  completedPoints: number;
  totalPoints: number;
  completionRate: number;
  sprintName?: string;
  daysRemaining?: number;
}

export function VelocityMetricsWidget({
  completedPoints,
  totalPoints,
  completionRate,
  sprintName = 'Sprint 1',
  daysRemaining = 6,
}: VelocityMetricsWidgetProps) {
  // Sparkline data points representing sprint progression
  // Calculate dynamic mock burn-up based on completion rate
  const sparkPoints = [
    { day: 'D1', val: 0 },
    { day: 'D2', val: Math.round(totalPoints * 0.15) },
    { day: 'D3', val: Math.round(totalPoints * 0.3) },
    { day: 'D4', val: Math.round(totalPoints * 0.55) },
    { day: 'D5', val: Math.round(totalPoints * 0.75) },
    { day: 'Now', val: completedPoints },
  ];

  // SVG dimensions for inline sparkline
  const svgWidth = 84;
  const svgHeight = 24;
  const maxVal = Math.max(totalPoints, 1);

  // Generate SVG path for the sparkline
  const pointsStr = sparkPoints
    .map((pt, i) => {
      const x = (i / (sparkPoints.length - 1)) * (svgWidth - 6) + 3;
      const y = svgHeight - (pt.val / maxVal) * (svgHeight - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const areaStr = `3,${svgHeight} ${pointsStr} ${svgWidth - 3},${svgHeight}`;

  return (
    <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-[#11141B] border border-slate-200/80 dark:border-[#232836] shadow-sm backdrop-blur-md">
      {/* Velocity Sparkline */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-0.5">
          <span className="flex items-center gap-1 font-semibold text-cyan-600 dark:text-cyan-400">
            <Activity className="w-3 h-3" />
            Velocity
          </span>
          <span className="text-slate-700 dark:text-slate-200 font-bold ml-1">
            {completionRate}%
          </span>
        </div>

        {/* Mini Inline Sparkline SVG */}
        <div className="relative">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            <defs>
              <linearGradient id="velocitySparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Area Fill */}
            <polygon points={areaStr} fill="url(#velocitySparkGrad)" />
            {/* Trend Line */}
            <polyline
              points={pointsStr}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Current Day Pulse Point */}
            <circle
              cx={svgWidth - 3}
              cy={svgHeight - (completedPoints / maxVal) * (svgHeight - 6) - 3}
              r="2.5"
              fill="#22D3EE"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      <div className="h-7 w-[1px] bg-slate-200 dark:bg-[#232836]" />

      {/* Story Points Burned vs Total */}
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Points
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
            {completedPoints}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            / {totalPoints} pts
          </span>
        </div>
      </div>

      {/* Active Sprint Countdown Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{daysRemaining}d left</span>
      </div>
    </div>
  );
}

export default VelocityMetricsWidget;
