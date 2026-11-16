import { ArrowRight, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EXPRESSION_MAP, GROUP_MAP } from '../data/taxonomy';
import { Activity } from '../types/activity';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const groupMeta = GROUP_MAP[activity.group];
  const expressionLabels = activity.expressions
    .slice(0, 2)
    .map((id) => EXPRESSION_MAP[id]?.label)
    .filter(Boolean);

  return (
    <Link
      to={`/hoat-dong/${activity.id}`}
      className="group flex flex-col justify-between bg-white rounded-2xl border border-[#DCE6E3] p-6 shadow-xs hover:shadow-md hover:border-[#176B5B]/40 transition-all duration-200"
    >
      <div>
        {/* Quiet 1-line unboxed metadata kicker */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-3">
          <span style={{ color: groupMeta?.accentColor || '#176B5B' }}>
            {groupMeta?.name || activity.group}
          </span>
          <span className="text-[#526867]/50" aria-hidden="true">
            ·
          </span>
          <span className="text-[#526867] font-medium tabular-nums">
            {activity.durationMinutes} phút
          </span>
          <span className="text-[#526867]/50" aria-hidden="true">
            ·
          </span>
          <span className="text-[#526867] font-medium">
            {activity.noMaterialsNeeded ? 'Không cần học cụ' : activity.materials}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#263B3A] group-hover:text-[#176B5B] transition-colors mb-2.5 leading-snug">
          {activity.title}
        </h3>

        <p className="text-sm leading-relaxed text-[#526867] line-clamp-3 mb-4">
          {activity.shortDescription}
        </p>
      </div>

      <div className="pt-4 border-t border-[#DCE6E3]/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-[#526867] min-w-0">
          <span className="inline-flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5 text-[#176B5B]" />
            {activity.scale}
          </span>
          {expressionLabels.length > 0 && (
            <span className="truncate text-[#7563B8] font-medium">
              {expressionLabels.join(', ')}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#176B5B] whitespace-nowrap shrink-0 group-hover:translate-x-0.5 transition-transform">
          Xem chi tiết
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
