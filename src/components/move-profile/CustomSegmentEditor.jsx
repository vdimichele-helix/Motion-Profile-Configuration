import React, { useState, useRef, useEffect } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomSegmentEditor({ segments, onSegmentsChange, isImperial }) {
  const svgRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const width = 600;
  const height = 280;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxTime = Math.max(...segments.map(s => s.time), 1);
  const maxVelocity = Math.max(...segments.map(s => s.velocity), 100);

  const timeToX = (t) => padding.left + (t / maxTime) * chartWidth;
  const velocityToY = (v) => padding.top + chartHeight - (v / maxVelocity) * chartHeight;
  const xToTime = (x) => Math.max(0, ((x - padding.left) / chartWidth) * maxTime);
  const yToVelocity = (y) => Math.max(0, ((chartHeight - (y - padding.top)) / chartHeight) * maxVelocity);

  const handleMouseDown = (index, e) => {
    e.preventDefault();
    if (index === 0 || index === segments.length - 1) return;
    setDraggingIndex(index);
  };

  const handleMouseMove = (e) => {
    if (draggingIndex === null) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newTime = xToTime(x);
    const newVelocity = yToVelocity(y);
    const newSegments = [...segments];
    const prevTime = segments[draggingIndex - 1]?.time || 0;
    const nextTime = segments[draggingIndex + 1]?.time || maxTime;
    newSegments[draggingIndex] = {
      time: Math.max(prevTime + 0.1, Math.min(nextTime - 0.1, newTime)),
      velocity: Math.max(0, Math.min(maxVelocity, newVelocity))
    };
    onSegmentsChange(newSegments);
  };

  const handleMouseUp = () => setDraggingIndex(null);

  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingIndex, segments]);

  const addSegment = () => {
    if (segments.length >= 10) return;
    const newTime = segments.length > 0 ? segments[segments.length - 1].time + 1 : 1;
    const newVelocity = segments.length > 0 ? segments[segments.length - 1].velocity : 0;
    onSegmentsChange([...segments.slice(0, -1), { time: newTime, velocity: newVelocity }, segments[segments.length - 1]]);
  };

  const deleteSegment = (index) => {
    if (segments.length <= 2 || index === 0 || index === segments.length - 1) return;
    onSegmentsChange(segments.filter((_, i) => i !== index));
  };

  const resetSegments = () => {
    onSegmentsChange([
      { time: 0, velocity: 0 },
      { time: 1, velocity: 50 },
      { time: 2, velocity: 80 },
      { time: 3, velocity: 40 },
      { time: 4, velocity: 0 }
    ]);
  };

  const pathData = segments.map((s, i) => {
    const x = timeToX(s.time);
    const y = velocityToY(s.velocity);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(" ");

  const velocityUnit = isImperial ? "in/s" : "mm/s";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-semibold uppercase tracking-widest text-[#5E6A71]">
          Custom Velocity Profile
        </label>
        <div className="flex gap-2">
          <button
            onClick={addSegment}
            disabled={segments.length >= 10}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0176D3] border border-[#0176D3] bg-white px-3 py-1.5 rounded-md hover:bg-[#EAF5FE] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            Add Point
          </button>
          <button
            onClick={resetSegments}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#5E6A71] border border-[#E5E8EB] bg-white px-3 py-1.5 rounded-md hover:bg-[#F4F6F9] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#B0BEC5] bg-white p-4">
        <svg ref={svgRef} width={width} height={height} className="w-full h-auto" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid */}
          <g opacity="0.5">
            {[...Array(5)].map((_, i) => (
              <line key={`h${i}`} x1={padding.left} y1={padding.top + (chartHeight / 4) * i}
                x2={width - padding.right} y2={padding.top + (chartHeight / 4) * i}
                stroke="#B0BEC5" strokeWidth="1" />
            ))}
            {[...Array(5)].map((_, i) => (
              <line key={`v${i}`} x1={padding.left + (chartWidth / 4) * i} y1={padding.top}
                x2={padding.left + (chartWidth / 4) * i} y2={height - padding.bottom}
                stroke="#B0BEC5" strokeWidth="1" />
            ))}
          </g>

          {/* Axes */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#B0BEC5" strokeWidth="1.5" />
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#B0BEC5" strokeWidth="1.5" />

          {/* Labels */}
          <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="10" fill="#5E6A71">Time (s)</text>
          <text x={15} y={height / 2} textAnchor="middle" transform={`rotate(-90 15 ${height / 2})`} fontSize="10" fill="#5E6A71">
            Velocity ({velocityUnit})
          </text>

          {/* Fill */}
          <defs>
            <linearGradient id="customGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0176D3" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#0176D3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L ${timeToX(segments[segments.length - 1].time)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
            fill="url(#customGrad)"
          />
          <path d={pathData} fill="none" stroke="#0176D3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {segments.map((segment, i) => {
            const x = timeToX(segment.time);
            const y = velocityToY(segment.velocity);
            const isFirst = i === 0;
            const isLast = i === segments.length - 1;
            const isDraggable = !isFirst && !isLast;
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                <circle
                  cx={x} cy={y} r={isDraggable ? 7 : 5}
                  fill={isDraggable ? "#0176D3" : "#C9D0D5"}
                  stroke="white" strokeWidth="2"
                  className={isDraggable ? "cursor-move" : ""}
                  onMouseDown={(e) => isDraggable && handleMouseDown(i, e)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {isDraggable && isHovered && (
                  <g onClick={() => deleteSegment(i)} style={{ cursor: "pointer" }}>
                    <circle cx={x + 12} cy={y - 12} r={9} fill="#ef4444" />
                    <text x={x + 12} y={y - 9} textAnchor="middle" fontSize="11" fill="white" style={{ pointerEvents: "none" }}>×</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-[#5E6A71] border-t border-[#B0BEC5] pt-3">
          <span>• Drag blue points to adjust</span>
          <span>• Add Point to insert new segments</span>
          <span>• Start and end fixed at zero</span>
        </div>
      </div>
    </div>
  );
}