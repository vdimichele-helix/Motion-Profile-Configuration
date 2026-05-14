import React from "react";

export default function LegalFooter({ className = "" }) {
  return (
    <div className={`mt-6 pt-4 border-t border-[#B0BEC5] text-center ${className}`}>
      <p
        style={{
          fontSize: "8pt",
          lineHeight: "1.5",
          color: "#4A4A4A",
          fontFamily: "inherit",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        © 2026 Helix Linear Technologies, Inc. All rights reserved. The information contained in this document, including pricing,
        calculations, specifications, and technical data, is confidential and proprietary to Helix Linear Technologies. It may not
        be reproduced, distributed, or disclosed to any third party without the prior written consent of Helix Linear Technologies.
      </p>
    </div>
  );
}