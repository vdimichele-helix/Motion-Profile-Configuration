import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

function addDistanceToPoints(points) {
  let cumDist = 0;
  return points.map((p, i) => {
    if (i > 0) {
      const dt = points[i].time - points[i - 1].time;
      cumDist += ((points[i].velocity + points[i - 1].velocity) / 2) * dt;
    }
    return { ...p, distance: parseFloat(cumDist.toFixed(4)) };
  });
}

function generateTrapezoidalData(maxSpeed, accel, moveTime) {
  if (!maxSpeed || !accel || !moveTime) return [];
  const tAccel = maxSpeed / accel;
  const tDecel = tAccel;
  const tCruise = moveTime - tAccel - tDecel;
  if (tCruise < 0) return generateTriangularData(maxSpeed, accel, moveTime);
  const points = [];
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * moveTime;
    let v = 0;
    if (t <= tAccel) { v = accel * t; }
    else if (t <= tAccel + tCruise) { v = maxSpeed; }
    else { v = maxSpeed - accel * (t - tAccel - tCruise); }
    points.push({ time: parseFloat(t.toFixed(4)), velocity: Math.max(0, parseFloat(v.toFixed(2))) });
  }
  return addDistanceToPoints(points);
}

function generateTriangularData(maxSpeed, accel, moveTime) {
  if (!maxSpeed || !accel || !moveTime) return [];
  const tPeak = moveTime / 2;
  const points = [];
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * moveTime;
    let v = 0;
    if (t <= tPeak) { v = (maxSpeed / tPeak) * t; }
    else { v = maxSpeed - (maxSpeed / (moveTime - tPeak)) * (t - tPeak); }
    points.push({ time: parseFloat(t.toFixed(4)), velocity: Math.max(0, parseFloat(v.toFixed(2))) });
  }
  return addDistanceToPoints(points);
}

const CustomTooltipTime = ({ active, payload, label, isImperial }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1F2D3D] text-white px-3 py-2 rounded-md text-xs shadow-xl">
      <div className="text-[#94a3b8]">t = {label} s</div>
      <div className="font-semibold mt-0.5">v = {payload[0].value} {isImperial ? "in/s" : "mm/s"}</div>
    </div>
  );
};

const CustomTooltipDist = ({ active, payload, label, isImperial }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1F2D3D] text-white px-3 py-2 rounded-md text-xs shadow-xl">
      <div className="text-[#94a3b8]">d = {label} {isImperial ? "in" : "mm"}</div>
      <div className="font-semibold mt-0.5">v = {payload[0].value} {isImperial ? "in/s" : "mm/s"}</div>
    </div>
  );
};

export default function ProfileChart({ profileType, results, isImperial, customSegments, moveDistance }) {
  const data = useMemo(() => {
    if (profileType === "custom" && customSegments && customSegments.length >= 2 && results) {
      const d = parseFloat(moveDistance);
      let rawDist = 0;
      for (let i = 1; i < customSegments.length; i++) {
        const dt = customSegments[i].time - customSegments[i - 1].time;
        rawDist += ((customSegments[i].velocity + customSegments[i - 1].velocity) / 2) * dt;
      }
      const scale = rawDist > 0 && d > 0 ? d / rawDist : 1;
      const points = customSegments.map(s => ({
        time: parseFloat(s.time.toFixed(4)),
        velocity: parseFloat((s.velocity * scale).toFixed(2)),
      }));
      return addDistanceToPoints(points);
    }
    if (!results || !results.maxSpeed || !results.acceleration || !results.moveTime) return [];
    if (profileType === "triangular") return generateTriangularData(results.maxSpeed, results.acceleration, results.moveTime);
    return generateTrapezoidalData(results.maxSpeed, results.acceleration, results.moveTime);
  }, [profileType, results, customSegments, moveDistance]);

  const distUnit = isImperial ? "in" : "mm";
  const velUnit = isImperial ? "in/s" : "mm/s";

  if (!data.length) {
    return (
      <div className="rounded-lg border border-dashed border-[#B0BEC5] bg-[#F4F6F9] flex items-center justify-center h-40">
        <span className="text-[13px] text-[#5E6A71]">Enter parameters to see charts</span>
      </div>
    );
  }

  const gridStyle = { strokeDasharray: "3 3", stroke: "#B0BEC5" };
  const axisStyle = { stroke: "#B0BEC5" };
  const tickStyle = { fontSize: 10, fill: "#5E6A71" };

  const chartDefs = (
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#0176D3" stopOpacity={0.12} />
        <stop offset="95%" stopColor="#0176D3" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
      </linearGradient>
    </defs>
  );

  return (
    <div className="space-y-6">
      {/* Velocity vs Time */}
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#0176D3] mb-3">Velocity vs Time</p>
        <div className="rounded-lg border border-[#B0BEC5] bg-white p-4">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
              {chartDefs}
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="time" tick={tickStyle} axisLine={axisStyle} tickLine={false}
                label={{ value: "Time (s)", position: "insideBottom", offset: -8, fontSize: 10, fill: "#5E6A71" }} />
              <YAxis tick={tickStyle} axisLine={axisStyle} tickLine={false}
                label={{ value: `Velocity (${velUnit})`, angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "#5E6A71" }} />
              <Tooltip content={<CustomTooltipTime isImperial={isImperial} />} />
              <Area type="linear" dataKey="velocity" stroke="#0176D3" strokeWidth={2} fill="url(#grad1)" dot={false}
                activeDot={{ r: 4, fill: "#0176D3", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Velocity vs Distance */}
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#22c55e] mb-3">Velocity vs Distance</p>
        <div className="rounded-lg border border-[#B0BEC5] bg-white p-4">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
              {chartDefs}
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="distance" tick={tickStyle} axisLine={axisStyle} tickLine={false}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: `Distance (${distUnit})`, position: "insideBottom", offset: -8, fontSize: 10, fill: "#5E6A71" }} />
              <YAxis tick={tickStyle} axisLine={axisStyle} tickLine={false}
                label={{ value: `Velocity (${velUnit})`, angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "#5E6A71" }} />
              <Tooltip content={<CustomTooltipDist isImperial={isImperial} />} />
              <Area type="monotone" dataKey="velocity" stroke="#22c55e" strokeWidth={2} fill="url(#grad2)" dot={false}
                activeDot={{ r: 4, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}