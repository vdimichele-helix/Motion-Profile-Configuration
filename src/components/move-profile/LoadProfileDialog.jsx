import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { FolderOpen, Trash2, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function LoadProfileDialog({ onLoadProfile }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["saved-profiles"],
    queryFn: () => base44.entities.SavedProfile.list("-created_date"),
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedProfile.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["saved-profiles"] }); toast.success("Profile deleted"); },
  });

  const handleLoad = (profile) => {
    onLoadProfile({
      profileType: profile.profile_type,
      fixityType: profile.fixity_type,
      threadedLength: profile.threaded_length || "",
      moveDistance: profile.move_distance || "",
      motionOption: profile.motion_option,
      motionValue: profile.motion_value || "",
      isImperial: profile.is_imperial || false,
    });
    toast.success(`Loaded "${profile.name}"`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 text-[14px] font-medium text-[#1F2D3D] border border-[#E5E8EB] bg-white px-4 py-2.5 rounded-md hover:bg-[#F4F6F9] transition-colors">
          <FolderOpen className="w-4 h-4 text-[#5E6A71]" />
          Load Profile
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#1F2D3D]">Load Saved Profile</DialogTitle>
          <DialogDescription className="text-[#5E6A71]">Select a previously saved configuration</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="text-center py-8 text-[13px] text-[#5E6A71]">Loading profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-10 text-[13px] text-[#5E6A71]">No saved profiles yet</div>
          ) : (
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={cn("flex items-center justify-between p-4 rounded-lg border border-[#B0BEC5] bg-white hover:bg-[#F4F6F9] transition-colors group")}
                >
                  <button onClick={() => handleLoad(profile)} className="flex-1 text-left">
                    <div className="font-semibold text-[14px] text-[#1F2D3D] mb-1">{profile.name}</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#EAF5FE] text-[#0176D3] font-medium">{profile.profile_type}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#F4F6F9] text-[#5E6A71] font-medium">{profile.fixity_type}</span>
                      {profile.is_imperial && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#F4F6F9] text-[#5E6A71] font-medium">imperial</span>
                      )}
                      <span className="text-[11px] text-[#5E6A71] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(profile.created_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete profile "${profile.name}"?`)) deleteMutation.mutate(profile.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}