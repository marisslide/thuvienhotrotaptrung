import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { playGentleClassroomChime } from '../lib/sound';

interface ClassroomTimerProps {
  initialMinutes: number;
  large?: boolean;
  darkSurface?: boolean;
}

export function ClassroomTimer({
  initialMinutes,
  large = false,
  darkSurface = false,
}: ClassroomTimerProps) {
  const defaultSeconds = Math.max(60, Math.round(initialMinutes * 60));
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setSecondsLeft(Math.max(60, Math.round(initialMinutes * 60)));
    setRunning(false);
    setFinished(false);
  }, [initialMinutes]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setFinished(true);
          if (soundEnabled) {
            playGentleClassroomChime();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running, soundEnabled]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handleReset = () => {
    setRunning(false);
    setFinished(false);
    setSecondsLeft(defaultSeconds);
  };

  const adjustSeconds = (delta: number) => {
    setFinished(false);
    setSecondsLeft((prev) => Math.max(15, Math.min(900, prev + delta)));
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${
        darkSurface
          ? 'bg-white/10 border-white/20 text-white'
          : 'bg-[#F6F9F8] border-[#DCE6E3] text-[#263B3A]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            className={`text-xs font-medium mb-1 ${
              darkSurface ? 'text-[#DDF3EA]' : 'text-[#526867]'
            }`}
          >
            {finished ? 'Đã hết thời gian hoạt động' : 'Đồng hồ lớp học'}
          </p>
          <div
            className={`font-mono font-bold tabular-nums tracking-tight ${
              large ? 'text-4xl sm:text-5xl' : 'text-3xl'
            } ${finished ? 'text-[#F2B65D]' : ''}`}
          >
            {formatted}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (secondsLeft === 0) setSecondsLeft(defaultSeconds);
              setFinished(false);
              setRunning((r) => !r);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
              running
                ? 'bg-[#F2B65D] text-[#263B3A] hover:bg-[#eab04f]'
                : darkSurface
                ? 'bg-white text-[#176B5B] hover:bg-[#DDF3EA]'
                : 'bg-[#176B5B] text-white hover:bg-[#125649]'
            }`}
          >
            {running ? (
              <>
                <Pause className="w-4 h-4" /> Tạm dừng
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Bắt đầu
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => adjustSeconds(30)}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              darkSurface
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white border border-[#DCE6E3] hover:bg-[#DDF3EA] text-[#263B3A]'
            }`}
          >
            +30 giây
          </button>

          <button
            type="button"
            onClick={handleReset}
            className={`p-2.5 rounded-xl transition-colors shrink-0 ${
              darkSurface
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white border border-[#DCE6E3] hover:bg-[#DDF3EA] text-[#263B3A]'
            }`}
            aria-label="Đặt lại đồng hồ"
            title="Đặt lại đồng hồ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className={`p-2.5 rounded-xl transition-colors shrink-0 ${
              darkSurface
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white border border-[#DCE6E3] hover:bg-[#DDF3EA] text-[#263B3A]'
            }`}
            aria-label={soundEnabled ? 'Tắt chuông báo nhẹ' : 'Bật chuông báo nhẹ'}
            title={soundEnabled ? 'Tắt chuông báo nhẹ' : 'Bật chuông báo nhẹ'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
