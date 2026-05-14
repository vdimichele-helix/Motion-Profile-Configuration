import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function SaveProfileDialog({ currentConfig }) {
  const [open, setOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profileName.trim()) { toast.error("Please enter a profile name"); return; }
    setSaving(true);
    try {
      await base44.entities.SavedProfile.create({
        name: profileName.trim(),
        profile_type: currentConfig.profileType,
        fixity_type: currentConfig.fixityType,
        threaded_length: currentConfig.threadedLength,
        move_distance: currentConfig.moveDistance,
        motion_option: currentConfig.motionOption,
        motion_value: currentConfig.motionValue,
        is_imperial: currentConfig.isImperial,
      });
      toast.success(`Profile "${profileName}" saved`);
      setProfileName("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 text-[14px] font-medium text-[#0176D3] border border-[#0176D3] bg-white px-4 py-2.5 rounded-md hover:bg-[#EAF5FE] transition-colors">
          <Save className="w-4 h-4" />
          Save Profile
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1F2D3D]">Save Move Profile</DialogTitle>
          <DialogDescription className="text-[#5E6A71]">Save your current configuration for later use</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-[13px] font-semibold text-[#1F2D3D]">Profile Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g., High Speed Setup"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="border-[#B0BEC5] focus:border-[#0176D3] text-[#1F2D3D]"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            disabled={saving}
            className="text-[14px] font-medium text-[#5E6A71] border border-[#B0BEC5] bg-white px-4 py-2 rounded-md hover:bg-[#F4F6F9] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[14px] font-semibold text-white px-4 py-2 rounded-md transition-colors"
            style={{ background: "#0176D3" }}
            onMouseEnter={e => e.currentTarget.style.background = "#014486"}
            onMouseLeave={e => e.currentTarget.style.background = "#0176D3"}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}