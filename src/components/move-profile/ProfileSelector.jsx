import React from "react";
import { cn } from "@/lib/utils";

const profiles = [
  {
    id: "trapezoidal",
    label: "Trapezoidal",
    description: "Constant velocity plateau",
    path: "M 10 70 L 30 20 L 70 20 L 90 70",
  },
  {
    id: "triangular",
    label: "Triangular",
    description: "Peak velocity, no plateau",
    path: "M 10 70 L 50 20 L 90 70",
  },
  {
    id: "custom",
    label: "Custom Multi-Segment",
    description: "User-defined segments",
    path: "M 10 70 L 25 40 L 40 20 L 60 30 L 75 20 L 90 70",
  },
];

export default function ProfileSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {profiles.map((p) => {
        const isSelected = selected === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              "relative flex flex-col items-center gap-3 rounded-lg border-2 p-5 transition-all duration-200 text-left",
              "hover:-translate-y-0.5",
              isSelected
                ? "border-[#0176D3] bg-[#EAF5FE]"
                : "border-[#B0BEC5] bg-white hover:border-[#0176D3]/40 hover:shadow-md"
            )}
            style={{ boxShadow: isSelected ? "0 0 0 1px #0176D3" : undefined }}
          >
            <svg viewBox="0 0 100 90" className="w-20 h-14">
              <path
                d={p.path}
                fill="none"
                stroke={isSelected ? "#0176D3" : "#C9D0D5"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="5" y1="72" x2="95" y2="72" stroke={isSelected ? "#0176D3" : "#B0BEC5"} strokeWidth="1" opacity="0.5" />
            </svg>
            <div className="text-center">
              <div className={cn("text-[14px] font-semibold", isSelected ? "text-[#0176D3]" : "text-[#1F2D3D]")}>
                {p.label}
              </div>
              <div className="text-[12px] text-[#5E6A71] mt-0.5">{p.description}</div>
            </div>
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#0176D3]" />
            )}
          </button>
        );
      })}
    </div>
  );
}