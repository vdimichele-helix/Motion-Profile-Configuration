import React from "react";
import { Zap, TrendingUp, Gauge, Clock } from "lucide-react";

const rows = [
  { key: "maxSpeed", label: "Max Speed", metricUnit: "mm/s", imperialUnit: "in/s", icon: Zap, metricToImperial: 0.0393701 },
  { key: "acceleration", label: "Acceleration", metricUnit: "mm/s²", imperialUnit: "in/s²", icon: TrendingUp, metricToImperial: 0.0393701 },
  { key: "avgSpeed", label: "Average Speed", metricUnit: "mm/s", imperialUnit: "in/s", icon: Gauge, metricToImperial: 0.0393701 },
  { key: "moveTime", label: "Move Time", metricUnit: "s", imperialUnit: "s", icon: Clock, metricToImperial: 1 },
];

export default function ProfileOutput({ results }) {
  const hasResults = results && Object.keys(results).length > 0;

  return (
    <div className="space-y-2">
      {rows.map((row, i) => {
        const Icon = row.icon;
        const metricVal = hasResults ? results[row.key] : null;
        const imperialVal = metricVal != null ? metricVal * row.metricToImperial : null;
        return (
          <div
            key={row.key}
            className="flex items-center justify-between py-3 px-0"
            style={{ borderBottom: i < rows.length - 1 ? "1px solid #B0BEC5" : undefined }}
          >
            <span className="flex items-center gap-2 text-[14px] font-medium text-[#1F2D3D]">
              <span className="w-7 h-7 rounded-md bg-[#EAF5FE] flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#0176D3]" />
              </span>
              {row.label}
            </span>
            <div className="flex gap-1 items-baseline text-[14px] font-semibold">
              <span className="text-[#1F2D3D]">{metricVal != null ? metricVal.toFixed(2) : "—"}</span>
              <span className="text-[12px] text-[#5E6A71] font-medium">{row.metricUnit}</span>
              {imperialVal != null && row.metricToImperial !== 1 && (
                <>
                  <span className="text-[#C9D0D5] mx-1">·</span>
                  <span className="text-[#5E6A71]">{imperialVal.toFixed(4)}</span>
                  <span className="text-[12px] text-[#5E6A71] font-medium">{row.imperialUnit}</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}