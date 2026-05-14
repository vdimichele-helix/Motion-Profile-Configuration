import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Ruler, MoveRight, Clock, Gauge, Zap, TrendingUp } from "lucide-react";

const getMotionOptions = (isImperial) => [
  { id: "moveTime", label: "Move Time", unit: "s", icon: Clock },
  { id: "avgSpeed", label: "Average Speed", unit: isImperial ? "in/s" : "mm/s", icon: Gauge },
  { id: "maxSpeed", label: "Maximum Speed", unit: isImperial ? "in/s" : "mm/s", icon: Zap },
  { id: "acceleration", label: "Acceleration", unit: isImperial ? "in/s²" : "mm/s²", icon: TrendingUp },
];

export default function MotionInputs({
  threadedLength, moveDistance, motionOption, motionValue, isImperial,
  onThreadedLengthChange, onMoveDistanceChange, onMotionOptionChange, onMotionValueChange,
}) {
  const motionOptions = getMotionOptions(isImperial);
  const selectedOption = motionOptions.find((o) => o.id === motionOption);
  const distanceUnit = isImperial ? "in" : "mm";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#5E6A71]">
            <Ruler className="w-3.5 h-3.5 text-[#0176D3]" />
            Threaded Length
          </Label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={threadedLength}
              onChange={(e) => onThreadedLengthChange(e.target.value)}
              className="pr-12 h-11 text-[15px] font-medium border-[#B0BEC5] focus:border-[#0176D3] text-[#1F2D3D] placeholder:text-[#C9D0D5]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5E6A71]">{distanceUnit}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#5E6A71]">
            <MoveRight className="w-3.5 h-3.5 text-[#0176D3]" />
            Move Distance
          </Label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={moveDistance}
              onChange={(e) => onMoveDistanceChange(e.target.value)}
              className="pr-12 h-11 text-[15px] font-medium border-[#B0BEC5] focus:border-[#0176D3] text-[#1F2D3D] placeholder:text-[#C9D0D5]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5E6A71]">{distanceUnit}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[12px] font-semibold uppercase tracking-widest text-[#5E6A71]">
          Select Motion Parameter
        </label>
        <div className="rounded-lg border border-[#B0BEC5] bg-[#F4F6F9] p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {motionOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = motionOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onMotionOptionChange(opt.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border-2 px-3 py-2.5 text-left transition-all duration-150",
                    isActive
                      ? "border-[#0176D3] bg-[#EAF5FE]"
                      : "border-transparent bg-white hover:border-[#B0BEC5] hover:shadow-sm"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#0176D3]" : "text-[#5E6A71]")} />
                  <span className={cn("text-[12px] font-medium leading-tight", isActive ? "text-[#0176D3]" : "text-[#1F2D3D]")}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div className="mt-4 pt-4 border-t border-[#B0BEC5]">
              <div className="relative max-w-xs">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={motionValue}
                  onChange={(e) => onMotionValueChange(e.target.value)}
                  className="pr-16 h-11 text-[15px] font-medium border-[#B0BEC5] focus:border-[#0176D3] text-[#1F2D3D] placeholder:text-[#C9D0D5]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5E6A71]">
                  {selectedOption.unit}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}