'use client';

import { ProjectPhase, PROJECT_PHASES } from '@/lib/projects-data';
import { Check, ArrowRight } from 'lucide-react';

interface PhaseProgressProps {
  currentPhase: ProjectPhase;
  phaseProgress?: number; // 0, 50, or 100
  onProgressChange?: (progress: number) => void;
  onPhaseChange?: (phase: ProjectPhase) => void;
}

export function PhaseProgress({ currentPhase, phaseProgress = 50, onProgressChange, onPhaseChange }: PhaseProgressProps) {
  const currentIndex = PROJECT_PHASES.indexOf(currentPhase);

  return (
    <div className="space-y-5 overflow-hidden">
      {/* Progress Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-medium">Current Phase Progress</span>
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
          {[0, 50, 100].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onProgressChange?.(p)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                phaseProgress === p
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {p === 0 ? '0%' : p === 50 ? '50%' : '100%'}
            </button>
          ))}
        </div>
      </div>

      {/* Phase Progress Bar - Desktop: Horizontal */}
      <div className="hidden md:block overflow-x-auto">
        <div className="flex items-start min-w-max gap-1">
          {PROJECT_PHASES.map((phase, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={phase} className="flex-1 min-w-[80px] flex flex-col items-center">
                {/* Node and line */}
                <div className="w-full flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors flex-shrink-0 ${
                      isCompleted || isCurrent
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={12} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < PROJECT_PHASES.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-1 rounded transition-colors ${
                        idx < currentIndex ? 'bg-foreground' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
                {/* Label */}
                <span
                  className={`mt-2 text-xs text-center leading-tight px-1 transition-colors ${
                    isCurrent
                      ? 'text-foreground font-medium'
                      : isCompleted
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {phase}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Progress - Mobile: Vertical */}
      <div className="md:hidden space-y-2">
        {PROJECT_PHASES.map((phase, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={phase}
              type="button"
              onClick={() => onPhaseChange?.(phase)}
              disabled={!onPhaseChange}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                isCurrent ? 'bg-muted' : ''
              } ${onPhaseChange ? 'cursor-pointer hover:bg-muted' : 'cursor-default'}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                  isCompleted || isCurrent
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check size={12} />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-sm flex-1 ${
                  isCurrent
                    ? 'text-foreground font-medium'
                    : isCompleted
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                }`}
              >
                {phase}
              </span>
              {isCurrent && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                  {phaseProgress}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Advance Phase Button - shown when progress is 100% */}
      {phaseProgress === 100 && currentIndex < PROJECT_PHASES.length - 1 && onPhaseChange && (
        <button
          type="button"
          onClick={() => onPhaseChange(PROJECT_PHASES[currentIndex + 1])}
          className="w-full py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight size={16} />
          Advance to {PROJECT_PHASES[currentIndex + 1]}
        </button>
      )}
    </div>
  );
}
