import React from "react";
import { cn } from "@/lib/utils";

const fixities = [
  { id: "fixed-free", label: "Fixed–Free", leftType: "fixed", rightType: "free" },
  { id: "fixed-fixed", label: "Fixed–Fixed", leftType: "fixed", rightType: "fixed" },
  { id: "fixed-floating", label: "Fixed–Floating", leftType: "fixed", rightType: "floating" },
];

function EndIcon({ type, side, isSelected }) {
  const color = isSelected ? "#0176D3" : "#C9D0D5";
  const barX = side === "left" ? 12 : 38;
  return (
    <svg viewBox="0 0 50 40" className="w-12 h-8">
      <line x1={barX} y1="5" x2={barX} y2="35" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {type === "fixed" && (
        [10, 17, 24, 31].map((y) => (
          <line key={y}
            x1={side === "left" ? barX - 5 : barX + 1}
            y1={y}
            x2={side === "left" ? barX - 1 : barX + 5}
            y2={y + 3}
            stroke={color} strokeWidth="1.5"
          />
        ))
      )}
      {type === "free" && (
        <circle cx={side === "left" ? barX + 8 : barX - 8} cy="20" r="4" fill="none" stroke={color} strokeWidth="1.5" />
      )}
      {type === "floating" && (
        <>
          <circle cx={side === "left" ? barX + 8 : barX - 8} cy="28" r="3" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx={side === "left" ? barX + 8 : barX - 8} cy="18" r="3" fill="none" stroke={color} strokeWidth="1.5" />
        </>
      )}
      <line
        x1={side === "left" ? barX : 12}
        y1="20"
        x2={side === "left" ? 40 : barX}
        y2="20"
        stroke={color} strokeWidth="2"
      />
    </svg>
  );
}

export default function FixitySelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#5E6A71] italic">Thomson end supports available in Step 3</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {fixities.map((f) => {
          const isSelected = selected === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              className={cn(
                "relative flex items-center justify-center gap-1 rounded-lg border-2 py-4 px-3 transition-all duration-200",
                "hover:-translate-y-0.5",
                isSelected
                  ? "border-[#0176D3] bg-[#EAF5FE]"
                  : "border-[#B0BEC5] bg-white hover:border-[#0176D3]/40 hover:shadow-md"
              )}
              style={{ boxShadow: isSelected ? "0 0 0 1px #0176D3" : undefined }}
            >
              <EndIcon type={f.leftType} side="left" isSelected={isSelected} />
              <span className={cn("text-[13px] font-semibold mx-1", isSelected ? "text-[#0176D3]" : "text-[#1F2D3D]")}>
                {f.label}
              </span>
              <EndIcon type={f.rightType} side="right" isSelected={isSelected} />
              {isSelected && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#0176D3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}