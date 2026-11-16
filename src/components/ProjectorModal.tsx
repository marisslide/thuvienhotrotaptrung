import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, X } from 'lucide-react';
import { GROUP_MAP } from '../data/taxonomy';
import { Activity } from '../types/activity';
import { ClassroomTimer } from './ClassroomTimer';

interface ProjectorModalProps {
  open: boolean;
  activity: Activity;
  onClose: () => void;
}

export function ProjectorModal({ open, activity, onClose }: ProjectorModalProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveStepIndex(0);
    setShowAllSteps(false);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setActiveStepIndex((i) => Math.min(activity.steps.length - 1, i + 1));
      }
      if (e.key === 'ArrowLeft') {
        setActiveStepIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, activity.steps.length, onClose]);

  if (!open) return null;

  const groupMeta = GROUP_MAP[activity.group];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#176B5B] text-white flex flex-col overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Chế độ trình chiếu lớp học"
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-10 py-5 border-b border-white/15">
        <div className="flex items-center gap-3 text-sm sm:text-base text-[#DDF3EA]">
          <span className="font-semibold text-white">{groupMeta?.name}</span>
          <span aria-hidden="true">·</span>
          <span>{activity.durationMinutes} phút</span>
          <span aria-hidden="true">·</span>
          <span>{activity.scale}</span>
          <span aria-hidden="true">·</span>
          <span>{activity.materials}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAllSteps((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
          >
            <Layers className="w-4 h-4" />
            {showAllSteps ? 'Xem từng bước lớn' : 'Hiện toàn bộ các bước'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#176B5B] hover:bg-[#DDF3EA] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <X className="w-4 h-4" /> Thoát trình chiếu
          </button>
        </div>
      </div>

      {/* Main Projector Stage */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-8 flex flex-col justify-between gap-8">
        <div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            {activity.title}
          </h2>
          <p className="text-lg sm:text-2xl text-[#DDF3EA] max-w-4xl leading-relaxed">
            {activity.shortDescription}
          </p>
        </div>

        {/* Steps display */}
        <div className="bg-white text-[#263B3A] rounded-3xl p-6 sm:p-10 shadow-2xl">
          {showAllSteps ? (
            <ol className="space-y-5">
              {activity.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-4 text-xl sm:text-2xl leading-relaxed">
                  <span className="w-9 h-9 rounded-xl bg-[#DDF3EA] text-[#176B5B] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm sm:text-base font-semibold text-[#176B5B] tabular-nums">
                  Bước {activeStepIndex + 1} / {activity.steps.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeStepIndex === 0}
                    onClick={() => setActiveStepIndex((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#DCE6E3] text-sm font-medium text-[#263B3A] hover:bg-[#F6F9F8] disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" /> Bước trước
                  </button>
                  <button
                    type="button"
                    disabled={activeStepIndex === activity.steps.length - 1}
                    onClick={() =>
                      setActiveStepIndex((i) => Math.min(activity.steps.length - 1, i + 1))
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    Bước tiếp <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-2xl sm:text-4xl font-semibold leading-snug text-[#263B3A] min-h-[110px]">
                {activity.steps[activeStepIndex]}
              </p>

              <div className="pt-5 border-t border-[#DCE6E3]">
                <p className="text-xs sm:text-sm font-semibold text-[#7563B8] mb-1">
                  Câu chuyển tiếp quay lại bài học
                </p>
                <p className="text-lg sm:text-xl text-[#526867] italic">
                  {activity.transitionBackTip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Projector Timer */}
        <ClassroomTimer initialMinutes={activity.durationMinutes} large darkSurface />
      </div>
    </div>
  );
}
