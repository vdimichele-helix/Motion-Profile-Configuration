import React, { useState } from "react";
import { Calculator, RotateCcw, MoveRight, FileDown, TableProperties } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileSelector from "@/components/move-profile/ProfileSelector";
import FixitySelector from "@/components/move-profile/FixitySelector";
import MotionInputs from "@/components/move-profile/MotionInputs";
import ProfileOutput from "@/components/move-profile/ProfileOutput";
import ProfileChart from "@/components/move-profile/ProfileChart";
import SaveProfileDialog from "@/components/move-profile/SaveProfileDialog";
import LoadProfileDialog from "@/components/move-profile/LoadProfileDialog";
import CustomSegmentEditor from "@/components/move-profile/CustomSegmentEditor";
import LegalFooter from "@/components/move-profile/LegalFooter";

function calculateCustomProfile(segments, moveDistance) {
  const d = parseFloat(moveDistance);
  if (!d || d <= 0 || segments.length < 2) return null;
  const totalTime = segments[segments.length - 1].time;
  if (totalTime <= 0) return null;
  let distance = 0;
  for (let i = 1; i < segments.length; i++) {
    const dt = segments[i].time - segments[i - 1].time;
    const avgVel = (segments[i].velocity + segments[i - 1].velocity) / 2;
    distance += avgVel * dt;
  }
  if (distance === 0) return null;
  const scale = d / distance;
  const maxSpeed = Math.max(...segments.map(s => s.velocity)) * scale;
  const avgSpeed = d / totalTime;
  let maxAcceleration = 0;
  for (let i = 1; i < segments.length; i++) {
    const dv = Math.abs(segments[i].velocity - segments[i - 1].velocity) * scale;
    const dt = segments[i].time - segments[i - 1].time;
    if (dt > 0) {
      const accel = dv / dt;
      maxAcceleration = Math.max(maxAcceleration, accel);
    }
  }
  return { maxSpeed, acceleration: maxAcceleration, avgSpeed, moveTime: totalTime };
}

function calculateProfile(profileType, moveDistance, motionOption, motionValue) {
  const d = parseFloat(moveDistance);
  const val = parseFloat(motionValue);
  if (!d || d <= 0 || !val || val <= 0) return null;
  let maxSpeed, acceleration, avgSpeed, moveTime;
  if (profileType === "triangular") {
    switch (motionOption) {
      case "moveTime": { moveTime = val; avgSpeed = d / moveTime; maxSpeed = 2 * avgSpeed; acceleration = maxSpeed / (moveTime / 2); break; }
      case "avgSpeed": { avgSpeed = val; moveTime = d / avgSpeed; maxSpeed = 2 * avgSpeed; acceleration = maxSpeed / (moveTime / 2); break; }
      case "maxSpeed": { maxSpeed = val; avgSpeed = maxSpeed / 2; moveTime = d / avgSpeed; acceleration = maxSpeed / (moveTime / 2); break; }
      case "acceleration": { acceleration = val; moveTime = 2 * Math.sqrt(d / acceleration); maxSpeed = acceleration * (moveTime / 2); avgSpeed = d / moveTime; break; }
      default: return null;
    }
  } else {
    switch (motionOption) {
      case "moveTime": { moveTime = val; maxSpeed = d / ((2 * moveTime) / 3); acceleration = maxSpeed / (moveTime / 3); avgSpeed = d / moveTime; break; }
      case "avgSpeed": { avgSpeed = val; moveTime = d / avgSpeed; maxSpeed = d / ((2 * moveTime) / 3); acceleration = maxSpeed / (moveTime / 3); break; }
      case "maxSpeed": { maxSpeed = val; moveTime = (3 * d) / (2 * maxSpeed); acceleration = maxSpeed / (moveTime / 3); avgSpeed = d / moveTime; break; }
      case "acceleration": { acceleration = val; moveTime = Math.sqrt((9 * d) / (2 * acceleration)); maxSpeed = acceleration * (moveTime / 3); avgSpeed = d / moveTime; break; }
      default: return null;
    }
  }
  return { maxSpeed, acceleration, avgSpeed, moveTime };
}

export default function MoveProfile() {
  const [profileType, setProfileType] = useState("trapezoidal");
  const [fixityType, setFixityType] = useState("fixed-fixed");
  const [threadedLength, setThreadedLength] = useState("");
  const [moveDistance, setMoveDistance] = useState("");
  const [motionOption, setMotionOption] = useState("moveTime");
  const [motionValue, setMotionValue] = useState("");
  const [results, setResults] = useState(null);
  const [isImperial, setIsImperial] = useState(false);
  const [customSegments, setCustomSegments] = useState([
    { time: 0, velocity: 0 },
    { time: 1, velocity: 50 },
    { time: 2, velocity: 80 },
    { time: 3, velocity: 40 },
    { time: 4, velocity: 0 }
  ]);

  const canCalculate = profileType === "custom"
    ? moveDistance && customSegments.length >= 2
    : moveDistance && motionValue;

  const handleCalculate = () => {
    let r;
    if (profileType === "custom") {
      r = calculateCustomProfile(customSegments, moveDistance);
    } else {
      r = calculateProfile(profileType, moveDistance, motionOption, motionValue);
    }
    setResults(r);
  };

  const handleReset = () => {
    setThreadedLength("");
    setMoveDistance("");
    setMotionValue("");
    setResults(null);
  };

  const handlePublishToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(31, 45, 61);
    doc.text("Move Profile Report", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(94, 106, 113);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);
    doc.text(`Profile Type: ${profileType.charAt(0).toUpperCase() + profileType.slice(1)}`, 20, 34);
    doc.text(`End Fixity: ${fixityType}`, 20, 40);
    doc.text(`Move Distance: ${moveDistance} ${isImperial ? "in" : "mm"}`, 20, 46);
    if (threadedLength) doc.text(`Threaded Length: ${threadedLength} ${isImperial ? "in" : "mm"}`, 20, 52);

    // Divider
    doc.setDrawColor(176, 190, 197);
    doc.line(20, 58, 190, 58);

    // Results
    doc.setFontSize(13);
    doc.setTextColor(31, 45, 61);
    doc.text("Profile Results", 20, 66);

    const rows = [
      ["Max Speed", results.maxSpeed, "mm/s", results.maxSpeed * 0.0393701, "in/s"],
      ["Acceleration", results.acceleration, "mm/s²", results.acceleration * 0.0393701, "in/s²"],
      ["Average Speed", results.avgSpeed, "mm/s", results.avgSpeed * 0.0393701, "in/s"],
      ["Move Time", results.moveTime, "s", results.moveTime, "s"],
    ];

    doc.setFontSize(10);
    let y = 76;
    rows.forEach(([label, metric, metricUnit, imperial, imperialUnit]) => {
      doc.setTextColor(94, 106, 113);
      doc.text(label, 20, y);
      doc.setTextColor(31, 45, 61);
      doc.text(`${metric.toFixed(2)} ${metricUnit}`, 100, y);
      if (metricUnit !== "s") doc.text(`${imperial.toFixed(4)} ${imperialUnit}`, 150, y);
      y += 10;
    });

    // Charts
    doc.addPage();
    doc.setFontSize(13);
    doc.setTextColor(31, 45, 61);
    doc.text("Velocity Charts", 20, 20);

    const chartContainer = document.querySelector('[data-testid="profile-charts"]');
    if (chartContainer) {
      const canvas = await html2canvas(chartContainer, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 170;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;
      doc.addImage(imgData, "PNG", 20, 30, imgWidth, imgHeight);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 160, 170);
    doc.text("© 2026 Move Profile Generator — Industrial Motion Analysis", 20, 285);

    doc.save(`move-profile-${profileType}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleDownloadCSV = () => {
    const unit = isImperial ? "in" : "mm";
    const velUnit = isImperial ? "in/s" : "mm/s";
    let points = [];

    if (profileType === "custom" && customSegments.length >= 2 && results) {
      const d = parseFloat(moveDistance);
      let rawDist = 0;
      for (let i = 1; i < customSegments.length; i++) {
        const dt = customSegments[i].time - customSegments[i - 1].time;
        rawDist += ((customSegments[i].velocity + customSegments[i - 1].velocity) / 2) * dt;
      }
      const scale = rawDist > 0 && d > 0 ? d / rawDist : 1;
      let cumDist = 0;
      points = customSegments.map((s, i) => {
        if (i > 0) {
          const dt = customSegments[i].time - customSegments[i - 1].time;
          cumDist += ((customSegments[i].velocity + customSegments[i - 1].velocity) / 2) * scale * dt;
        }
        return { time: s.time, velocity: s.velocity * scale, distance: cumDist };
      });
    } else if (results) {
      const { maxSpeed, acceleration, moveTime } = results;
      const tAccel = maxSpeed / acceleration;
      const tDecel = tAccel;
      const tCruise = moveTime - tAccel - tDecel;
      let cumDist = 0;
      for (let i = 0; i <= 200; i++) {
        const t = parseFloat(((i / 200) * moveTime).toFixed(6));
        let v = 0;
        if (profileType === "triangular") {
          const tPeak = moveTime / 2;
          v = t <= tPeak ? (maxSpeed / tPeak) * t : maxSpeed - (maxSpeed / (moveTime - tPeak)) * (t - tPeak);
        } else {
          if (t <= tAccel) v = acceleration * t;
          else if (tCruise > 0 && t <= tAccel + tCruise) v = maxSpeed;
          else v = maxSpeed - acceleration * (t - tAccel - (tCruise > 0 ? tCruise : 0));
        }
        v = Math.max(0, v);
        if (i > 0) {
          const prevT = (((i - 1) / 200) * moveTime);
          const prevV = points[i - 1]?.velocity ?? 0;
          cumDist += ((v + prevV) / 2) * (t - prevT);
        }
        points.push({ time: t, velocity: parseFloat(v.toFixed(6)), distance: parseFloat(cumDist.toFixed(6)) });
      }
    }

    const header = `time_s,velocity_${velUnit},distance_${unit}`;
    const rows = points.map(p => `${p.time},${p.velocity},${p.distance}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velocity-profile-${profileType}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadProfile = (config) => {
    setProfileType(config.profileType);
    setFixityType(config.fixityType);
    setThreadedLength(config.threadedLength);
    setMoveDistance(config.moveDistance);
    setMotionOption(config.motionOption);
    setMotionValue(config.motionValue);
    setIsImperial(config.isImperial);
    setResults(null);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#F4F6F9] border-b border-[#B0BEC5] py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] font-semibold text-[#0176D3] uppercase tracking-widest">Motion Analysis</span>
            </div>
            <h1 className="text-[28px] font-bold text-[#1F2D3D] leading-tight mb-2">
              Motion Profile Configuration
            </h1>
            <p className="text-[14px] text-[#5E6A71] max-w-lg leading-relaxed">
              Define, analyze, and visualize precision motion profiles for industrial linear motion applications.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Unit Toggle */}
            <div className="flex items-center gap-2 bg-white border border-[#B0BEC5] rounded-lg px-4 py-2.5 shadow-sm">
              <span className={`text-[13px] font-semibold transition-colors ${!isImperial ? "text-[#0176D3]" : "text-[#5E6A71]"}`}>mm</span>
              <button
                onClick={() => setIsImperial(!isImperial)}
                className="relative w-10 h-5 rounded-full transition-colors focus:outline-none"
                style={{ background: isImperial ? "#0176D3" : "#C9D0D5" }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ left: isImperial ? "calc(100% - 18px)" : "2px" }}
                />
              </button>
              <span className={`text-[13px] font-semibold transition-colors ${isImperial ? "text-[#0176D3]" : "text-[#5E6A71]"}`}>in</span>
            </div>
            <SaveProfileDialog
              currentConfig={{ profileType, fixityType, threadedLength, moveDistance, motionOption, motionValue, isImperial }}
            />

          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Config Panel */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Selector Card */}
            <div className="bg-white rounded-lg border border-[#B0BEC5] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#B0BEC5] bg-[#F4F6F9] flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#5E6A71] uppercase tracking-widest">Step 1</span>
                <span className="text-[#C9D0D5]">·</span>
                <span className="text-[14px] font-semibold text-[#1F2D3D]">Select Move Profile Type</span>
              </div>
              <div className="p-6">
                <ProfileSelector selected={profileType} onSelect={(t) => { setProfileType(t); setResults(null); }} />
              </div>
            </div>

            {/* Fixity Selector Card */}
            <div className="bg-white rounded-lg border border-[#B0BEC5] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#B0BEC5] bg-[#F4F6F9] flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#5E6A71] uppercase tracking-widest">Step 2</span>
                <span className="text-[#C9D0D5]">·</span>
                <span className="text-[14px] font-semibold text-[#1F2D3D]">End Fixity Configuration</span>
              </div>
              <div className="p-6">
                <FixitySelector selected={fixityType} onSelect={setFixityType} />
              </div>
            </div>

            {/* Motion Inputs Card */}
            <div className="bg-white rounded-lg border border-[#B0BEC5] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#B0BEC5] bg-[#F4F6F9] flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#5E6A71] uppercase tracking-widest">Step 3</span>
                <span className="text-[#C9D0D5]">·</span>
                <span className="text-[14px] font-semibold text-[#1F2D3D]">Motion Parameters</span>
              </div>
              <div className="p-6">
                {profileType === "custom" ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#5E6A71]">
                        <MoveRight className="w-3.5 h-3.5" />
                        Move Distance
                      </Label>
                      <div className="relative max-w-xs">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={moveDistance}
                          onChange={(e) => setMoveDistance(e.target.value)}
                          className="pr-12 h-11 text-[15px] font-medium border-[#B0BEC5] focus:border-[#0176D3] focus:ring-[#0176D3]/20 text-[#1F2D3D]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5E6A71]">
                          {isImperial ? "in" : "mm"}
                        </span>
                      </div>
                    </div>
                    <CustomSegmentEditor
                      segments={customSegments}
                      onSegmentsChange={(s) => { setCustomSegments(s); setResults(null); }}
                      isImperial={isImperial}
                    />
                  </div>
                ) : (
                  <MotionInputs
                    threadedLength={threadedLength}
                    moveDistance={moveDistance}
                    motionOption={motionOption}
                    motionValue={motionValue}
                    isImperial={isImperial}
                    onThreadedLengthChange={setThreadedLength}
                    onMoveDistanceChange={setMoveDistance}
                    onMotionOptionChange={(opt) => { setMotionOption(opt); setMotionValue(""); setResults(null); }}
                    onMotionValueChange={setMotionValue}
                  />
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCalculate}
                disabled={!canCalculate}
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-white px-5 py-2.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: canCalculate ? "#0176D3" : "#C9D0D5" }}
                onMouseEnter={e => { if (canCalculate) e.currentTarget.style.background = "#014486"; }}
                onMouseLeave={e => { if (canCalculate) e.currentTarget.style.background = "#0176D3"; }}
              >
                <Calculator className="w-4 h-4" />
                Calculate Profile
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-[14px] font-medium text-[#0176D3] border border-[#0176D3] bg-white px-5 py-2.5 rounded-md hover:bg-[#EAF5FE] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              {results && (
                <button
                  onClick={handlePublishToPDF}
                  className="inline-flex items-center gap-2 text-[14px] font-medium text-[#1F2D3D] border border-[#B0BEC5] bg-white px-5 py-2.5 rounded-md hover:bg-[#F4F6F9] transition-colors"
                >
                  <FileDown className="w-4 h-4 text-[#5E6A71]" />
                  Publish to PDF
                </button>
              )}
            </div>
          </div>

          {/* Right Results Panel */}
          <div className="space-y-6">
            {results ? (
              <>
                <div data-testid="profile-charts" className="space-y-6">
                <div className="bg-white rounded-lg border border-[#B0BEC5] shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#B0BEC5] bg-[#EAF5FE] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0176D3]" />
                      <span className="text-[14px] font-semibold text-[#0176D3]">Profile Results</span>
                    </div>
                    <button
                      onClick={handleDownloadCSV}
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0176D3] border border-[#0176D3] bg-white px-3 py-1.5 rounded-md hover:bg-[#EAF5FE] transition-colors"
                    >
                      <TableProperties className="w-3.5 h-3.5" />
                      Download CSV
                    </button>
                  </div>
                  <div className="p-6">
                    <ProfileOutput results={results} />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-[#B0BEC5] shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#B0BEC5] bg-[#F4F6F9]">
                    <span className="text-[14px] font-semibold text-[#1F2D3D]">Velocity Charts</span>
                  </div>
                  <div className="p-6">
                    <ProfileChart
                      profileType={profileType}
                      results={results}
                      isImperial={isImperial}
                      customSegments={profileType === "custom" ? customSegments : null}
                      moveDistance={moveDistance}
                    />
                  </div>
                </div>
                <LegalFooter />
              </div>
              </>
            ) : (
              <div className="bg-[#F4F6F9] rounded-lg border border-dashed border-[#C9D0D5] p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[260px]">
                <div className="w-12 h-12 rounded-full bg-[#EAF5FE] flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-[#0176D3]" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1F2D3D] mb-1">No results yet</p>
                  <p className="text-[13px] text-[#5E6A71]">Configure your motion parameters and click Calculate Profile to see results.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}